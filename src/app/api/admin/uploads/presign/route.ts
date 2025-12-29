import { NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/storage";

type PresignRequestFile = {
  index: number;
  fileName: string;
  contentType?: string;
  isThumbnail?: boolean;
};

const sanitize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_\\.]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = (body?.slug as string | undefined)?.trim();
    const files = body?.files as PresignRequestFile[] | undefined;

    if (!slug) {
      return NextResponse.json({ message: "Missing slug" }, { status: 400 });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ message: "No files" }, { status: 400 });
    }

    const safeSlug = sanitize(slug);

    const uploads = await Promise.all(
      files.map(async (file) => {
        const safeName = sanitize(file.fileName || "file");
        const contentType = file.contentType || "application/octet-stream";

        const originalKey = `products/${safeSlug}/original/${safeName}`;
        const original = await createPresignedUploadUrl(originalKey, contentType);

        let thumb:
          | {
              uploadUrl: string;
              publicUrl: string;
            }
          | undefined;

        if (file.isThumbnail) {
          const thumbKey = `products/${safeSlug}/thumb/${safeName}`;
          thumb = await createPresignedUploadUrl(thumbKey, contentType);
        }

        return {
          index: file.index,
          fileName: safeName,
          contentType,
          originalUploadUrl: original.uploadUrl,
          originalPublicUrl: original.publicUrl,
          thumbnailUploadUrl: thumb?.uploadUrl,
          thumbnailPublicUrl: thumb?.publicUrl,
        };
      }),
    );

    return NextResponse.json({ uploads });
  } catch (error: any) {
    console.error("Presign error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to create upload URLs" },
      { status: 400 },
    );
  }
}
