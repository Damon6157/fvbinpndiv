import { prisma } from '../lib/db';
import { redis } from '../lib/redis';
import { botManager } from './engine/BotManager';
import { proxyResilience } from './engine/ProxyResilience';
import { emitToDashboard } from '../lib/events';
import { setIoInstance } from '../lib/events'; // Assumindo que setIoInstance está lá

async function bootstrap() {
  console.log('🚀 Starting Self-Bot Dashboard Backend...');

  // 1. Verificar Banco de Dados
  try {
    await prisma.$connect();
    console.log('✅ Database connected.');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  // 2. Verificar Redis
  try {
    await redis.ping();
    console.log('✅ Redis connected.');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    process.exit(1);
  }

  // 3. Carregar Estado Inicial de Métricas
  const totalLeads = await prisma.lead.count();
  const activeTokensCount = await prisma.token.count({ where: { isActive: true, status: 'VALID' } });
  
  // Inicializar contadores no Redis se não existirem
  await redis.mset([
    'stats:messages_sent', '0',
    'stats:leads_total', totalLeads.toString(),
    'stats:active_tokens', activeTokensCount.toString()
  ]);

  // 4. Inicializar Bot Manager (Carregar tokens ativos)
  console.log('⚙️ Initializing Bot Workers...');
  await botManager.loadActiveTokens();

  console.log('✅ System Ready. Waiting for connections...');
}

// Executar bootstrap
bootstrap().catch(console.error);