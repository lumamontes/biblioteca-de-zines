import { cookies } from 'next/headers';
import type { TriageResult } from '@/application/triage.service';
import { FLASH_COOKIE } from '@/components/triage/triage.config';

export async function readTriageFlash(): Promise<TriageResult | null> {
  const raw = (await cookies()).get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TriageResult;
  } catch {
    return null;
  }
}
