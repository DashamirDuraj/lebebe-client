import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.DO_SPACES_REGION;
const bucket = process.env.DO_SPACES_BUCKET;
const cdnBase = process.env.DO_SPACES_CDN;

export const spacesClient =
  endpoint && bucket
    ? new S3Client({
        endpoint,
        region: region ?? "us-east-1",
        forcePathStyle: false,
        credentials: {
          accessKeyId: process.env.DO_SPACES_KEY || "",
          secretAccessKey: process.env.DO_SPACES_SECRET || "",
        },
      })
    : null;

export function buildPublicUrl(key: string) {
  if (!key) return "";
  if (cdnBase) return `${cdnBase.replace(/\/+$/, "")}/${key}`;
  if (bucket && endpoint) {
    return `${endpoint.replace(/\/+$/, "")}/${bucket}/${key}`;
  }
  return key;
}

export async function createPresignedUploadUrl(key: string, contentType: string) {
  if (!spacesClient || !bucket) {
    throw new Error("Spaces client not configured");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  const uploadUrl = await getSignedUrl(spacesClient, command, { expiresIn: 60 * 5 });
  return {
    uploadUrl,
    publicUrl: buildPublicUrl(key),
  };
}

export async function uploadObject(key: string, contentType: string, body: Buffer | Uint8Array) {
  if (!spacesClient || !bucket) {
    throw new Error("Spaces client not configured");
  }

  await spacesClient.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
    }),
  );

  return buildPublicUrl(key);
}
