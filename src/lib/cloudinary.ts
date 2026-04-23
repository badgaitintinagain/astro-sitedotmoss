type UploadOptions = {
  folder?: string;
  transformation?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
};

type UploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  resource_type?: string;
};

function env(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name]
    ?? (typeof process !== 'undefined' ? process.env[name] : undefined);
}

function requiredEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function sha1Hex(input: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const { createHash } = await import('node:crypto');
  return createHash('sha1').update(input).digest('hex');
}

async function signParams(params: Record<string, string>, apiSecret: string): Promise<string> {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return sha1Hex(`${serialized}${apiSecret}`);
}

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const cloudName = requiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = requiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = requiredEnv('CLOUDINARY_API_SECRET');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = options.folder ?? 'uploads';
  const transformation = options.transformation ?? '';
  const resourceType = options.resourceType ?? 'auto';

  const signatureParams: Record<string, string> = {
    timestamp,
    folder,
  };

  if (transformation) {
    signatureParams.transformation = transformation;
  }

  const signature = await signParams(signatureParams, apiSecret);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  if (transformation) {
    formData.append('transformation', transformation);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(uploadUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<UploadResult>;
}

export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const cloudName = requiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = requiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = requiredEnv('CLOUDINARY_API_SECRET');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signature = await signParams({ public_id: publicId, timestamp }, apiSecret);
  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  const response = await fetch(destroyUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary destroy failed (${response.status}): ${detail}`);
  }
}
