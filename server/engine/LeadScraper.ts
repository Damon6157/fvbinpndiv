import { Client, Guild, GuildMember } from 'discord.js-selfbot-v13';
import { prisma } from '../../lib/db';

export class LeadScraper {
  async scrapeGuildMembers(client: Client, guildId: string) {
    try {
      const guild = await client.guilds.fetch(guildId);
      const members = await guild.members.fetch();
      let scrapedCount = 0;

      for (const [, member] of members) {
        // Pular bots e contas verificadas (opcional)
        if (member.user.bot) continue;

        // Lógica de Upsert: Se já existe, atualiza; se não, cria
        const result = await prisma.lead.upsert({
          where: { userId: member.id },
          update: {
            username: member.user.username,
            guildId: guild.id,
            isTarget: true, // Ativa como alvo novamente
            updatedAt: new Date()
          },
          create: {
            userId: member.id,
            username: member.user.username,
            guildId: guild.id,
            isTarget: true
          }
        });

        scrapedCount++;
      }
      console.log(`[SCRAPER] Scanned ${scrapedCount} members from ${guild.name}`);
      return scrapedCount;
    } catch (error) {
      console.error(`[SCRAPER] Error scraping guild ${guildId}:`, error);
      throw error;
    }
  }

  async inviteToServer(client: Client, inviteUrl: string, delayMs: number) {
    const delay = delayMs + Math.floor(Math.random() * (delayMs / 2)); // Delay aleatório
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const invite = await client.invites.create(inviteUrl);
      const guild = await invite.guild.fetch();
      await guild.members.me.join();
      console.log(`[JOINT] Joined ${guild.name} via invite`);
    } catch (error) {
      console.error(`[JOINT] Failed to join invite:`, error);
    }
  }
}