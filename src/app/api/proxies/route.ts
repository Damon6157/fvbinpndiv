import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const proxySchema = z.object({
  address: z.string().regex(/^\d{1,3}(\.\d{1,3}){3}:\d+$/, "Invalid IP:Port format"),
  username: z.string().optional(),
  password: z.string().optional()
});

export async function GET() {
  const proxies = await prisma.proxy.findMany({
    include: {
      _count: { select: { tokens: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(proxies);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = proxySchema.parse(body);

    // Upsert: Se o proxy já existir, atualiza; senão, cria
    const proxy = await prisma.proxy.upsert({
      where: { address: data.address },
      update: {
        username: data.username,
        password: data.password
      },
      create: data
    });

    return NextResponse.json(proxy, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await prisma.proxy.delete({ where: { id } });
  return NextResponse.json({ success: true });
}