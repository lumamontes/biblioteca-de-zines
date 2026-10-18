"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { googleDriveImportSchema, GoogleDriveImportData } from "@/schemas/google-drive-import";
import { importZineFromDrive } from "@/app/(admin)/dashboard/import-actions";
import Button from "@/components/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";

interface GoogleDriveImportFormProps {
  zineId: number;
  onSuccess?: () => void;
}
export function GoogleDriveImportForm({ zineId, onSuccess }: GoogleDriveImportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoogleDriveImportData>({
    resolver: zodResolver(googleDriveImportSchema),
    defaultValues: {
      zineId,
      driveUrl: "",
    },
  });

  const onSubmit = async (data: GoogleDriveImportData) => {
    setIsSubmitting(true);
    try {
      const result = await importZineFromDrive(data.zineId, data.driveUrl);

      if (result.success) {
        toast.success(result.message);
        reset();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Import error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("driveUrl")}
        label="Google Drive File URL"
        placeholder="https://drive.google.com/file/d/FILE_ID/view"
        error={errors.driveUrl?.message}
        helperText="Paste the Google Drive file URL (supports images and PDFs)"
        disabled={isSubmitting}
      />

      <input type="hidden" {...register("zineId")} />

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? "Importing..." : "Import from Drive"}
        </Button>
      </div>
    </form>
  );
}
