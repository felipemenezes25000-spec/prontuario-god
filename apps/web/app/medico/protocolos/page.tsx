"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const PROTOCOLOS = [
  {
    nome: "Fibromialgia — CBD:THC 20:1",
    indicacao: "Dor crônica musculoesquelética refratária",
    evidencia: "B",
    doses: "Início 5mg CBD 2x/dia → titular +5mg a cada 7d até resposta ou 50mg",
    duracao: "Avaliar em 8 semanas",
    cid: ["M79.7"],
    vezes_usado: 34,
  },
  {
    nome: "Dravet / Lennox-Gastaut pediátrico — CBD isolado",
    indicacao: "Epilepsia refratária infantil",
    evidencia: "A",
    doses: "5mg/kg/dia divididos 2x → titular até 20mg/kg/dia",
    duracao: "Avaliar em 12 semanas",
    cid: ["G40.4", "G40.8"],
    vezes_usado: 12,
  },
  {
    nome: "Parkinson tremor — CBD:THC 1:1",
    indicacao: "Tremor refratário em Parkinson",
    evidencia: "B",
    doses: "2,5mg CBD + 2,5mg THC noturno → titular com cautela",
    duracao: "Avaliar em 4-6 semanas",
    cid: ["G20"],
    vezes_usado: 8,
  },
  {
    nome: "Ansiedade generalizada — CBD full-spectrum",
    indicacao: "TAG, sono alterado, irritabilidade",
    evidencia: "B",
    doses: "10mg CBD sublingual 2x/dia → titular +5mg conforme tolerância",
    duracao: "Avaliar em 4 semanas",
    cid: ["F41.1", "F41.2"],
    vezes_usado: 28,
  },
  {
    nome: "Dor oncológica paliativa — THC-rich",
    indicacao: "Dor intensa em neoplasia avançada",
    evidencia: "A",
    doses: "2,5mg THC sublingual 3x/dia → titular até 15mg THC",
    duracao: "Manutenção até óbito ou remissão",
    cid: ["C00-D49", "R52.1"],
    vezes_usado: 15,
  },
  {
    nome: "Endometriose — CBD:THC 20:1",
    indicacao: "Dor pélvica crônica",
    evidencia: "C",
    doses: "10mg CBD sublingual 2x/dia + dose resgate na crise",
    duracao: "Avaliar em 3 ciclos menstruais",
    cid: ["N80.9"],
    vezes_usado: 9,
  },
  {
    nome: "TEA (transtorno espectro autista)",
    indicacao: "TEA com irritabilidade/autoagressão",
    evidencia: "B",
    doses: "0,5mg/kg CBD → titular semanalmente",
    duracao: "Avaliar em 8 semanas",
    cid: ["F84.0"],
    vezes_usado: 6,
  },
  {
    nome: "Esclerose múltipla — espasticidade",
    indicacao: "Espasticidade refratária",
    evidencia: "A",
    doses: "Sativex spray: 1 puff 2-3x/dia → titular até 12 puffs",
    duracao: "Avaliar em 4 semanas",
    cid: ["G35"],
    vezes_usado: 4,
  },
];

export default function ProtocolosPage() {
  return (
    <AppShell>
      <Topbar title="Protocolos clínicos" subtitle="Biblioteca de protocolos baseados em evidências" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Protocolos ativos</div>
            <div className="text-3xl font-semibold text-text tnum">{PROTOCOLOS.length}</div>
            <div className="text-xs text-muted mt-1">curados Delphi 2021+</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Evidência A</div>
            <div className="text-3xl font-semibold text-leaf tnum">{PROTOCOLOS.filter(p => p.evidencia === "A").length}</div>
            <div className="text-xs text-muted mt-1">ECR robusto</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Uso total</div>
            <div className="text-3xl font-semibold text-text tnum">{PROTOCOLOS.reduce((a, p) => a + p.vezes_usado, 0)}</div>
            <div className="text-xs text-muted mt-1">prescrições geradas</div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Biblioteca"
            action={<Button size="sm">+ Protocolo customizado</Button>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {PROTOCOLOS.map((p, i) => (
              <div key={i} className="border border-border rounded-lg p-4 hover:border-primary/40 cursor-pointer transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-text text-sm leading-tight">{p.nome}</div>
                  <Badge tone={p.evidencia === "A" ? "success" : p.evidencia === "B" ? "neutral" : "warm"}>
                    Evidência {p.evidencia}
                  </Badge>
                </div>
                <div className="text-xs text-muted mb-3">{p.indicacao}</div>
                <div className="text-xs border-l-2 border-primary/40 pl-2 py-1 text-text leading-relaxed">
                  <span className="text-muted">Dose: </span>{p.doses}
                </div>
                <div className="text-xs text-muted mt-2 leading-relaxed">
                  <span className="text-muted">Avaliação: </span>{p.duracao}
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted">
                  <div className="flex gap-1">
                    {p.cid.map(c => <span key={c} className="font-mono bg-surface px-1.5 py-0.5 rounded">{c}</span>)}
                  </div>
                  <span className="tnum">{p.vezes_usado}x usado</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
