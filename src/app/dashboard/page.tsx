'use client';

import { useEffect, useState } from 'react';
import { Activity, Users, MessageSquare, Server, Key, TrendingUp } from 'lucide-react';
import io from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const socket = io(API_URL);

interface Stats {
  activeTokens: number;
  totalLeads: number;
  messagesSent: number;
  errorRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    activeTokens: 0,
    totalLeads: 0,
    messagesSent: 0,
    errorRate: 0
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Estado Inicial
    socket.on('initial-state', (data: Stats) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    // Atualizações em tempo real
    socket.on('stats-update', (data: Partial<Stats>) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    socket.on('log-activity', (log: any) => {
      setLogs(prev => [log, ...prev].slice(0, 20)); // Manter últimos 20 logs
    });

    return () => {
      socket.off('initial-state');
      socket.off('stats-update');
      socket.off('log-activity');
    };
  }, []);

  const cards = [
    { title: 'Tokens Ativos', value: stats.activeTokens, icon: Key, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Leads na Base', value: stats.totalLeads, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Mensagens Enviadas', value: stats.messagesSent, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Taxa de Erro', value: `${stats.errorRate}%`, icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${card.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400">{card.title}</h3>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> Log de Atividade em Tempo Real
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
          {logs.length === 0 && <p className="text-gray-500">Aguardando atividades...</p>}
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-900 rounded hover:bg-gray-700 transition-colors">
              <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'SUCCESS' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {log.status || log.type}
              </span>
              <div className="flex-1">
                <p className="text-gray-300">
                  <span className="text-indigo-400 font-semibold">{log.tokenName || log.token}</span>
                  {' → '}
                  <span className="text-green-400">{log.leadId || log.detail}</span>
                </p>
                {log.error && <p className="text-red-400 text-xs mt-1">{log.error}</p>}
              </div>
              <span className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}