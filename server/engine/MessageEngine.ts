import { Client, User } from 'discord.js-selfbot-v13';
import { botManager } from './BotManager';
import { prisma } from '../../lib/db';

interface SendMessagePayload {
  campaignId: string;
  messageId: string;
  leadId: string;
  tokenIds: string[];
  message: string;
  cooldownMin: number;
  cooldownMax: number;
  useTyping: boolean;
}

export class MessageEngine {
  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async executeCampaign(payload: SendMessagePayload) {
    const { tokenIds, message, cooldownMin, cooldownMax, useTyping } = payload;
    
    // Fetch leads
    const leads = await prisma.lead.findMany({
      where: { id: { in: payload.leadIds }, isTarget: true }
    });

    if (leads.length === 0) return;

    // Token Rotation Logic
    let tokenIndex = 0;
    
    for (const lead of leads) {
      // Select token (Round Robin)
      const currentTokenId = tokenIds[tokenIndex % tokenIds.length];
      tokenIndex++;

      const client = botManager.getClient(currentTokenId);
      if (!client) continue;

      try {
        const user = await client.users.fetch(lead.userId);
        await this.sendHumanizedMessage(client, user, message, useTyping, cooldownMin, cooldownMax);
        
        await prisma.lead.update({
          where: { id: lead.id },
          data: { sentCount: { increment: 1 }, lastSentAt: new Date() }
        });

        // Log success
        await prisma.log.create({
          data: {
            campaignId: payload.campaignId,
            tokenName: client.user.tag,
            leadId: lead.userId,
            status: 'SUCCESS'
          }
        });

      } catch (error) {
        console.error(`[ENGINE] Failed to send to ${lead.userId}:`, error);
        await prisma.log.create({
          data: {
            campaignId: payload.campaignId,
            tokenName: client.user.tag,
            leadId: lead.userId,
            status: 'ERROR',
            error: (error as Error).message
          }
        });
      }
    }
  }

  private async sendHumanizedMessage(
    client: Client, 
    user: User, 
    content: string, 
    useTyping: boolean,
    minDelay: number,
    maxDelay: number
  ) {
    const channel = await user.createDM();
    
    // Humanized Delay
    const delayMs = this.randomInt(minDelay, maxDelay) * 1000;
    await this.sleep(delayMs);

    if (useTyping) {
      channel.sendTyping();
      // Wait a bit while "typing"
      await this.sleep(this.randomInt(2000, 5000));
    }

    await channel.send(content);
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const messageEngine = new MessageEngine();