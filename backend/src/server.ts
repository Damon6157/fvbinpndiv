import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL });

app.use(cors());
app.use(express.json());

// Rota para adicionar tokens e vincular proxy
app.post('/tokens/import', async (req, res) => {
  const { tokens, useProxy, proxy } = req.body;
  try {
    const operations = tokens.map((t: string) =>
      prisma.token.upsert({
        where: { token: t },
        update: { useProxy, proxy },
        create: { token: t, useProxy, proxy },
      })
    );
    await prisma.$transaction(operations);
    res.json({ success: true, message: `${tokens.length} tokens processados.` });
  } catch (e) {
    res.status(500).json({ error: "Erro ao importar tokens." });
  }
});

// Rota para iniciar campanha (Envia para a fila do Redis)
app.post('/campaign/start', async (req, res) => {
  const { campaignId, leadIds } = req.body;
  try {
    const payload = JSON.stringify({ campaignId, leadIds });
    await redis.lPush('campaign_queue', payload);
    res.json({ success: true, message: "Campanha adicionada à fila de processamento." });
  } catch (e) {
    res.status(500).json({ error: "Erro ao agendar campanha." });
  }
});

// Rota de status em tempo real
app.get('/stats', async (req, res) => {
  const activeTokens = await prisma.token.count({ where: { status: 'valid' } });
  const pendingLeads = await prisma.lead.count({ where: { status: 'pending' } });
  res.json({ activeTokens, pendingLeads });
});

app.listen(5000, () => console.log("🚀 API rodando na porta 5000"));
