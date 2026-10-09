import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1)
});

export async function GET() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = templateSchema.parse(body);
  
  const template = await prisma.template.create({ data });
  return NextResponse.json(template, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ success: true });
}