'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { useRef, useState, useCallback } from 'react';
import type { Document } from '@/types';
import {
  Upload, FileText, Trash2, Loader2, ArrowLeft,
  File, AlertCircle, CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => API.get(`/projects/${id}/documents`).then((r) => r.data as Document[]),
  });

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return API.post(`/projects/${id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      showToast('ok', 'PDF subido correctamente');
    },
    onError: () => showToast('err', 'Error al subir el archivo'),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => API.delete(`/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      showToast('ok', 'Documento eliminado');
    },
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((f) => {
        if (f.type === 'application/pdf') uploadMutation.mutate(f);
        else showToast('err', `"${f.name}" no es un PDF`);
      });
    },
    [uploadMutation]
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#222222]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Documentos</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {docs?.length ?? 0} PDF{(docs?.length ?? 0) !== 1 ? 's' : ''} indexado{(docs?.length ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="flex items-center gap-2 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-50 text-[#111111] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            {uploadMutation.isPending
              ? <Loader2 size={16} className="animate-spin" />
              : <Upload size={16} />}
            {uploadMutation.isPending ? 'Subiendo...' : 'Subir PDF'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">

          {/* Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              dragging
                ? 'border-[#32d583] bg-[#1a2d24] scale-[1.01]'
                : 'border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              dragging ? 'bg-[#32d583]/20' : 'bg-[#1e1e1e]'
            }`}>
              <Upload size={28} className={dragging ? 'text-[#32d583]' : 'text-gray-500'} />
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm ${dragging ? 'text-[#32d583]' : 'text-gray-300'}`}>
                {dragging ? 'Suelta el archivo aquí' : 'Arrastra PDFs aquí o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Soporta múltiples archivos PDF</p>
            </div>
          </div>

          {/* Documents List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#32d583]" size={32} />
            </div>
          ) : docs && docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  formatSize={formatSize}
                  onDelete={() => deleteMutation.mutate(doc.id)}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <File size={48} className="text-[#2a2a2a] mb-4" />
              <p className="text-gray-500 text-sm">Aún no hay documentos. ¡Sube tu primer PDF!</p>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium z-50 transition-all ${
          toast.type === 'ok'
            ? 'bg-[#1a2d24] border-[#2d5040] text-[#32d583]'
            : 'bg-red-950/40 border-red-900/50 text-red-400'
        }`}>
          {toast.type === 'ok'
            ? <CheckCircle2 size={16} />
            : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function DocCard({
  doc,
  formatSize,
  onDelete,
  deleting,
}: {
  doc: Document;
  formatSize: (b: number) => string;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#3a3a3a] transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-900/30 flex items-center justify-center shrink-0">
          <FileText size={18} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-[#32d583] transition-colors">
            {doc.fileName}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatSize(doc.fileSize)}</p>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
        >
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
        <span className="text-xs text-gray-600">
          {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true, locale: es })}
        </span>
        <span className="text-xs font-mono bg-[#222222] text-gray-400 px-2 py-0.5 rounded-md">PDF</span>
      </div>
    </div>
  );
}
