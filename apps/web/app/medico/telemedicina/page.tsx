"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const AGENDADAS = [
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
  return (
    <AppShell>
      <Topbar title="Telemedicina" subtitle="Sessões via LiveKit · gravação automática" />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div>
            <div className="text-3xl font-semibold text-text tnum">3</div>
            <div className="text-xs text-muted mt-1">sessões agendadas</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Este mês</div>
            <div className="text-3xl font-semibold text-text tnum">58</div>
            <div className="text-xs text-leaf mt-1">+22% vs anterior</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Duração média</div>
            <div className="text-3xl font-semibold text-text tnum">34min</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Horas/semana</div>
            <div className="text-3xl font-semibold text-text tnum">32h</div>
            <div className="text-xs text-muted mt-1">de 50h plano</div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Hoje"
            action={<Button size="sm">+ Agendar telemed</Button>}
          />
          <div className="space-y-3 mt-3">
            {AGENDADAS.map((s) => (
              <div key={s.sala} className="border border-border rounded-lg p-4 flex items-center gap-4">
                <div className="w-14 font-mono text-sm text-text tnum">{s.hora}</div>
                <div className="w-1 h-12 bg-sky rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{s.paciente}</div>
                  <div className="text-xs text-muted">{s.motivo} · {s.duracao}min</div>
                  <div className="text-[10px] text-muted font-mono mt-1">livekit://{s.sala}</div>
                </div>
                {s.status === "aguardando_paciente" ? (
                  <>
                    <Badge tone="warm">aguardando paciente</Badge>
                    <Button size="sm">Entrar na sala</Button>
                  </>
                ) : (
                  <>
                    <Badge tone="neutral">agendada</Badge>
                    <Button variant="secondary" size="sm">Abrir sala</Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Histórico + briefs pré-consulta" />
          <div className="divide-y divide-border mt-2">
            {HISTORICO.map((h, i) => (
              <div key={i} className="py-4 flex gap-4">
                <div className="w-16 shrink-0 text-xs text-muted tnum">{h.data}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-text">{h.paciente}</div>
                    <Badge tone="neutral">{h.duracao}</Badge>
                    {h.gravacao && <Badge tone="success">gravado</Badge>}
                  </div>
                  <div className="text-sm text-muted mt-1 leading-relaxed">{h.brief}</div>
                </div>
                <div className="flex gap-2 items-start">
                  <Button variant="secondary" size="sm">Transcrição</Button>
                  <Button variant="secondary" size="sm">Prontuário</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
