import { Client } from 'discord.js-selfbot-v13';
import HttpsProxyAgent from 'https-proxy-agent';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL });

async function startWorker() {
  await redis.connect();
  console.log("⚙️ Worker conectado ao Redis. Aguardando campanhas...");

  while (true) {
    // Pega a próxima campanha da fila (Blocking Pop)
    const job = await redis.brPop('campaign_queue', 0);
    if (!job) continue;

    const { campaignId, leadIds } = JSON.parse(job[1]);
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    const tokens = await prisma.token.findMany({ where: { status: 'valid' } });

    if (!campaign || tokens.length === 0) {
      console.log("❌ Campanha ou tokens insuficientes.");
      continue;
    }

    let tokenIndex = 0;

    for (const leadId of leadIds) {
      const tokenData = tokens[tokenIndex];
      const client = new Client({ checkUpdate: false });

      try {
        // Lógica de Proxy Híbrido
        if (tokenData.useProxy && tokenData.proxy) {
          const agent = new HttpsProxyAgent(tokenData.proxy);
          (client as any).options.httpAgent = agent;
          (client as any).options.httpsAgent = agent;
        }

        await client.login(tokenData.token);

        // Simulação de comportamento humano
        const user = await client.users.fetch(leadId);
        await user.send(`Typing...`);
        await new Promise(res => setTimeout(res, 3000));

        await user.send({
          content: campaign.content.replace('{user}', `<@${leadId}>`),
          files: campaign.imageUrl ? [campaign.imageUrl] : []
        });

        await prisma.lead.update({ where: { id: leadId }, data: { status: 'sent' } });
        console.log(`✅ Lead ${leadId} processado.`);

      } catch (err) {
        console.error(`⚠️ Token ${tokenData.token.slice(0,10)} banido ou inválido.`);
        await prisma.token.update({ where: { id: tokenData.id }, data: { status: 'invalid' } });
      } finally {
        client.destroy();
      }

      // Rotação de Token e Cooldown Aleatório (Anti-Ban)
      tokenIndex = (tokenIndex + 1) % tokens.length;
      const delay = Math.floor(Math.random() * (60000 - 30000 + 1) + 30000);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

startWorker().catch(console.error);
