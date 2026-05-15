'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Activity, Clock } from 'lucide-react';
import type { ActivityLog } from '@/types';

export default function ActivityPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => API.get(`/projects/${id}/activity?page=0&size=50`).then((r) => r.data),
  });

  const logs: ActivityLog[] = data?.content || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Actividad</h1>
          <p className="text-sm text-gray-500">Registro de cambios en el proyecto</p>
        </div>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div> : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border bg-white p-4">
                <div className="rounded-full bg-gray-100 p-2 mt-0.5"><Activity size={16} className="text-gray-500" /></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>{log.userFullName}</strong> {log.action} <span className="text-blue-600">{log.entityType}</span>
                  </p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                  <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-center py-12 text-gray-400">Sin actividad registrada</p>}
          </div>
        )}
      </main>
    </div>
  );
}
