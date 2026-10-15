"use server";

import { revalidatePath } from "next/cache";
import { googleDriveImportSchema } from "@/schemas/google-drive-import";
import { createSourceImportModule } from '@/composition/server/source-import-module';

/**
 * Import zine from Google Drive URL
 */
export async function importZineFromDrive(
  zineId: number,
  driveUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input
    const validationResult = googleDriveImportSchema.safeParse({
      zineId,
      driveUrl,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.errors[0]?.message || "Invalid input",
      };
    }

    await (await createSourceImportModule()).importFromDrive(zineId, driveUrl);

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Zine queued for processing from Google Drive",
    };
  } catch (error) {
    console.error("Error importing zine from Drive:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import zine from Google Drive",
    };
  }
}

/**
 * Retry failed import
 */
export async function retryFailedImport(
  zineId: number,
  driveUrl: string
): Promise<{ success: boolean; message: string }> {
  // Same as importZineFromDrive, but can be extended with retry-specific logic
  return importZineFromDrive(zineId, driveUrl);
}
