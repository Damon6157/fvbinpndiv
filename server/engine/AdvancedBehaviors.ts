import { Client, Channel, TextBasedChannel } from 'discord.js-selfbot-v13';
import { prisma } from '../../lib/db';
import { emitToDashboard } from '../../lib/events';

export class AdvancedBehaviors {
  private activeListeners: Map<string, string[]> = new Map(); // TokenId -> ChannelIds

  /**
   * Inicia a escuta de canais para encontrar convites (Auto-Join)
   */
  startInviteListener(client: Client, tokenId: string, channelIds: string[]) {
    if (this.activeListeners.has(tokenId)) {
      this.stopInviteListener(tokenId);
    }

    this.activeListeners.set(tokenId, channelIds);

    const handler = (message: any) => {
      // Verificar se o canal é um dos monitorados
      if (!this.activeListeners.get(tokenId)?.includes(message.channel.id)) return;

      // Regex para encontrar convites de Discord
      const inviteRegex = /discord(?:\.gg|\.com\/invite|app\.com\/[a-zA-Z0-9]+\/)\/[a-zA-Z0-9-]+/g;
      const invites = message.content.match(inviteRegex);

      if (invites) {
        for (const invite of invites) {
          // Normalizar URL
          const url = invite.startsWith('http') ? invite : `https://discord.gg/${invite.split('/').pop()}`;
          
          console.log(`[AUTO-JOIN] Found invite in ${message.channel.name}: ${url}`);
          
          // Disparar o join com delay
          setTimeout(async () => {
            try {
              const guild = await client.invites.create(url);
              await guild.guild.members.me.join();
              emitToDashboard('log-activity', {
                type: 'AUTO_JOIN',
                tokenName: client.user.tag,
                detail: `Joined ${guild.guild.name} via listener`,
                status: 'SUCCESS'
              });
            } catch (error) {
              console.error(`[AUTO-JOIN] Failed to join ${url}:`, error);
            }
          }, 2000 + Math.random() * 3000);
        }
      }
    };

    client.on('messageCreate', handler);
    
    // Armazenar o handler para remoção futura
    (client as any).__inviteHandler = handler;
  }

  stopInviteListener(tokenId: string) {
    // Em uma implementação real, você precisaria manter uma referência ao client
    // ou usar um EventEmitter customizado. Aqui, assumimos que o client está no BotManager.
    // Para simplificar, vamos apenas remover do mapa. A limpeza real do listener 
    // seria feita via client.off('messageCreate', handler).
    this.activeListeners.delete(tokenId);
  }

  /**
   * Simula "leitura" de mensagens antes de responder (Auto-Reply Contextual)
   */
  simulateReading(client: Client, channelId: string) {
    const channel = client.channels.cache.get(channelId) as TextBasedChannel;
    if (channel) {
      // Fingir que está lendo o histórico
      channel.messages.fetch({ limit: 10 }).then(msgs => {
        // Log interno de que o bot "leu" as últimas 10 mensagens
        console.log(`[READ] ${client.user.tag} read 10 messages in ${channel.name}`);
      }).catch(console.error);
    }
  }
}

export const advancedBehaviors = new AdvancedBehaviors();