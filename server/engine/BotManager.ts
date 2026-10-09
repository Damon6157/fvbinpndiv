// Adicione dentro da classe BotManager em BotManager.ts

import { LeadScraper } from './LeadScraper';
import { BehaviorSimulator } from './BehaviorSimulator';
import { prisma } from '../../lib/db';
import { redis } from '../../lib/redis';
import { emitToDashboard } from '../index'; // Note: Cuidado com circular dependency, se houver, mova emitToDashboard para um arquivo de util.

private scraper: LeadScraper = new LeadScraper();
private simulator: BehaviorSimulator = new BehaviorSimulator();

async executeScrape(tokenId: string, guildId: string) {
  const client = this.clients.get(tokenId);
  if (!client) throw new Error('Token not found or offline');

  try {
    const count = await this.scraper.scrapeGuildMembers(client, guildId);
    // Atualizar contador de leads no Redis
    await redis.incr('stats:leads_scraped');
    emitToDashboard('leads-updated', { count });
    return count;
  } catch (error) {
    throw new Error(`Scrape failed: ${(error as Error).message}`);
  }
}

async executeJoin(tokenId: string, inviteUrl: string) {
  const client = this.clients.get(tokenId);
  if (!client) throw new Error('Token not found or offline');

  try {
    // Delay humanizado antes de entrar
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000));
    await this.scraper.inviteToServer(client, inviteUrl, 1000);
    emitToDashboard('log-activity', {
      type: 'JOIN',
      token: client.user.tag,
      detail: `Joined ${inviteUrl}`
    });
  } catch (error) {
    throw new Error(`Join failed: ${(error as Error).message}`);
  }
}