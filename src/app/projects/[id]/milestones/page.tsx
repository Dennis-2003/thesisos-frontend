'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Plus, Trash2, Calendar, CheckCircle2, Clock, CircleDot, ArrowLeft, X } from 'lucide-react';
import type { Milestone } from '@/types';

const STATUS_CONFIG = {
  completed:   { label: 'Completado', icon: <CheckCircle2 size={16} />, color: 'text-[#32d583]', bg: 'bg-[#243c33]', border: 'border-[#2d5040]' },
  in_progress: { label: 'En curso',   icon: <CircleDot size={16} />,    color: 'text-blue-400',    bg: 'bg-blue-950/30', border: 'border-blue-900/30' },
  pending:     { label: 'Pendiente',  icon: <Clock size={16} />,        color: 'text-gray-400',    bg: 'bg-[#1e1e1e]',   border: 'border-[#2a2a2a]' },
};

export default function MilestonesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'pending' });

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones', id],
    queryFn: () => API.get(`/projects/${id}/milestones`).then((r) => r.data as Milestone[]),
  });

  const createMutation = useMutation({
    mutationFn: () => API.post(`/projects/${id}/milestones`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', id] });
      setShowModal(false);
      setForm({ title: '', description: '', dueDate: '', status: 'pending' });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (m: Milestone) =>
      API.put(`/projects/${id}/milestones/${m.id}`, {
        title: m.title, description: m.description, dueDate: m.dueDate, status: m.status === 'completed' ? 'pending' : 'completed',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (mId: string) => API.delete(`/projects/${id}/milestones/${mId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones', id] }),
  });

  const completedCount = milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalCount = milestones?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const isPast = d < now;
    return { label: d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }), isPast };
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
              <h1 className="text-2xl font-bold text-white">Cronograma de Hitos</h1>
              <p className="text-sm text-gray-500 mt-0.5">{completedCount}/{totalCount} completados</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} /> Agregar hito
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          {/* Overall Progress */}
          {totalCount > 0 && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-6 max-w-3xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Progreso general</span>
                <span className="text-sm font-bold text-white">{progressPct}%</span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                <div
                  className="h-full bg-[#32d583] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#32d583]" size={32} /></div>
          ) : milestones?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
                <Calendar size={36} className="text-[#333333]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sin hitos definidos</h2>
              <p className="text-sm text-gray-500 max-w-xs mb-8">Crea un cronograma con las fechas clave de tu tesis (entregas, revisiones, defensa...).</p>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors">
                <Plus size={16} /> Crear primer hito
              </button>
            </div>
          ) : (
            // Timeline view
            <div className="max-w-3xl relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[#2a2a2a]" />
              <div className="space-y-4">
                {(milestones ?? []).map((m) => {
                  const cfg = STATUS_CONFIG[m.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const date = m.dueDate ? formatDate(m.dueDate) : null;
                  return (
                    <div key={m.id} className="flex gap-4 group">
                      {/* Timeline dot */}
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all ${
                        m.status === 'completed' ? 'bg-[#243c33] border-[#32d583]' : 'bg-[#1a1a1a] border-[#333333]'
                      }`}>
                        <span className={cfg.color}>{cfg.icon}</span>
                      </div>

                      {/* Card */}
                      <div className={`flex-1 bg-[#1a1a1a] border rounded-xl p-5 hover:border-[#3a3a3a] transition-all ${
                        m.status === 'completed' ? 'border-[#2d5040]' : 'border-[#2a2a2a]'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-semibold text-sm ${m.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                {m.title}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            {m.description && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.description}</p>
                            )}
                            {date && (
                              <div className={`flex items-center gap-1.5 mt-2 text-xs ${date.isPast && m.status !== 'completed' ? 'text-red-400' : 'text-gray-500'}`}>
                                <Calendar size={12} />
                                <span>{date.label}</span>
                                {date.isPast && m.status !== 'completed' && <span className="text-red-400 font-medium">· Vencido</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => toggleStatus.mutate(m)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                                m.status === 'completed'
                                  ? 'border-[#333333] text-gray-500 hover:text-white hover:bg-[#222222]'
                                  : 'border-[#2d5040] text-[#32d583] bg-[#243c33] hover:bg-[#2d5040]'
                              }`}
                            >
                              {m.status === 'completed' ? 'Reabrir' : 'Completar'}
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(m.id)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              <h2 className="text-xl font-bold text-white">Nuevo Hito</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Entrega del capítulo 1"
                  required
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Descripción <span className="text-gray-500">(opcional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalles adicionales del hito..."
                  rows={3}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Fecha límite <span className="text-gray-500">(opcional)</span></label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all [color-scheme:dark]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {createMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  Crear hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
