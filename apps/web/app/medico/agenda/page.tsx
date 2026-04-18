"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { demoAction } from "@/lib/demo-actions";
import { PACIENTE_DEMO_ID } from "@/lib/api";

const HOJE = [
  { hora: "08:30", paciente: "Maria Silva", tipo: "Retorno", cid: "M79.7", status: "confirmada", cor: "leaf", href: `/medico/prontuario/${PACIENTE_DEMO_ID}` },
  { hora: "09:00", paciente: "Lucia Fernandes", tipo: "Titulação", cid: "G40.4", status: "confirmada", cor: "leaf", href: "/medico/pacientes" },
  { hora: "10:00", paciente: "Carlos Pereira", tipo: "Primeira consulta", cid: "G20", status: "confirmada", cor: "ochre", href: "/medico/pacientes" },
  { hora: "11:30", paciente: "Rosa Albuquerque", tipo: "Telemedicina", cid: "F41.1", status: "aguardando", cor: "sky", href: "/medico/telemedicina" },
  { hora: "14:00", paciente: "Pedro Martins", tipo: "Retorno", cid: "M54.5", status: "confirmada", cor: "leaf", href: "/medico/pacientes" },
  { hora: "15:00", paciente: "Gabriela Torres", tipo: "Ajuste RDC 660", cid: "C50.9", status: "confirmada", cor: "ember", href: "/medico/receita" },
  { hora: "16:30", paciente: "Henrique Dias", tipo: "Telemedicina", cid: "G35", status: "confirmada", cor: "sky", href: "/medico/telemedicina" },
  { hora: "17:30", paciente: "Beatriz Campos", tipo: "Retorno", cid: "N80.9", status: "aguardando", cor: "ochre", href: "/medico/pacientes" },
];

const SEMANA = ["Seg 14", "Ter 15", "Qua 16", "Qui 17 (hoje)", "Sex 18", "Sáb 19", "Dom 20"];
const SEMANA_COUNT = [6, 9, 7, 8, 5, 2, 0];

export default function AgendaPage() {
  return (
    <AppShell>
      <Topbar title="Agenda" subtitle="Quinta-feira, 17 de abril de 2026" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div>
            <div className="text-3xl font-semibold text-text tnum">8</div>
            <div className="text-xs text-muted mt-1">consultas · 3 telemed</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Semana</div>
            <div className="text-3xl font-semibold text-text tnum">37</div>
            <div className="text-xs text-muted mt-1">+12% vs anterior</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Taxa no-show</div>
            <div className="text-3xl font-semibold text-text tnum">6%</div>
            <div className="text-xs text-leaf mt-1">abaixo da média (11%)</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Próxima</div>
            <div className="text-2xl font-semibold text-text tnum">08:30</div>
            <div className="text-xs text-muted mt-1">Maria Silva · Retorno</div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Visão semanal"
            action={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={demoAction("Navegando para semana anterior", "info")}>← Semana</Button><Button variant="secondary" size="sm" onClick={demoAction("Voltando ao dia de hoje", "info")}>Hoje</Button><Button variant="secondary" size="sm" onClick={demoAction("Navegando para próxima semana", "info")}>Semana →</Button></div>}
          />
          <div className="grid grid-cols-7 gap-2 mt-4">
            {SEMANA.map((dia, i) => (
              <div key={dia} className={`border rounded-lg p-3 ${i === 3 ? "border-primary bg-primary/5" : "border-border bg-surface"}`}>
                <div className="text-xs text-muted uppercase tracking-wide">{dia}</div>
                <div className="text-2xl font-semibold text-text mt-2 tnum">{SEMANA_COUNT[i]}</div>
                <div className="text-[10px] text-muted mt-1">consultas</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Hoje — 17 abr"
            action={<Button size="sm" onClick={demoAction("Nova consulta — abrindo formulário…", "info")}>+ Nova consulta</Button>}
          />
          <div className="divide-y divide-border mt-2">
            {HOJE.map((c) => (
              <div key={c.hora} className="py-3 flex items-center gap-4 hover:bg-surface -mx-2 px-2 rounded-lg transition">
                <div className="w-16 font-mono text-sm text-text tnum">{c.hora}</div>
                <div className={`w-1 h-10 rounded-full bg-${c.cor}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{c.paciente}</div>
                  <div className="text-xs text-muted">{c.tipo} · CID {c.cid}</div>
                </div>
                <Badge tone={c.status === "confirmada" ? "success" : "warm"}>
                  {c.status}
                </Badge>
                <Link href={c.href}>
                  <Button variant="secondary" size="sm">Abrir</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Disponibilidade" />
            <div className="space-y-2 mt-3">
              {["Seg 14–18h", "Ter 8–12h", "Qua 14–18h", "Qui 8–18h (hoje)", "Sex 8–12h"].map((s, i) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className={i === 3 ? "text-text font-medium" : "text-muted"}>{s}</span>
                  <span className="text-xs text-muted tnum">{[4,4,4,10,4][i]}h</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Alertas" />
            <ul className="text-sm space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-ember mt-0.5">●</span>
                <span className="text-text">3 pacientes com ofício RDC 660 vencendo em &lt;30d</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ochre mt-0.5">●</span>
                <span className="text-text">2 pacientes sem tracker log há mais de 7 dias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">●</span>
                <span className="text-text">Rosa Albuquerque confirmou presença há 2min</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
