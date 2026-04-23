import type { APIRoute } from 'astro';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await uploadToCloudinary(file, {
      folder: 'blog-posts',
      resourceType: 'auto',
      transformation: 'c_limit,h_1200,w_1200/f_auto,q_auto'
    });

    return new Response(JSON.stringify({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
