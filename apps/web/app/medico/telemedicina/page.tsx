"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalField, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

interface Sessao {
  hora: string;
  paciente: string;
  duracao: number;
  motivo: string;
  status: string;
  sala: string;
}

const INIT: Sessao[] = [
  { hora: "11:30", paciente: "Rosa Albuquerque", duracao: 30, motivo: "Avaliação de titulação", status: "aguardando_paciente", sala: "meridiana-abc123" },
  { hora: "14:00", paciente: "Henrique Dias", duracao: 45, motivo: "Retorno — ajuste CBD", status: "agendada", sala: "meridiana-def456" },
  { hora: "16:30", paciente: "Rafael Gomes", duracao: 30, motivo: "Primeira consulta telemedicina", status: "agendada", sala: "meridiana-ghi789" },
];

const HISTORICO = [
  { data: "16 abr", paciente: "Carla Mendes", duracao: "38min", brief: "Paciente TEA adulto, relato de melhora de sono após aumento CBD para 50mg/dia. Receita renovada.", gravacao: true },
  { data: "15 abr", paciente: "Júlia Barbosa", duracao: "42min", brief: "Mãe presente. Júlia (9a) apresenta redução de crises de 4/dia para 1/dia. Continuar protocolo.", gravacao: true },
  { data: "14 abr", paciente: "Sandra Lima", duracao: "55min", brief: "Queixa de sonolência excessiva. Reduzir THC noturno de 10mg → 5mg. Re-avaliar em 14d.", gravacao: true },
  { data: "12 abr", paciente: "Cláudia Souza", duracao: "28min", brief: "Estável. Manter protocolo. Próxima em 30d.", gravacao: true },
];

export default function TelemedicinaPage() {
  const toast = useToast();
  const [sessoes, setSessoes] = useState<Sessao[]>(INIT);
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [salaAtiva, setSalaAtiva] = useState<Sessao | null>(null);
  const [transcricao, setTranscricao] = useState<(typeof HISTORICO)[number] | null>(null);

  function agendar(form: FormData) {
    const paciente = String(form.get("paciente") ?? "").trim();
    if (!paciente) return;
    const nova: Sessao = {
      hora: String(form.get("hora") ?? "10:00"),
      paciente,
      duracao: Number(form.get("duracao") ?? 30),
      motivo: String(form.get("motivo") ?? "Retorno"),
      status: "agendada",
      sala: `meridiana-${Math.random().toString(36).slice(2, 8)}`,
    };
    setSessoes((arr) => [...arr, nova].sort((a, b) => a.hora.localeCompare(b.hora)));
    setAgendarOpen(false);
    toast.show(`Telemed agendada: ${paciente} às ${nova.hora}`, "success");
  }

  function finalizar() {
    if (!salaAtiva) return;
    toast.show(`Sessão finalizada — transcrição Whisper processando`, "success");
    setSessoes((arr) => arr.filter((s) => s.sala !== salaAtiva.sala));
    setSalaAtiva(null);
  }

  return (
    <AppShell>
      <Topbar title="Telemedicina" subtitle="Sessões via LiveKit · gravação automática" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">{sessoes.length}</div><div className="text-xs text-muted mt-1">sessões</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Este mês</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">58</div><div className="text-xs text-leaf mt-1">+22% vs anterior</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Duração média</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">34min</div></Card>
          <Card><div className="text-xs text-muted uppercase tracking-wide mb-1">Horas/semana</div><div className="text-2xl md:text-3xl font-semibold text-text tnum">32h</div><div className="text-xs text-muted mt-1">de 50h plano</div></Card>
        </div>

        <Card>
          <CardHeader title="Hoje" action={<Button size="sm" onClick={() => setAgendarOpen(true)}>+ Agendar</Button>} />
          <div className="space-y-3 mt-3">
            {sessoes.map((s) => (
              <div key={s.sala} className="border border-border rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-14 font-mono text-sm text-text tnum">{s.hora}</div>
                  <div className="w-1 h-12 bg-sky rounded-full" />
                  <div className="flex-1 min-w-0 md:hidden">
                    <div className="font-medium text-text truncate">{s.paciente}</div>
                    <div className="text-xs text-muted truncate">{s.motivo} · {s.duracao}min</div>
                  </div>
                </div>
                <div className="hidden md:block flex-1 min-w-0">
                  <div className="font-medium text-text">{s.paciente}</div>
                  <div className="text-xs text-muted">{s.motivo} · {s.duracao}min</div>
                  <div className="text-[10px] text-muted font-mono mt-1">livekit://{s.sala}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {s.status === "aguardando_paciente"
                    ? <><Badge tone="warm">aguardando paciente</Badge><Button size="sm" onClick={() => setSalaAtiva(s)}>Entrar</Button></>
                    : <><Badge tone="neutral">agendada</Badge><Button variant="secondary" size="sm" onClick={() => setSalaAtiva(s)}>Abrir sala</Button></>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Histórico + resumos" />
          <div className="divide-y divide-border mt-2">
            {HISTORICO.map((h, i) => (
              <div key={i} className="py-4 flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="md:w-16 shrink-0 text-xs text-muted tnum">{h.data}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-text">{h.paciente}</div>
                    <Badge tone="neutral">{h.duracao}</Badge>
                    {h.gravacao && <Badge tone="success">gravado</Badge>}
                  </div>
                  <div className="text-sm text-muted mt-1 leading-relaxed">{h.brief}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setTranscricao(h)}>Transcrição</Button>
                  <Button variant="secondary" size="sm" onClick={() => toast.show(`Abrindo prontuário de ${h.paciente}`, "info")}>Prontuário</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={agendarOpen} onClose={() => setAgendarOpen(false)} title="Agendar telemedicina" subtitle="LiveKit · gravação + transcrição Whisper" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); agendar(new FormData(e.currentTarget)); }} className="space-y-4">
          <ModalField label="Paciente *">
            <ModalSelect name="paciente" required defaultValue="">
              <option value="" disabled>Escolha o paciente…</option>
              <option>Maria Silva</option><option>Carlos Augusto Pereira</option><option>Lucia Fernandes</option>
              <option>Rosa Albuquerque</option><option>Henrique Dias</option><option>Rafael Gomes</option><option>Carla Mendes</option>
            </ModalSelect>
          </ModalField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalField label="Data *"><ModalInput name="data" type="date" required defaultValue="2026-04-17" /></ModalField>
            <ModalField label="Horário *"><ModalInput name="hora" type="time" required defaultValue="14:00" /></ModalField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalField label="Duração"><ModalSelect name="duracao" defaultValue="30"><option value="30">30min</option><option value="45">45min</option><option value="60">60min</option></ModalSelect></ModalField>
            <ModalField label="Tipo"><ModalSelect name="motivo" defaultValue="Retorno"><option>Primeira consulta telemedicina</option><option>Retorno</option><option>Titulação</option><option>Ajuste de dose</option></ModalSelect></ModalField>
          </div>
          <ModalField label="Resumo pré-consulta (gerar com IA)" hint="Deixar em branco = gerar do histórico">
            <ModalTextarea name="brief" rows={3} />
          </ModalField>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" defaultChecked /> Enviar link via WhatsApp automaticamente
          </label>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setAgendarOpen(false)}>Cancelar</Button>
            <Button type="submit">Agendar</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={salaAtiva !== null}
        onClose={() => setSalaAtiva(null)}
        title={`Sala · ${salaAtiva?.paciente ?? ""}`}
        subtitle={salaAtiva ? `livekit://${salaAtiva.sala}` : undefined}
        size="xl"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={() => toast.show("✨ Resumo regenerado", "success")}>✨ Resumo IA</Button>
            <Button variant="secondary" onClick={() => toast.show("Gravação pausada", "info")}>⏸ Pausar</Button>
            <Button onClick={finalizar}>Encerrar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl md:text-2xl mx-auto mb-3">
                  {salaAtiva?.paciente.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? "P"}
                </div>
                <div className="text-white/80 text-sm">{salaAtiva?.paciente}</div>
                <div className="text-white/40 text-xs mt-1">câmera desligada</div>
              </div>
            </div>
            <div className="absolute top-2 left-2 md:top-3 md:left-3 flex gap-1.5 md:gap-2 flex-wrap">
              <span className="bg-red-600/90 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> REC
              </span>
              <span className="bg-black/60 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">{salaAtiva?.duracao}min</span>
              <span className="bg-primary/80 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">🔒 E2EE</span>
            </div>
            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-20 h-14 md:w-32 md:h-24 bg-surface rounded border-2 border-primary flex items-center justify-center text-[10px] md:text-xs text-muted">
              Você
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs text-muted uppercase mb-1">✨ Whisper (ao vivo)</div>
              <div className="text-xs text-muted italic">Aguardando áudio…</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs text-muted uppercase mb-1">💊 Resumo</div>
              <div className="text-xs text-text">CBD 20:1 · 20mg/d · alteração há 7d</div>
            </div>
          </div>
          <div className="text-[10px] text-muted leading-relaxed border-l-2 border-primary/30 pl-2">
            🔒 E2EE · Gravação em servidor BR · Whisper local · Audit hash chain
          </div>
        </div>
      </Modal>

      <Modal open={transcricao !== null} onClose={() => setTranscricao(null)} title={`Transcrição · ${transcricao?.paciente ?? ""}`} subtitle={transcricao ? `${transcricao.data} · ${transcricao.duracao}` : undefined} size="lg">
        {transcricao && (
          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-primary/40 pl-3 py-1 text-muted text-xs">
              <strong className="text-text">Resumo (IA):</strong> {transcricao.brief}
            </div>
            <div className="bg-surface rounded-lg p-3 md:p-4 font-mono text-xs text-text leading-relaxed max-h-80 overflow-y-auto">
              <div className="text-muted mb-2">[00:00] <strong>Dra. Ana</strong></div>
              Oi, tudo bem? Conta pra mim como foram esses 14 dias.<br /><br />
              <div className="text-muted mb-2">[00:15] <strong>{transcricao.paciente}</strong></div>
              Dra., melhorei muito. Sono normalizou, dor caiu.<br /><br />
              <div className="text-muted mb-2">[00:42] <strong>Dra. Ana</strong></div>
              Efeitos colaterais?<br /><br />
              <div className="text-muted mb-2">[00:48] <strong>{transcricao.paciente}</strong></div>
              Nenhum agora. No início tive um pouco mas passou.<br /><br />
              <div className="text-muted italic">…continua…</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.show("TXT baixado", "success")}>📥 TXT</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.show("Adicionado ao prontuário", "success")}>📋 Prontuário</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.show("✨ SOAP gerado", "success")}>✨ SOAP</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
