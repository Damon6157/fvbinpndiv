"use client";
import { useState } from 'react';
import { Shield, Users, MessageSquare, Zap, Settings, Trash2, CheckCircle, Globe } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tokens');
  const [useProxy, setUseProxy] = useState(false);
  const [proxyValue, setProxyValue] = useState('');

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 p-6 flex flex-col gap-6 border-r border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">SELF-PRO <span className="text-indigo-500">V1</span></h1>
        </div>

        <nav className="flex flex-col gap-2">
          <TabButton active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')} icon={<Shield size={20}/>} label="Account Manager" />
          <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={<Users size={20}/>} label="Server Scraper" />
          <TabButton active={activeTab === 'campaign'} onClick={() => setActiveTab('campaign')} icon={<MessageSquare size={20}/>} label="Message Studio" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Global Settings" />
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-gradient-to-br from-slate-950 to-slate-900">
        {activeTab === 'tokens' && (
          <div className="max-w-5xl animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h2 className="text-4xl font-bold">Account Manager</h2>
              <p className="text-slate-400">Gerencie seus tokens e configure a conectividade de rede.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <label className="block text-sm font-medium text-slate-400 mb-2">Importar Tokens (um por linha)</label>
                <textarea
                  className="w-full h-64 bg-slate-950 border border-slate-700 p-4 rounded-xl mb-4 focus:ring-2 ring-indigo-500 outline-none transition-all font-mono text-sm"
                  placeholder="MTAuY29t...&#10;TTAuY29t..."
                />
                <div className="flex gap-3">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <CheckCircle size={18}/> Validar Tokens
                  </button>
                  <button className="bg-slate-800 hover:bg-red-900/40 text-red-400 px-4 py-3 rounded-xl transition-all">
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-indigo-400"/> Conexão de Rede
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 mb-4">
                  <span className="text-sm font-medium">Usar Proxy</span>
                  <button
                    onClick={() => setUseProxy(!useProxy)}
                    className={`w-12 h-6 rounded-full transition-all relative ${useProxy ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useProxy ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {useProxy && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Proxy (ip:porta ou user:pass@ip:porta)</label>
                    <input
                      value={proxyValue}
                      onChange={(e) => setProxyValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm outline-none focus:ring-1 ring-indigo-500"
                      placeholder="127.0.0.1:8080"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="max-w-5xl animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h2 className="text-4xl font-bold">Server Scraper</h2>
              <p className="text-slate-400">Capture IDs de membros online para suas campanhas.</p>
            </header>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex gap-4 mb-6">
                <input className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 ring-indigo-500" placeholder="Link do convite do servidor (discord.gg/...)"/>
                <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition-all">Iniciar Scrape</button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4">Discord ID</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Origem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-mono">8234910234812304</td>
                      <td className="p-4"><span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs">Online</span></td>
                      <td className="p-4 text-slate-500">Server X</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaign' && (
          <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h2 className="text-4xl font-bold">Message Studio</h2>
              <p className="text-slate-400">Crie mensagens persuasivas e configure o disparo.</p>
            </header>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6">
              <input className="bg-slate-950 border border-slate-700 p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500 text-lg font-medium" placeholder="Nome da Campanha (ex: Promoção Verão)" />
              <textarea className="bg-slate-950 border border-slate-700 p-4 rounded-xl h-48 outline-none focus:ring-2 ring-indigo-500" placeholder="Sua mensagem aqui... use {user} para mencionar o destinatário." />
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Cooldown Dinâmico:</span>
                  <input type="number" className="bg-slate-950 border border-slate-700 p-2 w-20 rounded-lg text-center" defaultValue={45} />
                  <span className="text-xs text-slate-400">segundos</span>
                </div>
                <input type="file" className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
              </div>
              <button className="bg-green-600 hover:bg-green-700 py-4 rounded-xl font-black text-xl transition-all shadow-lg shadow-green-900/20">🚀 DISPARAR CAMPANHA</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
      {icon} <span className="font-medium">{label}</span>
    </button>
  );
}
