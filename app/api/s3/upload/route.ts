import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,      // https://s3.ru-7.storage.selcloud.ru
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    if (!filename) {
      return NextResponse.json({ error: "filename required" }, { status: 400 });
    }

    const body = await req.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: filename,
        Body: Buffer.from(body),
        ContentType: "application/octet-stream",
      })
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("s3 upload error:", e);
    return NextResponse.json(
      { error: e?.message ?? "upload failed" },
      { status: 500 }
    );
  }
}
