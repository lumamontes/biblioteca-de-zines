import { z } from 'zod';

/**
 * Schema for Google Drive import validation
 */
export const googleDriveImportSchema = z.object({
  driveUrl: z.string().url('Must be a valid URL').refine(
    (url) => url.includes('drive.google.com/file/d/'),
    {
      message: 'Must be a Google Drive file URL (e.g., https://drive.google.com/file/d/FILE_ID/view)',
    }
  ),
  zineId: z.number().int().positive('Zine ID must be a positive number'),
});

export type GoogleDriveImportData = z.infer<typeof googleDriveImportSchema>;

