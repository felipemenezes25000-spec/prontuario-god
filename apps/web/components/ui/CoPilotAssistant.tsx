"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface Suggestion {
  text: string;
  highlight?: string;
  cta?: { label: string; href?: string; onClick?: () => void };
}

const ROUTE_SUGGESTIONS: Record<string, Suggestion[]> = {
  "/": [
    {
      text: "Bem-vindo. Posso explicar o produto, agendar uma demo ou abrir um caso clínico real.",
      cta: { label: "Ver Co-Pilot", href: "/co-pilot/titulacao" },
    },
    {
      text: "Já é cadastrado? Entre direto no painel.",
      cta: { label: "Entrar", href: "/entrar" },
    },
  ],
  "/entrar": [
    {
      text: "Use a conta de demonstração se for sua primeira vez — abre o painel da Dra. Ana Beatriz com 5 pacientes.",
      highlight: "em 1 clique.",
    },
  ],
  "/co-pilot/titulacao": [
    {
      text: "Estou pronto. Preencha o caso e cruzo com 1.247 pacientes BR similares em segundos.",
      highlight: "start low, go slow.",
    },
    {
      text: "Para fibromialgia + duloxetina, tipicamente sugiro CBD-só sublingual.",
    },
  ],
  "/paciente/log": [
    {
      text: "Oi Maria. Seu humor está crescendo desde quinta. Continue logando.",
      highlight: "+18% essa semana.",
    },
  ],
  "/medico/dashboard": [
    {
      text: "Roberto K. não loga há 5 dias. Quer que eu envie um SMS de retomada?",
      highlight: "ação sugerida",
      cta: { label: "Enviar SMS", onClick: () => alert("SMS de retomada enviado") },
    },
    {
      text: "João Pereira tem RDC 660 vencendo em 89 dias. Já preparei o ofício.",
      cta: { label: "Revisar", href: "/medico/receita" },
    },
  ],
  "/medico/receita": [
    {
      text: "Receita Tipo B, ANVISA-compliant. Posso gerar também a guia TUSS se for plano.",
    },
  ],
};

const PRONTUARIO_SUGGESTIONS: Suggestion[] = [
  {
    text: "Posso transcrever sua próxima consulta em voz e estruturar em SOAP automaticamente.",
    highlight: "Toque em 'falar' acima.",
  },
  {
    text: "Pergunte sobre este paciente no painel à direita — eu cruzo todo o histórico.",
  },
];

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { text: "Olá. Sou o Co-Pilot. Posso ajudar com qualquer coisa." },
];

export function CoPilotAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [askInput, setAskInput] = useState("");

  const suggestions = useMemo(() => {
    const path = pathname ?? "/";
    if (path.startsWith("/medico/prontuario/")) return PRONTUARIO_SUGGESTIONS;
    return ROUTE_SUGGESTIONS[path] ?? DEFAULT_SUGGESTIONS;
  }, [pathname]);

  const current = suggestions[idx % suggestions.length] ?? suggestions[0]!;

  useEffect(() => {
    if (open) return;
    if (suggestions.length <= 1) return;
    const id = setInterval(() => setIdx((n) => n + 1), 8000);
    return () => clearInterval(id);
  }, [open, suggestions.length]);

  useEffect(() => {
    setIdx(0); setReply(null); setAskInput("");
  }, [pathname]);

  function ask() {
    if (!askInput.trim()) return;
    setThinking(true); setReply(null);
    setTimeout(() => {
      setReply("Em produção eu cruzo o seu prontuário, a coorte BR e a literatura em ~2s. Configure a chave de IA para respostas reais.");
      setThinking(false);
    }, 800);
  }

  return (
    <div className={clsx("fixed z-40 transition-all duration-300", open ? "bottom-6 right-6 w-[min(380px,calc(100vw-3rem))]" : "bottom-6 right-6")}>
      {open ? (
        <div className="bg-surface border border-border rounded-2xl shadow-floating overflow-hidden animate-rise">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Pulse />
              <div>
                <div className="text-sm font-semibold text-text leading-none">Co-Pilot</div>
                <div className="text-[11px] text-muted mt-0.5">IA · sempre por perto</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-text w-7 h-7 flex items-center justify-center rounded-md hover:bg-bg"
              aria-label="fechar"
            >
              ×
            </button>
          </div>

          {/* Conversation */}
          <div className="p-4 max-h-[55vh] overflow-y-auto space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="text-primary text-sm mt-0.5">✦</span>
              <div className="flex-1">
                <p className="text-sm text-text leading-relaxed">
                  {current.text}{" "}
                  {current.highlight && <span className="text-primary font-medium">{current.highlight}</span>}
                </p>
                {current.cta && (
                  current.cta.href ? (
                    <a href={current.cta.href} className="inline-block mt-2 text-xs font-medium text-primaryText border border-primary/30 px-3 py-1 rounded-full hover:bg-primarySoft">
                      {current.cta.label}
                    </a>
                  ) : (
                    <button onClick={current.cta.onClick} className="inline-block mt-2 text-xs font-medium text-primaryText border border-primary/30 px-3 py-1 rounded-full hover:bg-primarySoft">
                      {current.cta.label}
                    </button>
                  )
                )}
              </div>
            </div>

            {askInput && reply !== null && (
              <>
                <div className="flex items-start gap-2.5 pl-6">
                  <span className="text-xs text-muted mt-0.5">você</span>
                  <div className="text-sm text-text italic">{askInput}</div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary text-sm mt-0.5">✦</span>
                  <div className="text-sm text-text leading-relaxed">{reply}</div>
                </div>
              </>
            )}

            {thinking && (
              <div className="flex items-start gap-2.5">
                <span className="text-primary text-sm mt-0.5">✦</span>
                <div className="flex items-center gap-1">
                  <Dot delay={0} /><Dot delay={200} /><Dot delay={400} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder="Pergunte algo…"
              className="flex-1 bg-bg border border-border focus:border-primary outline-none px-3 py-2 text-sm rounded-lg"
            />
            <button
              type="submit"
              disabled={!askInput.trim() || thinking}
              className="bg-primary hover:bg-primaryHover disabled:opacity-30 text-white px-3.5 py-2 rounded-lg text-sm"
              aria-label="enviar"
            >
              ↩
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 bg-surface backdrop-blur-md border border-border rounded-full pl-1.5 pr-4 py-1.5 shadow-floating hover:border-primary/40 transition-all max-w-[min(420px,calc(100vw-3rem))]"
        >
          <Pulse />
          <div className="text-left min-w-0 max-w-[280px]">
            <div className="text-[10px] uppercase tracking-wide text-muted">Co-Pilot · IA</div>
            <div className="text-sm text-text truncate group-hover:text-primary transition-colors">
              {current.text}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

function Pulse() {
  return (
    <div className="relative shrink-0 w-8 h-8 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulseSoft" />
      <div className="relative w-6 h-6 rounded-full bg-primarySoft border border-primary/30 grid place-items-center">
        <span className="text-primary text-sm">✦</span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"
      style={{ animation: `pulseSoft 1s ease-in-out ${delay}ms infinite` }}
    />
  );
}
