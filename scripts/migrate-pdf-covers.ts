import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';
import { isPlaceholderCover } from '../src/utils/cover-image';

type MonitorReport = {
  results?: Array<{ resourceId?: string; outcome?: string }>;
};

const reportPath = getArgument('--report') ?? '/tmp/biblioteca-zines-monitor/resource-report.json';
const apply = process.argv.includes('--apply');
const onlyId = getArgument('--only-id');
const formUploadId = getArgument('--form-upload-id');

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  if (formUploadId) {
    const parsedFormUploadId = Number(formUploadId);
    if (!Number.isInteger(parsedFormUploadId) || parsedFormUploadId <= 0) {
      throw new Error('--form-upload-id must be a positive integer');
    }
    await processFormUpload(supabase, parsedFormUploadId);
    return;
  }

  const report = JSON.parse(await readFile(reportPath, 'utf8')) as MonitorReport;
  const excludedIds = new Set(
    (report.results ?? [])
      .filter((result) => result.outcome === 'inaccessible' || result.outcome === 'invalid')
      .map((result) => parseResourceId(result.resourceId))
      .filter((id): id is number => id !== null),
  );

  const { data: zines, error } = await supabase
    .from('library_zines')
    .select('id, title, pdf_url, cover_image, import_status, total_pages')
    .eq('is_published', true)
    .not('pdf_url', 'is', null);

  if (error) throw new Error(`Failed to load zines: ${error.message}`);

  const candidates = (zines ?? []).filter((zine) => {
    if (onlyId && zine.id !== Number(onlyId)) return false;
    if (excludedIds.has(zine.id)) return false;
    return zine.import_status !== 'completed' || !zine.total_pages || isPlaceholderCover(zine.cover_image);
  });

  console.log(`${apply ? 'Applying' : 'Dry run'} PDF migration for ${candidates.length} zines`);
  console.log(`Excluded by monitor report: ${excludedIds.size}`);

  const { createPageGenerationFromUrl } = apply
    ? await import('../src/services/zine-import-service')
    : { createPageGenerationFromUrl: null };

  for (const zine of candidates) {
    console.log(`[${apply ? 'process' : 'would process'}] ${zine.id}: ${zine.title}`);
    if (apply && zine.pdf_url && createPageGenerationFromUrl) {
      try {
        await createPageGenerationFromUrl(zine.id, zine.pdf_url, supabase);
        console.log(`  completed (${zine.id})`);
      } catch (migrationError) {
        console.error(`  failed (${zine.id}):`, migrationError);
      }
    }
  }
}

async function processFormUpload(
  supabase: ReturnType<typeof createClient<Database>>,
  formUploadId: number,
): Promise<void> {
  const { data: upload, error } = await supabase
    .from('form_uploads')
    .select('id, title, pdf_url')
    .eq('id', formUploadId)
    .single();
  if (error || !upload) throw new Error(`Form upload with ID ${formUploadId} not found`);

  console.log(`${apply ? 'Applying' : 'Dry run'} form-upload page migration for 1 submission`);
  console.log(`[${apply ? 'process' : 'would process'}] ${upload.id}: ${upload.title}`);
  if (apply && !upload.pdf_url) {
    throw new Error(`Form upload ${formUploadId} has no PDF URL`);
  }
  if (apply && upload.pdf_url) {
    const { createFormUploadPageGenerationFromUrl } = await import('../src/services/form-upload-generation-service');
    await createFormUploadPageGenerationFromUrl(upload.id, upload.pdf_url, supabase);
    console.log(`  completed (${upload.id})`);
  }
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseResourceId(resourceId: string | undefined): number | null {
  const match = resourceId?.match(/^library_zines:(\d+)$/);
  return match ? Number(match[1]) : null;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
