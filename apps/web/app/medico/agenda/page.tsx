"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { PACIENTE_DEMO_ID } from "@/lib/api";

interface Consulta {
  hora: string;
  paciente: string;
  tipo: string;
  cid: string;
  status: string;
  cor: string;
  href: string;
}

const INITIAL: Consulta[] = [
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
  const toast = useToast();
  const [consultas, setConsultas] = useState<Consulta[]>(INITIAL);
  const [novaOpen, setNovaOpen] = useState(false);
  const [consultaDetalhe, setConsultaDetalhe] = useState<Consulta | null>(null);

  function criarConsulta(form: FormData) {
    const paciente = String(form.get("paciente") ?? "").trim();
    if (!paciente) return;
    const nova: Consulta = {
      hora: String(form.get("hora") ?? "09:00"),
      paciente,
      tipo: String(form.get("tipo") ?? "Retorno"),
      cid: String(form.get("cid") ?? "—"),
      status: "confirmada",
      cor: "leaf",
      href: "/medico/pacientes",
    };
    setConsultas((arr) => [...arr, nova].sort((a, b) => a.hora.localeCompare(b.hora)));
    setNovaOpen(false);
    toast.show(`Consulta agendada: ${paciente} às ${nova.hora}`, "success");
  }

  return (
    <AppShell>
      <Topbar title="Agenda" subtitle="Quinta-feira, 17 de abril de 2026" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div><div className="text-3xl font-semibold text-text tnum">{consultas.length}</div><div className="text-xs text-muted mt-1">consultas · 3 telemed</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Semana</div><div className="text-3xl font-semibold text-text tnum">37</div><div className="text-xs text-muted mt-1">+12% vs anterior</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Taxa no-show</div><div className="text-3xl font-semibold text-text tnum">6%</div><div className="text-xs text-leaf mt-1">abaixo da média (11%)</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Próxima</div><div className="text-2xl font-semibold text-text tnum">{consultas[0]?.hora ?? "—"}</div><div className="text-xs text-muted mt-1">{consultas[0]?.paciente ?? "—"}</div></Card>
        </div>

        <Card>
          <CardHeader title="Visão semanal" action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.show("Semana anterior carregada", "info")}>← Semana</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.show("Hoje", "info")}>Hoje</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.show("Próxima semana carregada", "info")}>Semana →</Button>
            </div>
          } />
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
          <CardHeader title="Hoje — 17 abr" action={<Button size="sm" onClick={() => setNovaOpen(true)}>+ Nova consulta</Button>} />
          <div className="divide-y divide-border mt-2">
            {consultas.map((c, i) => (
              <div key={i} className="py-3 flex items-center gap-4 hover:bg-surface -mx-2 px-2 rounded-lg transition">
                <div className="w-16 font-mono text-sm text-text tnum">{c.hora}</div>
                <div className={`w-1 h-10 rounded-full bg-${c.cor}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{c.paciente}</div>
                  <div className="text-xs text-muted">{c.tipo} · CID {c.cid}</div>
                </div>
                <Badge tone={c.status === "confirmada" ? "success" : "warm"}>{c.status}</Badge>
                <Button variant="secondary" size="sm" onClick={() => setConsultaDetalhe(c)}>Abrir</Button>
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
                  <span className="text-xs text-muted tnum">{[4, 4, 4, 10, 4][i]}h</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Alertas" />
            <ul className="text-sm space-y-2 mt-3">
              <li className="flex items-start gap-2"><span className="text-ember mt-0.5">●</span><span className="text-text">3 pacientes com ofício RDC 660 vencendo em &lt;30d</span></li>
              <li className="flex items-start gap-2"><span className="text-ochre mt-0.5">●</span><span className="text-text">2 pacientes sem tracker log há mais de 7 dias</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">●</span><span className="text-text">Rosa Albuquerque confirmou presença há 2min</span></li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Modal: Nova consulta */}
      <Modal open={novaOpen} onClose={() => setNovaOpen(false)} title="Nova consulta" subtitle="Agendar atendimento presencial ou telemedicina" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); criarConsulta(new FormData(e.currentTarget)); }} className="space-y-4">
          <ModalField label="Paciente *">
            <ModalSelect name="paciente" required defaultValue="">
              <option value="" disabled>Escolha o paciente…</option>
              <option>Maria Silva</option>
              <option>Carlos Augusto Pereira</option>
              <option>Lucia Fernandes</option>
              <option>Rosa Albuquerque</option>
              <option>Pedro Martins</option>
              <option>Gabriela Torres</option>
              <option>Henrique Dias</option>
              <option>Novo paciente (cadastrar depois)</option>
            </ModalSelect>
          </ModalField>
          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Data *"><ModalInput name="data" type="date" required defaultValue="2026-04-17" /></ModalField>
            <ModalField label="Horário *"><ModalInput name="hora" type="time" required defaultValue="09:00" /></ModalField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Tipo">
              <ModalSelect name="tipo" defaultValue="Retorno">
                <option>Primeira consulta</option>
                <option>Retorno</option>
                <option>Titulação</option>
                <option>Telemedicina</option>
                <option>Ajuste RDC 660</option>
                <option>Paliativo</option>
              </ModalSelect>
            </ModalField>
            <ModalField label="Duração"><ModalSelect name="duracao" defaultValue="30"><option value="30">30min</option><option value="45">45min</option><option value="60">60min</option></ModalSelect></ModalField>
          </div>
          <ModalField label="CID-10 (se aplicável)"><ModalInput name="cid" placeholder="M79.7, G40.4, F41.1…" /></ModalField>
          <ModalField label="Observações" hint="Visível apenas para a equipe clínica">
            <ModalTextarea name="obs" rows={2} placeholder="Motivo, preparo, contexto…" />
          </ModalField>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setNovaOpen(false)}>Cancelar</Button>
            <Button type="submit">Agendar consulta</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalhe da consulta */}
      <Modal
        open={consultaDetalhe !== null}
        onClose={() => setConsultaDetalhe(null)}
        title={consultaDetalhe?.paciente ?? ""}
        subtitle={consultaDetalhe ? `${consultaDetalhe.tipo} · ${consultaDetalhe.hora} · CID ${consultaDetalhe.cid}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { toast.show("Paciente confirmado via WhatsApp", "success"); setConsultaDetalhe(null); }}>Confirmar via WA</Button>
            {consultaDetalhe && (
              <Link href={consultaDetalhe.href}>
                <Button>Abrir atendimento</Button>
              </Link>
            )}
          </>
        }
      >
        {consultaDetalhe && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone={consultaDetalhe.status === "confirmada" ? "success" : "warm"}>{consultaDetalhe.status}</Badge>
              <span className="text-muted">·</span>
              <span className="text-text">{consultaDetalhe.tipo}</span>
            </div>
            <div className="border-l-2 border-primary/40 pl-3 py-2 text-muted text-xs">
              <div className="text-text font-medium mb-1">Brief pré-consulta</div>
              Paciente {consultaDetalhe.paciente} em acompanhamento — último tracker log com melhora de 42% nas dores nos últimos 30 dias. Dose atual estável. Avaliar ajustes conforme relato.
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" onClick={() => { toast.show("✨ Brief IA atualizado", "success"); }}>✨ Regerar brief</Button>
              <Button variant="secondary" size="sm" onClick={() => { toast.show("Lembrete enviado", "success"); }}>📱 Lembrar</Button>
              <Button variant="secondary" size="sm" onClick={() => { toast.show("Consulta cancelada", "info"); setConsultas((a) => a.filter((x) => x !== consultaDetalhe)); setConsultaDetalhe(null); }}>✕ Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
