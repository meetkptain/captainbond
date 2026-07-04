import { getPresignedPutUrl } from '@/lib/wasabi';
import { AppError } from '@/lib/errors';

export interface PresignUploadInput {
  filename: string;
  fileType: string;
  fileSize: number;
}

export interface PresignUploadResult {
  uploadUrl: string;
  fileUrl: string;
  objectKey: string;
}

export async function getPresignedUploadUrl(input: PresignUploadInput): Promise<PresignUploadResult> {
  if (!input.filename || !input.fileType || input.fileSize === undefined) {
    throw new AppError('VALIDATION_ERROR', 'Missing required parameters: filename, fileType, fileSize');
  }

  if (!process.env.WASABI_ACCESS_KEY_ID || !process.env.WASABI_SECRET_ACCESS_KEY || !process.env.WASABI_BUCKET_NAME) {
    throw new AppError('CONFIG_MISSING', 'Wasabi storage is not configured. Contact support.');
  }

  const maxFileSize = 10 * 1024 * 1024;
  if (input.fileSize > maxFileSize) {
    throw new AppError('VALIDATION_ERROR', 'File size exceeds maximum limit of 10MB');
  }

  if (!input.fileType.startsWith('image/')) {
    throw new AppError('VALIDATION_ERROR', 'Only image uploads are allowed');
  }

  const uniqueId = crypto.randomUUID();
  const cleanFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = `uploads/${uniqueId}-${cleanFilename}`;

  const uploadUrl = await getPresignedPutUrl(objectKey, input.fileType, input.fileSize, 300);

  const wasabiRegion = process.env.WASABI_REGION || 'eu-central-1';
  const wasabiBucketName = process.env.WASABI_BUCKET_NAME || 'placeholder-bucket';
  const wasabiEndpoint = process.env.WASABI_ENDPOINT || `https://s3.${wasabiRegion}.wasabisys.com`;
  const fileUrl = `${wasabiEndpoint}/${wasabiBucketName}/${objectKey}`;

  return { uploadUrl, fileUrl, objectKey };
}
