'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, BookOpen, FileText,
  Quote, Settings, FolderOpen, BookMarked, Users,
  Calendar, HelpCircle, ListTree, Search,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem { label: string; icon: React.ReactNode; href: string; badge?: string | number; }

// Defined OUTSIDE Sidebar to avoid "component created during render" lint error
function NavButton({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  const active =
    item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <button
      onClick={() => onNavigate(item.href)}
      className={clsx(
        'flex items-center justify-between w-full px-6 py-2.5 text-sm transition-all border-l-2',
        active
          ? 'bg-[#1a2d24] text-white font-medium border-[#32d583]'
          : 'hover:text-gray-200 hover:bg-[#1a1a1a] border-transparent text-gray-400'
      )}
    >
      <div className={clsx('flex items-center gap-3', active && 'text-[#32d583]')}>
        {item.icon}
        <span className={active ? 'text-white' : ''}>{item.label}</span>
      </div>
      {item.badge !== undefined && (
        <span className="bg-[#222222] text-gray-300 text-xs px-2 py-0.5 rounded-full font-medium">
          {item.badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1];
  const inProject = !!projectId && projectId !== 'page';

  const nav = (href: string) => router.push(href);

  const btn = (item: NavItem) => (
    <NavButton key={item.href} item={item} pathname={pathname} onNavigate={nav} />
  );

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#111111] text-gray-400 border-r border-[#222222] z-40">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-6 border-b border-[#222222] cursor-pointer"
        onClick={() => nav('/dashboard')}
      >
        <div className="text-xl font-bold text-white tracking-tight flex items-center">
          Thesis<span className="text-[#32d583]">OS</span>
        </div>
        <div className="bg-[#243c33] text-[#32d583] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2d5040] shadow-[0_0_8px_rgba(50,213,131,0.2)]">
          IA Activa
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-4 space-y-5 custom-scrollbar">

        {/* PRINCIPAL */}
        <div>
          <p className="px-6 text-[10px] font-bold text-gray-600 mb-2 tracking-widest uppercase">Principal</p>
          <div className="space-y-0.5">
            {btn({ label: 'Dashboard',     icon: <LayoutDashboard size={17} />, href: '/dashboard' })}
            {btn({ label: 'Mis Proyectos', icon: <FolderOpen size={17} />,      href: '/projects' })}
            {btn({ label: 'Buscar',        icon: <Search size={17} />,           href: '/search' })}
          </div>
        </div>

        {/* PROYECTO ACTIVO */}
        {inProject && (
          <div>
            <p className="px-6 text-[10px] font-bold text-gray-600 mb-2 tracking-widest uppercase">Proyecto Activo</p>
            <div className="space-y-0.5">
              {btn({ label: 'Documentos',    icon: <FileText size={17} />,     href: `/projects/${projectId}/documents` })}
              {btn({ label: 'Esquema',       icon: <ListTree size={17} />,      href: `/projects/${projectId}/outline` })}
              {btn({ label: 'Preguntas',     icon: <HelpCircle size={17} />,    href: `/projects/${projectId}/questions` })}
              {btn({ label: 'Hitos',         icon: <Calendar size={17} />,      href: `/projects/${projectId}/milestones` })}
              {btn({ label: 'Bibliografía',  icon: <BookMarked size={17} />,    href: `/projects/${projectId}/bibliography` })}
              {btn({ label: 'Citas',         icon: <Quote size={17} />,         href: `/projects/${projectId}/citations` })}
              {btn({ label: 'Chat IA',       icon: <MessageSquare size={17} />, href: `/projects/${projectId}/chat`, badge: 'IA' })}
              {btn({ label: 'Colaboradores', icon: <Users size={17} />,         href: `/projects/${projectId}/collaborators` })}
            </div>
          </div>
        )}

        {/* HERRAMIENTAS */}
        <div>
          <p className="px-6 text-[10px] font-bold text-gray-600 mb-2 tracking-widest uppercase">Herramientas</p>
          <div className="space-y-0.5">
            {!inProject && btn({ label: 'Mi Tesis', icon: <BookOpen size={17} />, href: '/projects' })}
            {btn({ label: 'Configuración', icon: <Settings size={17} />, href: '/settings' })}
          </div>
        </div>

      </nav>

      <div className="px-6 py-4 border-t border-[#222222]">
        <p className="text-[10px] text-gray-700 leading-relaxed">
          ThesisOS v1.0 · Datos cifrados y protegidos.
        </p>
      </div>
    </aside>
  );
}
