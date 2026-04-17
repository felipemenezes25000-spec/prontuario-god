"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/medico/dashboard": "Painel",
  "/co-pilot/titulacao": "Co-Pilot de Titulação",
  "/medico/receita": "Receituário",
};

// Labels amigáveis para segmentos do breadcrumb
const SEGMENT_LABELS: Record<string, string> = {
  medico: "Área do médico",
  "co-pilot": "Co-Pilot",
  titulacao: "Titulação",
  dashboard: "Painel",
  receita: "Receituário",
  prontuario: "Prontuário",
  paciente: "Paciente",
  entrar: "Entrar",
  log: "Diário",
};

export function Topbar({ title, subtitle, actions }: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const auto = TITLES[pathname];
  const heading = title ?? auto ?? "Meridiana";

  // Breadcrumb amigável — ignora UUIDs e nomeia segmentos
  const rawSegments = pathname.split("/").filter(Boolean);
  const segments = rawSegments
    .filter((s) => !/^[0-9a-f]{8}-/.test(s)) // filtra UUIDs
    .map((s) => SEGMENT_LABELS[s] ?? s.replace(/-/g, " "));

  return (
    <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur border-b border-border">
      <div className="px-4 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="min-w-0 flex-1">
          {segments.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted mb-1 flex-wrap">
              {segments.map((seg, i) => (
                <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                  {i > 0 && <span className="text-subtle">›</span>}
                  <span className="capitalize">{seg}</span>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-text truncate">{heading}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
        )}
      </div>
    </header>
  );
}

export function MobileMenuButton() {
  return (
    <Link
      href="/medico/dashboard"
      className="lg:hidden inline-flex items-center gap-2 text-sm text-muted hover:text-text"
    >
      ← painel
    </Link>
  );
}
