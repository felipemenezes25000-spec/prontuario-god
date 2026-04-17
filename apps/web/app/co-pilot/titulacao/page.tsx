"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { callTitulacao } from "@/lib/api";
import { enriquecerEvidencia } from "@/lib/evidencia";
import { useToast } from "@/providers/ToastProvider";

interface TitulacaoResult {
  protocolo_recomendado: "routine" | "conservative" | "rapid";
  protocolo_justificativa: string;
  produto_sugerido: { tipo: string; via_administracao: string; razao: string };
  dose_inicial: { cbd_mg: number; thc_mg: number | null; frequencia_diaria: number; via: string };
  ramp_up: { dia: number; cbd_mg_dia: number; thc_mg_dia: number | null; observacao: string }[];
  red_flags_interacoes: { medicamento: string; severidade: string; mecanismo: string; recomendacao: string }[];
  alerta_compliance: { receita_tipo: "A" | "B"; via_regulatoria: string; observacao_cfm: string | null };
  evidencia: { nivel: string; referencias: string[] };
  proximos_passos: string[];
  disclaimer: string;
}

const INDICACOES = [
  { v: "fibromialgia", l: "Fibromialgia" },
  { v: "dor_cronica", l: "Dor crônica" },
  { v: "ansiedade", l: "Ansiedade" },
  { v: "insonia", l: "Insônia" },
  { v: "epilepsia_refrataria", l: "Epilepsia refratária" },
  { v: "esclerose_multipla", l: "Esclerose múltipla" },
  { v: "lupus", l: "Lúpus" },
  { v: "autismo", l: "Autismo" },
  { v: "parkinson", l: "Parkinson" },
  { v: "cancer_dor", l: "Câncer (dor)" },
  { v: "endometriose", l: "Endometriose" },
];

const ESPECIALIDADES = [
  { v: "neurologia", l: "Neurologia" },
  { v: "neurologia_pediatrica", l: "Neuro pediátrica" },
  { v: "psiquiatria", l: "Psiquiatria" },
  { v: "dor", l: "Dor" },
  { v: "oncologia", l: "Oncologia" },
  { v: "geriatria", l: "Geriatria" },
  { v: "outra", l: "Outra" },
];

export default function CoPilotPage() {
  const [indicacao, setIndicacao] = useState("fibromialgia");
  const [idade, setIdade] = useState("47");
  const [peso, setPeso] = useState("68");
  const [especialidade, setEspecialidade] = useState("dor");
  const [comorbidades, setComorbidades] = useState("depressão moderada");
  const [meds, setMeds] = useState("duloxetina 60mg/dia, pregabalina 150mg 2x/dia");
  const [tentativas, setTentativas] = useState("amitriptilina sem resposta, fisioterapia sem alívio");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TitulacaoResult | null>(null);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await callTitulacao({
        indicacao,
        idade: Number(idade),
        peso_kg: Number(peso),
        especialidade_prescritor: especialidade,
        comorbidades: split(comorbidades),
        medicamentos_em_uso: split(meds),
        tentativas_previas: split(tentativas),
        alergias: [],
      });
      setResult(data);
      const flagsMsg =
        data.red_flags_interacoes.length > 0
          ? ` · ${data.red_flags_interacoes.length} interação(ões)`
          : "";
      toast.show(`Protocolo ${protocoloPtBr(data.protocolo_recomendado)} sugerido${flagsMsg}`, "success");
    } catch (err) {
      toast.show("Falha ao consultar Co-Pilot: " + (err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <Topbar
        subtitle="Conte sobre o paciente e receba um protocolo personalizado em segundos"
      />

      <div className="px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* FORM */}
        <Card className="xl:col-span-5">
          <CardHeader title="Caso clínico" subtitle="Dados básicos para o coorte cruzar" />
          <form onSubmit={submit} className="space-y-5">
            <Field label="Indicação clínica">
              <Select value={indicacao} onChange={setIndicacao} options={INDICACOES} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Idade (anos)">
                <Input type="number" value={idade} onChange={setIdade} />
              </Field>
              <Field label="Peso (kg)">
                <Input type="number" value={peso} onChange={setPeso} />
              </Field>
            </div>

            <Field label="Especialidade do prescritor">
              <Select value={especialidade} onChange={setEspecialidade} options={ESPECIALIDADES} />
            </Field>

            <Field label="Comorbidades" hint="separe por vírgula">
              <TextArea value={comorbidades} onChange={setComorbidades} rows={2} />
            </Field>

            <Field label="Medicamentos em uso" hint="motor de regras cruza interações automaticamente">
              <TextArea value={meds} onChange={setMeds} rows={2} />
            </Field>

            <Field label="Tentativas terapêuticas prévias">
              <TextArea value={tentativas} onChange={setTentativas} rows={2} />
            </Field>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulseSoft" />
                  consultando o coorte…
                </>
              ) : (
                <>Sugerir titulação <span>→</span></>
              )}
            </Button>
          </form>
        </Card>

        {/* RESULT */}
        <div className="xl:col-span-7">
          {loading ? <LoadingState /> : result ? <ResultPanel result={result} /> : <EmptyState />}
        </div>
      </div>
    </AppShell>
  );
}

function split(s: string): string[] {
  return s.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
}

function protocoloPtBr(p: "routine" | "conservative" | "rapid"): string {
  return { routine: "Padrão", conservative: "Conservador", rapid: "Rápido" }[p];
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-text">{label}</span>
        {hint && <span className="text-[11px] text-muted italic">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-text font-mono tnum"
    />
  );
}

function TextArea({ value, onChange, rows }: { value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-text resize-none"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-text"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}

function ResultPanel({ result }: { result: TitulacaoResult }) {
  return (
    <div className="space-y-6 animate-rise">
      {/* Hero */}
      <Card>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-xs text-muted">Protocolo recomendado</div>
            <h2 className="text-3xl font-semibold text-text tracking-tight mt-1">
              {protocoloPtBr(result.protocolo_recomendado)}
            </h2>
          </div>
          <div className="text-right">
            <Badge tone={result.alerta_compliance.receita_tipo === "A" ? "warm" : "primary"}>
              Receita Tipo {result.alerta_compliance.receita_tipo}
            </Badge>
            <div className="text-[11px] text-muted mt-1">
              via {result.alerta_compliance.via_regulatoria.replace(/_/g, " ")}
            </div>
          </div>
        </div>
        <p className="text-sm text-text leading-relaxed">{result.protocolo_justificativa}</p>
      </Card>

      {/* Produto / dose / via */}
      <div className="grid grid-cols-3 gap-4">
        <Card padded={false} className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted">Produto</div>
          <div className="text-base font-medium text-text mt-1">{result.produto_sugerido.tipo}</div>
        </Card>
        <Card padded={false} className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted">Via</div>
          <div className="text-base font-medium text-text mt-1 capitalize">{result.produto_sugerido.via_administracao}</div>
        </Card>
        <Card padded={false} className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted">Dose inicial</div>
          <div className="text-base font-medium text-text mt-1 font-mono tnum">
            {result.dose_inicial.cbd_mg}mg · {result.dose_inicial.frequencia_diaria}×/dia
          </div>
        </Card>
      </div>

      {/* Escadinha */}
      <Card>
        <CardHeader title="Escalonamento" subtitle="Comece baixo, vá devagar — incrementos seguros baseados em consenso clínico" />
        <RampStaircase steps={result.ramp_up} />
      </Card>

      {/* Red flags */}
      {result.red_flags_interacoes.length > 0 && (
        <Card>
          <CardHeader title="⚠ Interações sinalizadas" subtitle="Detectadas pelo motor de regras — exigem vigilância clínica" />
          <div className="space-y-3">
            {result.red_flags_interacoes.map((f, i) => (
              <RedFlag key={i} flag={f} />
            ))}
          </div>
        </Card>
      )}

      {/* Compliance + evidência + próximos passos */}
      {result.alerta_compliance.observacao_cfm && (
        <Card className="border-l-4 border-l-warm">
          <div className="text-xs font-semibold text-warm uppercase tracking-wide mb-1">CFM · observação</div>
          <p className="text-sm text-text">{result.alerta_compliance.observacao_cfm}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Próximos passos" />
          <ol className="space-y-2.5">
            {result.proximos_passos.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-text">
                <span className="text-primary font-mono tnum text-xs mt-0.5">{(i + 1).toString().padStart(2, "0")}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <CardHeader title="Evidência científica" subtitle="Clique em uma referência para abrir o artigo original no PubMed" />
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xs text-muted">Nível</span>
            <span className="text-2xl font-semibold text-primary">{result.evidencia.nivel}</span>
          </div>
          <div className="space-y-2.5">
            {result.evidencia.referencias.map((r, i) => (
              <ReferenciaCard key={i} idx={i + 1} raw={r} />
            ))}
          </div>
        </Card>
      </div>

      <p className="text-[11px] text-subtle leading-relaxed pt-4">{result.disclaimer}</p>
    </div>
  );
}

function RampStaircase({ steps }: { steps: TitulacaoResult["ramp_up"] }) {
  const max = Math.max(...steps.map((s) => s.cbd_mg_dia + (s.thc_mg_dia ?? 0)));
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const cbdPct = (s.cbd_mg_dia / max) * 100;
        const thcPct = ((s.thc_mg_dia ?? 0) / max) * 100;
        return (
          <div key={i} className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-1 text-xs font-mono tnum text-primary font-medium">D{s.dia}</div>
            <div className="col-span-3 text-xs font-mono tnum text-text">
              {s.cbd_mg_dia}<span className="text-muted">mg CBD</span>
              {s.thc_mg_dia ? (
                <span className="text-warm"> +{s.thc_mg_dia}<span className="text-muted">mg THC</span></span>
              ) : null}
            </div>
            <div className="col-span-4 relative h-7 bg-bg rounded-md overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${cbdPct}%` }} />
              {s.thc_mg_dia ? (
                <div className="absolute inset-y-0 bg-warm" style={{ left: `${cbdPct}%`, width: `${thcPct}%` }} />
              ) : null}
            </div>
            <div className="col-span-4 text-xs text-muted italic">{s.observacao}</div>
          </div>
        );
      })}
    </div>
  );
}

function RedFlag({ flag }: { flag: TitulacaoResult["red_flags_interacoes"][number] }) {
  const tone = flag.severidade === "critica" || flag.severidade === "alta" ? "danger" : "warm";
  return (
    <div className={clsx(
      "border-l-4 rounded-r-lg p-4",
      tone === "danger" ? "border-l-danger bg-dangerSoft/40" : "border-l-warm bg-warmSoft/40",
    )}>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-sm font-semibold text-text">{flag.medicamento}</div>
        <Badge tone={tone}>{flag.severidade}</Badge>
      </div>
      <p className="text-xs text-text mb-2">{flag.mecanismo}</p>
      <p className="text-xs text-muted italic">→ {flag.recomendacao}</p>
    </div>
  );
}

function ReferenciaCard({ idx, raw }: { idx: number; raw: string }) {
  const ev = enriquecerEvidencia(raw);
  const [open, setOpen] = useState(false);
  const temResumo = Boolean(ev.titulo_pt || ev.resumo_pt);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!temResumo}
        className={clsx(
          "w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors",
          temResumo ? "hover:bg-primarySoft cursor-pointer" : "cursor-default",
        )}
      >
        <span className="text-[11px] font-mono tnum text-primary font-semibold shrink-0 mt-0.5">
          {idx.toString().padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text font-medium leading-snug">
            {ev.titulo_pt ?? ev.raw}
          </div>
          {(ev.autores || ev.ano) && (
            <div className="text-[11px] text-muted mt-0.5">
              {ev.autores}{ev.ano ? ` · ${ev.ano}` : ""}
              {ev.id && ev.tipo !== "texto" && <span className="ml-2 font-mono tnum text-primary">{ev.id}</span>}
            </div>
          )}
        </div>
        {temResumo && <span className="text-muted text-xs mt-1">{open ? "−" : "▸"}</span>}
      </button>

      {open && temResumo && (
        <div className="px-3 pb-3 pt-0 border-t border-border bg-bg/50 animate-rise">
          {ev.resumo_pt && (
            <p className="text-xs text-text leading-relaxed mt-3">{ev.resumo_pt}</p>
          )}
          {ev.link && (
            <a
              href={ev.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-primary hover:text-primaryHover"
            >
              Ler artigo completo (em inglês) ↗
            </a>
          )}
        </div>
      )}
      {!temResumo && ev.link && (
        <a
          href={ev.link}
          target="_blank"
          rel="noreferrer"
          className="block px-3 pb-2 pt-0 text-xs font-medium text-primary hover:text-primaryHover"
        >
          Abrir no PubMed ↗
        </a>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="h-full flex flex-col items-center justify-center text-center min-h-[480px]">
      <div className="w-14 h-14 rounded-full bg-primarySoft flex items-center justify-center text-primary mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
      </div>
      <h3 className="text-lg font-semibold text-text">Aguardando o caso clínico</h3>
      <p className="text-sm text-muted max-w-sm mt-2">
        Preencha o formulário ao lado. O Co-Pilot vai cruzar com o consenso Delphi 2021,
        motor de regras de interações e coorte BR — em <span className="text-primary font-medium">menos de 3 segundos</span>.
      </p>
    </Card>
  );
}

function LoadingState() {
  const STAGES = [
    "Verificando interações no motor de regras…",
    "Cruzando perfil com coorte BR (1.247 pacientes)…",
    "Consultando consenso Delphi 2021…",
    "Personalizando ramp-up para o paciente…",
    "Validando compliance ANVISA + CFM…",
  ];
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1100);
    return () => clearInterval(id);
  }, []);
  return (
    <Card className="h-full flex flex-col items-center justify-center text-center min-h-[480px]">
      <div className="w-14 h-14 rounded-full bg-primarySoft flex items-center justify-center text-primary mb-6 animate-pulseSoft">
        <span className="text-2xl">✦</span>
      </div>
      <h3 className="text-base text-text font-medium mb-1 min-h-[2em]">{STAGES[stage]}</h3>
      <div className="mt-6 flex items-center gap-1.5">
        {STAGES.map((_, i) => (
          <span
            key={i}
            className={clsx(
              "h-1 rounded-full transition-all duration-500",
              i === stage ? "w-8 bg-primary" : i < stage ? "w-4 bg-primary/30" : "w-4 bg-border",
            )}
          />
        ))}
      </div>
    </Card>
  );
}
