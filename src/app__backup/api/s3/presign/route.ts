import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET   = process.env.S3_BUCKET!;
const REGION   = process.env.S3_REGION!;
const ENDPOINT = process.env.S3_ENDPOINT!;
const ACCESS   = process.env.S3_ACCESS_KEY_ID!;
const SECRET   = process.env.S3_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: ACCESS, secretAccessKey: SECRET },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  if (!filename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename,
    ContentType: "application/octet-stream",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 минут
  return NextResponse.json({ url, bucket: BUCKET, key: filename });
}
