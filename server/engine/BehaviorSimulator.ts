import { Client, Message, TextBasedChannel } from 'discord.js-selfbot-v13';

export class BehaviorSimulator {
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Simula comportamento humano ao receber uma mensagem em um canal.
   * Se configurado para Auto-Reply, responde após um delay.
   */
  handleIncomingMessage(client: Client, message: Message, autoReplyContent?: string) {
    // Ignorar se for o próprio bot
    if (message.author.bot) return;

    // 1. Simular leitura (delay base)
    const readDelay = 2000 + Math.random() * 3000; // 2-5s

    setTimeout(() => {
      // 2. Simular digitação
      const channel = message.channel as TextBasedChannel;
      channel.sendTyping();
      
      // 3. Enviar resposta após tempo de "digitação"
      const typingDuration = 3000 + Math.random() * 4000; // 3-7s de digitação simulada
      
      setTimeout(() => {
        if (autoReplyContent) {
          // Substituir variáveis simples
          const content = autoReplyContent.replace('{user}', `<@${message.author.id}>`);
          channel.send(content).catch(console.error);
        }
      }, typingDuration);

    }, readDelay);
  }

  /**
   * Inicia a "escuta" de um canal para auto-reply.
   */
  listenForChannel(client: Client, channelId: string, autoReplyContent?: string) {
    const channel = client.channels.cache.get(channelId) as TextBasedChannel;
    if (!channel) return;

    channel.on('messageCreate', (msg) => {
      this.handleIncomingMessage(client, msg, autoReplyContent);
    });
  }
}