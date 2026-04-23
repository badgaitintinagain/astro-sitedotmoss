import { NextResponse } from 'next/server';
import { db, comments } from '@/lib/db';
import { withAuth } from '@/lib/middleware/auth';
import { desc } from 'drizzle-orm';

async function handler() {
  try {
    const allComments = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt));

    return NextResponse.json({ comments: allComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, true);
