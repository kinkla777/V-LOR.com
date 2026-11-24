import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, bio: true, createdAt: true }, orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] });
  return NextResponse.json(users);
}
