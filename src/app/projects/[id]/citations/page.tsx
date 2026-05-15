'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Quote, Plus, Trash2, Copy, Sparkles, ArrowLeft, X, Check } from 'lucide-react';
import type { Citation } from '@/types';

export default function CitationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ formattedApa: '', formattedIeee: '' });
  const [copied, setCopied] = useState<string | null>(null);

  const { data: citations, isLoading } = useQuery({
    queryKey: ['citations', id],
    queryFn: () => API.get(`/projects/${id}/citations`).then((r) => r.data as Citation[]),
  });

  const createMutation = useMutation({
    mutationFn: () => API.post(`/projects/${id}/citations`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations', id] });
      setShowCreate(false);
      setForm({ formattedApa: '', formattedIeee: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (citationId: string) => API.delete(`/projects/${id}/citations/${citationId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['citations', id] }),
  });

  const aiMutation = useMutation({
    mutationFn: () => API.post(`/projects/${id}/ai/suggest-citations`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['citations', id] }),
  });

  const copyToClipboard = (text: string, cId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(cId);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#222222]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Citas</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {citations?.length ?? 0} referencia{(citations?.length ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333333] hover:border-[#32d583] hover:text-[#32d583] text-gray-300 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              {aiMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Sugerir con IA
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={16} /> Agregar cita
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#32d583]" size={32} />
            </div>
          ) : citations && citations.length > 0 ? (
            <div className="space-y-3 max-w-3xl">
              {citations.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {c.formattedApa && (
                        <div>
                          <span className="text-[10px] font-bold text-[#32d583] bg-[#243c33] px-2 py-0.5 rounded-full border border-[#2d5040] mr-2">APA</span>
                          <span className="text-sm text-gray-300">{c.formattedApa}</span>
                        </div>
                      )}
                      {c.formattedIeee && (
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded-full border border-blue-900/30 mr-2">IEEE</span>
                          <span className="text-sm text-gray-300">{c.formattedIeee}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => copyToClipboard(c.formattedApa || c.formattedIeee, c.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-[#32d583] hover:bg-[#243c33] transition-colors"
                        title="Copiar"
                      >
                        {copied === c.id ? <Check size={15} className="text-[#32d583]" /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
                <Quote size={36} className="text-[#333333]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sin citas aún</h2>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Agrega referencias manualmente o deja que la IA las sugiera a partir de tus documentos.
              </p>
              <button
                onClick={() => aiMutation.mutate()}
                disabled={aiMutation.isPending}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333333] hover:border-[#32d583] hover:text-[#32d583] text-gray-300 font-medium px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                <Sparkles size={15} /> Sugerir con IA
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">Nueva Cita</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Formato APA</label>
                <textarea
                  value={form.formattedApa}
                  onChange={(e) => setForm({ ...form, formattedApa: e.target.value })}
                  placeholder="Autor, A. (Año). Título. Editorial."
                  rows={3}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Formato IEEE <span className="text-gray-500">(opcional)</span></label>
                <textarea
                  value={form.formattedIeee}
                  onChange={(e) => setForm({ ...form, formattedIeee: e.target.value })}
                  placeholder="A. Autor, &quot;Título,&quot; Editorial, Año."
                  rows={3}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
