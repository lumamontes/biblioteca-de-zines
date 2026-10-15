import { downloadFile } from "@/services/google-drive-service";

export const runtime = "nodejs";

const GOOGLE_DRIVE_FILE_ID = /^[A-Za-z0-9_-]{1,200}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  if (!GOOGLE_DRIVE_FILE_ID.test(fileId)) {
    return Response.json({ error: "Invalid Google Drive file ID." }, { status: 400 });
  }

  try {
    const { buffer } = await downloadFile(fileId);
    if (buffer.subarray(0, 4).toString() !== "%PDF") {
      return Response.json(
        { error: "Google Drive did not return a PDF publication." },
        { status: 502 },
      );
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "The Google Drive publication could not be loaded.",
        detail: error instanceof Error ? error.message : "Unknown upstream error",
      },
      { status: 502 },
    );
  }
}
