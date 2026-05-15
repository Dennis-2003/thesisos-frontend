'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Plus, Edit3, Trash2, ChevronRight, ChevronDown, BookOpen, ArrowLeft, X } from 'lucide-react';
import type { ThesisOutline } from '@/types';

export default function OutlinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ThesisOutline | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ title: '', content: '', parentId: '', sortOrder: 0 });

  const { data: outline, isLoading } = useQuery({
    queryKey: ['outline', id],
    queryFn: () => API.get(`/projects/${id}/outline`).then((r) => r.data as ThesisOutline[]),
  });

  const topLevel = outline?.filter((o) => !o.parentId).sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const getChildren = (parentId: string) =>
    outline?.filter((o) => o.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  const openCreate = (parent?: string) => {
    setEditing(null);
    setForm({ title: '', content: '', parentId: parent || '', sortOrder: 0 });
    setShowModal(true);
  };

  const openEdit = (section: ThesisOutline) => {
    setEditing(section);
    setForm({ title: section.title, content: section.content || '', parentId: section.parentId || '', sortOrder: section.sortOrder });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? API.put(`/projects/${id}/outline/${editing.id}`, { ...form, parentId: form.parentId || null })
        : API.post(`/projects/${id}/outline`, { ...form, parentId: form.parentId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outline', id] });
      setShowModal(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (outlineId: string) => API.delete(`/projects/${id}/outline/${outlineId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outline', id] }),
  });

  const toggleExpand = (sectionId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Calculate progress for each section
  const getProgress = (sectionId: string) => {
    const children = getChildren(sectionId);
    if (children.length === 0) return null;
    const withContent = children.filter((c) => c.content && c.content.length > 20).length;
    return Math.round((withContent / children.length) * 100);
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
              <h1 className="text-2xl font-bold text-white">Esquema de Tesis</h1>
              <p className="text-sm text-gray-500 mt-0.5">{topLevel.length} secciones principales</p>
            </div>
          </div>
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} /> Agregar sección
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#32d583]" size={32} /></div>
          ) : topLevel.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
                <BookOpen size={36} className="text-[#333333]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Esquema vacío</h2>
              <p className="text-sm text-gray-500 max-w-xs mb-8">Empieza a estructurar tu tesis añadiendo los capítulos principales.</p>
              <button onClick={() => openCreate()} className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors">
                <Plus size={16} /> Crear primer capítulo
              </button>
            </div>
          ) : (
            <div className="max-w-3xl space-y-3">
              {topLevel.map((section, idx) => {
                const children = getChildren(section.id);
                const isExpanded = expanded.has(section.id);
                const progress = getProgress(section.id);

                return (
                  <div key={section.id}>
                    {/* Main Section */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-all">
                      <div className="flex items-center gap-3 p-4">
                        <span className="text-xs font-mono text-gray-600 w-6 text-center">{idx + 1}</span>
                        {children.length > 0 && (
                          <button onClick={() => toggleExpand(section.id)} className="text-gray-500 hover:text-white transition-colors">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{section.title}</p>
                          {section.content && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.content}</p>
                          )}
                          {progress !== null && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 bg-[#2a2a2a] rounded-full h-1">
                                <div
                                  className="h-full bg-[#32d583] rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-500">{progress}%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openCreate(section.id)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-[#32d583] hover:bg-[#243c33] transition-colors"
                            title="Añadir subsección"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(section)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(section.id)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Subsections */}
                      {isExpanded && children.length > 0 && (
                        <div className="border-t border-[#222222] bg-[#161616]">
                          {children.map((sub, subIdx) => (
                            <div
                              key={sub.id}
                              className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e] last:border-b-0 hover:bg-[#1a1a1a] transition-colors group"
                            >
                              <span className="text-xs font-mono text-gray-700 w-6 text-center">{idx + 1}.{subIdx + 1}</span>
                              <ChevronRight size={12} className="text-gray-700 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300">{sub.title}</p>
                                {sub.content && <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{sub.content}</p>}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(sub)} className="p-1 rounded text-gray-600 hover:text-white hover:bg-[#2a2a2a] transition-colors">
                                  <Edit3 size={12} />
                                </button>
                                <button onClick={() => deleteMutation.mutate(sub.id)} className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
              <h2 className="text-xl font-bold text-white">{editing ? 'Editar sección' : 'Nueva sección'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Marco Teórico"
                  required
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
                />
              </div>
              {!form.parentId && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Sección padre <span className="text-gray-500">(opcional)</span></label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-[#32d583] transition-all"
                  >
                    <option value="">Sin padre (nivel principal)</option>
                    {topLevel.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Contenido / Notas <span className="text-gray-500">(opcional)</span></label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  placeholder="Descripción de esta sección..."
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                  {editing ? 'Guardar cambios' : 'Crear sección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
