'use client';
import { useState } from 'react';
import { Search, Upload, BookOpen, ChevronDown, Loader2, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import API from '@/lib/api';
import type { Project, PagedResponse, ActivityLog } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => API.get('/projects?page=0&size=50').then((r) => r.data as PagedResponse<Project>),
    enabled: !!user,
  });

  const firstProjectId = projects?.content[0]?.id;

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', firstProjectId],
    queryFn: () => API.get(`/projects/${firstProjectId}/activity?page=0&size=5`).then((r) => r.data as PagedResponse<ActivityLog>),
    enabled: !!firstProjectId,
  });

  const totalDocs = projects?.content.reduce((sum, p) => sum + p.documentCount, 0) || 0;
  const totalCitations = projects?.content.reduce((sum, p) => sum + p.citationCount, 0) || 0;

  // Placeholder for progress (in a real app, this might come from Milestones or Outline)
  const thesisProgress = 67;

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#222222]">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#32d583] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar papers, notas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333333] hover:border-[#444444] hover:bg-[#222222] text-sm font-medium px-4 py-2 rounded-lg transition-all">
              <Upload size={16} className="text-gray-400" />
              Subir PDF
            </button>
            <button suppressHydrationWarning className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#32d583] to-blue-500 flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-[#222222] uppercase">
              {user?.fullName?.substring(0, 2) || 'TU'}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-2">Dashboard de investigación</h1>
              <p className="text-gray-400 text-sm">Resumen de tu ecosistema académico activo</p>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#32d583]" size={32} /></div>
            ) : (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#333333] transition-colors">
                    <span className="text-4xl font-semibold text-white mb-1">{totalDocs}</span>
                    <span className="text-sm text-gray-400 font-medium leading-tight">Papers<br/>indexados</span>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#333333] transition-colors">
                    <span className="text-4xl font-semibold text-white mb-1">{thesisProgress}%</span>
                    <span className="text-sm text-gray-400 font-medium leading-tight">Progreso<br/>tesis</span>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#333333] transition-colors">
                    <span className="text-4xl font-semibold text-white mb-1">{totalCitations}</span>
                    <span className="text-sm text-gray-400 font-medium leading-tight">Citas<br/>generadas</span>
                  </div>
                </div>

                {/* Bottom Section (2 columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Progreso por capítulo */}
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 relative">
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="text-[#32d583]" size={20} />
                      <h2 className="text-lg font-semibold text-white">Progreso por capítulo</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <ProgressRow label="Introducción" percentage={100} color="bg-[#32d583]" />
                      <ProgressRow label="Marco teórico" percentage={85} color="bg-[#32d583]" />
                      <ProgressRow label="Metodología" percentage={60} color="bg-orange-400" />
                      <ProgressRow label="Resultados" percentage={20} color="bg-red-500" />
                      <ProgressRow label="Conclusiones" percentage={0} color="bg-gray-600" />
                    </div>
                    
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#2a2a2a] rounded-full p-1.5 cursor-pointer hover:bg-[#222222] transition-colors">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Actividad reciente */}
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Activity className="text-[#32d583]" size={20} />
                      <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
                    </div>
                    
                    <div className="relative border-l-2 border-[#2a2a2a] ml-3 space-y-6 pb-2">
                      {activitiesLoading ? (
                        <div className="pl-6"><Loader2 className="animate-spin text-[#32d583]" size={20} /></div>
                      ) : activities?.content && activities.content.length > 0 ? (
                        activities.content.map((act) => (
                          <ActivityItem 
                            key={act.id}
                            color="bg-[#32d583]"
                            title={act.action}
                            desc={act.details || act.entityType}
                            time={formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: es })}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 pl-6">No hay actividad reciente.</p>
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </main>
      

    </div>
  );
}

function ProgressRow({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function ActivityItem({ color, title, desc, time }: { color: string, title: string, desc: string, time: string }) {
  return (
    <div className="relative pl-6">
      <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${color} ring-4 ring-[#1a1a1a]`}></div>
      <p className="text-sm font-semibold text-gray-200 capitalize">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc} · {time}</p>
    </div>
  );
}
