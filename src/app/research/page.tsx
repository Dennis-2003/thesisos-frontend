'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Search, Globe, Sparkles, BookOpen, GraduationCap, Microscope } from 'lucide-react';

export default function ResearchPage() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Redirect to Google Scholar or Google Search in a new tab
    const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  const SUGGESTIONS = [
    { label: 'Impacto de la IA en medicina', icon: <Microscope size={14} /> },
    { label: 'Estrategias de aprendizaje híbrido', icon: <GraduationCap size={14} /> },
    { label: 'Cambio climático y economía global', icon: <Globe size={14} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col items-center justify-center p-8">
        
        <div className="max-w-2xl w-full text-center space-y-8 -mt-20">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#243c33] border border-[#2d5040] text-[#32d583] text-xs font-bold uppercase tracking-wider">
              <Globe size={12} /> Búsqueda Global de Investigación
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Encuentra fuentes para tu <span className="text-[#32d583]">Tesis</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">
              Accede a millones de artículos académicos, papers y libros directamente desde Google Scholar.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-gray-500 group-focus-within:text-[#32d583] transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Google Scholar..." 
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-2xl pl-14 pr-32 py-5 text-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all shadow-2xl"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              Buscar <Sparkles size={16} />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sugerencias:</span>
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i}
                onClick={() => { setQuery(s.label); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-400 hover:text-white hover:border-[#444444] transition-all"
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 text-left">
            <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#243c33] flex items-center justify-center text-[#32d583]">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-white">Google Scholar</h3>
              <p className="text-sm text-gray-500">Acceso directo a la base de datos de investigación más grande del mundo.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e2a3b] flex items-center justify-center text-blue-400">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-white">Integración IA</h3>
              <p className="text-sm text-gray-500">Próximamente: Resúmenes automáticos de los resultados encontrados.</p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
