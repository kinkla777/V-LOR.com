import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const posts = await prisma.newsPost.findMany({ include: { author: { select: { username: true } } }, orderBy: { createdAt: 'desc' }, take: 30 });
  return NextResponse.json(posts);
}
