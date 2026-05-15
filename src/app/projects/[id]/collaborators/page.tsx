'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2, Users, Trash2, Mail, Shield, ArrowLeft, X, UserPlus } from 'lucide-react';
import type { Collaborator } from '@/types';

const ROLES = [
  { value: 'advisor',   label: 'Asesor',     color: 'text-purple-400 bg-purple-950/30 border-purple-900/30' },
  { value: 'coauthor',  label: 'Co-autor',   color: 'text-blue-400 bg-blue-950/30 border-blue-900/30' },
  { value: 'reviewer',  label: 'Revisor',    color: 'text-orange-400 bg-orange-950/30 border-orange-900/30' },
];

const PERMISSIONS = [
  { value: 'read',  label: 'Solo lectura' },
  { value: 'write', label: 'Lectura y escritura' },
  { value: 'admin', label: 'Administrador' },
];

export default function CollaboratorsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'advisor', permissions: 'read' });

  const { data: collabs, isLoading } = useQuery({
    queryKey: ['collaborators', id],
    queryFn: () => API.get(`/projects/${id}/collaborators`).then((r) => r.data as Collaborator[]),
  });

  const inviteMutation = useMutation({
    mutationFn: () => API.post(`/projects/${id}/collaborators`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', id] });
      setShowModal(false);
      setForm({ email: '', role: 'advisor', permissions: 'read' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (collabId: string) => API.delete(`/projects/${id}/collaborators/${collabId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collaborators', id] }),
  });

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const getRoleConfig = (role: string) =>
    ROLES.find((r) => r.value === role) || { label: role, color: 'text-gray-400 bg-[#1e1e1e] border-[#2a2a2a]' };

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
              <h1 className="text-2xl font-bold text-white">Colaboradores</h1>
              <p className="text-sm text-gray-500 mt-0.5">{collabs?.length ?? 0} miembro{(collabs?.length ?? 0) !== 1 ? 's' : ''} en este proyecto</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <UserPlus size={16} /> Invitar
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#32d583]" size={32} /></div>
          ) : collabs?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6">
                <Users size={36} className="text-[#333333]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Solo tú por ahora</h2>
              <p className="text-sm text-gray-500 max-w-xs mb-8">Invita a tu asesor o compañeros para colaborar en tu proyecto de tesis.</p>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors">
                <UserPlus size={16} /> Invitar colaborador
              </button>
            </div>
          ) : (
            <div className="max-w-2xl space-y-3">
              {collabs?.map((c) => {
                const roleCfg = getRoleConfig(c.role);
                return (
                  <div key={c.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-center justify-between gap-4 hover:border-[#3a3a3a] transition-all group">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#32d583] to-blue-500 flex items-center justify-center shrink-0 text-sm font-bold text-[#111111]">
                        {getInitials(c.userFullName || c.userEmail)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{c.userFullName || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={11} /> {c.userEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${roleCfg.color}`}>
                        {roleCfg.label}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Shield size={11} /> {PERMISSIONS.find((p) => p.value === c.permissions)?.label || c.permissions}
                      </span>
                      <button
                        onClick={() => removeMutation.mutate(c.id)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
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
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">Invitar colaborador</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-[#222222] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Email del usuario *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="asesor@universidad.edu"
                  required
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#32d583] focus:ring-1 focus:ring-[#32d583] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Rol</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        form.role === r.value ? r.color : 'bg-[#111111] text-gray-500 border-[#333333] hover:border-[#444444]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Permisos</label>
                <div className="space-y-2">
                  {PERMISSIONS.map((p) => (
                    <label key={p.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        form.permissions === p.value ? 'border-[#32d583] bg-[#32d583]' : 'border-[#444444] group-hover:border-[#666666]'
                      }`} onClick={() => setForm({ ...form, permissions: p.value })}>
                        {form.permissions === p.value && <div className="w-1.5 h-1.5 bg-[#111111] rounded-full" />}
                      </div>
                      <span className="text-sm text-gray-300">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-[#333333] hover:bg-[#222222] text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={inviteMutation.isPending || !form.email} className="flex-1 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {inviteMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  <UserPlus size={15} /> Invitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
