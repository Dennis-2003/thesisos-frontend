'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import API from '@/lib/api';
import type { Project, PagedResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, FileText, Quote, Loader2, MoreVertical, Trash2, Pencil, Calendar, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const CITATION_STYLES = ['APA', 'IEEE', 'MLA', 'Chicago', 'Vancouver'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', citationStyle: 'APA' });
  const [formError, setFormError] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => API.get('/projects?page=0&size=50').then((r) => r.data as PagedResponse<Project>),
  });

  const createMutation = useMutation({
    mutationFn: (body: { title: string; description: string; citationStyle: string }) =>
      API.post('/projects', body).then((r) => r.data as Project),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setForm({ title: '', description: '', citationStyle: 'APA' });
      router.push(`/projects/${created.id}/documents`);
    },
    onError: () => setFormError('No se pudo crear el proyecto. Inténtalo de nuevo.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => API.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('El título es obligatorio.'); return; }
    createMutation.mutate(form);
  };

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#222222]">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Proyectos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.totalElements ?? 0} tesis activa{(data?.totalElements ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={18} />
            Nueva Tesis
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#32d583]" size={36} />
            </div>
          ) : data?.content.length === 0 ? (
            <EmptyState onNew={() => setShowModal(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {data?.content.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  onOpen={() => router.push(`/projects/${p.id}/documents`)}
                  onDelete={() => deleteMutation.mutate(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">Nueva Tesis</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#222222]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {formError && (
                <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Título de la Tesis</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Impacto de la IA en la educación superior"
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Descripción <span className="text-gray-500">(opcional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descripción de tu investigación..."
                  rows={3}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Estilo de Citas</label>
                <div className="grid grid-cols-5 gap-2">
                  {CITATION_STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, citationStyle: s })}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        form.citationStyle === s
                          ? 'bg-[#32d583] text-[#111111] border-[#32d583]'
                          : 'bg-[#111111] text-gray-400 border-[#333333] hover:border-[#555555]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {createMutation.isPending ? 'Creando...' : 'Crear Tesis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  menuOpenId,
  setMenuOpenId,
  onOpen,
  onDelete,
}: {
  project: Project;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const isMenuOpen = menuOpenId === project.id;

  return (
    <div
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#3a3a3a] transition-all cursor-pointer group relative"
      onClick={onOpen}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#32d583] to-blue-500 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-[#111111]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-[#32d583] transition-colors">
              {project.title}
            </h3>
            <span className="text-xs font-mono text-[#32d583] bg-[#243c33] px-2 py-0.5 rounded-full mt-1 inline-block border border-[#2d5040]">
              {project.citationStyle}
            </span>
          </div>
        </div>

        {/* Menu Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : project.id); }}
          className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-500 hover:text-gray-200 transition-colors shrink-0"
        >
          <MoreVertical size={16} />
        </button>

        {/* Dropdown */}
        {isMenuOpen && (
          <div
            className="absolute right-4 top-12 bg-[#222222] border border-[#333333] rounded-xl shadow-xl z-10 overflow-hidden w-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors">
              <Pencil size={14} /> Editar
            </button>
            <button
              onClick={() => { onDelete(); setMenuOpenId(null); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{project.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-1 border-t border-[#222222]">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FileText size={13} className="text-gray-600" />
          <span>{project.documentCount} docs</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Quote size={13} className="text-gray-600" />
          <span>{project.citationCount} citas</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
          <Calendar size={13} className="text-gray-600" />
          <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: es })}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
        <BookOpen size={36} className="text-[#333333]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Aún no tienes proyectos</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        Crea tu primera tesis y empieza a organizar tu investigación con el poder de la IA.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors"
      >
        <Plus size={18} />
        Crear mi primera tesis
      </button>
    </div>
  );
}
