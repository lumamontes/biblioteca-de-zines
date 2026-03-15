"use server";

import { revalidatePath } from "next/cache";
import { importFromGoogleDrive } from "@/services/zine-import-service";
import { googleDriveImportSchema } from "@/schemas/google-drive-import";

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

    // Import from Google Drive
    await importFromGoogleDrive(zineId, driveUrl);

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Zine imported successfully from Google Drive",
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

