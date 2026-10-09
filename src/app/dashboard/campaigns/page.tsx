'use client';

import { useState, useEffect } from 'react';
import { Send, Play, Pause, Plus, Save } from 'lucide-react';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
  cooldownMin: z.number().int().min(1).default(5),
  cooldownMax: z.number().int().min(1).default(15),
  useTyping: z.boolean().default(true),
  tokenIds: z.array(z.string()).min(1, "Selecione ao menos um token"),
  leadIds: z.array(z.string()).min(1, "Selecione ao menos um lead"),
  autoReply: z.string().optional()
});

export default function CampaignStudio() {
  const [form, setForm] = useState({
    name: '',
    message: '',
    cooldownMin: 5,
    cooldownMax: 15,
    useTyping: true,
    tokenIds: [] as string[],
    leadIds: [] as string[],
    autoReply: ''
  });
  const [tokens, setTokens] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetch('/api/tokens').then(r => r.json()).then(setTokens);
    fetch('/api/leads').then(r => r.json()).then(setLeads);
  }, []);

  const toggleToken = (id: string) => {
    setForm(prev => ({
      ...prev,
      tokenIds: prev.tokenIds.includes(id) 
        ? prev.tokenIds.filter(t => t !== id) 
        : [...prev.tokenIds, id]
    }));
  };

  const toggleLead = (id: string) => {
    setForm(prev => ({
      ...prev,
      leadIds: prev.leadIds.includes(id) 
        ? prev.leadIds.filter(l => l !== id) 
        : [...prev.leadIds, id]
    }));
  };

  const handleLaunch = async () => {
    try {
      const parsed = campaignSchema.parse(form);
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      
      if (res.ok) {
        setIsRunning(true);
        alert('Campanha iniciada com sucesso!');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert('Erro de validação: ' + error.errors.map(e => e.message).join(', '));
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor de Mensagem */}
      <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Save className="w-5 h-5" /> Studio de Mensagem
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Campanha</label>
            <input 
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo (Use {user} para mencionar)</label>
            <textarea 
              className="w-full h-40 bg-gray-900 border border-gray-700 rounded p-2 font-mono text-sm"
              placeholder="Olá {user}, veja essa oportunidade..."
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cooldown Mín (seg)</label>
              <input 
                type="number" 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2"
                value={form.cooldownMin}
                onChange={e => setForm({...form, cooldownMin: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cooldown Máx (seg)</label>
              <input 
                type="number" 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2"
                value={form.cooldownMax}
                onChange={e => setForm({...form, cooldownMax: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={form.useTyping}
                onChange={e => setForm({...form, useTyping: e.target.checked})}
              />
              Simular Typing...
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={!!form.autoReply}
                onChange={e => setForm({...form, autoReply: e.target.checked ? 'Olá!' : ''})}
              />
              Ativar Auto-Reply
            </label>
          </div>
          
          {form.autoReply && (
            <input 
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
              placeholder="Resposta automática..."
              value={form.autoReply}
              onChange={e => setForm({...form, autoReply: e.target.value})}
            />
          )}
        </div>
      </div>

      {/* Seleção de Alvos e Tokens */}
      <div className="bg-gray-800 p-6 rounded-lg overflow-y-auto max-h-[600px]">
        <h2 className="text-xl font-semibold mb-4">Alvos & Tokens</h2>
        
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2">Tokens Ativos ({form.tokenIds.length})</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-700 rounded p-2">
            {tokens.map(t => (
              <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 rounded">
                <input 
                  type="checkbox" 
                  checked={form.tokenIds.includes(t.id)}
                  onChange={() => toggleToken(t.id)}
                />
                <span className="text-sm">{t.username || t.token.substring(0, 10)}...</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-400 mb-