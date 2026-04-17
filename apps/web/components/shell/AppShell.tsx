"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { AuthGuard } from "./AuthGuard";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-bg text-text">
        <Sidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Mobile topbar botão hamburger */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-bg border-b border-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-muted hover:text-text p-1.5 rounded-md hover:bg-surface"
              aria-label="abrir menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-white grid place-items-center text-[11px] font-bold">M</span>
              <span className="font-semibold text-sm">Meridiana</span>
            </div>
            <div className="w-8" />
          </div>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
