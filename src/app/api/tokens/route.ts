import { NextResponse } from 'next/server';
import { TokenService } from '@/server/services/TokenService';
import { z } from 'zod';

const tokenSchema = z.object({
  token: z.string().min(10),
  proxyAddress: z.string().optional(),
  proxyUser: z.string().optional(),
  proxyPass: z.string().optional(),
  proxyId: z.string().optional()
});

const tokenService = new TokenService();

export async function GET() {
  const tokens = await tokenService.getAllTokens();
  return NextResponse.json(tokens);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Suporte para upload massivo (array) ou single
    const payload = Array.isArray(body) ? body : [body];
    
    const results = [];
    for (const item of payload) {
      const parsed = tokenSchema.parse(item);
      const result = await tokenService.validateAndSave([parsed.token], {
        proxyAddress: parsed.proxyAddress,
        proxyUser: parsed.proxyUser,
        proxyPass: parsed.proxyPass,
        proxyId: parsed.proxyId
      });
      results.push(...result);
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}