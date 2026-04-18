"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { PACIENTE_DEMO_ID } from "@/lib/api";

interface Mensagem {
  autor: "paciente" | "medica" | "sistema";
  hora: string;
  texto: string;
}

interface Conversa {
  id: string;
  nome: string;
  ultima: string;
  hora: string;
  nao_lidas: number;
  telefone: string;
  pacienteId?: string;
  mensagens: Mensagem[];
}

const CONVERSAS_INIT: Conversa[] = [
  {
    id: "maria",
    nome: "Maria Silva",
    ultima: "Dra, tomei a dose da manhã e está melhor. Posso aumentar à noite?",
    hora: "há 14min",
    nao_lidas: 2,
    telefone: "+55 11 98877-6655",
    pacienteId: PACIENTE_DEMO_ID,
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
    telefone: "+55 11 97766-5544",
    mensagens: [
      { autor: "paciente", hora: "09:15", texto: "Dra, saiu o deferimento!" },
      { autor: "paciente", hora: "09:16", texto: "O ofício de importação chegou. Vou enviar foto." },
    ],
  },
  {
    id: "lucia-mae",
    nome: "Patricia (mãe Lucia)",
    ultima: "Lucia teve só uma crise essa semana. Obrigada doutora!",
    hora: "há 5h",
    nao_lidas: 0,
    telefone: "+55 11 96655-4433",
    mensagens: [
      { autor: "paciente", hora: "07:20", texto: "Bom dia Dra!" },
      { autor: "paciente", hora: "07:20", texto: "Lucia teve só uma crise essa semana. Obrigada doutora!" },
      { autor: "medica", hora: "08:00", texto: "Maravilha Patricia! Continue registrando no app, na próxima consulta avaliamos aumentar a dose para consolidar a resposta." },
    ],
  },
  { id: "rosa", nome: "Rosa Albuquerque", ultima: "Confirmo telemed 11:30 de hoje.", hora: "há 6h", nao_lidas: 0, telefone: "+55 11 95544-3322", mensagens: [] },
  { id: "gabriela", nome: "Gabriela Torres", ultima: "Sentindo muita sonolência.", hora: "ontem", nao_lidas: 3, telefone: "+55 11 94433-2211", mensagens: [
    { autor: "paciente", hora: "ontem 18:20", texto: "Dra, iniciei o Aurora Night ontem à noite" },
    { autor: "paciente", hora: "ontem 18:21", texto: "Consegui dormir, mas acordei muito sonolenta" },
    { autor: "paciente", hora: "ontem 18:22", texto: "Sentindo muita sonolência." },
  ] },
  { id: "pedro", nome: "Pedro Martins", ultima: "Doutora, posso pegar receita renovada?", hora: "ontem", nao_lidas: 0, telefone: "+55 11 93322-1100", mensagens: [] },
  { id: "henrique", nome: "Henrique Dias", ultima: "Comprei o Aurora Morning. Quando começo?", hora: "2d", nao_lidas: 1, telefone: "+55 11 92211-0099", mensagens: [] },
  { id: "julia-mae", nome: "Mônica (mãe Júlia)", ultima: "Boa tarde doutora!", hora: "3d", nao_lidas: 0, telefone: "+55 11 91100-9988", mensagens: [] },
];

// Respostas inteligentes por contexto — dá sensação de IA sem custo
const SUGESTOES_RESPOSTA: Record<string, string[]> = {
  maria: [
    "Pode sim, Maria. Adicione 10mg à noite e me avise amanhã como dormiu.",
    "Ainda não, vamos manter a dose por mais 3 dias para estabilizar.",
    "Prefiro avaliar em consulta. Agendei para amanhã 10h?",
  ],
  carlos: [
    "Perfeito Carlos! Pode enviar a foto, vou validar.",
    "Ótima notícia! Vou atualizar seu prontuário.",
    "Parabéns pela paciência! Próxima etapa: agendar retirada.",
  ],
  gabriela: [
    "Gabriela, é esperado nos primeiros 3 dias. Se persistir, reduzimos para 1 puff.",
    "Pausa por 48h e me avisa. Vou ajustar a dose.",
    "Marque sua telemed — precisamos conversar.",
  ],
  rosa: ["Confirmado! Entro na sala às 11:30.", "Ótimo Rosa, até daqui a pouco."],
  pedro: ["Claro Pedro, vou assinar e enviar por aqui ainda hoje.", "Precisa ser renovada via agenda, pode marcar?"],
  henrique: ["Pode começar hoje à noite — 3 gotas sublingual antes de dormir.", "Vamos esperar até sua próxima telemed para iniciar corretamente."],
};

export default function MensagensPage() {
  const toast = useToast();
  const [conversas, setConversas] = useState<Conversa[]>(CONVERSAS_INIT);
  const [ativaId, setAtivaId] = useState<string>("maria");
  const [draft, setDraft] = useState("");
  const [busca, setBusca] = useState("");

  const ativa = conversas.find((c) => c.id === ativaId) ?? conversas[0];
  const filtradas = conversas.filter((c) => busca === "" || c.nome.toLowerCase().includes(busca.toLowerCase()));

  function abrirConversa(id: string) {
    setAtivaId(id);
    setConversas((arr) => arr.map((c) => (c.id === id ? { ...c, nao_lidas: 0 } : c)));
  }

  function enviar(texto?: string) {
    const msg = (texto ?? draft).trim();
    if (!msg || !ativa) return;
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const nova: Mensagem = { autor: "medica", hora, texto: msg };
    setConversas((arr) => arr.map((c) => (c.id === ativa.id
      ? { ...c, mensagens: [...c.mensagens, nova], ultima: msg, hora: "agora" }
      : c
    )));
    setDraft("");
    toast.show("Mensagem enviada via WhatsApp Business", "success");
  }

  function enviarTemplate(label: string, texto: string) {
    enviar(texto);
    toast.show(`Template "${label}" disparado`, "success");
  }

  const sugestoes = ativa ? (SUGESTOES_RESPOSTA[ativa.id] ?? []) : [];

  return (
    <AppShell>
      <Topbar title="Mensagens" subtitle="WhatsApp Business · templates aprovados ANVISA" />
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Card className="md:col-span-1 p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar paciente…"
                className="w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text"
              />
            </div>
            <div className="max-h-[640px] overflow-y-auto divide-y divide-border">
              {filtradas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => abrirConversa(c.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface ${ativa?.id === c.id ? "bg-surface" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                      {c.nome.split(" ").map((w) => w[0]).slice(0, 2).join("")}
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
                <div className="text-xs text-muted">{ativa?.telefone} · WhatsApp Business</div>
              </div>
              {ativa?.pacienteId ? (
                <Link href={`/medico/prontuario/${ativa.pacienteId}`}>
                  <Button variant="secondary" size="sm">Abrir prontuário</Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => toast.show("Paciente sem prontuário ativo", "info")}>Abrir prontuário</Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/30">
              {(ativa?.mensagens.length ? ativa.mensagens : [{ autor: "sistema" as const, hora: "", texto: "Nenhuma mensagem ainda. Use um template abaixo para iniciar." }]).map((m, i) => (
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

            {sugestoes.length > 0 && (
              <div className="border-t border-border p-3 bg-primary/5">
                <div className="text-[10px] text-muted mb-2 uppercase tracking-wide">✨ Sugestões do Co-Pilot (baseadas no contexto)</div>
                <div className="flex gap-2 flex-wrap">
                  {sugestoes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => enviar(s)}
                      className="text-xs text-left px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary hover:bg-primary/10 text-text max-w-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border p-3">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => enviarTemplate("lembrete_dose", "🔔 Oi! Lembrando sua dose das 20h — depois registre no app como se sentiu.")}
                  className="text-[10px] px-2 py-1 rounded-md bg-surface border border-border text-muted hover:text-text hover:border-primary"
                >📋 Template: lembrete_dose</button>
                <button
                  onClick={() => enviarTemplate("agendar", "📅 Vamos marcar seu retorno? Envie 3 opções de horário entre segunda e sexta.")}
                  className="text-[10px] px-2 py-1 rounded-md bg-surface border border-border text-muted hover:text-text hover:border-primary"
                >📋 Template: agendar</button>
                <button
                  onClick={() => enviarTemplate("renovacao_660", "📄 Seu ofício RDC 660 vence em 30 dias. Vamos iniciar renovação?")}
                  className="text-[10px] px-2 py-1 rounded-md bg-surface border border-border text-muted hover:text-text hover:border-primary"
                >📋 Template: renovação RDC 660</button>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); enviar(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Digite uma mensagem…"
                  className="flex-1 bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text"
                />
                <Button size="sm" type="submit">Enviar</Button>
              </form>
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
