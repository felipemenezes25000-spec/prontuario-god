"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { label: "Painel", href: "/medico/dashboard", icon: IconHome },
  { label: "Co-Pilot", href: "/co-pilot/titulacao", icon: IconSpark },
  { label: "Receituário", href: "/medico/receita", icon: IconReceipt },
  { label: "Prontuário Maria", href: "/medico/prontuario/00000000-0000-0000-0000-000000000002", icon: IconUser },
];

const SECONDARY = [
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
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="fechar menu"
        className="flex-1 bg-sidebar/60 backdrop-blur-sm"
      />
      {/* Drawer */}
      <aside className="w-[260px] bg-sidebar text-sidebarText flex flex-col border-l border-sidebar2 animate-rise">
        <SidebarContent onNavigate={onClose} />
      </aside>
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
        className="flex items-center gap-2.5 px-5 pt-6 pb-8 hover:opacity-90"
      >
        <span className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold">
          M
        </span>
        <span className="font-semibold text-base text-sidebarTextStrong tracking-tight">
          Meridiana
        </span>
      </Link>

      <nav className="px-3 flex-1 flex flex-col gap-1 overflow-y-auto">
        <NavGroup label="Atendimento">
          {NAV.map((it) => {
            const isActive = pathname === it.href || (it.href.includes("/prontuario/") && pathname.startsWith("/medico/prontuario"));
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onNavigate}
                className={clsx("nav-item relative", isActive && "active")}
              >
                <Icon className="shrink-0" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </NavGroup>

        <NavGroup label="Outros">
          {SECONDARY.map((it) => {
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onNavigate}
                className="nav-item"
              >
                <Icon className="shrink-0" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </NavGroup>
      </nav>

      <div className="border-t border-sidebar2 px-3 py-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shrink-0">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-sidebarTextStrong truncate">Dra. Ana Beatriz</div>
            <div className="text-xs text-sidebarMuted truncate">CRM 123456/SP</div>
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

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-sidebarMuted">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

// Icons
function IconHome({ className = "" }: { className?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" /></svg>; }
function IconSpark({ className = "" }: { className?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>; }
function IconReceipt({ className = "" }: { className?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>; }
function IconUser({ className = "" }: { className?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>; }
function IconArrowOut({ className = "" }: { className?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }
function IconHeart({ className = "" }: { className?: string }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function IconLogout({ className = "" }: { className?: string }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }
