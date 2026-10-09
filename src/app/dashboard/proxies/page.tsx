'use client';

import { useState, useEffect } from 'react';
import { Server, Plus, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface ProxyItem {
  id: string;
  address: string;
  username: string | null;
  password: string | null;
  _count: { tokens: number };
}

export default function ProxyManagement() {
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [newProxy, setNewProxy] = useState({ address: '', username: '', password: '' });
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProxies();
  }, []);

  const fetchProxies = async () => {
    const res = await fetch('/api/proxies');
    const data = await res.json();
    setProxies(data);
  };

  const handleAddProxy = async () => {
    await fetch('/api/proxies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProxy)
    });
    setNewProxy({ address: '', username: '', password: '' });
    fetchProxies();
  };

  const handleTestProxy = async (id: string) => {
    setTestingId(id);
    const res = await fetch(`/api/proxies/test?id=${id}`, { method: 'POST' });
    const result = await res.json();
    alert(result.success ? 'Proxy is working!' : 'Proxy failed to connect.');
    setTestingId(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/proxies?id=${id}`, { method: 'DELETE' });
    fetchProxies();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" /> Pool de Proxies
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input 
            className="bg-gray-900 border border-gray-700 rounded p-2"
            placeholder="IP:Porta"
            value={newProxy.address}
            onChange={e => setNewProxy({...newProxy, address: e.target.value})}
          />
          <input 
            className="bg-gray-900 border border-gray-700 rounded p-2"
            placeholder="Usuário (Opcional)"
            value={newProxy.username}
            onChange={e => setNewProxy({...newProxy, username: e.target.value})}
          />
          <input 
            className="bg-gray-900 border border-gray-700 rounded p-2"
            type="password"
            placeholder="Senha (Opcional)"
            value={newProxy.password}
            onChange={e => setNewProxy({...newProxy, password: e.target.value})}
          />
          <button 
            onClick={handleAddProxy}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-2 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Endereço</th>
              <th className="p-3 text-left">Credenciais</th>
              <th className="p-3 text-right">Tokens Vinculados</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {proxies.map(proxy => (
              <tr key={proxy.id} className="hover:bg-gray-700/50">
                <td className="p-3 font-mono text-gray-300">{proxy.address}</td>
                <td className="p-3 text-gray-400">
                  {proxy.username ? `${proxy.username}:${proxy.password?.substring(0, 4)}****` : 'Anônimo'}
                </td>
                <td className="p-3 text-right font-semibold text-indigo-400">{proxy._count.tokens}</td>
                <td className="p-3 text-right space-x-2">
                  <button 
                    onClick={() => handleTestProxy(proxy.id)}
                    disabled={testingId === proxy.id}
                    className="p-1 hover:text-green-400 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingId === proxy.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={() => handleDelete(proxy.id)}
                    className="p-1 hover:text-red-400"
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
  );
}