"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/decorative/Sparkline";
import { PACIENTE_DEMO_ID } from "@/lib/api";

const PACIENTES = [
  {
    id: PACIENTE_DEMO_ID,
    nome: "Maria Silva",
    idade: 47,
    cid: "M79.7",
    cond: "Fibromialgia",
    proto: "Padrão",
    dose: 30,
    delta: -42,
    sparkline: [7, 7, 6.5, 6.2, 5.8, 5.4, 5.0, 4.6, 4.3, 4.1, 3.8, 3.5],
    rdc660: { status: "ativo", expira_em_dias: 412 },
    last_log: "há 2h",
    risk: "ok" as const,
  },
  {
    id: null,
    nome: "João Pereira",
    idade: 62,
    cid: "G40.0",
    cond: "Epilepsia ref.",
    proto: "Conservador",
    dose: 50,
    delta: -71,
    sparkline: [4.2, 4.0, 3.5, 3.0, 2.5, 2.0, 1.8, 1.4, 1.2, 1.0, 0.8, 0.6],
    rdc660: { status: "ativo", expira_em_dias: 89 },
    last_log: "há 1d",
    risk: "warm" as const,
  },
  {
    id: null,
    nome: "Carla Mota",
    idade: 35,
    cid: "F41.1",
    cond: "Ansiedade",
    proto: "Padrão",
    dose: 20,
    delta: -28,
    sparkline: [6, 5.8, 5.5, 5.2, 5.0, 4.8, 4.6, 4.5, 4.4, 4.3, 4.2, 4.3],
    rdc660: null,
    last_log: "há 3h",
    risk: "ok" as const,
  },
  {
    id: null,
    nome: "Roberto K.",
    idade: 71,
    cid: "G20",
    cond: "Parkinson",
    proto: "Conservador",
    dose: 25,
    delta: -12,
    sparkline: [8, 8, 8, 7.8, 7.7, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 7.0],
    rdc660: { status: "ativo", expira_em_dias: 192 },
    last_log: "há 5d",
    risk: "danger" as const,
  },
  {
    id: null,
    nome: "Beatriz Lima",
    idade: 29,
    cid: "M54.5",
    cond: "Lombalgia",
    proto: "Rápido",
    dose: 60,
    delta: -55,
    sparkline: [9, 8.5, 7.8, 7.0, 6.2, 5.5, 5.0, 4.5, 4.2, 4.0, 4.0, 4.0],
    rdc660: { status: "pendente", expira_em_dias: null },
    last_log: "há 8h",
    risk: "ok" as const,
  },
];

const PERGUNTAS_SUGERIDAS = [
  "Pacientes com fibromialgia que melhoraram >40% — qual dose mediana?",
  "Algum paciente em interação crítica nas últimas 48h?",
  "Quem está com RDC 660 vencendo nos próximos 90 dias?",
];

export default function DashboardMedico() {
  const [chatInput, setChatInput] = useState("");
  const [chatExchanges, setChatExchanges] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredPacientes = PACIENTES.filter((p) =>
    [p.nome, p.cond, p.cid, p.proto].some((s) => s.toLowerCase().includes(search.toLowerCase())),
  );

  function ask(q: string) {
    setChatInput("");
    setLoading(true);
    setTimeout(() => {
      const respostas: Record<string, string> = {
        fibromialgia: "Você tem 47 pacientes com fibromialgia ativos. Dose mediana de CBD: 35mg/dia (coorte BR: 28mg). 18 reportaram redução ≥40% em 8 semanas — Maria Silva é a melhor responder (-42% em 12 sem).",
        interaç: "Nenhuma interação crítica nas últimas 48h. 2 moderadas: Maria Silva (duloxetina + CBD) e Roberto K. (clobazam + CBD 30mg) — vigilância clínica recomendada.",
        660: "João Pereira tem RDC 660 expirando em 89 dias. Já preparei o ofício pré-preenchido — pode revisar em Receituário.",
      };
      const key = Object.keys(respostas).find((k) => q.toLowerCase().includes(k)) ?? "default";
      const a = respostas[key] ?? "Em produção, eu cruzo todos os seus pacientes + coorte BR anonimizado em ~1.5s. Configure GEMINI_API_KEY na API.";
      setChatExchanges((arr) => [...arr, { q, a }]);
      setLoading(false);
    }, 700);
  }

  return (
    <AppShell>
      <Topbar
        subtitle="Visão geral dos seus pacientes em titulação"
        actions={
          <>
            <Button href="/co-pilot/titulacao" variant="secondary" size="md">
              + Nova titulação
            </Button>
            <Button href="/medico/receita" variant="primary" size="md">
              Emitir receita
            </Button>
          </>
        }
      />

      <div className="px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Stats row */}
        <div className="xl:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tempo até efeito" value="18d" delta="−6d vs. média BR" deltaTone="positive" />
          <StatCard label="Pacientes ativos" value={47} delta="+3 na semana" deltaTone="positive" />
          <StatCard label="Adesão ao diário" value="84%" delta="+12pp em 30 dias" deltaTone="positive" />
          <StatCard label="Receitas emitidas" value={138} hint="no mês" deltaTone="neutral" />
        </div>

        {/* Patient list */}
        <Card className="xl:col-span-8" padded={false}>
          <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-text">Pacientes em titulação</h2>
              <p className="text-xs text-muted mt-0.5">
                {filteredPacientes.length} de {PACIENTES.length} · 12 semanas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar paciente…"
                  className="w-56 bg-bg border border-border focus:border-primary outline-none pl-8 pr-3 py-1.5 rounded-lg text-sm placeholder:text-subtle"
                />
              </div>
              <Link href="/co-pilot/titulacao" className="text-xs text-primary hover:text-primaryHover font-medium whitespace-nowrap">
                + nova titulação
              </Link>
            </div>
          </div>

          <div className="border-y border-border">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1.4fr_1fr_1.5fr_1fr_1.2fr] gap-3 px-6 py-3 bg-bg/50 text-xs text-muted font-medium">
              <div>Paciente</div>
              <div>Condição</div>
              <div>Dose</div>
              <div>Evolução</div>
              <div className="text-right">Δ sintoma</div>
              <div className="text-right">RDC 660</div>
            </div>
            {/* Rows */}
            {filteredPacientes.length === 0 ? (
              <div className="px-6 py-16 text-center border-t border-border">
                <div className="text-sm text-muted">Nenhum paciente encontrado para "<span className="text-text font-medium">{search}</span>"</div>
                <button onClick={() => setSearch("")} className="text-xs text-primary hover:text-primaryHover mt-2">
                  limpar busca
                </button>
              </div>
            ) : null}
            {filteredPacientes.map((p) => {
              const inner = (
                <>
                  <div className="flex items-center gap-2.5">
                    <RiskDot risk={p.risk} />
                    <div>
                      <div className="text-sm font-medium text-text">{p.nome}</div>
                      <div className="text-[11px] text-muted tnum">{p.idade}a · log {p.last_log}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text">{p.cond}</div>
                    <div className="text-[11px] font-mono tnum text-muted">{p.cid}</div>
                  </div>
                  <div>
                    <div className="text-sm font-mono tnum text-text">{p.dose}<span className="text-muted">mg</span></div>
                    <div className="text-[11px] text-muted">{p.proto}</div>
                  </div>
                  <div>
                    <Sparkline values={p.sparkline} color="#14b8a6" width={140} height={32} showLast={false} />
                  </div>
                  <div className="text-right">
                    <div className={clsx("text-sm font-mono tnum font-medium", p.delta < 0 ? "text-success" : "text-danger")}>
                      {p.delta > 0 ? "+" : ""}{p.delta}%
                    </div>
                    <div className="text-[11px] text-muted">12 sem</div>
                  </div>
                  <div className="text-right">
                    {p.rdc660 ? (
                      <>
                        <Badge tone={p.rdc660.expira_em_dias && p.rdc660.expira_em_dias < 90 ? "warm" : "primary"}>
                          {p.rdc660.status}
                        </Badge>
                        {p.rdc660.expira_em_dias && (
                          <div className="text-[10px] font-mono tnum text-muted mt-1">vence em {p.rdc660.expira_em_dias}d</div>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] text-subtle">—</span>
                    )}
                  </div>
                </>
              );

              if (p.id) {
                return (
                  <Link
                    key={p.nome}
                    href={`/medico/prontuario/${p.id}`}
                    className="grid grid-cols-[2fr_1.4fr_1fr_1.5fr_1fr_1.2fr] gap-3 items-center px-6 py-4 border-t border-border hover:bg-primarySoft/40 transition-colors"
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <div
                  key={p.nome}
                  className="grid grid-cols-[2fr_1.4fr_1fr_1.5fr_1fr_1.2fr] gap-3 items-center px-6 py-4 border-t border-border opacity-70"
                  title="Paciente exemplo"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Chat */}
        <Card className="xl:col-span-4">
          <CardHeader
            title="Pergunte ao painel"
            subtitle="IA cruza seus pacientes + coorte BR em tempo real"
          />

          <div className="bg-bg rounded-lg p-4 mb-3 min-h-[180px] max-h-[300px] overflow-y-auto">
            {chatExchanges.length === 0 ? (
              <p className="text-sm text-muted italic leading-relaxed">
                Faça uma pergunta sobre seus pacientes, protocolos ou coorte BR.
              </p>
            ) : (
              <div className="space-y-4">
                {chatExchanges.map((x, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted mt-0.5">você</span>
                      <div className="text-sm text-text italic">{x.q}</div>
                    </div>
                    <div className="flex items-start gap-2 pl-8">
                      <span className="text-primary text-xs mt-0.5">✦</span>
                      <div className="text-sm text-text leading-relaxed">{x.a}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-1.5 pl-8">
                    <span className="text-primary text-xs">✦</span>
                    <Dot delay={0} /><Dot delay={150} /><Dot delay={300} />
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (chatInput.trim()) ask(chatInput.trim());
            }}
            className="flex gap-2 mb-3"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ex: Maria está pronta pra reduzir a duloxetina?"
              className="flex-1 bg-surface border border-border focus:border-primary outline-none px-3 py-2 text-sm rounded-lg"
            />
            <Button type="submit">Perguntar</Button>
          </form>

          <div className="space-y-1.5">
            <div className="text-xs text-muted">Sugestões</div>
            {PERGUNTAS_SUGERIDAS.map((p, i) => (
              <button
                key={i}
                onClick={() => ask(p)}
                className="w-full text-left text-xs text-text hover:text-primaryText border border-border hover:border-primary/40 hover:bg-primarySoft px-3 py-2 rounded-lg transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function RiskDot({ risk }: { risk: "ok" | "warm" | "danger" }) {
  const color = { ok: "bg-success", warm: "bg-warm", danger: "bg-danger" }[risk];
  return <span className={clsx("inline-block w-2 h-2 rounded-full shrink-0", color)} />;
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"
      style={{ animation: `pulseSoft 1s ease-in-out ${delay}ms infinite` }}
    />
  );
}
