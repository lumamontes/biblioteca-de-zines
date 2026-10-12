import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';
import { forEachPageFromPdf } from '../src/services/pdf-service';
import { downloadSource } from '../src/services/source-download-service';

const uploadId = getRequiredArgument('--upload-id');
const outputPath = getArgument('--output') ?? `/tmp/form-upload-${uploadId}-cover.png`;

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const { data: upload, error } = await supabase
    .from('form_uploads')
    .select('id, title, pdf_url')
    .eq('id', Number(uploadId))
    .single();

  if (error || !upload) throw new Error(`Failed to load form upload: ${error?.message ?? uploadId}`);
  if (!upload.pdf_url) throw new Error(`Form upload ${uploadId} has no PDF URL`);

  const source = await downloadSource(upload.pdf_url);
  if (!source.mimeType.includes('pdf') && source.buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`Form upload ${uploadId} is not a PDF source`);
  }

  await forEachPageFromPdf(source.buffer, async (cover) => {
    await writeFile(outputPath, cover);
  }, { maxPages: 1 });

  console.log(`Generated cover for ${upload.id} (${upload.title}) at ${outputPath}`);
}

function getRequiredArgument(name: string): string {
  const value = getArgument(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
