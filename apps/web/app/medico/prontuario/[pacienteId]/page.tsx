"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/decorative/Sparkline";
import { useToast } from "@/providers/ToastProvider";
import { useVoiceInput } from "@/hooks/useVoice";
import { getPacienteFull, postConsulta, type PacienteFull } from "@/lib/api";
import { ConsultaIAAvancada } from "@/components/medical/ConsultaIAAvancada";

type TabId = "consulta-ia" | "timeline" | "tracker" | "ficha";

export default function ProntuarioPage() {
  const params = useParams<{ pacienteId: string }>();
  const pacienteId = params.pacienteId;
  const toast = useToast();

  const [data, setData] = useState<PacienteFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("consulta-ia");

  async function reload() {
    try {
      const d = await getPacienteFull(pacienteId);
      setData(d);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [pacienteId]);

  if (loading) return <AppShell><Topbar title="Carregando…" /><Skeleton /></AppShell>;
  if (error || !data) return <AppShell><Topbar title="Prontuário" /><ErrorState msg={error ?? "vazio"} /></AppShell>;

  return (
    <AppShell>
      <Topbar title="Prontuário do paciente" />

      <div className="px-4 lg:px-8 pt-4 pb-8 max-w-[1600px] w-full mx-auto">
        {/* HERO ESTRIP — patient header compacto */}
        <HeroStrip data={data} />

        {/* TABS + rail */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          {/* Main */}
          <div>
            <TabBar value={tab} onChange={setTab} counts={{
              "consulta-ia": 0,
              timeline: data.eventos.length + data.prescricoes.length,
              tracker: data.tracker_logs.length,
              ficha: 0,
            }} />

            <div className="mt-4">
              {tab === "consulta-ia" && <ConsultaIAAvancada pacienteNome={data.paciente.nome_completo} />}
              {tab === "timeline" && <Timeline data={data} />}
              {tab === "tracker" && <TrackerTab logs={data.tracker_logs} />}
              {tab === "ficha" && <FichaTab paciente={data.paciente} prontuario={data.prontuario} />}
            </div>
          </div>

          {/* Right rail — sticky */}
          <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
            <NovaConsulta
              prontuarioId={data.prontuario.id}
              onCreated={async () => { await reload(); toast.show("Consulta registrada · SOAP gerado por IA", "success"); }}
            />
            <AskAboutPatient nome={data.paciente.nome_completo} eventos={data.eventos.length} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

// =========== HERO STRIP ==============

function HeroStrip({ data }: { data: PacienteFull }) {
  const idade = calcularIdade(data.paciente.data_nascimento);

  const dorSpark = useMemo(() =>
    data.tracker_logs.slice().reverse().slice(-14).map((l) => l.sintomas.dor ?? 5),
    [data.tracker_logs],
  );
  const dorAgora = dorSpark[dorSpark.length - 1];
  const dorInicial = dorSpark[0];
  const deltaPct = dorInicial && dorInicial > 0
    ? Math.round(((dorInicial - (dorAgora ?? 0)) / dorInicial) * 100)
    : 0;

  const prescricaoAtiva = data.prescricoes[0];
  const protocoloDose = prescricaoAtiva
    ? `${prescricaoAtiva.dose_alvo_mg_dia} mg/dia`
    : "—";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 lg:p-6 shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-full bg-primary text-white grid place-items-center text-lg font-semibold shrink-0">
            {initials(data.paciente.nome_completo)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-semibold text-text tracking-tight truncate">
                {data.paciente.nome_completo}
              </h1>
              {data.prontuario.evidencia_indicacao && (
                <Badge tone="primary">Evidência {data.prontuario.evidencia_indicacao}</Badge>
              )}
            </div>
            <div className="mt-1 text-sm text-muted flex items-center gap-x-3 gap-y-0.5 flex-wrap">
              <span><span className="text-text font-medium">{idade}</span> anos</span>
              <span>·</span>
              <span><span className="text-text font-medium">{data.paciente.peso_kg}</span>kg</span>
              {data.prontuario.cid10_principal && (
                <>
                  <span>·</span>
                  <span>CID <span className="font-mono tnum text-text">{data.prontuario.cid10_principal}</span></span>
                </>
              )}
              <span>·</span>
              <span>CPF <span className="font-mono tnum text-text">{formatCpf(data.paciente.cpf)}</span></span>
            </div>
          </div>
        </div>

        {/* Divider vertical (desktop) */}
        <div className="hidden lg:block w-px h-14 bg-border" />

        {/* Mini stats inline */}
        <div className="grid grid-cols-3 lg:flex lg:items-center gap-5 lg:gap-6">
          <MiniStat
            label="Protocolo"
            value={prescricaoAtiva ? "Padrão" : "—"}
            hint={protocoloDose}
          />
          <MiniStat
            label={`Dor · ${dorSpark.length}d`}
            value={dorAgora !== undefined ? dorAgora.toFixed(1) : "—"}
            hint={deltaPct !== 0 ? `${deltaPct > 0 ? "−" : "+"}${Math.abs(deltaPct)}%` : ""}
            tone={deltaPct > 0 ? "success" : "neutral"}
          />
          <MiniStat
            label="Logs"
            value={data.tracker_logs.length.toString()}
            hint={data.tracker_logs[0] ? `há ${diffHoras(data.tracker_logs[0].criado_em)}` : "—"}
          />
        </div>

        {/* Sparkline inline */}
        {dorSpark.length > 1 && (
          <div className="hidden md:block min-w-0 flex-1 lg:max-w-[280px]">
            <div className="text-[10px] uppercase tracking-wide text-muted mb-1">Evolução da dor</div>
            <Sparkline values={dorSpark} color="#14b8a6" width={280} height={40} showRange showLast={false} className="w-full" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button href="/co-pilot/titulacao" variant="secondary" size="sm">Titulação</Button>
          <Button href="/medico/receita" variant="primary" size="sm">+ Receita</Button>
        </div>
      </div>

      {/* Resumo clínico */}
      {data.prontuario.resumo_atual && (
        <div className="mt-5 pt-4 border-t border-border text-sm text-text leading-relaxed">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted mr-2">Resumo</span>
          {data.prontuario.resumo_atual}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint?: string; tone?: "neutral" | "success" }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="text-lg font-semibold text-text stat-num leading-tight">{value}</div>
      {hint && (
        <div className={clsx(
          "text-[11px] mt-0.5",
          tone === "success" ? "text-success font-medium" : "text-muted",
        )}>
          {hint}
        </div>
      )}
    </div>
  );
}

// =========== TABS ==============

function TabBar({ value, onChange, counts }: { value: TabId; onChange: (t: TabId) => void; counts: Record<TabId, number> }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "consulta-ia", label: "✨ Consulta IA" },
    { id: "timeline", label: "Histórico" },
    { id: "tracker", label: "Diário" },
    { id: "ficha", label: "Ficha clínica" },
  ];
  return (
    <div className="border-b border-border flex items-center gap-0 overflow-x-auto">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
              active ? "text-primary" : "text-muted hover:text-text",
            )}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span className={clsx(
                "ml-2 text-[10px] font-mono tnum px-1.5 py-0.5 rounded-full",
                active ? "bg-primarySoft text-primaryText" : "bg-bg text-muted",
              )}>
                {counts[t.id]}
              </span>
            )}
            {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

// =========== TIMELINE ==============

function Timeline({ data }: { data: PacienteFull }) {
  const items = useMemo(() => {
    const merged = [
      ...data.eventos.map((e) => ({ kind: "evento" as const, ts: e.criado_em, data: e })),
      ...data.prescricoes.map((p) => ({ kind: "prescricao" as const, ts: p.criado_em, data: p })),
    ];
    return merged.sort((a, b) => b.ts.localeCompare(a.ts));
  }, [data]);

  if (items.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="text-sm text-muted">Ainda não há consultas ou receitas.</div>
        <div className="text-xs text-subtle mt-1">Registre a primeira consulta no painel à direita.</div>
      </Card>
    );
  }

  return (
    <ol className="relative border-l-2 border-border pl-6 space-y-5 ml-2">
      {items.map((item, i) => <TimelineItem key={`${item.kind}-${i}`} item={item} />)}
    </ol>
  );
}

function TimelineItem({ item }: { item:
  | { kind: "evento"; ts: string; data: PacienteFull["eventos"][number] }
  | { kind: "prescricao"; ts: string; data: PacienteFull["prescricoes"][number] };
}) {
  const meta = {
    evento: { color: "bg-primary text-white", label: "Consulta" },
    prescricao: { color: "bg-warm text-white", label: "Receita" },
  }[item.kind];

  return (
    <li className="relative">
      <span className={clsx("absolute -left-[34px] top-0.5 w-5 h-5 rounded-full border-2 border-bg grid place-items-center text-[10px]", meta.color)}>
        {item.kind === "evento" ? "✱" : "℞"}
      </span>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wide">{meta.label}</span>
        <span className="text-[11px] text-subtle font-mono tnum">{formatDataHora(item.ts)}</span>
      </div>
      {item.kind === "evento" && <EventoCard e={item.data} />}
      {item.kind === "prescricao" && <PrescricaoCard p={item.data} />}
    </li>
  );
}

function EventoCard({ e }: { e: PacienteFull["eventos"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const soap = (e.payload?.soap ?? null) as null | {
    subjetivo: string; objetivo: string; avaliacao: string; plano: string;
    cid10_sugeridos?: string[]; alertas?: string[];
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-text">
            {e.tipo === "nota_voz" ? "Consulta · nota de voz" : "Consulta"}
          </h4>
          <span className="text-muted text-xs">{expanded ? "−" : "▸"}</span>
        </div>
        {!expanded && soap && (
          <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
            {soap.avaliacao} → {soap.plano}
          </p>
        )}
      </button>
      {expanded && soap && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <SoapCell label="S · Subjetivo" text={soap.subjetivo} />
          <SoapCell label="O · Objetivo" text={soap.objetivo} />
          <SoapCell label="A · Avaliação" text={soap.avaliacao} />
          <SoapCell label="P · Plano" text={soap.plano} />
          {soap.cid10_sugeridos && soap.cid10_sugeridos.length > 0 && (
            <div className="col-span-full flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-muted self-center">CID:</span>
              {soap.cid10_sugeridos.map((c, i) => <Badge key={i} tone="primary">{c}</Badge>)}
            </div>
          )}
          {soap.alertas && soap.alertas.length > 0 && (
            <div className="col-span-full">
              {soap.alertas.map((a, i) => (
                <div key={i} className="text-xs text-warm bg-warmSoft/40 px-2.5 py-1.5 rounded-md mb-1.5">⚠ {a}</div>
              ))}
            </div>
          )}
        </div>
      )}
      {expanded && !soap && e.transcricao && (
        <p className="mt-3 text-sm text-text leading-relaxed">{e.transcricao}</p>
      )}
    </div>
  );
}

function SoapCell({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-1">{label}</div>
      <div className="text-text leading-snug">{text}</div>
    </div>
  );
}

function PrescricaoCard({ p }: { p: PacienteFull["prescricoes"][number] }) {
  const isImportada = p.via_regulatoria === "anvisa_rdc_660_importacao";
  return (
    <div className="bg-warmSoft/30 border border-warm/30 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h4 className="text-sm font-semibold text-text min-w-0">{p.produto_descricao}</h4>
        <Badge tone="warm">Tipo {p.tipo_receita}</Badge>
      </div>
      <div className="text-xs text-muted flex items-center gap-x-3 gap-y-0.5 flex-wrap">
        <span><span className="font-mono tnum text-text">{p.dose_alvo_mg_dia}</span> mg/dia</span>
        <span>·</span>
        <span><span className="font-mono tnum text-text">{p.duracao_dias}</span> dias</span>
        {isImportada && p.validade_660_ate && (
          <>
            <span>·</span>
            <span>RDC 660 até <span className="font-mono tnum text-text">{p.validade_660_ate}</span></span>
          </>
        )}
      </div>
    </div>
  );
}

// =========== TRACKER TAB ==============

function TrackerTab({ logs }: { logs: PacienteFull["tracker_logs"] }) {
  if (logs.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="text-sm text-muted">Paciente ainda não registrou logs.</div>
      </Card>
    );
  }
  const ordered = logs.slice().reverse(); // cronológico antigo→novo
  const mk = (k: string) => ordered.map((l) => l.sintomas[k] ?? null).filter((v): v is number => v !== null);

  const sintomas = [
    { k: "dor", l: "Dor", color: "#ef4444" },
    { k: "sono", l: "Sono", color: "#10b981" },
    { k: "ansiedade", l: "Ansiedade", color: "#f59e0b" },
    { k: "humor", l: "Humor", color: "#0ea5e9" },
  ];

  return (
    <div className="space-y-4">
      {/* Sparklines por sintoma */}
      <Card>
        <h3 className="text-sm font-semibold text-text mb-4">Evolução por sintoma — {logs.length} logs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sintomas.map((s) => {
            const values = mk(s.k);
            if (values.length < 2) return null;
            const first = values[0]!;
            const last = values[values.length - 1]!;
            const delta = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
            const isPositive = s.k === "humor" || s.k === "sono" ? delta > 0 : delta < 0;
            return (
              <div key={s.k} className="bg-bg rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted">{s.l}</div>
                    <div className="text-xl font-semibold stat-num">{last.toFixed(1)}<span className="text-muted text-xs">/10</span></div>
                  </div>
                  <div className={clsx("text-xs font-mono tnum font-medium", isPositive ? "text-success" : "text-danger")}>
                    {delta > 0 ? "+" : ""}{delta}%
                  </div>
                </div>
                <Sparkline values={values} color={s.color} width={280} height={32} className="w-full" showLast={false} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Últimos logs */}
      <Card padded={false}>
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-text">Últimos registros</h3>
        </div>
        <div className="border-t border-border">
          {logs.slice(0, 15).map((l, i) => (
            <div key={l.id} className={clsx(
              "px-5 py-3 flex items-center gap-4 flex-wrap",
              i < logs.length - 1 && "border-b border-border",
            )}>
              <div className="text-[11px] font-mono tnum text-muted w-20 shrink-0">{formatDataHora(l.criado_em)}</div>
              <div className="flex items-center gap-5 flex-wrap text-sm flex-1 min-w-0">
                {Object.entries(l.sintomas).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted">{k}</div>
                    <div className="font-mono tnum text-text font-medium">{v}</div>
                  </div>
                ))}
              </div>
              {l.dose_mg !== undefined && (
                <div className="text-right ml-auto">
                  <div className="text-[10px] uppercase tracking-wide text-muted">dose</div>
                  <div className="text-sm font-mono tnum text-primary">{l.dose_mg}mg</div>
                </div>
              )}
              <Badge tone="neutral">{l.entrada_via}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// =========== FICHA TAB ==============

function FichaTab({ paciente, prontuario }: { paciente: PacienteFull["paciente"]; prontuario: PacienteFull["prontuario"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Identidade</h3>
        <dl className="space-y-2 text-sm">
          <Row label="Nome"><span className="text-text">{paciente.nome_completo}</span></Row>
          <Row label="CPF"><span className="font-mono tnum text-text">{formatCpf(paciente.cpf)}</span></Row>
          <Row label="Nascimento"><span className="font-mono tnum text-text">{formatNasc(paciente.data_nascimento)}</span></Row>
          {paciente.sexo_biologico && <Row label="Sexo"><span className="capitalize text-text">{paciente.sexo_biologico}</span></Row>}
          <Row label="Peso"><span className="font-mono tnum text-text">{paciente.peso_kg} kg</span></Row>
        </dl>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Diagnósticos</h3>
        {prontuario.cid10_principal ? (
          <div>
            <div className="text-xs text-muted mb-1">Principal</div>
            <Badge tone="primary">{prontuario.cid10_principal}</Badge>
            {prontuario.cid10_secundarios.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted mb-1">Secundários</div>
                <div className="flex flex-wrap gap-1.5">
                  {prontuario.cid10_secundarios.map((c, i) => <Badge key={i} tone="neutral">{c}</Badge>)}
                </div>
              </div>
            )}
            {prontuario.evidencia_indicacao && (
              <div className="mt-3">
                <div className="text-xs text-muted mb-1">Evidência cannabis</div>
                <Badge tone="primary">Nível {prontuario.evidencia_indicacao}</Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted italic">nenhum diagnóstico cadastrado</div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Comorbidades</h3>
        {paciente.comorbidades.length === 0 ? (
          <div className="text-xs text-muted italic">nenhuma</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {paciente.comorbidades.map((c, i) => <Badge key={i} tone="primary">{c}</Badge>)}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Medicamentos em uso</h3>
        {paciente.medicamentos_em_uso.length === 0 ? (
          <div className="text-xs text-muted italic">nenhum</div>
        ) : (
          <ul className="space-y-1.5">
            {paciente.medicamentos_em_uso.map((m, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm text-text">
                <span className="text-warm text-xs">℞</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="md:col-span-2">
        <h3 className="text-sm font-semibold text-text mb-3">Alergias</h3>
        {paciente.alergias.length === 0 ? (
          <div className="text-xs text-muted italic">nenhuma reportada</div>
        ) : (
          <ul className="space-y-1 text-sm text-danger">
            {paciente.alergias.map((a, i) => <li key={i}>⚠ {a}</li>)}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted shrink-0">{label}</dt>
      <dd className="text-sm text-right">{children}</dd>
    </div>
  );
}

// =========== NOVA CONSULTA (rail) ==============

function NovaConsulta({ prontuarioId, onCreated }: { prontuarioId: string; onCreated: () => Promise<void> }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const voice = useVoiceInput({ lang: "pt-BR" });

  useEffect(() => { if (voice.transcript) setTexto(voice.transcript); }, [voice.transcript]);

  async function submit() {
    if (texto.trim().length < 20) { setErro("Descreva com pelo menos 20 caracteres."); return; }
    setEnviando(true); setErro(null);
    try {
      await postConsulta(prontuarioId, { transcricao: texto, origem: voice.transcript ? "voz_transcrita" : "digitada" });
      setTexto(""); voice.reset();
      await onCreated();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="ring-1 ring-primary/20">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">+ Nova consulta</h2>
          <p className="text-[11px] text-muted">IA estrutura em SOAP</p>
        </div>
        {voice.supported && (
          <button
            onClick={voice.listening ? voice.stop : voice.start}
            className={clsx(
              "inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-colors shrink-0",
              voice.listening ? "border-primary bg-primary text-white mic-active" : "border-border text-muted hover:border-primary hover:text-primary",
            )}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
            </svg>
            {voice.listening ? "ouvindo…" : "falar"}
          </button>
        )}
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder='"Paciente refere melhora de 30% após 7d de CBD 10mg. Sono melhorou…"'
        rows={4}
        className="w-full bg-surface border border-border focus:border-primary outline-none p-2.5 text-text resize-none rounded-md text-xs leading-relaxed"
      />
      {erro && <div className="mt-2 text-[11px] text-danger">{erro}</div>}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted"><span className="font-mono tnum">{texto.length}</span> car.</span>
        <Button onClick={submit} disabled={enviando || texto.trim().length < 20} size="sm">
          {enviando ? "…" : "Estruturar SOAP →"}
        </Button>
      </div>
    </Card>
  );
}

// =========== IA CHAT (rail) ==============

function AskAboutPatient({ nome, eventos }: { nome: string; eventos: number }) {
  const [perguntas, setPerguntas] = useState<{ q: string; a: string }[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const firstName = nome.split(" ")[0];

  const sugeridas = [
    `${firstName} nas últimas 2 semanas?`,
    "Devo ajustar a dose?",
    "Resumo para próxima consulta?",
  ];

  function ask(q: string) {
    setInput(""); setThinking(true);
    setTimeout(() => {
      const respostas: Record<string, string> = {
        respond: `${firstName} está logando consistentemente. Dor caiu 62% em 28 dias. Humor subindo. Efeito colateral leve (boca seca) só nos primeiros 3d.`,
        dose: "Dado delta de −62% com 30mg/dia e tolerância boa, considere manter dose por 2 semanas antes de escalar para 40mg/dia.",
        resumo: `${firstName}, fibro + depressão moderada. Em CBD 30mg/dia há 28d. Melhora 62% BPI. Sono +167%. Sem eventos adversos. Plano: manter dose, avaliar redução duloxetina.`,
        semana: `${firstName} tem tendência clara de melhora. Dor mediana 3.2 (vs 8 basal). Logs diários 100%.`,
      };
      const key = Object.keys(respostas).find((k) => q.toLowerCase().includes(k));
      setPerguntas((arr) => [...arr, { q, a: key ? respostas[key]! : "Configure GEMINI_API_KEY para IA real sobre o prontuário." }]);
      setThinking(false);
    }, 700);
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-primarySoft grid place-items-center text-primary text-xs">✦</span>
        <div>
          <h3 className="text-sm font-semibold text-text leading-none">IA sobre {firstName}</h3>
          <p className="text-[10px] text-muted mt-0.5">{eventos} eventos indexados</p>
        </div>
      </div>

      <div className="bg-bg rounded-md p-3 mb-3 min-h-[140px] max-h-[32vh] overflow-y-auto space-y-2.5">
        {perguntas.length === 0 ? (
          <p className="text-[11px] text-muted italic">Pergunte qualquer coisa sobre {firstName}.</p>
        ) : (
          perguntas.map((x, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[11px] text-muted italic">» {x.q}</div>
              <div className="text-[12px] text-text leading-relaxed">
                <span className="text-primary">✦</span> {x.a}
              </div>
            </div>
          ))
        )}
        {thinking && (
          <div className="flex items-center gap-1 text-primary">
            <span>✦</span>
            <Dot delay={0} /><Dot delay={200} /><Dot delay={400} />
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) ask(input.trim()); }} className="flex gap-1.5 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ex: subir a dose?"
          className="flex-1 bg-surface border border-border focus:border-primary outline-none px-2.5 py-1.5 text-xs rounded-md"
        />
        <Button type="submit" size="sm">↩</Button>
      </form>

      <div className="space-y-1.5">
        {sugeridas.map((s, i) => (
          <button
            key={i}
            onClick={() => ask(s)}
            className="w-full text-left text-[11px] text-text hover:text-primaryText border border-border hover:border-primary/40 hover:bg-primarySoft px-2.5 py-1.5 rounded-md transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </Card>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block w-1 h-1 rounded-full bg-primary/60"
      style={{ animation: `pulseSoft 1s ease-in-out ${delay}ms infinite` }}
    />
  );
}

// =========== SKELETON / ERROR ==============

function Skeleton() {
  return (
    <div className="px-4 lg:px-8 py-6 animate-pulseSoft space-y-4 max-w-[1600px] mx-auto">
      <div className="h-28 bg-surface rounded-xl" />
      <div className="h-10 w-80 bg-surface rounded-lg" />
      <div className="h-96 bg-surface rounded-xl" />
    </div>
  );
}

function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="px-8 py-20 text-center">
      <div className="text-3xl font-semibold mb-2">Prontuário não encontrado</div>
      <p className="text-muted mb-6">{msg}</p>
      <Button href="/medico/dashboard">← painel</Button>
    </div>
  );
}

// =========== helpers ==============

function calcularIdade(dn: string): number {
  return Math.floor((Date.now() - new Date(dn).getTime()) / (365.25 * 24 * 3600 * 1000));
}
function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
function formatNasc(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function formatDataHora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function diffHoras(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / (3600 * 1000));
  if (h < 1) return "< 1h";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}
