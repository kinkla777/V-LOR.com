import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export const runtime = 'nodejs';
const schema = z.object({ username: z.string().trim().min(3).max(24).regex(/^[\p{L}\p{N}_-]+$/u), email: z.string().trim().email().max(254), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid callsign, email, and password (8+ characters).' }, { status: 400 });
  const { username, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: normalizedEmail }, { username }] } });
  if (existing) return NextResponse.json({ error: 'That email or callsign is already registered.' }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const isInitialOwner = Boolean(process.env.OWNER_EMAIL) && normalizedEmail === process.env.OWNER_EMAIL?.toLowerCase();
  const user = await prisma.user.create({ data: { username, email: normalizedEmail, passwordHash, role: isInitialOwner ? 'OWNER' : 'MEMBER' }, select: { id: true, username: true, email: true, role: true, bio: true, createdAt: true } });
  await createSession(user.id);
  return NextResponse.json({ user }, { status: 201 });
}
