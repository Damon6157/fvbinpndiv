import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { botManager } from './engine/BotManager';
import { prisma } from '../lib/db';
import { redis } from '../lib/redis';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de Logging simples
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rota de Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Exemplo de API Endpoint para Forçar Scrape
app.post('/api/bot/scrape', async (req, res) => {
  const { guildId, tokenId } = req.body;
  try {
    // Em produção, você validaria se o token pertence ao usuário logado
    await botManager.executeScrape(tokenId, guildId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Exemplo de API Endpoint para Auto-Join
app.post('/api/bot/join', async (req, res) => {
  const { inviteUrl, tokenId } = req.body;
  try {
    await botManager.executeJoin(tokenId, inviteUrl);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Envio de Status Inicial
  socket.emit('initial-state', {
    activeTokens: 0,
    totalLeads: 0,
    messagesSent: 0
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper para emitir eventos para o dashboard
export const emitToDashboard = (event: string, payload: any) => {
  io.emit(event, payload);
};

// Inicialização do Worker
const initializeWorker = async () => {
  console.log('Initializing Bot Worker...');
  
  // Carregar todos os tokens ativos do banco
  const activeTokens = await prisma.token.findMany({
    where: { isActive: true, status: 'VALID' },
    include: { proxy: true }
  });

  for (const token of activeTokens) {
    try {
      await botManager.initializeBot({
        id: token.id,
        token: token.token,
        proxyAddress: token.proxy?.address,
        proxyUser: token.proxy?.username,
        proxyPass: token.proxy?.password
      });
    } catch (error) {
      console.error(`Failed to initialize token ${token.id}:`, error);
      await prisma.token.update({
        where: { id: token.id },
        data: { status: 'INVALID' }
      });
    }
  }

  // Atualizar métricas iniciais
  const totalLeads = await prisma.lead.count();
  const totalMessages = await redis.get('stats:messages_sent') || 0;
  
  emitToDashboard('initial-state', {
    activeTokens: activeTokens.length,
    totalLeads,
    messagesSent: parseInt(totalMessages as string)
  });
};

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Backend API & Socket.io running on port ${PORT}`);
  initializeWorker();
});