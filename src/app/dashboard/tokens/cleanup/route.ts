import { NextResponse } from 'next/server';
import { TokenService } from '@/server/services/TokenService';

const tokenService = new TokenService();

export async function POST() {
  const count = await tokenService.cleanupInvalidTokens();
  return NextResponse.json({ deleted: count });
}