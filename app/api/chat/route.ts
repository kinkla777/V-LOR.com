import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const messages = await prisma.message.findMany({ include: { user: { select: { username: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json(messages.reverse());
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Log in to send messages.' }, { status: 401 });
  if (user.role === 'MEMBER' && user.createdAt.getTime() > Date.now() - 10_000) return NextResponse.json({ error: 'Please wait a few seconds before posting.' }, { status: 429 });
  const parsed = z.object({ body: z.string().trim().min(1).max(500) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Message must be 1–500 characters.' }, { status: 400 });
  const message = await prisma.message.create({ data: { body: parsed.data.body, userId: user.id }, include: { user: { select: { username: true, role: true } } } });
  return NextResponse.json(message, { status: 201 });
}
