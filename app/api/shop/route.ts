import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json(await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } })); }
