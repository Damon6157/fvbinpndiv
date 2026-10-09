import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const leads = await prisma.lead.findMany({
    where: { isTarget: true },
    take: 100,
    orderBy: { updatedAt: 'desc' }
  });
  return NextResponse.json(leads);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}