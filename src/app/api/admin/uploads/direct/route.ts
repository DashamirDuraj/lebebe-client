import { NextResponse } from "next/server";
import { buildPublicUrl, uploadObject } from "@/lib/storage";

export const runtime = "nodejs";

type ManifestItem = {
  index: number;
  fileName?: string;
  contentType?: string;
  isThumbnail?: boolean;
};

const sanitize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_.]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const slug = (form.get("slug") as string | null)?.trim();
    const manifestRaw = form.get("manifest") as string | null;

    if (!slug) {
      return NextResponse.json({ message: "Missing slug" }, { status: 400 });
    }
    if (!manifestRaw) {
      return NextResponse.json({ message: "Missing manifest" }, { status: 400 });
    }

    const manifest = JSON.parse(manifestRaw) as ManifestItem[];
    if (!Array.isArray(manifest) || manifest.length === 0) {
      return NextResponse.json({ message: "Invalid manifest" }, { status: 400 });
    }

    const safeSlug = sanitize(slug);
    const uploads = [];

    for (const item of manifest) {
      const file = form.get(`file-${item.index}`) as File | null;
      if (!file) continue;

      const safeName = sanitize(item.fileName || file.name || "file");
      const contentType = item.contentType || file.type || "application/octet-stream";
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const originalKey = `products/${safeSlug}/original/${safeName}`;
      const originalUrl = await uploadObject(originalKey, contentType, buffer);

      let thumbnailUrl: string | undefined;
      if (item.isThumbnail) {
        const thumbKey = `products/${safeSlug}/thumb/${safeName}`;
        thumbnailUrl = await uploadObject(thumbKey, contentType, buffer);
      }

      uploads.push({
        index: item.index,
        originalUrl,
        thumbnailUrl,
        publicUrl: originalUrl,
        thumbPublicUrl: thumbnailUrl,
      });
    }

    return NextResponse.json({ uploads });
  } catch (error: any) {
    console.error("Direct upload error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to upload files" },
      { status: 400 },
    );
  }
}
