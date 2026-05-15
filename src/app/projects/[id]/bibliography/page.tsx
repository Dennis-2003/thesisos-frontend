'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, BookOpen, Plus, Trash2, ExternalLink, ArrowLeft, X, Copy, Check } from 'lucide-react';
import type { BibliographyEntry } from '@/types';

const ENTRY_TYPES = [
  { value: 'article',       label: 'Artículo' },
  { value: 'book',          label: 'Libro' },
  { value: 'inproceedings', label: 'Conferencia' },
  { value: 'thesis',        label: 'Tesis' },
  { value: 'website',       label: 'Sitio web' },
];

const TYPE_COLOR: Record<string, string> = {
  article:       'text-blue-400 bg-blue-950/30 border-blue-900/30',
  book:          'text-purple-400 bg-purple-950/30 border-purple-900/30',
  inproceedings: 'text-orange-400 bg-orange-950/30 border-orange-900/30',
  thesis:        'text-[#32d583] bg-[#243c33] border-[#2d5040]',
  website:       'text-gray-400 bg-[#1e1e1e] border-[#2a2a2a]',
};

function Field({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
      />
    </div>
  );
}

export default function BibliographyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    authors: '', year: '', title: '', journal: '', doi: '', url: '',
    volume: '', issue: '', pages: '', publisher: '', entryType: 'article',
    formattedApa: '', formattedIeee: '',
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['bibliography', id],
    queryFn: () => API.get(`/projects/${id}/bibliography`).then((r) => r.data as BibliographyEntry[]),
  });

  const createMutation = useMutation({
    mutationFn: () => API.post(`/projects/${id}/bibliography`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibliography', id] });
      setShowModal(false);
      setForm({ authors: '', year: '', title: '', journal: '', doi: '', url: '', volume: '', issue: '', pages: '', publisher: '', entryType: 'article', formattedApa: '', formattedIeee: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => API.delete(`/projects/${id}/bibliography/${entryId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibliography', id] }),
  });

  const copyApa = (e: BibliographyEntry, entryId: string) => {
    const text = e.formattedApa || `${e.authors} (${e.year}). ${e.title}. ${e.journal || e.publisher || ''}.`;
    navigator.clipboard.writeText(text);
    setCopied(entryId);
    setTimeout(() => setCopied(null), 2000);
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
              <h1 className="text-2xl font-bold text-white">Bibliografía</h1>
              <p className="text-sm text-gray-500 mt-0.5">{entries?.length ?? 0} referencia{(entries?.length ?? 0) !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} /> Agregar referencia
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#32d583]" size={32} /></div>
          ) : entries?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
                <BookOpen size={36} className="text-[#333333]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Bibliografía vacía</h2>
              <p className="text-sm text-gray-500 max-w-xs mb-8">Agrega las fuentes que sustentan tu investigación.</p>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors">
                <Plus size={16} /> Agregar primera referencia
              </button>
            </div>
          ) : (
            <div className="max-w-3xl space-y-3">
              {entries?.map((e) => {
                const colorClass = TYPE_COLOR[e.entryType] || TYPE_COLOR.website;
                return (
                  <div key={e.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                            {ENTRY_TYPES.find((t) => t.value === e.entryType)?.label || e.entryType}
                          </span>
                          <span className="text-xs text-gray-500">{e.year}</span>
                        </div>
                        <p className="font-semibold text-sm text-white leading-snug">{e.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {e.authors}
                          {(e.journal || e.publisher) && <span className="text-gray-600"> · {e.journal || e.publisher}</span>}
                          {e.volume && <span className="text-gray-600"> · Vol. {e.volume}</span>}
                        </p>
                        {e.formattedApa && (
                          <p className="text-xs text-gray-600 mt-2 italic leading-relaxed line-clamp-2">{e.formattedApa}</p>
                        )}
                        {e.doi && (
                          <p className="text-xs text-blue-400/70 mt-1 font-mono">DOI: {e.doi}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => copyApa(e, e.id)}
                          className="p-2 rounded-lg text-gray-600 hover:text-[#32d583] hover:bg-[#243c33] transition-colors"
                          title="Copiar APA"
                        >
                          {copied === e.id ? <Check size={15} className="text-[#32d583]" /> : <Copy size={15} />}
                        </button>
                        {(e.doi || e.url) && (
                          <a
                            href={e.doi ? `https://doi.org/${e.doi}` : e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-blue-950/30 transition-colors"
                            title="Abrir enlace"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(e.id)}
                          className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">Nueva Referencia</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto custom-scrollbar">
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Tipo de fuente</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ENTRY_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, entryType: t.value })}
                        className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                          form.entryType === t.value
                            ? 'bg-[#32d583] text-[#111111] border-[#32d583]'
                            : 'bg-[#111111] text-gray-500 border-[#333333] hover:border-[#444444]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Título *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Título de la publicación" />
                <Field label="Autores" value={form.authors} onChange={(v) => setForm({ ...form, authors: v })} placeholder="Apellido, N. y Apellido, N." />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Año" value={form.year} onChange={(v) => setForm({ ...form, year: v })} placeholder="2024" />
                  <Field label="Volumen" value={form.volume} onChange={(v) => setForm({ ...form, volume: v })} placeholder="12" />
                </div>
                <Field label="Revista / Editorial" value={form.journal} onChange={(v) => setForm({ ...form, journal: v })} placeholder="Nombre de la revista" />
                <Field label="DOI" value={form.doi} onChange={(v) => setForm({ ...form, doi: v })} placeholder="10.xxxx/xxxxx" />
                <Field label="URL" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://..." />
                <Field label="Formato APA (opcional)" value={form.formattedApa} onChange={(v) => setForm({ ...form, formattedApa: v })} placeholder="Cita formateada en APA" />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm">Cancelar</button>
                  <button type="submit" disabled={createMutation.isPending || !form.title} className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    {createMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
