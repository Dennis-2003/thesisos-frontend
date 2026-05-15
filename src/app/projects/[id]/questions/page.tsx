'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Plus, Trash2, HelpCircle, Target, Lightbulb, ArrowLeft, X } from 'lucide-react';
import type { ResearchQuestion } from '@/types';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  research_question: { label: 'Pregunta', icon: <HelpCircle size={16} />, color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-900/30' },
  hypothesis:        { label: 'Hipótesis', icon: <Lightbulb size={16} />, color: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-900/30' },
  objective:         { label: 'Objetivo', icon: <Target size={16} />, color: 'text-[#32d583]', bg: 'bg-[#243c33]', border: 'border-[#2d5040]' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30' },
  in_progress: { label: 'En curso',  color: 'text-blue-400 bg-blue-950/30 border-blue-900/30' },
  answered:    { label: 'Respondida', color: 'text-[#32d583] bg-[#243c33] border-[#2d5040]' },
  completed:   { label: 'Completado', color: 'text-[#32d583] bg-[#243c33] border-[#2d5040]' },
};

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'research_question', questionText: '', status: 'pending', sortOrder: 0 });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', id],
    queryFn: () => API.get(`/projects/${id}/questions`).then((r) => r.data as ResearchQuestion[]),
  });

  const createMutation = useMutation({
    mutationFn: () => API.post(`/projects/${id}/questions`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', id] });
      setShowModal(false);
      setForm({ type: 'research_question', questionText: '', status: 'pending', sortOrder: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (qId: string) => API.delete(`/projects/${id}/questions/${qId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions', id] }),
  });

  const grouped = {
    objective:         questions?.filter((q) => q.type === 'objective') || [],
    research_question: questions?.filter((q) => q.type === 'research_question') || [],
    hypothesis:        questions?.filter((q) => q.type === 'hypothesis') || [],
  };

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#222222]">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Preguntas de Investigación</h1>
              <p className="text-sm text-gray-500 mt-0.5">{questions?.length ?? 0} elemento{(questions?.length ?? 0) !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} /> Agregar
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#32d583]" size={32} /></div>
          ) : questions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
                <HelpCircle size={36} className="text-[#333333]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sin preguntas aún</h2>
              <p className="text-sm text-gray-500 max-w-xs mb-8">Define los objetivos, preguntas e hipótesis que guiarán tu investigación.</p>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors">
                <Plus size={16} /> Agregar primero
              </button>
            </div>
          ) : (
            <div className="max-w-4xl space-y-8">
              {(Object.entries(grouped) as [string, ResearchQuestion[]][]).map(([type, items]) => {
                if (items.length === 0) return null;
                const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.research_question;
                return (
                  <div key={type}>
                    <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg w-fit border ${cfg.bg} ${cfg.border}`}>
                      <span className={cfg.color}>{cfg.icon}</span>
                      <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}s</span>
                    </div>
                    <div className="space-y-3">
                      {items.map((q) => {
                        const st = STATUS_CONFIG[q.status] || STATUS_CONFIG.pending;
                        return (
                          <div key={q.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-start justify-between gap-4 hover:border-[#3a3a3a] transition-all group">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                              <div>
                                <p className="text-sm text-gray-200 leading-relaxed">{q.questionText}</p>
                                <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                                  {st.label}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMutation.mutate(q.id)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">Nuevo elemento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key })}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                        form.type === key
                          ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                          : 'bg-[#111111] border-[#333333] text-gray-500 hover:border-[#444444]'
                      }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Texto *</label>
                <textarea
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Escribe aquí tu pregunta, objetivo o hipótesis..."
                  rows={4}
                  required
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {createMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
