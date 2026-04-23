import { NextRequest, NextResponse } from 'next/server';
import { db, posts } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware/auth';

async function publishPostHandler(
  request: NextRequest,
  user: { id: string; email: string; name: string; role: string },
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { published } = body;

    await db
      .update(posts)
      .set({ published })
      .where(eq(posts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(publishPostHandler, true);
