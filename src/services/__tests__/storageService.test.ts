import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPresignedUploadUrl } from '../storageService';

vi.mock('@/lib/wasabi', () => ({
  getPresignedPutUrl: vi.fn().mockResolvedValue('https://wasabi.example.com/upload'),
}));

describe('storageService', () => {
  beforeEach(() => {
    vi.stubEnv('WASABI_BUCKET_NAME', 'test-bucket');
    vi.stubEnv('WASABI_ENDPOINT', 'https://s3.test.wasabisys.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns upload url and public file url', async () => {
    const result = await getPresignedUploadUrl({
      filename: 'photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024,
    });

    expect(result.uploadUrl).toBe('https://wasabi.example.com/upload');
    expect(result.fileUrl).toContain('test-bucket');
    expect(result.fileUrl).toContain('uploads/');
    expect(result.objectKey).toContain('photo.jpg');
  });

  it('rejects non-image files', async () => {
    await expect(
      getPresignedUploadUrl({ filename: 'file.pdf', fileType: 'application/pdf', fileSize: 1024 })
    ).rejects.toThrow('Only image uploads are allowed');
  });

  it('rejects files larger than 10MB', async () => {
    await expect(
      getPresignedUploadUrl({ filename: 'big.jpg', fileType: 'image/jpeg', fileSize: 11 * 1024 * 1024 })
    ).rejects.toThrow('File size exceeds maximum limit of 10MB');
  });
});
