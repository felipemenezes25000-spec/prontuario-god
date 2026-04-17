"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { PACIENTE_DEMO_ID, postTrackerLog } from "@/lib/api";
import { useVoiceInput } from "@/hooks/useVoice";
import { useToast } from "@/providers/ToastProvider";

const SINTOMAS = [
  { k: "dor", l: "Dor" },
  { k: "sono", l: "Sono" },
  { k: "ansiedade", l: "Ansiedade" },
  { k: "humor", l: "Humor" },
];

const VIAS = [
  { v: "sublingual", l: "Sublingual" },
  { v: "oral", l: "Oral" },
  { v: "inalada", l: "Inalada" },
  { v: "dermatologica", l: "Dermo" },
  { v: "bucal", l: "Bucal" },
];

export default function PacienteLog() {
  const [step, setStep] = useState(0);
  const [sintomas, setSintomas] = useState<Record<string, number>>({});
  const [dose, setDose] = useState<number | null>(null);
  const [via, setVia] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const sintomaAtual = SINTOMAS[step];
  const total = SINTOMAS.length;
  const progress = ((step + (sintomaAtual && sintomas[sintomaAtual.k] !== undefined ? 1 : 0)) / (total + 2)) * 100;

  function setNivel(n: number) {
    if (!sintomaAtual) return;
    setSintomas((s) => ({ ...s, [sintomaAtual.k]: n }));
    setTimeout(() => setStep((p) => p + 1), 250);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await postTrackerLog({
        paciente_id: PACIENTE_DEMO_ID,
        ...(dose !== null ? { dose_mg: dose } : {}),
        ...(via !== null ? { via } : {}),
        sintomas,
        efeitos_colaterais: [],
        ...(observacao ? { contexto: { observacao } } : {}),
        entrada_via: observacao ? "voz" : "app",
      });
      toast.show("Diário registrado · sua médica já vê", "success");
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
      toast.show(`Erro: ${(err as Error).message.slice(0, 60)}`, "error");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return <Confirmacao onReset={() => { setSubmitted(false); setStep(0); setSintomas({}); setDose(null); setVia(null); setObservacao(""); }} />;
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Top */}
      <header className="px-6 pt-6 pb-3 flex items-center justify-between max-w-md mx-auto w-full">
        <Link href="/" className="text-sm text-muted hover:text-primary">← voltar</Link>
        <div className="text-sm text-text font-medium">Olá, Maria 👋</div>
      </header>

      {/* Progress */}
      <div className="max-w-md mx-auto px-6 mt-2 w-full">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      <section className="relative z-10 px-6 py-12 max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        {step < total && sintomaAtual ? (
          <SintomaStep sintoma={sintomaAtual} nivelSelecionado={sintomas[sintomaAtual.k] ?? null} onSelect={setNivel} stepIdx={step + 1} stepTotal={total} />
        ) : step === total ? (
          <DoseStep dose={dose} via={via} onDose={setDose} onVia={setVia} onContinue={() => setStep(step + 1)} />
        ) : (
          <ResumoStep sintomas={sintomas} dose={dose} via={via} observacao={observacao} onObservacao={setObservacao} onSubmit={submit} loading={loading} error={error} onBack={() => setStep(0)} />
        )}
      </section>

      <div className="text-center text-xs text-subtle pb-6">
        🔒 seus dados ficam só com você e sua médica
      </div>
    </main>
  );
}

function SintomaStep({ sintoma, nivelSelecionado, onSelect, stepIdx, stepTotal }: { sintoma: { k: string; l: string }; nivelSelecionado: number | null; onSelect: (n: number) => void; stepIdx: number; stepTotal: number }) {
  return (
    <div className="animate-rise">
      <div className="text-sm text-muted mb-3">Pergunta {stepIdx} de {stepTotal}</div>
      <h1 className="text-4xl font-semibold tracking-tight text-text mb-3">
        {questionFor(sintoma.k)}
      </h1>
      <p className="text-muted mb-10">Toque na nota — de zero a dez. Sem certo ou errado.</p>

      <div className="space-y-5">
        <div className="flex items-end justify-between gap-2">
          {Array.from({ length: 11 }).map((_, n) => {
            const isActive = nivelSelecionado === n;
            const intensity = n / 10;
            const r = sintoma.k === "humor" || sintoma.k === "sono"
              ? Math.round(239 - intensity * 220)
              : Math.round(20 + intensity * 220);
            const g = sintoma.k === "humor" || sintoma.k === "sono"
              ? Math.round(68 + intensity * 116)
              : Math.round(184 - intensity * 116);
            const b = sintoma.k === "humor" || sintoma.k === "sono"
              ? Math.round(68 + intensity * 98)
              : Math.round(166 - intensity * 98);
            const fill = `rgb(${r}, ${g}, ${b})`;
            const fillSoft = `rgba(${r}, ${g}, ${b}, 0.18)`;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onSelect(n)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                aria-label={`nível ${n}`}
              >
                <span
                  className="rounded-full transition-all"
                  style={{
                    width: isActive ? '48px' : '32px',
                    height: isActive ? '48px' : '32px',
                    background: isActive ? fill : fillSoft,
                    boxShadow: isActive ? `0 4px 16px ${fillSoft}` : 'none',
                    border: isActive ? `2px solid ${fill}` : `1.5px solid ${fillSoft}`,
                  }}
                />
                <span className={clsx("text-sm tnum", isActive ? "text-text font-bold" : "text-muted group-hover:text-text")}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-muted px-1">
          <span>{sintoma.k === "humor" || sintoma.k === "sono" ? "péssimo" : "ausente"}</span>
          <span className="opacity-60">moderado</span>
          <span>{sintoma.k === "humor" || sintoma.k === "sono" ? "ótimo" : "incapacitante"}</span>
        </div>

        {nivelSelecionado !== null && (
          <div className="mt-8 text-center animate-rise">
            <div className="text-2xl font-semibold text-text">{labelFor(nivelSelecionado, sintoma.k)}</div>
            <div className="text-xs text-muted mt-1">avançando…</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DoseStep({ dose, via, onDose, onVia, onContinue }: { dose: number | null; via: string | null; onDose: (d: number) => void; onVia: (v: string) => void; onContinue: () => void }) {
  return (
    <div className="animate-rise">
      <div className="text-sm text-muted mb-3">Pergunta 5 de 6</div>
      <h1 className="text-4xl font-semibold tracking-tight text-text mb-8">
        Tomou alguma dose <span className="text-primary">hoje?</span>
      </h1>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[0, 5, 10, 15, 20, 25, 30, 40].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDose(d)}
            className={clsx(
              "py-4 rounded-xl font-mono tnum text-lg border-2 transition-all",
              dose === d ? "border-primary bg-primary text-white" : "border-border hover:border-primary/50",
            )}
          >
            {d === 0 ? "—" : `${d}mg`}
          </button>
        ))}
      </div>

      {dose !== null && dose > 0 && (
        <>
          <div className="text-xs uppercase tracking-wide text-muted mb-3">Via de administração</div>
          <div className="grid grid-cols-5 gap-2 mb-10">
            {VIAS.map((v) => (
              <button
                key={v.v}
                type="button"
                onClick={() => onVia(v.v)}
                className={clsx(
                  "py-3 rounded-xl border-2 transition-all text-xs",
                  via === v.v ? "border-primary bg-primarySoft text-primaryText font-medium" : "border-border hover:border-primary/50",
                )}
              >
                {v.l}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={dose === null || (dose > 0 && !via)}
        className="w-full bg-text text-white py-4 rounded-xl font-medium hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Revisar antes de enviar →
      </button>
    </div>
  );
}

function ResumoStep({ sintomas, dose, via, observacao, onObservacao, onSubmit, loading, error, onBack }: { sintomas: Record<string, number>; dose: number | null; via: string | null; observacao: string; onObservacao: (s: string) => void; onSubmit: () => void; loading: boolean; error: string | null; onBack: () => void }) {
  const voice = useVoiceInput({ lang: "pt-BR" });
  useEffect(() => { if (voice.transcript) onObservacao(voice.transcript); }, [voice.transcript, onObservacao]);

  return (
    <div className="animate-rise">
      <div className="text-sm text-muted mb-3">Quase lá — revise antes de enviar</div>
      <h1 className="text-4xl font-semibold tracking-tight text-text mb-8">
        Revise e <span className="text-primary">envie.</span>
      </h1>

      <div className="bg-surface rounded-xl p-1 mb-6 border border-border">
        {SINTOMAS.map((s, i) => (
          <div key={s.k} className={clsx("flex items-center justify-between py-3 px-4", i < SINTOMAS.length - 1 && "border-b border-border")}>
            <span className="text-text">{s.l}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tnum text-text">{sintomas[s.k] ?? "—"}</span>
              <span className="text-xs text-muted">/10</span>
            </div>
          </div>
        ))}
        {dose !== null && (
          <div className="flex items-center justify-between py-3 px-4 border-t border-border">
            <span className="text-text">Dose / via</span>
            <div className="font-mono tnum text-text">
              {dose === 0 ? "sem dose hoje" : `${dose}mg · ${via ?? "—"}`}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-muted uppercase tracking-wide">Algo mais? (opcional)</span>
          {voice.supported ? (
            <button
              type="button"
              onClick={voice.listening ? voice.stop : voice.start}
              className={clsx(
                "text-xs flex items-center gap-1.5",
                voice.listening ? "text-primary" : "text-muted hover:text-primary",
              )}
            >
              <span className={clsx("inline-block w-1.5 h-1.5 rounded-full", voice.listening ? "bg-primary animate-pulseSoft" : "bg-subtle")} />
              {voice.listening ? "ouvindo…" : "falar"}
            </button>
          ) : (
            <span className="text-xs text-subtle">voz não suportada</span>
          )}
        </div>
        <textarea
          value={observacao}
          onChange={(e) => onObservacao(e.target.value)}
          rows={3}
          placeholder='ex: "tomei a dose mais cedo hoje, sono melhorando"'
          className="w-full bg-surface border border-border focus:border-primary outline-none p-3 text-text resize-none rounded-xl text-sm"
        />
      </div>

      {error && (
        <div className="text-sm text-danger border border-danger/30 bg-dangerSoft p-3 rounded-xl mb-4">{error}</div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-primary hover:bg-primaryHover text-white py-4 rounded-xl font-medium disabled:opacity-30 transition-all"
      >
        {loading ? "enviando…" : "Enviar diário de hoje ✓"}
      </button>
      <button type="button" onClick={onBack} className="w-full mt-3 text-muted py-2 text-sm hover:text-primary">
        ↩ refazer
      </button>
    </div>
  );
}

function Confirmacao({ onReset }: { onReset: () => void }) {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md text-center animate-rise">
        <div className="w-20 h-20 mx-auto rounded-full bg-primarySoftStrong text-primary grid place-items-center mb-6 text-3xl">✓</div>
        <h1 className="text-3xl font-semibold tracking-tight text-text mb-3">
          Recebido, <span className="text-primary">Maria.</span>
        </h1>
        <p className="text-muted leading-relaxed mb-8">
          Seus dados foram registrados com hash chain. A Dra. Ana Beatriz vê isso em tempo real.
          <br /><br />
          <span className="text-primary">Próximo lembrete:</span> amanhã às 20h.
        </p>
        <button onClick={onReset} className="text-sm text-muted hover:text-primary">
          ↻ registrar outro
        </button>
      </div>
    </main>
  );
}

function questionFor(k: string): string {
  return ({ dor: "Sua dor agora?", sono: "Como dormiu?", ansiedade: "Sua ansiedade agora?", humor: "Como está seu humor?" } as Record<string, string>)[k] ?? "Como está?";
}

function labelFor(n: number, k: string): string {
  if (k === "humor" || k === "sono") {
    if (n <= 2) return "péssimo";
    if (n <= 4) return "ruim";
    if (n <= 6) return "ok";
    if (n <= 8) return "bom";
    return "ótimo";
  }
  if (n === 0) return "ausente";
  if (n <= 3) return "leve";
  if (n <= 5) return "moderado";
  if (n <= 7) return "intenso";
  return "incapacitante";
}
