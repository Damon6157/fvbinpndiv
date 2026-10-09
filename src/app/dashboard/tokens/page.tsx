'use client';

import { useState, useRef, useEffect } from 'react';
import { Key, Trash2, Upload, ShieldCheck, ShieldX, Server } from 'lucide-react';
import { validateDiscordToken } from '@/lib/utils';
import { z } from 'zod';
import { tokenSchema } from '@/lib/validators';

interface Token {
  id: string;
  token: string;
  username: string | null;
  status: string;
  proxy: { address: string } | null;
}

export default function TokenManagement() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newTokenInput, setNewTokenInput] = useState('');
  const [proxyAddress, setProxyAddress] = useState('');
  const [proxyUser, setProxyUser] = useState('');
  const [proxyPass, setProxyPass] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    const res = await fetch('/api/tokens');
    const data = await res.json();
    setTokens(data);
  };

  const handleAddSingleToken = async () => {
    if (!newTokenInput) return;
    await processTokens([newTokenInput]);
    setNewTokenInput('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    await processTokens(lines);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processTokens = async (tokenList: string[]) => {
    setIsProcessing(true);
    const results = [];

    for (const token of tokenList) {
      // 1. Validação Local via Zod
      const parsed = tokenSchema.safeParse({ token, proxyAddress, proxyUser, proxyPass });
      if (!parsed.success) {
        results.push({ token, status: 'INVALID_FORMAT', error: parsed.error.errors[0].message });
        continue;
      }

      // 2. Validação Remota (API Discord)
      const validation = await validateDiscordToken(token);

      if (!validation.valid) {
        results.push({ token, status: 'INVALID_API', error: validation.error });
        continue;
      }

      // 3. Salvar no Banco
      try {
        const res = await fetch('/api/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            proxyAddress: proxyAddress || undefined,
            proxyUser: proxyUser || undefined,
            proxyPass: proxyPass || undefined
          })
        });
        const data = await res.json();
        results.push({ ...data, username: validation.user?.username });
      } catch (error) {
        results.push({ token, status: 'ERROR', error: (error as Error).message });
      }
    }

    // Atualizar UI com resultados
    alert(`Processamento concluído: ${results.filter(r => r.status === 'NEW' || r.status === 'EXISTING').length} tokens adicionados/validados.`);
    fetchTokens();
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este token?')) {
      await fetch(`/api/tokens?id=${id}`, { method: 'DELETE' });
      fetchTokens();
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Massivo */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-400" /> Upload Massivo de Tokens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Arquivo .txt (1 token por linha)</label>
            <input
              type="file"
              accept=".txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Token Manual</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                placeholder="Colar token aqui..."
                value={newTokenInput}
                onChange={e => setNewTokenInput(e.target.value)}
              />
              <button
                onClick={handleAddSingleToken}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                Validar & Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Proxy Configuration */}
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2">Configuração de Proxy (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              className="bg-gray-900 border border-gray-700 rounded p-2 text-sm"
              placeholder="IP:Porta (ex: 1.2.3.4:8080)"
              value={proxyAddress}
              onChange={e => setProxyAddress(e.target.value)}
            />
            <input
              className="bg-gray-900 border border-gray-700 rounded p-2 text-sm"
              placeholder="Usuário"
              value={proxyUser}
              onChange={e => setProxyUser(e.target.value)}
            />
            <input
              type="password"
              className="bg-gray-900 border border-gray-700 rounded p-2 text-sm"
              placeholder="Senha"
              value={proxyPass}
              onChange={e => setProxyPass(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Tokens */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tokens Ativos ({tokens.length})</h2>
          <button
            onClick={() => {
              // Limpar tokens inválidos
              fetch('/api/tokens/cleanup', { method: 'POST' });
              fetchTokens();
            }}
            className="bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded text-sm"
          >
            Limpar Inválidos
          </button>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs sticky top-0">
              <tr>
                <th className="p-3 text-left">Usuário</th>
                <th className="p-3 text-left">Token (Mascarado)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Proxy</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tokens.map(token => (
                <tr key={token.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={token.username ? `https://cdn.discordapp.com/avatars/${token.id}/default.png` : ''}
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium">{token.username || 'Desconhecido'}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-400">
                    {token.token.substring(0, 15)}...{token.token.substring(token.token.length - 5)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${token.status === 'VALID' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">
                    {token.proxy ? `${token.proxy.address}` : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(token.id)}
                      className="p-1 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}