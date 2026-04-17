"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const EXAMES = [
  {
    paciente: "Maria Silva",
    tipo: "Função hepática",
    data: "2026-04-15",
    lab: "Fleury",
    resultados: [
      { a: "AST", v: 28, ref: "até 40", ok: true },
      { a: "ALT", v: 34, ref: "até 40", ok: true },
      { a: "GGT", v: 52, ref: "até 60", ok: true },
    ],
    status: "normal",
  },
  {
    paciente: "Carlos Pereira",
    tipo: "Função hepática",
    data: "2026-04-12",
    lab: "DASA",
    resultados: [
      { a: "AST", v: 48, ref: "até 40", ok: false },
      { a: "ALT", v: 52, ref: "até 40", ok: false },
      { a: "GGT", v: 88, ref: "até 60", ok: false },
    ],
    status: "alterado",
    alerta: "Elevação leve de transaminases — considerar redução de dose.",
  },
  {
    paciente: "Lucia Fernandes",
    tipo: "Hemograma completo",
    data: "2026-04-10",
    lab: "Pardini",
    resultados: [
      { a: "Hemácias", v: "4.2 M/mm³", ref: "3.9-5.0", ok: true },
      { a: "Leucócitos", v: "7.100", ref: "4.000-10.000", ok: true },
      { a: "Plaquetas", v: "245.000", ref: "150-450mil", ok: true },
    ],
    status: "normal",
  },
  {
    paciente: "Gabriela Torres",
    tipo: "Toxicológico",
    data: "2026-04-08",
    lab: "Hermes Pardini",
    resultados: [
      { a: "THC-COOH", v: "52 ng/mL", ref: "terapêutico", ok: true },
      { a: "CBD", v: "280 ng/mL", ref: "terapêutico", ok: true },
    ],
    status: "normal",
  },
  {
    paciente: "Henrique Dias",
    tipo: "Função renal",
    data: "2026-04-05",
    lab: "Fleury",
    resultados: [
      { a: "Creatinina", v: 1.1, ref: "0.7-1.2", ok: true },
      { a: "Ureia", v: 38, ref: "15-40", ok: true },
      { a: "Clearance", v: 92, ref: ">60", ok: true },
    ],
    status: "normal",
  },
];

const PENDENTES = [
  { paciente: "Maria Silva", tipo: "Função hepática de 6 meses", vence: "em 3 dias" },
  { paciente: "Sandra Lima", tipo: "Hemograma basal pré-titulação", vence: "em 5 dias" },
  { paciente: "Antônio Ferreira", tipo: "Função renal (idoso)", vence: "atrasado 2d" },
];

export default function ExamesPage() {
  return (
    <AppShell>
      <Topbar title="Exames laboratoriais" subtitle="Monitoramento durante terapia canábica" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Últimos 30d</div>
            <div className="text-3xl font-semibold text-text tnum">42</div>
            <div className="text-xs text-muted mt-1">exames processados</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Alterados</div>
            <div className="text-3xl font-semibold text-ember tnum">3</div>
            <div className="text-xs text-muted mt-1">requerem ajuste</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Pendentes</div>
            <div className="text-3xl font-semibold text-ochre tnum">{PENDENTES.length}</div>
            <div className="text-xs text-muted mt-1">solicitados, aguardando</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Aderência</div>
            <div className="text-3xl font-semibold text-leaf tnum">88%</div>
            <div className="text-xs text-muted mt-1">paciente coletou no prazo</div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Pendentes / alertas" />
          <div className="space-y-2 mt-3">
            {PENDENTES.map((p, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                <span className="text-ochre">●</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text">{p.paciente}</div>
                  <div className="text-xs text-muted">{p.tipo}</div>
                </div>
                <Badge tone={p.vence.includes("atrasado") ? "danger" : "warm"}>{p.vence}</Badge>
                <Button variant="secondary" size="sm">Cobrar</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Exames recentes"
            action={<Button size="sm">+ Solicitar exame</Button>}
          />
          <div className="space-y-4 mt-3">
            {EXAMES.map((e, i) => (
              <div key={i} className="border border-border rounded-lg p-4 hover:border-primary/40 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-text">{e.paciente}</div>
                    <div className="text-xs text-muted font-mono">{e.tipo} · {e.lab} · {e.data}</div>
                  </div>
                  <Badge tone={e.status === "alterado" ? "warm" : "success"}>
                    {e.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {e.resultados.map((r, j) => (
                    <div key={j} className={`rounded-md p-2 border ${r.ok ? "border-border bg-surface" : "border-ember/40 bg-ember/5"}`}>
                      <div className="text-[10px] text-muted uppercase tracking-wide">{r.a}</div>
                      <div className={`font-mono tnum text-sm font-medium ${r.ok ? "text-text" : "text-ember"}`}>{r.v}</div>
                      <div className="text-[10px] text-muted">ref: {r.ref}</div>
                    </div>
                  ))}
                </div>

                {e.alerta && (
                  <div className="text-xs text-ember border-l-2 border-ember pl-2 py-1">{e.alerta}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
