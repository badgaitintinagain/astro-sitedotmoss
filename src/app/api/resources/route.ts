import { NextRequest, NextResponse } from 'next/server';
import { db, resources } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { generateId } from '@/lib/auth/utils';
import { withAuth } from '@/lib/middleware/auth';
import cloudinary from '@/lib/cloudinary';

// Public: list all resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const query = category
      ? db.select().from(resources).where(eq(resources.category, category)).orderBy(desc(resources.createdAt))
      : db.select().from(resources).orderBy(desc(resources.createdAt));

    const items = await query;

    return NextResponse.json({ resources: items });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

// Admin: upload a resource
async function uploadResourceHandler(
  request: NextRequest,
  user: { id: string; email: string; name: string; role: string }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'resources',
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      ).end(buffer);
    });

    const resourceId = generateId();

    await db.insert(resources).values({
      id: resourceId,
      title,
      description: description || null,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      category: category || 'general',
      uploadedBy: user.name,
    });

    return NextResponse.json({
      success: true,
      resource: {
        id: resourceId,
        title,
        imageUrl: result.secure_url,
      },
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    return NextResponse.json({ error: 'Failed to upload resource' }, { status: 500 });
  }
}

export const POST = withAuth(uploadResourceHandler, true);
