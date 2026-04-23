import { NextRequest, NextResponse } from 'next/server';
import { db, resources } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware/auth';
import cloudinary from '@/lib/cloudinary';

type RouteContext = { params: Promise<{ id: string }> };

// Admin: delete a resource
async function deleteResourceHandler(
  request: NextRequest,
  user: { id: string; email: string; name: string; role: string },
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Get the resource first to find cloudinary public_id
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(resource.publicId);
    } catch {
      console.error('Failed to delete from Cloudinary, continuing with DB delete');
    }

    // Delete from DB
    await db.delete(resources).where(eq(resources.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

export const DELETE = withAuth(deleteResourceHandler, true);
