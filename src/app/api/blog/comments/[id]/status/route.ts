import { NextRequest, NextResponse } from 'next/server';
import { db, comments } from '@/lib/db';
import { withAuth } from '@/lib/middleware/auth';
import { eq } from 'drizzle-orm';

async function handler(
  request: NextRequest,
  user: { id: string; email: string; name: string; role: string },
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await db
      .update(comments)
      .set({ status })
      .where(eq(comments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating comment status:', error);
    return NextResponse.json(
      { error: 'Failed to update comment status' },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(handler, true);
