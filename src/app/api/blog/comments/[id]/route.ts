import { NextRequest, NextResponse } from 'next/server';
import { db, comments } from '@/lib/db';
import { withAuth } from '@/lib/middleware/auth';
import { eq } from 'drizzle-orm';

async function deleteHandler(
  request: NextRequest,
  user: { id: string; email: string; name: string; role: string },
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await db.delete(comments).where(eq(comments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(deleteHandler, true);
