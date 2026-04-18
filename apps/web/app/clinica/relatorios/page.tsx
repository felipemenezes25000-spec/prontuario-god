"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { demoAction } from "@/lib/demo-actions";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/decorative/Sparkline";

const COHORT_CID = [
  { cid: "Fibromialgia (M79.7)", n: 23, tte: 12, dose_med: 28, adesao: 92 },
  { cid: "Ansiedade (F41.1)", n: 18, tte: 9, dose_med: 18, adesao: 87 },
  { cid: "Epilepsia refrat. (G40.4)", n: 7, tte: 18, dose_med: 140, adesao: 95 },
  { cid: "Dor oncológica (C00-D49)", n: 9, tte: 6, dose_med: 60, adesao: 88 },
  { cid: "Parkinson (G20)", n: 5, tte: 21, dose_med: 35, adesao: 78 },
  { cid: "Autismo TEA (F84.0)", n: 6, tte: 24, dose_med: 35, adesao: 94 },
  { cid: "EM (G35)", n: 4, tte: 14, dose_med: 40, adesao: 89 },
  { cid: "Endometriose (N80.9)", n: 8, tte: 10, dose_med: 22, adesao: 81 },
];

const SINTOMAS_AGREGADOS = [
  { label: "Dor (0-10)", antes: 7.2, agora: 4.1, delta: -43 },
  { label: "Sono (0-10)", antes: 4.3, agora: 7.1, delta: 65 },
  { label: "Ansiedade (0-10)", antes: 6.8, agora: 3.9, delta: -43 },
  { label: "Humor (0-10)", antes: 4.1, agora: 6.8, delta: 66 },
];

const RDC660 = [
  { status: "Ativo", count: 14, cor: "bg-leaf" },
  { status: "Vencendo <30d", count: 3, cor: "bg-ochre" },
  { status: "Em análise", count: 2, cor: "bg-sky" },
  { status: "Indeferido histórico", count: 1, cor: "bg-ember" },
];

export default function RelatoriosPage() {
  return (
    <AppShell>
      <Topbar title="Relatórios clínicos" subtitle="Cohort k-anonymized · evidence lab" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">TTE médio</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">12d</div>
            <div className="text-xs text-leaf mt-1">↓ 68% vs média BR (37d)</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Aderência tracker</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">82%</div>
            <div className="text-xs text-muted mt-1">log ≥4x/semana</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Redução dor (média)</div>
            <div className="text-2xl md:text-3xl font-semibold text-leaf tnum">-43%</div>
            <div className="text-xs text-muted mt-1">8 semanas</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Eventos adversos</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">6%</div>
            <div className="text-xs text-muted mt-1">dose ajustada, sem desfecho grave</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Card>
            <CardHeader title="Antes → Depois (8 semanas, média cohort)" />
            <div className="space-y-3 mt-4">
              {SINTOMAS_AGREGADOS.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text font-medium">{s.label}</span>
                    <span className={`font-mono tnum ${s.delta < 0 ? "text-leaf" : "text-sky"}`}>
                      {s.delta > 0 ? "+" : ""}{s.delta}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted font-mono tnum w-10 text-right">{s.antes}</span>
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 bg-border" style={{ width: `${s.antes * 10}%` }} />
                      <div className="absolute left-0 top-0 bottom-0 bg-primary" style={{ width: `${s.agora * 10}%` }} />
                    </div>
                    <span className="text-xs text-primary font-mono tnum w-10">{s.agora}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted mt-4">
              Dados anonimizados, k&ge;5. Publicável como evidência mundial real (M8 Evidence Lab).
            </div>
          </Card>

          <Card>
            <CardHeader title="RDC 660 — status dos pacientes" />
            <div className="space-y-3 mt-4">
              {RDC660.map(r => (
                <div key={r.status} className="flex items-center gap-4">
                  <div className={`w-2 h-10 ${r.cor} rounded-full`} />
                  <div className="flex-1">
                    <div className="text-sm text-text font-medium">{r.status}</div>
                    <div className="text-xs text-muted">pacientes atendidos por importação excepcional</div>
                  </div>
                  <div className="text-2xl font-semibold tnum text-text">{r.count}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-3 flex justify-between text-xs">
              <span className="text-muted">Total RDC 660</span>
              <span className="font-mono tnum text-text font-medium">{RDC660.reduce((a,r)=>a+r.count,0)}</span>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Cohort por CID"
            action={<Button variant="secondary" size="sm" onClick={demoAction("CSV anonimizado (k≥5) baixado")}>Exportar CSV (anonimizado)</Button>}
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="text-left py-2 font-medium">Condição / CID</th>
                  <th className="text-right py-2 font-medium">N (pacientes)</th>
                  <th className="text-right py-2 font-medium">TTE (dias)</th>
                  <th className="text-right py-2 font-medium">Dose média (mg/d)</th>
                  <th className="text-right py-2 font-medium">Aderência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COHORT_CID.map(c => (
                  <tr key={c.cid} className="hover:bg-surface">
                    <td className="py-3 text-text font-medium">{c.cid}</td>
                    <td className="py-3 text-right font-mono tnum">{c.n}</td>
                    <td className="py-3 text-right font-mono tnum">{c.tte}</td>
                    <td className="py-3 text-right font-mono tnum">{c.dose_med}</td>
                    <td className="py-3 text-right font-mono tnum">
                      <span className={c.adesao >= 90 ? "text-leaf" : c.adesao >= 80 ? "text-text" : "text-ochre"}>
                        {c.adesao}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
