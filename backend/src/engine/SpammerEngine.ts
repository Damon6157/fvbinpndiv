import { Client } from 'discord.js-selfbot-v13';
import HttpsProxyAgent from 'https-proxy-agent';
import { Token, Lead } from '../../backend/src/models/Schemas';

export class SpammerEngine {
  async executeCampaign(template: any, leadIds: string[]) {
    const activeTokens = await Token.find({ status: 'valid' });
    let tokenIndex = 0;

    for (const leadId of leadIds) {
      const tokenData = activeTokens[tokenIndex];
      const client = new Client({ checkUpdate: false });

      try {
        // Implementação de Proxy Híbrido
        if (tokenData.useProxy && tokenData.proxy) {
          const agent = new HttpsProxyAgent(tokenData.proxy);
          // Injeção de agente para bypass de IP
          (client as any).options.httpAgent = agent;
          (client as any).options.httpsAgent = agent;
        }

        await client.login(tokenData.token);

        // Simulação Humana: Typing...
        const user = await client.users.fetch(leadId);
        await user.send(`Typing...`); // Simulação visual
        await new Promise(res => setTimeout(res, 2000));

        await user.send({
          content: template.content.replace('{user}', `<@${leadId}>`),
          files: template.imageUrl ? [template.imageUrl] : []
        });

        await Lead.updateOne({ discordId: leadId }, { status: 'sent' });
        console.log(`✅ Enviado para ${leadId} via Token ${tokenData.token.slice(0,10)}`);

      } catch (err) {
        console.error(`❌ Token ${tokenData.token.slice(0,10)} falhou. Marcando como inválido.`);
        await Token.updateOne({ _id: tokenData._id }, { status: 'invalid' });
      } finally {
        client.destroy();
      }

      // Rotação de Token e Cooldown Dinâmico
      tokenIndex = (tokenIndex + 1) % activeTokens.length;
      const delay = Math.floor(Math.random() * (60000 - 30000 + 1) + 30000);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}
