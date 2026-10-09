'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    content: string;
}

export default function TemplateSelector({ onSelect }: { onSelect: (content: string) => void }) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const res = await fetch('/api/templates');
        const data = await res.json();
        setTemplates(data);
    };

    const handleSaveTemplate = async () => {
        if (!newName || !newContent) return;

        await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, content: newContent })
        });

        setNewName('');
        setNewContent('');
        fetchTemplates();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
        fetchTemplates();
    };

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Biblioteca de Templates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Novo Template</label>
                    <input
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                        placeholder="Nome do template"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <textarea
                        className="w-full h-24 bg-gray-800 border border-gray-700 rounded p-2 text-sm font-mono"
                        placeholder="Conteúdo da mensagem..."
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                    />
                    <button
                        onClick={handleSaveTemplate}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Salvar Template
                    </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {templates.map(tpl => (
                        <div key={tpl.id} className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
                            <div className="flex-1 truncate text-sm text-gray-300" title={tpl.content}>
                                <span className="font-medium text-indigo-400">{tpl.name}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onSelect(tpl.content)}
                                    className="p-1 hover:text-green-400"
                                    title="Usar Template"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(tpl.id)}
                                    className="p-1 hover:text-red-400"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}