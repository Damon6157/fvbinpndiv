'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, Trash2, Search, RefreshCw, Server as ServerIcon } from 'lucide-react';
import { z } from 'zod';

interface Lead {
  id: string;
  userId: string;
  username: string | null;
  guildId: string | null;
  sentCount: number;
  lastSentAt: string | null;
}

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetch('/api/tokens').then(r => r.json()).then(setTokens);
  }, []);

  const fetchLeads = async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredLeads = leads.filter(lead => 
    lead.username?.toLowerCase().includes(search.toLowerCase()) || 
    lead.userId.includes(search)
  );

  const handleScrape = async () => {
    if (!scrapeUrl || !selectedTokenId) return alert('Informe a URL do servidor e selecione um token');
    
    setIsScraping(true);
    try {
      const res = await fetch('/api/bot/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: scrapeUrl, // Assumindo que passamos o ID ou URL, o backend extrai
          tokenId: selectedTokenId
        })
      });
      if (res.ok) {
        alert('Scrape concluído!');
        fetchLeads();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    fetchLeads();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ServerIcon className="w-5 h-5 text-indigo-400" /> Server Manager & Scraper
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Link de Convite ou ID do Servidor</label>
            <input 
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
              placeholder="https://discord.gg/invite ou ID"
              value={scrapeUrl}
              onChange={e => setScrapeUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Token Executor</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
              value={selectedTokenId}
              onChange={e => setSelectedTokenId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {tokens.map(t => (
                <option key={t.id} value={t.id}>{t.username || t.token.substring(0, 10)}</option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={handleScrape}
          disabled={isScraping}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isScraping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          {isScraping ? 'Coletando Leads...' : 'Executar Scrape'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Banco de Leads ({filteredLeads.length})</h2>
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar por usuário ou ID..."
              className="bg-gray-900 border border-gray-700 rounded pl-10 pr-4 py-2 w-64"