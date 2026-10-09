import { prisma } from '../../lib/db';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getHumanizedDelay } from '../../lib/utils';

export class ProxyService {
  /**
   * Vincula um proxy existente a um token.
   * Se o token já tiver proxy, desvincula o antigo e vincula o novo.
   */
  async assignProxyToToken(tokenId: string, proxyId: string | null) {
    return await prisma.token.update({
      where: { id: tokenId },
      data: {
        proxy: proxyId ? { connect: { id: proxyId } } : { disconnect: true }
      },
      include: { proxy: true }
    });
  }

  /**
   * Cria um novo proxy e o vincula imediatamente a um token.
   */
  async createAndAssignProxy(tokenId: string, proxyData: { address: string; username?: string; password?: string }) {
    const proxy = await prisma.proxy.upsert({
      where: { address: proxyData.address },
      update: { username: proxyData.username, password: proxyData.password },
      create: proxyData
    });

    return await this.assignProxyToToken(tokenId, proxy.id);
  }

  /**
   * Testa a conectividade de um proxy fazendo uma requisição simples.
   */
  async testProxyConnection(address: string, username?: string, password?: string): Promise<boolean> {
    try {
      const proxyUrl = username 
        ? `http://${username}:${password}@${address}`
        : `http://${address}`;
      
      const agent = new HttpsProxyAgent(proxyUrl);
      
      // Testa conectividade com o Discord API (leve e confiável)
      const response = await fetch('https://discord.com/api/v10/gateway', {
        agent: agent as any,
        method: 'GET',
        timeout: 5000
      });

      return response.ok;
    } catch (error) {
      console.error(`[PROXY-TEST] Failed to connect to ${address}:`, error);
      return false;
    }
  }

  /**
   * Rotação de Proxy: Retorna um proxy aleatório da lista de ativos.
   * Útil para campanhas que usam múltiplos proxies.
   */
  async getRandomActiveProxy(): Promise<string | null> {
    const proxies = await prisma.proxy.findMany({
      where: { /* Pode filtrar por status se adicionar campo is_active */ },
      select: { address: true, username: true, password: true }
    });

    if (proxies.length === 0) return null;
    
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    return randomProxy.username 
      ? `http://${randomProxy.username}:${randomProxy.password}@${randomProxy.address}`
      : `http://${randomProxy.address}`;
  }
}