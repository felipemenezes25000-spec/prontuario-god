"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CONVERSAS = [
  {
    id: "maria",
    nome: "Maria Silva",
    ultima: "Dra, tomei a dose da manhã e está melhor. Posso aumentar à noite?",
    hora: "há 14min",
    nao_lidas: 2,
    mensagens: [
      { autor: "paciente", hora: "10:12", texto: "Bom dia Dra. Ana!" },
      { autor: "paciente", hora: "10:12", texto: "Ontem dormi melhor depois que aumentei para 20mg 😊" },
      { autor: "medica", hora: "10:30", texto: "Que ótimo Maria! Vamos manter por mais 7 dias e reavaliar." },
      { autor: "paciente", hora: "11:45", texto: "Dra, tomei a dose da manhã e está melhor. Posso aumentar à noite?" },
    ],
  },
  {
    id: "carlos",
    nome: "Carlos Pereira",
    ultima: "O ofício de importação chegou. Vou enviar foto.",
    hora: "há 2h",
    nao_lidas: 1,
    mensagens: [],
  },
  {
    id: "lucia-mae",
    nome: "Patricia (mãe Lucia)",
    ultima: "Lucia teve só uma crise essa semana. Obrigada doutora!",
    hora: "há 5h",
    nao_lidas: 0,
    mensagens: [],
  },
  {
    id: "rosa",
    nome: "Rosa Albuquerque",
    ultima: "Confirmo telemed 11:30 de hoje.",
    hora: "há 6h",
    nao_lidas: 0,
    mensagens: [],
  },
  {
    id: "gabriela",
    nome: "Gabriela Torres",
    ultima: "Sentindo muita sonolência.",
    hora: "ontem",
    nao_lidas: 3,
    mensagens: [],
  },
  {
    id: "pedro",
    nome: "Pedro Martins",
    ultima: "Doutora, posso pegar receita renovada?",
    hora: "ontem",
    nao_lidas: 0,
    mensagens: [],
  },
  {
    id: "henrique",
    nome: "Henrique Dias",
    ultima: "Comprei o Aurora Morning. Quando começo?",
    hora: "2d",
    nao_lidas: 1,
    mensagens: [],
  },
  {
    id: "julia-mae",
    nome: "Mônica (mãe Júlia)",
    ultima: "Boa tarde doutora!",
    hora: "3d",
    nao_lidas: 0,
    mensagens: [],
  },
];

export default function MensagensPage() {
  const [ativa, setAtiva] = useState(CONVERSAS[0]);

  return (
    <AppShell>
      <Topbar title="Mensagens" subtitle="WhatsApp Business · templates aprovados ANVISA" />
      <div className="px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1 p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <input
                type="text"
                placeholder="Buscar paciente…"
                className="w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text"
              />
            </div>
            <div className="max-h-[640px] overflow-y-auto divide-y divide-border">
              {CONVERSAS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setAtiva(c)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface ${ativa?.id === c.id ? "bg-surface" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                      {c.nome.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-sm font-medium text-text truncate">{c.nome}</div>
                        <div className="text-[10px] text-muted tnum">{c.hora}</div>
                      </div>
                      <div className="text-xs text-muted truncate">{c.ultima}</div>
                    </div>
                    {c.nao_lidas > 0 && (
                      <span className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium shrink-0">
                        {c.nao_lidas}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-2 p-0 overflow-hidden flex flex-col max-h-[720px]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-medium text-text">{ativa?.nome}</div>
                <div className="text-xs text-muted">+55 11 98877-6655 · WhatsApp Business</div>
              </div>
              <Button variant="secondary" size="sm">Abrir prontuário</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/30">
              {(ativa?.mensagens.length ? ativa.mensagens : [
                { autor: "sistema", hora: "", texto: "Conversa vazia. Clique em uma conversa ao lado." },
              ]).map((m, i) => (
                <div key={i} className={`flex ${m.autor === "medica" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    m.autor === "medica" ? "bg-primary text-white" :
                    m.autor === "paciente" ? "bg-surface border border-border text-text" :
                    "bg-transparent text-muted italic text-xs"
                  }`}>
                    {m.texto}
                    {m.hora && <div className={`text-[10px] mt-1 ${m.autor === "medica" ? "text-white/60" : "text-muted"}`}>{m.hora}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex gap-2 mb-2">
                <button className="text-[10px] px-2 py-1 rounded-md bg-surface border border-border text-muted hover:text-text">📋 Template: lembrete_dose</button>
                <button className="text-[10px] px-2 py-1 rounded-md bg-surface border border-border text-muted hover:text-text">📋 Template: agendar</button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite uma mensagem…"
                  className="flex-1 bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text"
                />
                <Button size="sm">Enviar</Button>
              </div>
              <div className="text-[10px] text-muted mt-2 flex items-center gap-1">
                <span>🔒</span> Somente pacientes com consentimento marketing ativo · LGPD art.11
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
