'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Search, Loader2, FileText, BookOpen, Quote, HelpCircle, Calendar, ArrowRight } from 'lucide-react';
import type { SearchResult } from '@/types';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  document:   { label: 'Documento',    icon: <FileText size={14} />,   color: 'text-blue-400',    bg: 'bg-blue-950/30 border-blue-900/30' },
  outline:    { label: 'Capítulo',     icon: <BookOpen size={14} />,   color: 'text-[#32d583]',   bg: 'bg-[#243c33] border-[#2d5040]' },
  citation:   { label: 'Cita',         icon: <Quote size={14} />,      color: 'text-purple-400',  bg: 'bg-purple-950/30 border-purple-900/30' },
  question:   { label: 'Pregunta',     icon: <HelpCircle size={14} />, color: 'text-yellow-400',  bg: 'bg-yellow-950/30 border-yellow-900/30' },
  milestone:  { label: 'Hito',         icon: <Calendar size={14} />,   color: 'text-orange-400',  bg: 'bg-orange-950/30 border-orange-900/30' },
  bibliography: { label: 'Bibliografía', icon: <BookOpen size={14} />, color: 'text-pink-400',    bg: 'bg-pink-950/30 border-pink-900/30' },
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('q') || '';
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: (q: string) => API.get(`/search?q=${encodeURIComponent(q)}`).then((r) => r.data as SearchResult[]),
    onSuccess: (data) => {
      setResults(data);
      setHasSearched(true);
    },
  });

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    router.replace(`/search?q=${encodeURIComponent(q)}`);
    searchMutation.mutate(q);
  };



  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header with Search */}
        <header className="px-8 py-6 border-b border-[#222222]">
          <h1 className="text-2xl font-bold text-white mb-4">Búsqueda Global</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Busca entre todos tus proyectos, documentos, capítulos, citas..."
              autoFocus
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
            />
            <button
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || searchMutation.isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold px-4 py-1.5 rounded-lg text-xs transition-all"
            >
              {searchMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </header>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {searchMutation.isPending ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#32d583]" size={32} />
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search size={48} className="text-[#2a2a2a] mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Sin resultados</h2>
              <p className="text-sm text-gray-500">No se encontró nada para <span className="text-gray-300">&quot;{query}&quot;</span>. Intenta con otras palabras.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-w-3xl">
              <p className="text-xs text-gray-500 mb-5">{results.length} resultado{results.length !== 1 ? 's' : ''} para <span className="text-gray-300">&quot;{query}&quot;</span></p>
              <div className="space-y-3">
                {results.map((r) => {
                  const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.document;
                  return (
                    <div
                      key={r.id}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-all cursor-pointer group"
                      onClick={() => r.projectId && router.push(`/projects/${r.projectId}/documents`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`flex items-center gap-1.5 shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border ${cfg.bg} ${cfg.color} mt-0.5`}>
                            {cfg.icon}
                            {cfg.label}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-white group-hover:text-[#32d583] transition-colors leading-snug">{r.title}</p>
                            {r.snippet && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{r.snippet}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {r.relevance > 0 && (
                            <span className="text-[10px] text-gray-600 font-mono">{Math.round(r.relevance * 100)}% relevante</span>
                          )}
                          <ArrowRight size={14} className="text-gray-600 group-hover:text-[#32d583] transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search size={48} className="text-[#2a2a2a] mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Busca en todo tu trabajo</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Encuentra documentos, capítulos, citas, hitos y más a través de todos tus proyectos con una sola búsqueda.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
