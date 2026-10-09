import { prisma } from '../../lib/db';
import { z } from 'zod';

const tokenSchema = z.object({
  token: z.string().min(10),
  proxyId: z.string().optional(),
  proxyAddress: z.string().optional(),
  proxyUser: z.string().optional(),
  proxyPass: z.string().optional()
});

export class TokenService {
  async validateAndSave(tokens: string[], proxyData?: any) {
    const results = [];
    for (const token of tokens) {
      try {
        // Basic format check + optional API check if needed
        const isValidFormat = token.split('.').length === 3;
        if (!isValidFormat) throw new Error("Invalid token format");

        const existing = await prisma.token.findUnique({ where: { token } });
        if (existing) {
          return { token, status: 'EXISTING', id: existing.id };
        }

        // Handle Proxy Binding
        let proxy = undefined;
        if (proxyData?.proxyAddress) {
          proxy = await prisma.proxy.upsert({
            where: { address: proxyData.proxyAddress },
            update: {
              username: proxyData.proxyUser,
              password: proxyData.proxyPass
            },
            create: {
              address: proxyData.proxyAddress,
              username: proxyData.proxyUser,
              password: proxyData.proxyPass
            }
          });
        } else if (proxyData?.proxyId) {
          proxy = await prisma.proxy.findUnique({ where: { id: proxyData.proxyId } });
        }

        const newToken = await prisma.token.create({
          data: {
            token,
            status: 'VALID',
            proxy: proxy ? { connect: { id: proxy.id } } : undefined
          }
        });

        results.push({ token, status: 'NEW', id: newToken.id });
      } catch (error) {
        results.push({ token, status: 'INVALID', error: (error as Error).message });
      }
    }
    return results;
  }

  async cleanupInvalidTokens() {
    const invalidTokens = await prisma.token.findMany({ where: { status: 'INVALID' } });
    await prisma.token.deleteMany({ where: { id: { in: invalidTokens.map(t => t.id) } } });
    return invalidTokens.length;
  }
}