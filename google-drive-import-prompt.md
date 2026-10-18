# Google Drive Import Feature for Zine Library

## Context
I need to add a Google Drive import feature to my Next.js zine library app. The app uses:
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS  
- **Database**: Supabase with existing tables: `library_zines`, `authors`, `library_zines_authors`, `form_uploads`
- **Storage**: Cloudflare R2 (needs to be configured)
- **Patterns**: Server Actions, React Hook Form with Zod validation

## Current Database Schema
```typescript
// Existing tables relevant to this feature:
library_zines: {
  id: number;
  title: string;
  description: string | null;
  pdf_url: string | null;  // Currently stores PDF URLs
  cover_image: string | null;
  tags: Json | null;
  is_published: boolean | null;
  // ... other fields
}

authors: {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  url: string | null;
}

library_zines_authors: {
  zine_id: number;
  author_id: number;
}
```

## Required Implementation

### 1. New Database Tables
Create migration files to add:

**`zine_pages` table:**
```sql
CREATE TABLE public.zine_pages (
    id SERIAL PRIMARY KEY,
    zine_id INTEGER REFERENCES library_zines(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,  -- R2 URL for the page image
    original_drive_url TEXT,   -- Original Google Drive image URL
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Add to existing `library_zines` table:**
```sql
ALTER TABLE library_zines 
ADD COLUMN drive_folder_id TEXT,  -- Google Drive folder ID
ADD COLUMN total_pages INTEGER DEFAULT 0,
ADD COLUMN import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed'));
```

### 2. Environment Variables
Add to `env.example` and configure:
```
# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_ACCOUNT_ID=
NEXT_PUBLIC_R2_PUBLIC_URL=

# Google Drive API (for future auth, if needed)
GOOGLE_DRIVE_API_KEY=
```

### 3. Core Services to Implement

**`src/services/google-drive-service.ts`:**
- `extractFolderIdFromUrl(url: string)` - Parse Drive folder URL
- `listFolderImages(folderId: string)` - Get images from public folder
- `getDirectImageUrl(fileId: string)` - Convert to direct downloadable URL

**`src/services/r2-storage-service.ts`:**
- `uploadImageFromUrl(imageUrl: string, key: string)` - Download and upload to R2
- `generateR2Key(zineId: number, pageNumber: number, fileName: string)` - Generate storage keys
- `deleteZineImages(zineId: number)` - Cleanup function

**`src/services/zine-import-service.ts`:**
- `importFromGoogleDrive(zineId: number, driveUrl: string)` - Main import orchestrator
- `processZinePages(zineId: number, imageUrls: string[])` - Process page images
- `updateZineStatus(zineId: number, status: string)` - Update import status

### 4. Admin Dashboard Integration

**Add to existing dashboard page (`src/app/(admin)/dashboard/page.tsx`):**
- Import status indicators for zines
- Bulk import actions
- Re-import functionality for failed imports

**New import form component:**
```typescript
// src/components/admin/google-drive-import-form.tsx
interface ImportFormProps {
  zineId?: number;  // For editing existing zines
  onSuccess?: () => void;
}
```

### 5. Server Actions

**`src/app/(admin)/dashboard/import-actions.ts`:**
- `importZineFromDrive(zineId: number, driveUrl: string)`
- `retryFailedImport(zineId: number)`  
- `bulkImportZines(importData: { zineId: number, driveUrl: string }[])`

### 6. Database Type Updates

**Update `src/types/database.types.ts`:**
```typescript
// Add new fields to library_zines type
drive_folder_id: string | null;
total_pages: number | null; 
import_status: 'pending' | 'processing' | 'completed' | 'failed' | null;

// Add new zine_pages table type
zine_pages: {
  Row: {
    id: number;
    zine_id: number;
    page_number: number;
    image_url: string;
    original_drive_url: string | null;
    created_at: string | null;
  };
  // ... Insert/Update types
}
```

### 7. Zod Schemas

**`src/schemas/google-drive-import.ts`:**
```typescript
export const googleDriveImportSchema = z.object({
  driveUrl: z.string().url().refine(url => 
    url.includes('drive.google.com/drive/folders/'), 
    'Must be a Google Drive folder URL'
  ),
  zineId: z.number().optional(),
});
```

## Implementation Requirements

### Error Handling
- Graceful handling of invalid Drive URLs
- Retry logic for failed image downloads
- Status tracking and user feedback
- Rollback capability for failed imports

### Security & Performance
- Rate limiting for Drive API calls
- Image optimization before R2 upload
- Async processing for large folders
- Progress tracking for long-running imports

### UI/UX Considerations
- Loading states during import
- Progress indicators
- Error messages with actionable steps
- Bulk selection and import capabilities

### File Structure
Follow existing patterns:
- Place services in `src/services/`
- Use existing component patterns from `src/components/dashboard/`
- Follow server action patterns from `src/app/(admin)/dashboard/actions.ts`
- Add migration files in `supabase/migrations/`

## Integration Points
- Extend existing dashboard filtered uploads component
- Use existing form patterns with react-hook-form
- Follow existing error handling patterns
- Integrate with existing notification system (Telegram)

Please implement this feature following the existing codebase patterns, ensuring type safety, proper error handling, and maintaining the current architectural decisions.