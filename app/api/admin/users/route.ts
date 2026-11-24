import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ userId: z.string().min(1), role: z.enum(['MEMBER', 'MODERATOR', 'ADMIN']) });
export async function GET() {
  const actor = await requireRole(['OWNER', 'ADMIN']);
  if (!actor) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  return NextResponse.json(await prisma.user.findMany({ select: { id: true, username: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'asc' } }));
}
export async function PATCH(request: Request) {
  const actor = await requireRole(['OWNER']);
  if (!actor) return NextResponse.json({ error: 'Only the Owner can change member roles.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid role update.' }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target || target.role === 'OWNER') return NextResponse.json({ error: 'The Owner account is protected.' }, { status: 403 });
  const updated = await prisma.user.update({ where: { id: target.id }, data: { role: parsed.data.role }, select: { id: true, username: true, role: true } });
  await prisma.auditLog.create({ data: { actorId: actor.id, action: `ROLE_${parsed.data.role}`, target: target.id } });
  return NextResponse.json({ user: updated });
}
