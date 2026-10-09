import { Client } from 'discord.js-selfbot-v13';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { prisma } from '../../lib/db';

export class ProxyResilience {
  private failedProxies: Map<string, number> = new Map(); // ProxyId -> FailureCount

  async handleConnectionError(client: Client, tokenId: string, error: Error) {
    // Verificar se o erro é de rede/proxy
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT') || error.message.includes('PROXY')) {
      const token = await prisma.token.findUnique({
        where: { id: tokenId },
        include: { proxy: true }
      });

      if (token?.proxy) {
        const proxyId = token.proxy.id;
        const currentFailures = this.failedProxies.get(proxyId) || 0;
        const newFailures = currentFailures + 1;
        this.failedProxies.set(proxyId, newFailures);

        console.log(`[PROXY-RESILIENCE] Proxy ${proxyId} failed ${newFailures} times.`);

        // Se falhar 3 vezes, marcar proxy como inativo (opcional) ou rotacionar
        if (newFailures >= 3) {
          await prisma.proxy.update({
            where: { id: proxyId },
            data: { /* Campo is_active se existisse */ }
          });
          
          // Tentar reconectar sem proxy ou com outro proxy
          console.log(`[PROXY-RESILIENCE] Attempting fallback for token ${tokenId}`);
          await this.reconnectWithoutProxy(client, tokenId);
        }
      }
    }
  }

  private async reconnectWithoutProxy(client: Client, tokenId: string) {
    try {
      // Em uma implementação real, você reinicializaria o client com um novo agent
      // Para simplificar, apenas logamos a ação. O BotManager teria um método destroyAndRecreate
      console.log(`[PROXY-RESILIENCE] Token ${tokenId} would reconnect without proxy.`);
    } catch (e) {
      console.error(`[PROXY-RESILIENCE] Reconnect failed:`, e);
    }
  }
}

export const proxyResilience = new ProxyResilience();