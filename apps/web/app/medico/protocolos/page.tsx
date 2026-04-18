"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

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
  const toast = useToast();
  const [novoOpen, setNovoOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<(typeof PROTOCOLOS)[number] | null>(null);

  function criar(form: FormData) {
    const nome = String(form.get("nome") ?? "");
    if (!nome) return;
    setNovoOpen(false);
    toast.show(`Protocolo "${nome}" criado`, "success");
  }

  return (
    <AppShell>
      <Topbar title="Protocolos clínicos" subtitle="Biblioteca de protocolos baseados em evidências" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Protocolos ativos</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">{PROTOCOLOS.length}</div>
            <div className="text-xs text-muted mt-1">curados Delphi 2021+</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Evidência A</div>
            <div className="text-2xl md:text-3xl font-semibold text-leaf tnum">{PROTOCOLOS.filter(p => p.evidencia === "A").length}</div>
            <div className="text-xs text-muted mt-1">ECR robusto</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Uso total</div>
            <div className="text-2xl md:text-3xl font-semibold text-text tnum">{PROTOCOLOS.reduce((a, p) => a + p.vezes_usado, 0)}</div>
            <div className="text-xs text-muted mt-1">prescrições geradas</div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Biblioteca"
            action={<Button size="sm" onClick={() => setNovoOpen(true)}>+ Protocolo customizado</Button>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {PROTOCOLOS.map((p, i) => (
              <button key={i} onClick={() => setDetalhe(p)} className="text-left w-full border border-border rounded-lg p-4 hover:border-primary/40 cursor-pointer transition">
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
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo protocolo clínico" subtitle="Documente seu protocolo para reuso na clínica" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); criar(new FormData(e.currentTarget)); }} className="space-y-4">
          <ModalField label="Nome do protocolo *"><ModalInput name="nome" required placeholder="Ex: Fibromialgia — abordagem cuidados paliativos" /></ModalField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalField label="CID-10 principal *"><ModalInput name="cid" required placeholder="M79.7" /></ModalField>
            <ModalField label="Evidência">
              <ModalSelect name="evidencia" defaultValue="B">
                <option value="A">A — ECR robusto</option>
                <option value="B">B — ensaios limitados</option>
                <option value="C">C — relato de caso</option>
                <option value="D">D — opinião especialista</option>
              </ModalSelect>
            </ModalField>
          </div>
          <ModalField label="Indicação"><ModalTextarea name="indicacao" rows={2} placeholder="Quando aplicar este protocolo…" /></ModalField>
          <ModalField label="Posologia / Titulação *"><ModalTextarea name="doses" rows={3} required placeholder="Dose inicial → ajuste semanal → dose alvo" /></ModalField>
          <ModalField label="Prazo de avaliação"><ModalInput name="duracao" placeholder="8 semanas" /></ModalField>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar protocolo</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detalhe !== null} onClose={() => setDetalhe(null)} title={detalhe?.nome ?? ""} subtitle={detalhe?.indicacao} size="lg"
        footer={detalhe && <>
          <Button variant="secondary" onClick={() => { toast.show("Protocolo duplicado para edição", "info"); setDetalhe(null); }}>Duplicar</Button>
          <Button onClick={() => { toast.show("Aplicar protocolo no Co-Pilot Titulação", "success"); setDetalhe(null); }}>Aplicar em novo paciente</Button>
        </>}
      >
        {detalhe && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={detalhe.evidencia === "A" ? "success" : detalhe.evidencia === "B" ? "neutral" : "warm"}>Evidência {detalhe.evidencia}</Badge>
              {detalhe.cid.map((c) => <span key={c} className="text-[10px] font-mono bg-surface border border-border px-2 py-1 rounded">{c}</span>)}
              <span className="text-xs text-muted tnum">{detalhe.vezes_usado}x usado</span>
            </div>
            <div>
              <div className="text-xs text-muted uppercase mb-1">Posologia</div>
              <div className="text-text border-l-2 border-primary/40 pl-3 py-2 bg-surface rounded-r">{detalhe.doses}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase mb-1">Avaliação</div>
              <div className="text-text">{detalhe.duracao}</div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
