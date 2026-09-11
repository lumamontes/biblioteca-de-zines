/**
 * Zine Import Service
 * Main orchestrator for importing zines from Google Drive
 * Handles both images and PDFs
 */

import { createClient } from '@/utils/supabase/server';
import { extractFileIdFromUrl, downloadFile } from './google-drive-service';
import { uploadBufferToR2, generateR2Key, deleteZineImages } from './r2-storage-service';
import { extractPagesFromPdf } from './pdf-service';

/**
 * Import zine from Google Drive URL
 * Supports both image files and PDFs
 */
export async function importFromGoogleDrive(zineId: number, driveUrl: string): Promise<void> {
  const supabase = await createClient();

  try {
    // Verify zine exists
    const { data: zine, error: zineError } = await supabase
      .from('library_zines')
      .select('id')
      .eq('id', zineId)
      .single();

    if (zineError || !zine) {
      throw new Error(`Zine with ID ${zineId} not found`);
    }

    // Update status to processing
    await updateZineStatus(zineId, 'processing');

    // Extract file ID from URL
    const fileId = extractFileIdFromUrl(driveUrl);

    // Download file
    const { buffer, mimeType } = await downloadFile(fileId);

    // Determine file type and process accordingly
    // Use both MIME type and buffer detection for reliability
    const isPdf = mimeType === 'application/pdf' || mimeType.includes('pdf') || 
                  (buffer.length >= 4 && buffer.subarray(0, 4).toString() === '%PDF');
    const isImage = mimeType.startsWith('image/') || 
                   (buffer[0] === 0xFF && buffer[1] === 0xD8) || // JPEG
                   (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) || // PNG
                   (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46); // GIF

    if (!isPdf && !isImage) {
      throw new Error(
        `Unsupported file type: ${mimeType}. Only PDFs and images are supported. ` +
        `File appears to be: ${buffer.length} bytes, first bytes: ${buffer.subarray(0, 8).toString('hex')}`
      );
    }

    let pageBuffers: Buffer[];
    let contentType: string;

    if (isPdf) {
      // Extract pages from PDF
      pageBuffers = await extractPagesFromPdf(buffer);
      contentType = 'image/png'; // PDF pages are converted to PNG
    } else {
      // Single image file
      pageBuffers = [buffer];
      contentType = mimeType;
    }

    // Delete existing pages if re-importing
    await deleteExistingPages(zineId);

    // Upload each page to R2 and store in database
    const uploadedPages: Array<{ pageNumber: number; imageUrl: string }> = [];

    for (let i = 0; i < pageBuffers.length; i++) {
      const pageNumber = i + 1;
      const pageBuffer = pageBuffers[i];
      
      // Determine file extension based on content type
      const extension = contentType.includes('png') ? 'png' : 
                       contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' :
                       contentType.includes('webp') ? 'webp' : 'png';

      // Generate R2 key
      const r2Key = generateR2Key(zineId, pageNumber, extension);

      // Upload to R2
      const imageUrl = await uploadBufferToR2(pageBuffer, r2Key, contentType);

      // Store page record in database
      const { error: insertError } = await supabase
        .from('zine_pages')
        .insert({
          zine_id: zineId,
          page_number: pageNumber,
          image_url: imageUrl,
        });

      if (insertError) {
        // Rollback: delete uploaded images
        await deleteZineImages(zineId);
        throw new Error(`Failed to store page ${pageNumber}: ${insertError.message}`);
      }

      uploadedPages.push({ pageNumber, imageUrl });
    }

    // Update zine with total pages and completed status
    const { error: updateError } = await supabase
      .from('library_zines')
      .update({
        total_pages: pageBuffers.length,
        import_status: 'completed',
      })
      .eq('id', zineId);

    if (updateError) {
      throw new Error(`Failed to update zine status: ${updateError.message}`);
    }
  } catch (error) {
    // Update status to failed
    await updateZineStatus(zineId, 'failed');
    
    // Cleanup: delete any uploaded images
    try {
      await deleteZineImages(zineId);
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    throw error;
  }
}

/**
 * Update zine import status
 */
async function updateZineStatus(zineId: number, status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('library_zines')
    .update({ import_status: status })
    .eq('id', zineId);

  if (error) {
    throw new Error(`Failed to update zine status: ${error.message}`);
  }
}

/**
 * Delete existing pages for a zine
 * Used when re-importing
 */
async function deleteExistingPages(zineId: number): Promise<void> {
  const supabase = await createClient();
  
  // Delete from database (CASCADE will handle cleanup)
  const { error } = await supabase
    .from('zine_pages')
    .delete()
    .eq('zine_id', zineId);

  if (error) {
    throw new Error(`Failed to delete existing pages: ${error.message}`);
  }

  // Delete from R2
  await deleteZineImages(zineId);
}

