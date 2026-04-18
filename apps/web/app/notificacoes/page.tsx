"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";

interface Notif {
  id: string;
  hora: string;
  tipo: string;
  titulo: string;
  desc: string;
  cor: string;
  lida: boolean;
  acao?: string;
  acaoFeedback?: string;
}

const INITIAL: Notif[] = [
  { id: "n1", hora: "agora", tipo: "alerta_clinico", titulo: "Carlos Pereira — transaminases elevadas", desc: "AST 48 (ref <40). Considere reduzir dose de THC de 25mg → 15mg.", cor: "ember", lida: false, acao: "Ver exame", acaoFeedback: "Abrindo exame de Carlos Pereira" },
  { id: "n2", hora: "há 14min", tipo: "mensagem", titulo: "Maria Silva enviou mensagem", desc: "Dra, tomei a dose da manhã e está melhor. Posso aumentar à noite?", cor: "primary", lida: false, acao: "Responder", acaoFeedback: "Abrindo conversa com Maria Silva" },
  { id: "n3", hora: "há 1h", tipo: "rdc660", titulo: "RDC 660 de Gabriela Torres deferido", desc: "Ofício aprovado pela ANVISA · Validade até 17 abr 2028", cor: "leaf", lida: false, acao: "Baixar ofício", acaoFeedback: "Ofício RDC 660 baixado (PDF)" },
  { id: "n4", hora: "há 2h", tipo: "rdc660_alerta", titulo: "RDC 660 vencendo em 27 dias", desc: "Paciente: Henrique Dias · Renovação recomendada", cor: "ochre", lida: false, acao: "Iniciar renovação", acaoFeedback: "Renovação RDC 660 iniciada — ofício gerado" },
  { id: "n5", hora: "há 4h", tipo: "tracker", titulo: "Cláudia Souza — sem log há 7 dias", desc: "Último tracker log em 10 abr. Enviar cobrança via WhatsApp?", cor: "ochre", lida: true, acao: "Cobrar", acaoFeedback: "Lembrete enviado via WhatsApp" },
  { id: "n6", hora: "ontem", tipo: "sistema", titulo: "Nova versão do Co-Pilot disponível", desc: "Protocolos atualizados com dados Delphi 2026. Aceitar atualização?", cor: "sky", lida: true, acao: "Ver changelog", acaoFeedback: "Changelog aberto" },
  { id: "n7", hora: "ontem", tipo: "consulta", titulo: "Telemed confirmada com Rosa Albuquerque", desc: "Amanhã 11:30 · sala meridiana-abc123", cor: "sky", lida: true, acao: "Preparar brief", acaoFeedback: "Brief pré-consulta gerado (IA)" },
  { id: "n8", hora: "2d", tipo: "billing", titulo: "Fatura paga — R$ 499", desc: "Plano Clínica · Mar 2026 · PIX recorrente", cor: "leaf", lida: true, acao: "Baixar NF", acaoFeedback: "NFSe baixada" },
  { id: "n9", hora: "3d", tipo: "compliance", titulo: "Audit hash chain verificado", desc: "1.842 eventos · integridade OK", cor: "leaf", lida: true, acao: "Ver relatório", acaoFeedback: "Relatório audit aberto" },
];

export default function NotificacoesPage() {
  const toast = useToast();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);

  const naoLidas = notifs.filter((n) => !n.lida).length;
  const alertasClinicos = notifs.filter((n) => n.tipo.includes("alerta") || n.tipo === "rdc660_alerta").length;
  const hoje = notifs.filter((n) => n.hora.includes("agora") || n.hora.includes("min") || n.hora.includes("h")).length;

  function marcarLida(id: string) {
    setNotifs((arr) => arr.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  function marcarTodas() {
    setNotifs((arr) => arr.map((n) => ({ ...n, lida: true })));
    toast.show("Todas notificações marcadas como lidas", "success");
  }

  function executarAcao(n: Notif) {
    marcarLida(n.id);
    if (n.acaoFeedback) toast.show(n.acaoFeedback, "success");
  }

  return (
    <AppShell>
      <Topbar title="Notificações" subtitle={`${naoLidas} não lidas · últimos 7 dias`} />
      <div className="px-6 lg:px-10 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Não lidas</div>
            <div className="text-3xl font-semibold text-primary tnum">{naoLidas}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Alertas clínicos</div>
            <div className="text-3xl font-semibold text-ember tnum">{alertasClinicos}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Hoje</div>
            <div className="text-3xl font-semibold text-text tnum">{hoje}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Canais</div>
            <div className="text-sm text-text mt-1">
              <div>📱 WhatsApp · 📧 Email · 🔔 Push</div>
              <div className="text-muted text-xs mt-1">Preferências em Configurações</div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Timeline"
            action={
              <Button variant="secondary" size="sm" onClick={marcarTodas} disabled={naoLidas === 0}>
                Marcar tudo como lida
              </Button>
            }
          />
          <div className="divide-y divide-border mt-3">
            {notifs.map((n) => (
              <div key={n.id} className={`py-4 flex gap-4 ${!n.lida ? "bg-primary/5 -mx-4 px-4 border-l-2 border-primary" : ""}`}>
                <div className="shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${n.cor}/20 text-${n.cor}`}>
                    <span className="text-lg">
                      {n.tipo.includes("alerta") ? "⚠" : n.tipo === "mensagem" ? "💬" : n.tipo.includes("rdc660") ? "📄" : n.tipo === "tracker" ? "📊" : n.tipo === "sistema" ? "⚙" : n.tipo === "consulta" ? "🎥" : n.tipo === "billing" ? "💳" : "🛡"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className={`text-sm font-medium ${!n.lida ? "text-text" : "text-muted"}`}>{n.titulo}</div>
                    <div className="text-[10px] text-muted shrink-0">{n.hora}</div>
                  </div>
                  <div className="text-xs text-muted mt-1 leading-relaxed">{n.desc}</div>
                  <div className="flex gap-2 mt-2">
                    {n.acao && (
                      <Button variant="secondary" size="sm" onClick={() => executarAcao(n)}>
                        {n.acao}
                      </Button>
                    )}
                    {!n.lida && (
                      <Button variant="secondary" size="sm" onClick={() => marcarLida(n.id)}>
                        Marcar lida
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
