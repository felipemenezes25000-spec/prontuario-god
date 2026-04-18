"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string };

const NAV_ATENDIMENTO: NavItem[] = [
  { label: "Painel", href: "/medico/dashboard", icon: IconHome },
  { label: "Agenda", href: "/medico/agenda", icon: IconCalendar, badge: "8" },
  { label: "Pacientes", href: "/medico/pacientes", icon: IconUsers },
  { label: "Prontuário Maria", href: "/medico/prontuario/00000000-0000-0000-0000-000000000002", icon: IconUser },
  { label: "Co-Pilot Titulação", href: "/co-pilot/titulacao", icon: IconSpark },
  { label: "Receituário", href: "/medico/receita", icon: IconReceipt },
  { label: "Exames", href: "/medico/exames", icon: IconFlask, badge: "3" },
  { label: "Telemedicina", href: "/medico/telemedicina", icon: IconVideo },
  { label: "Protocolos", href: "/medico/protocolos", icon: IconBook },
];

const NAV_CLINICA: NavItem[] = [
  { label: "Equipe", href: "/clinica/equipe", icon: IconTeam },
  { label: "Catálogo", href: "/clinica/catalogo", icon: IconPackage },
  { label: "Financeiro", href: "/clinica/financeiro", icon: IconMoney },
  { label: "Relatórios", href: "/clinica/relatorios", icon: IconChart },
];

const NAV_COMUNICACAO: NavItem[] = [
  { label: "Mensagens", href: "/mensagens", icon: IconMessage, badge: "12" },
  { label: "Notificações", href: "/notificacoes", icon: IconBell, badge: "4" },
];

const NAV_SISTEMA: NavItem[] = [
  { label: "Compliance", href: "/compliance", icon: IconShield },
  { label: "Configurações", href: "/configuracoes", icon: IconSettings },
];

const NAV_OUTROS: NavItem[] = [
  { label: "Página inicial", href: "/", icon: IconArrowOut },
  { label: "App do paciente", href: "/paciente/log", icon: IconHeart },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 bg-sidebar text-sidebarText flex-col border-r border-sidebar2 sticky top-0 h-screen">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Drawer à ESQUERDA (mesmo lado do hamburger) */}
      <aside className="w-[280px] max-w-[85vw] bg-sidebar text-sidebarText flex flex-col border-r border-sidebar2 animate-slide-right shadow-2xl">
        <SidebarContent onNavigate={onClose} />
      </aside>
      {/* Backdrop clicável do lado direito */}
      <button
        onClick={onClose}
        aria-label="fechar menu"
        className="flex-1 bg-black/50 backdrop-blur-sm"
      />
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  function sair() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("meridiana.auth");
    }
    router.push("/");
    onNavigate?.();
  }

  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pt-6 pb-6 hover:opacity-90"
      >
        <span className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold">
          M
        </span>
        <span className="font-semibold text-base text-sidebarTextStrong tracking-tight">
          Meridiana
        </span>
      </Link>

      <nav className="px-3 flex-1 flex flex-col gap-1 overflow-y-auto pb-4">
        <NavGroup label="Atendimento">
          {NAV_ATENDIMENTO.map((it) => (
            <NavLink key={it.href} item={it} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </NavGroup>
        <NavGroup label="Clínica">
          {NAV_CLINICA.map((it) => (
            <NavLink key={it.href} item={it} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </NavGroup>
        <NavGroup label="Comunicação">
          {NAV_COMUNICACAO.map((it) => (
            <NavLink key={it.href} item={it} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </NavGroup>
        <NavGroup label="Sistema">
          {NAV_SISTEMA.map((it) => (
            <NavLink key={it.href} item={it} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </NavGroup>
        <NavGroup label="Outros">
          {NAV_OUTROS.map((it) => (
            <NavLink key={it.href} item={it} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </NavGroup>
      </nav>

      <div className="border-t border-sidebar2 px-3 py-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shrink-0">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-sidebarTextStrong truncate">Dra. Ana Beatriz</div>
            <div className="text-xs text-sidebarMuted truncate">CRM 123456/SP · Meridiana Paulista</div>
          </div>
          <button
            onClick={sair}
            className="text-sidebarMuted hover:text-sidebarTextStrong p-1.5 rounded-md hover:bg-sidebarHover"
            aria-label="sair"
            title="Sair"
          >
            <IconLogout />
          </button>
        </div>
      </div>
    </>
  );
}

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const isActive =
    pathname === item.href ||
    (item.href.includes("/prontuario/") && pathname.startsWith("/medico/prontuario")) ||
    (item.href !== "/" && pathname.startsWith(item.href));
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx("nav-item relative flex items-center justify-between", isActive && "active")}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="shrink-0" />
        <span>{item.label}</span>
      </span>
      {item.badge && (
        <span className="text-[10px] bg-primary/20 text-primary rounded-full px-1.5 py-0.5 font-mono tnum">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebarMuted">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

// ----- Icons -----
function IconHome({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" /></svg>; }
function IconSpark({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>; }
function IconReceipt({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>; }
function IconUser({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>; }
function IconUsers({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function IconCalendar({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function IconFlask({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 3h6M10 3v6l-6 10a2 2 0 0 0 1.73 3h12.54A2 2 0 0 0 20 19L14 9V3" /></svg>; }
function IconVideo({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>; }
function IconBook({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5A2.5 2.5 0 0 0 4 19.5z" /></svg>; }
function IconTeam({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function IconPackage({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" /><path d="M2.32 6.16L12 11l9.68-4.84M12 22.76V11" /></svg>; }
function IconMoney({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function IconChart({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>; }
function IconMessage({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>; }
function IconBell({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>; }
function IconShield({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }
function IconSettings({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>; }
function IconArrowOut({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }
function IconHeart({ className = "" }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function IconLogout({ className = "" }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }
