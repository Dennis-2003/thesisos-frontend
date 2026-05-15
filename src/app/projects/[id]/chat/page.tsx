'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import API from '@/lib/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Send, Bot, Loader2, Sparkles, BookOpen, FileSearch, Quote } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_PROMPTS = [
  { icon: <BookOpen size={14} />, label: 'Resumir mi investigación', text: '¿Puedes hacer un resumen ejecutivo de mi investigación hasta ahora?' },
  { icon: <FileSearch size={14} />, label: 'Sugerir estructura', text: '¿Qué estructura recomiendas para mi tesis basada en el tema?' },
  { icon: <Quote size={14} />, label: 'Ayudar con marco teórico', text: 'Ayúdame a redactar el marco teórico de mi tesis.' },
  { icon: <Sparkles size={14} />, label: 'Mejorar redacción', text: 'Dame consejos para mejorar la redacción académica de mi tesis.' },
];

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de tesis con IA. Puedo ayudarte a estructurar tus capítulos, resumir documentos, sugerir citas o responderte cualquier pregunta sobre tu investigación.\n\n¿En qué te ayudo hoy?' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = useMutation({
    mutationFn: (msg: string) =>
      API.post(`/projects/${id}/ai/chat`, { message: msg }).then((r) => r.data),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.message || 'Sin respuesta del asistente.' }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Ocurrió un error al conectar con el asistente. Verifica que el backend esté activo.' }]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    chatMutation.mutate(msg);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const showQuickPrompts = messages.length <= 1;

  return (
    <div className="flex min-h-screen bg-[#111111] text-white selection:bg-[#32d583] selection:text-black">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-4 px-8 py-4 border-b border-[#222222]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#32d583] to-blue-500 flex items-center justify-center shrink-0">
            <Bot size={18} className="text-[#111111]" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base">Asistente de Tesis IA</h1>
            <div className="flex items-center gap-1.5 text-xs text-[#32d583]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32d583] animate-pulse" />
              Activo y listo para ayudar
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto mt-4">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleSend(qp.text)}
                  className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#32d583] hover:bg-[#1a2d24] text-left px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-[#32d583] transition-all"
                >
                  <span className="text-[#32d583] shrink-0">{qp.icon}</span>
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'assistant'
                  ? 'bg-gradient-to-br from-[#32d583] to-blue-500'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700'
              }`}>
                {m.role === 'assistant'
                  ? <Bot size={16} className="text-[#111111]" />
                  : <span suppressHydrationWarning className="text-xs font-bold text-white uppercase">{user?.fullName?.substring(0, 2) || 'TU'}</span>
                }
              </div>

              {/* Bubble */}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] ${
                m.role === 'assistant'
                  ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-200 rounded-tl-sm'
                  : 'bg-[#32d583] text-[#111111] font-medium rounded-tr-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {chatMutation.isPending && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#32d583] to-blue-500 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-[#111111]" />
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#32d583] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#32d583] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#32d583] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#222222] px-6 py-4 bg-[#111111]">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded-2xl px-4 py-3 focus-within:border-[#32d583] focus-within:ring-1 focus-within:ring-[#32d583] transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
                rows={1}
                className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
                style={{ maxHeight: '160px' }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || chatMutation.isPending}
              className="w-11 h-11 bg-[#32d583] hover:bg-[#2bc275] disabled:opacity-40 disabled:cursor-not-allowed text-[#111111] rounded-xl flex items-center justify-center transition-all shrink-0"
            >
              {chatMutation.isPending
                ? <Loader2 size={18} className="animate-spin" />
                : <Send size={18} />
              }
            </button>
          </div>
          <p className="text-center text-xs text-gray-700 mt-2">La IA puede cometer errores. Verifica la información importante.</p>
        </div>
      </main>
    </div>
  );
}
