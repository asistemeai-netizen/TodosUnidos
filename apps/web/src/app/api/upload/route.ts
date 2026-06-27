import { NextRequest, NextResponse } from 'next/server';
import { minioClient, BUCKET_NAME, ensureBucketExists } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    await ensureBucketExists();

    const contentType = file.type || 'application/octet-stream';

    await minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
      'Content-Type': contentType
    });

    const endpointUrl = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    const photoUrl = `${endpointUrl}/${BUCKET_NAME}/${fileName}`;

    return NextResponse.json({ url: photoUrl });

  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
