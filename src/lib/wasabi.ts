import { AwsClient } from 'aws4fetch';

const wasabiAccessKeyId = process.env.WASABI_ACCESS_KEY_ID;
const wasabiSecretAccessKey = process.env.WASABI_SECRET_ACCESS_KEY;
const wasabiRegion = process.env.WASABI_REGION || 'eu-central-1';
const wasabiBucketName = process.env.WASABI_BUCKET_NAME;

// Wasabi endpoints are region specific (e.g. s3.eu-central-1.wasabisys.com)
const wasabiEndpoint = process.env.WASABI_ENDPOINT || `https://s3.${wasabiRegion}.wasabisys.com`;

export const wasabiClient = new AwsClient({
  accessKeyId: wasabiAccessKeyId || '',
  secretAccessKey: wasabiSecretAccessKey || '',
  service: 's3',
  region: wasabiRegion,
});

/**
 * Generates a presigned PUT URL for direct client upload to a Wasabi S3 bucket.
 * @param objectKey The target S3 path/filename.
 * @param contentType The MIME type of the file.
 * @param contentLength The file size in bytes.
 * @param expiresInSeconds The URL expiration time in seconds (default 300 / 5 minutes).
 */
export async function getPresignedPutUrl(
  objectKey: string,
  contentType: string,
  contentLength: number,
  expiresInSeconds = 300
): Promise<string> {
  if (!wasabiAccessKeyId || !wasabiSecretAccessKey || !wasabiBucketName) {
    throw new Error('Missing Wasabi S3 configuration in environment variables');
  }

  // Construct URL with bucket name and object key
  const url = new URL(`${wasabiEndpoint}/${wasabiBucketName}/${objectKey}`);
  
  // Set expiration in query params (aws4fetch will sign it)
  url.searchParams.set('X-Amz-Expires', expiresInSeconds.toString());

  // Sign request using aws4fetch in query parameter signing mode (signQuery)
  const signedRequest = await wasabiClient.sign(
    new Request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength.toString(),
      },
    }),
    {
      aws: {
        signQuery: true,
        allHeaders: true,
      },
    }
  );

  return signedRequest.url;
}
