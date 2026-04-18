"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

const EXAMES = [
  { paciente: "Maria Silva", tipo: "Função hepática", data: "2026-04-15", lab: "Fleury", resultados: [ { a: "AST", v: 28, ref: "até 40", ok: true }, { a: "ALT", v: 34, ref: "até 40", ok: true }, { a: "GGT", v: 52, ref: "até 60", ok: true } ], status: "normal" as const, alerta: undefined as string | undefined },
  { paciente: "Carlos Pereira", tipo: "Função hepática", data: "2026-04-12", lab: "DASA", resultados: [ { a: "AST", v: 48, ref: "até 40", ok: false }, { a: "ALT", v: 52, ref: "até 40", ok: false }, { a: "GGT", v: 88, ref: "até 60", ok: false } ], status: "alterado" as const, alerta: "Elevação leve de transaminases — considerar redução de dose." as string | undefined },
  { paciente: "Lucia Fernandes", tipo: "Hemograma completo", data: "2026-04-10", lab: "Pardini", resultados: [ { a: "Hemácias", v: "4.2 M/mm³", ref: "3.9-5.0", ok: true }, { a: "Leucócitos", v: "7.100", ref: "4.000-10.000", ok: true }, { a: "Plaquetas", v: "245.000", ref: "150-450mil", ok: true } ], status: "normal" as const, alerta: undefined },
  { paciente: "Gabriela Torres", tipo: "Toxicológico", data: "2026-04-08", lab: "Hermes Pardini", resultados: [ { a: "THC-COOH", v: "52 ng/mL", ref: "terapêutico", ok: true }, { a: "CBD", v: "280 ng/mL", ref: "terapêutico", ok: true } ], status: "normal" as const, alerta: undefined },
  { paciente: "Henrique Dias", tipo: "Função renal", data: "2026-04-05", lab: "Fleury", resultados: [ { a: "Creatinina", v: 1.1, ref: "0.7-1.2", ok: true }, { a: "Ureia", v: 38, ref: "15-40", ok: true }, { a: "Clearance", v: 92, ref: ">60", ok: true } ], status: "normal" as const, alerta: undefined },
];

interface Pendente { id: string; paciente: string; tipo: string; vence: string; }

const INIT_PENDENTES: Pendente[] = [
  { id: "p1", paciente: "Maria Silva", tipo: "Função hepática de 6 meses", vence: "em 3 dias" },
  { id: "p2", paciente: "Sandra Lima", tipo: "Hemograma basal pré-titulação", vence: "em 5 dias" },
  { id: "p3", paciente: "Antônio Ferreira", tipo: "Função renal (idoso)", vence: "atrasado 2d" },
];

export default function ExamesPage() {
  const toast = useToast();
  const [pendentes, setPendentes] = useState<Pendente[]>(INIT_PENDENTES);
  const [solicitarOpen, setSolicitarOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<(typeof EXAMES)[number] | null>(null);

  function solicitar(form: FormData) {
    const paciente = String(form.get("paciente") ?? "");
    const tipo = String(form.get("tipo") ?? "");
    if (!paciente || !tipo) return;
    setPendentes((arr) => [{ id: `p-${Date.now()}`, paciente, tipo, vence: "em 7 dias" }, ...arr]);
    setSolicitarOpen(false);
    toast.show(`Exame solicitado — ${paciente} notificado via WhatsApp`, "success");
  }

  function cobrar(id: string, nome: string) {
    toast.show(`Lembrete enviado para ${nome}`, "success");
    setPendentes((arr) => arr.map((p) => (p.id === id ? { ...p, vence: "cobrado agora" } : p)));
  }

  return (
    <AppShell>
      <Topbar title="Exames laboratoriais" subtitle="Monitoramento durante terapia canábica" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Últimos 30d</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">42</div><div className="text-xs text-muted mt-1">processados</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Alterados</div><div className="text-2xl md:text-3xl font-semibold text-ember tnum">3</div><div className="text-xs text-muted mt-1">requerem ajuste</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Pendentes</div><div className="text-2xl md:text-3xl font-semibold text-ochre tnum">{pendentes.length}</div><div className="text-xs text-muted mt-1">aguardando</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Aderência</div><div className="text-2xl md:text-3xl font-semibold text-leaf tnum">88%</div><div className="text-xs text-muted mt-1">coletou no prazo</div></Card>
        </div>

        <Card>
          <CardHeader title="Pendentes / alertas" />
          <div className="space-y-2 mt-3">
            {pendentes.map((p) => (
              <div key={p.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-2 border-b border-border last:border-0">
                <span className="text-ochre">●</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text truncate">{p.paciente}</div>
                  <div className="text-xs text-muted">{p.tipo}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={p.vence.includes("atrasado") ? "danger" : p.vence.includes("cobrado") ? "success" : "warm"}>{p.vence}</Badge>
                  <Button variant="secondary" size="sm" onClick={() => cobrar(p.id, p.paciente)}>Cobrar</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Exames recentes" action={<Button size="sm" onClick={() => setSolicitarOpen(true)}>+ Solicitar</Button>} />
          <div className="space-y-4 mt-3">
            {EXAMES.map((e, i) => (
              <button
                key={i}
                onClick={() => setDetalhe(e)}
                className="w-full text-left border border-border rounded-lg p-3 md:p-4 hover:border-primary/40 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="font-medium text-text">{e.paciente}</div>
                    <div className="text-xs text-muted font-mono">{e.tipo} · {e.lab} · {e.data}</div>
                  </div>
                  <Badge tone={e.status === "alterado" ? "warm" : "success"}>{e.status}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-3">
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
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={solicitarOpen} onClose={() => setSolicitarOpen(false)} title="Solicitar exame" subtitle="Paciente recebe WhatsApp com orientação + link do lab" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); solicitar(new FormData(e.currentTarget)); }} className="space-y-4">
          <ModalField label="Paciente *">
            <ModalSelect name="paciente" required defaultValue="">
              <option value="" disabled>Escolha…</option>
              <option>Maria Silva</option><option>Carlos Augusto Pereira</option><option>Lucia Fernandes</option>
              <option>Rosa Albuquerque</option><option>Sandra Lima</option><option>Henrique Dias</option>
            </ModalSelect>
          </ModalField>
          <ModalField label="Tipo de exame *">
            <ModalSelect name="tipo" required defaultValue="">
              <option value="" disabled>Escolha…</option>
              <option>Função hepática (AST, ALT, GGT)</option>
              <option>Função renal (creatinina, ureia, clearance)</option>
              <option>Hemograma completo</option>
              <option>Lipidograma</option>
              <option>Glicemia de jejum</option>
              <option>Hormonal (TSH, cortisol)</option>
              <option>Toxicológico (THC-COOH, CBD)</option>
              <option>Urina I</option>
              <option>Outros</option>
            </ModalSelect>
          </ModalField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalField label="Laboratório preferido">
              <ModalSelect name="lab" defaultValue="Fleury"><option>Fleury</option><option>DASA</option><option>Hermes Pardini</option><option>Pardini</option><option>Delboni</option></ModalSelect>
            </ModalField>
            <ModalField label="Coleta até">
              <ModalInput name="prazo" type="date" defaultValue="2026-04-24" />
            </ModalField>
          </div>
          <ModalField label="Observações clínicas (opcional)">
            <ModalTextarea name="obs" rows={2} placeholder="Preparo, jejum, contexto…" />
          </ModalField>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" defaultChecked /> Enviar orientação via WhatsApp Business
          </label>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setSolicitarOpen(false)}>Cancelar</Button>
            <Button type="submit">Solicitar exame</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detalhe !== null} onClose={() => setDetalhe(null)} title={detalhe ? `${detalhe.tipo} · ${detalhe.paciente}` : ""} subtitle={detalhe ? `${detalhe.lab} · ${detalhe.data}` : undefined} size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => { toast.show("PDF original baixado", "success"); setDetalhe(null); }}>📥 PDF</Button>
          <Button onClick={() => { toast.show("Adicionado ao prontuário", "success"); setDetalhe(null); }}>+ Prontuário</Button>
        </>}
      >
        {detalhe && (
          <div className="space-y-3">
            <Badge tone={detalhe.status === "alterado" ? "warm" : "success"}>{detalhe.status}</Badge>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {detalhe.resultados.map((r, j) => (
                <div key={j} className={`rounded-md p-3 border ${r.ok ? "border-border bg-surface" : "border-ember/40 bg-ember/5"}`}>
                  <div className="text-[10px] text-muted uppercase">{r.a}</div>
                  <div className={`font-mono tnum text-lg font-medium ${r.ok ? "text-text" : "text-ember"}`}>{r.v}</div>
                  <div className="text-xs text-muted">referência: {r.ref}</div>
                </div>
              ))}
            </div>
            {detalhe.alerta && (
              <div className="bg-ember/5 border border-ember/30 rounded-lg p-3 text-sm">
                <div className="text-ember font-medium mb-1">⚠ Alerta clínico</div>
                <div className="text-text text-xs">{detalhe.alerta}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
