import assert from 'node:assert/strict';
import test from 'node:test';
import { getPreviewUrl } from '@/utils/assets';

test('does not use a Google Drive folder as a PDF preview', () => {
  assert.equal(
    getPreviewUrl('https://drive.google.com/drive/folders/1VbBa78utqz-7MKEf713PYVzp1VXV_1ds?usp=drive_link'),
    '',
  );
});

test('keeps Google Drive file previews available', () => {
  assert.equal(
    getPreviewUrl('https://drive.google.com/file/d/file-id/view?usp=drive_link'),
    'https://drive.google.com/file/d/file-id/preview?usp=drive_link',
  );
});
