"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/providers/ToastProvider";

/**
 * Consulta IA Avançada — página-vitrine do produto Meridiana.
 *
 * Componentes agregados em uma tela densa mas hierarquizada:
 * 1. Gravador de voz com waveform animado + timer
 * 2. Transcrição Whisper ao vivo (streaming simulado)
 * 3. Sintomas extraídos com confidence
 * 4. Red flags automáticos (dor intensa, ideação suicida, EA grave)
 * 5. Sugestão de CID com top-3
 * 6. Interações medicamentosas
 * 7. SOAP 4-seções gerado
 * 8. Calculadora de dose recomendada
 * 9. Comparação com cohort k-anonymized
 * 10. Preview de receita ANVISA + assinatura ICP-Brasil
 * 11. Exames laboratoriais sugeridos
 * 12. Resumo executivo das últimas N consultas
 */

// Script clínico realista que vai "sendo transcrito" (simula Whisper ao vivo)
const TRANSCRIPT_SCRIPT: { t: string; autor: "medica" | "paciente"; texto: string }[] = [
  { t: "00:03", autor: "medica", texto: "Maria, como você está? Conta pra mim como foram esses 14 dias." },
  { t: "00:12", autor: "paciente", texto: "Dra., muito melhor. A dor reduziu bastante." },
  { t: "00:16", autor: "paciente", texto: "Estou dormindo a noite toda agora, sem acordar." },
  { t: "00:22", autor: "medica", texto: "Que bom. De 0 a 10, como estaria a dor hoje?" },
  { t: "00:28", autor: "paciente", texto: "Hoje uns 3 ou 4. Antes ficava em 7, 8 o dia todo." },
  { t: "00:36", autor: "paciente", texto: "Mas continuo tomando a duloxetina junto, e a pregabalina de 150 duas vezes." },
  { t: "00:44", autor: "medica", texto: "E a dose do CBD, você está tomando certinho?" },
  { t: "00:48", autor: "paciente", texto: "20mg de manhã e 20 à noite, como você passou." },
  { t: "00:54", autor: "paciente", texto: "Às vezes sinto um pouco de sonolência pela manhã, mas passa rapido." },
  { t: "01:02", autor: "medica", texto: "Ok. Humor, ansiedade, tem notado alguma mudança?" },
  { t: "01:08", autor: "paciente", texto: "Ansiedade melhorou muito. Consigo trabalhar o dia todo agora." },
  { t: "01:14", autor: "medica", texto: "Algum efeito colateral além da sonolência?" },
  { t: "01:18", autor: "paciente", texto: "Não, só isso mesmo. Boca seca de vez em quando." },
];

// Sintomas extraídos progressivamente (dependem do texto)
const SINTOMAS_DETECTADOS = [
  { nome: "Dor crônica", valor: 4, valor_anterior: 7.5, trend: "down", confidence: 97 },
  { nome: "Sono", valor: 8, valor_anterior: 4, trend: "up", confidence: 94 },
  { nome: "Ansiedade", valor: 3, valor_anterior: 7, trend: "down", confidence: 91 },
  { nome: "Sonolência matinal", valor: 2, valor_anterior: 0, trend: "up", confidence: 88, flag: "efeito colateral leve" },
  { nome: "Xerostomia", valor: 1, valor_anterior: 0, trend: "up", confidence: 82, flag: "efeito colateral" },
];

// Interações detectadas
const INTERACOES = [
  { severidade: "leve", drugs: "CBD 20mg/d + Duloxetina 60mg/d", efeito: "CBD inibe CYP2D6 → pode aumentar concentração de duloxetina em ~15%. Monitorar sonolência.", acao: "Manter, monitorar" },
  { severidade: "leve", drugs: "CBD + Pregabalina 300mg/d", efeito: "Potencialização leve do efeito sedativo. Pode explicar sonolência matinal.", acao: "Considerar reduzir pregabalina para 225mg/d" },
];

// CIDs sugeridos com confiança
const CID_SUGERIDOS = [
  { cid: "M79.7", desc: "Fibromialgia", conf: 98, atual: true },
  { cid: "F32.1", desc: "Depressão moderada (comorbidade)", conf: 76, atual: true },
  { cid: "G47.0", desc: "Insônia (resolvida)", conf: 42, atual: false },
];

// SOAP gerado (chunks que vão aparecendo)
const SOAP_CHUNKS = {
  S: "Paciente refere melhora significativa da dor (7→4 na EVA), normalização do padrão de sono, redução da ansiedade. Adesão plena ao CBD 20mg BID. Mantém duloxetina 60mg/d e pregabalina 150mg BID. Efeito adverso leve: sonolência matinal autolimitada + xerostomia esporádica.",
  O: "Consulta de retorno 14 dias pós ajuste. Pacient lúcida, orientada, deambulando sem auxílio. Sem sinais de intoxicação ou hipotensão postural. Peso estável (68kg). PA 118x74. Exame físico sem alterações.",
  A: "Fibromialgia (M79.7) em boa resposta à titulação CBD 20:1, 40mg/dia. Comorbidade depressão (F32.1) controlada. Efeitos adversos brandos, sem indicação de suspensão. Cohort Meridiana (n=23) mostra TTE médio 12d — paciente dentro do esperado.",
  P: "1) Manter CBD full-spectrum 20mg sublingual BID; 2) Considerar reduzir pregabalina para 225mg/d em 15d se sonolência persistir; 3) Solicitar função hepática + hemograma controle; 4) Retorno em 30d; 5) Orientar registro contínuo no tracker app.",
};

const EXAMES_SUGERIDOS = [
  { exame: "Função hepática (AST, ALT, GGT)", motivo: "Controle 3 meses pós início CBD (CYP450)", prazo: "em 15 dias" },
  { exame: "Hemograma completo", motivo: "Screening rotina uso crônico", prazo: "em 15 dias" },
  { exame: "Beck Depression Inventory", motivo: "Reavaliar comorbidade F32.1", prazo: "próxima consulta" },
];

const HISTORICO_CONSULTAS = [
  { data: "17/mar", titulo: "Titulação inicial — 10mg BID", notas: "Iniciou Greencare 50mg/mL. Dor 8, sono ruim, ansiedade 8." },
  { data: "31/mar", titulo: "1ª revisão — +10mg BID", notas: "Dor 6. Sono melhorando. Sem efeitos. Aumentada para 20mg BID." },
  { data: "17/abr", titulo: "Consulta atual (hoje)", notas: "Dor 4, sono 8, ansiedade 3. Efeitos mínimos.", atual: true },
];

export function ConsultaIAAvancada({ pacienteNome }: { pacienteNome: string }) {
  const toast = useToast();
  const [gravando, setGravando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [transcript, setTranscript] = useState<typeof TRANSCRIPT_SCRIPT>([]);
  const [sintomasVisiveis, setSintomasVisiveis] = useState<number>(0);
  const [soapGenerado, setSoapGenerado] = useState({ S: "", O: "", A: "", P: "" });
  const [finalizada, setFinalizada] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Timer de gravação
  useEffect(() => {
    if (!gravando) return;
    const id = setInterval(() => setTempo((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [gravando]);

  // Transcrição streaming simulada
  useEffect(() => {
    if (!gravando) return;
    const idx = transcript.length;
    if (idx >= TRANSCRIPT_SCRIPT.length) return;
    const next = TRANSCRIPT_SCRIPT[idx];
    if (!next) return;
    const delay = 2500 + Math.random() * 1500;
    const id = setTimeout(() => {
      setTranscript((t) => [...t, next]);
      // Atualiza sintomas proporcionalmente ao progresso
      const progresso = Math.min(SINTOMAS_DETECTADOS.length, Math.ceil(((idx + 1) / TRANSCRIPT_SCRIPT.length) * SINTOMAS_DETECTADOS.length));
      setSintomasVisiveis(progresso);
      // Scroll auto
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, delay);
    return () => clearTimeout(id);
  }, [gravando, transcript.length]);

  // Geração progressiva do SOAP ao final
  useEffect(() => {
    if (!finalizada) return;
    const secoes: (keyof typeof SOAP_CHUNKS)[] = ["S", "O", "A", "P"];
    secoes.forEach((sec, i) => {
      setTimeout(() => {
        setSoapGenerado((s) => ({ ...s, [sec]: SOAP_CHUNKS[sec] }));
      }, i * 1500);
    });
  }, [finalizada]);

  function iniciar() {
    setGravando(true);
    setTempo(0);
    setTranscript([]);
    setSintomasVisiveis(0);
    setSoapGenerado({ S: "", O: "", A: "", P: "" });
    setFinalizada(false);
    toast.show("🎙 Gravação iniciada · Whisper self-hosted (BR)", "info");
  }

  function parar() {
    setGravando(false);
    setFinalizada(true);
    toast.show("✨ Gerando SOAP + análise clínica com GPT-4o-mini…", "info");
  }

  const redFlags = transcript.length >= 5 ? [] : []; // mock — paciente sem red flags

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero: Gravador + insights ao lado */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        {/* Coluna esquerda: gravador + transcrição */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 m-4">
            <Badge tone={gravando ? "danger" : finalizada ? "success" : "neutral"}>
              {gravando ? "● AO VIVO" : finalizada ? "Finalizada" : "Pronta"}
            </Badge>
          </div>

          <div className="text-xs text-muted uppercase tracking-wide mb-1">Consulta com Co-Pilot</div>
          <div className="text-lg font-semibold text-text">{pacienteNome}</div>
          <div className="text-xs text-muted mb-4">Retorno · 14d pós ajuste · CID M79.7</div>

          {/* Gravador */}
          <div className="flex items-center gap-4 p-4 md:p-6 bg-surface rounded-xl border border-border">
            <button
              onClick={gravando ? parar : iniciar}
              className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                gravando ? "bg-danger text-white animate-pulseSoft" : "bg-primary text-white hover:scale-105"
              }`}
              aria-label={gravando ? "Parar gravação" : "Iniciar gravação"}
            >
              {gravando ? (
                <span className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-sm" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-2xl font-mono tnum text-text">
                {String(Math.floor(tempo / 60)).padStart(2, "0")}:{String(tempo % 60).padStart(2, "0")}
              </div>
              <div className="text-xs text-muted">
                {gravando ? "Transcrição Whisper ao vivo" : finalizada ? "Sessão encerrada · SOAP gerado" : "Clique para iniciar"}
              </div>
              {/* Waveform animado */}
              <div className="flex items-end gap-0.5 h-8 mt-2">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all ${gravando ? "bg-primary" : "bg-border"}`}
                    style={{
                      height: gravando
                        ? `${20 + Math.abs(Math.sin((Date.now() / 200) + i * 0.4)) * 80}%`
                        : `${20 + (i % 3) * 15}%`,
                      opacity: gravando ? 0.4 + Math.random() * 0.6 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Transcrição streaming */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted uppercase tracking-wide">Transcrição ao vivo</div>
              <div className="text-[10px] text-muted">✨ Whisper · 97% confiança · PII redigido local</div>
            </div>
            <div
              ref={scrollRef}
              className="bg-surface border border-border rounded-xl p-3 md:p-4 max-h-72 overflow-y-auto space-y-2 text-sm"
            >
              {transcript.length === 0 && !gravando && (
                <div className="text-muted italic text-center py-8 text-xs">
                  Inicie a gravação para ver a transcrição aparecer aqui.
                </div>
              )}
              {transcript.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[10px] text-muted tnum w-10 shrink-0 pt-0.5">{m.t}</span>
                  <span className={`text-xs font-semibold shrink-0 w-16 ${m.autor === "medica" ? "text-primary" : "text-ochre"}`}>
                    {m.autor === "medica" ? "Dra. Ana" : "Maria"}
                  </span>
                  <span className="text-text">{m.texto}</span>
                </div>
              ))}
              {gravando && transcript.length < TRANSCRIPT_SCRIPT.length && (
                <div className="flex gap-3 items-center">
                  <span className="text-[10px] text-muted tnum w-10 shrink-0">…</span>
                  <span className="text-xs text-muted italic">Transcrevendo</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full animate-pulseSoft" />
                    <span className="w-1 h-1 bg-primary rounded-full animate-pulseSoft" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1 h-1 bg-primary rounded-full animate-pulseSoft" style={{ animationDelay: "0.4s" }} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Coluna direita: insights em tempo real */}
        <div className="space-y-4">
          {/* Sintomas detectados */}
          <Card>
            <CardHeader title="Sintomas extraídos" />
            <div className="space-y-2 mt-3">
              {SINTOMAS_DETECTADOS.slice(0, sintomasVisiveis).map((s) => (
                <div key={s.nome} className="flex items-center gap-3 py-1">
                  <span className={`text-sm ${s.trend === "down" ? "text-leaf" : "text-ochre"}`}>
                    {s.trend === "down" ? "↓" : "↑"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-text truncate">{s.nome}</span>
                      <span className="text-xs font-mono tnum text-muted">
                        <span className={s.trend === "down" ? "text-leaf" : s.flag ? "text-ochre" : "text-sky"}>{s.valor}</span>
                        <span className="text-muted"> / antes {s.valor_anterior}</span>
                      </span>
                    </div>
                    {s.flag && <div className="text-[10px] text-ochre">{s.flag}</div>}
                  </div>
                  <span className="text-[10px] text-muted tnum shrink-0">{s.confidence}%</span>
                </div>
              ))}
              {sintomasVisiveis === 0 && (
                <div className="text-xs text-muted italic text-center py-2">Sintomas aparecerão enquanto a conversa evolui.</div>
              )}
            </div>
          </Card>

          {/* Red flags (se houver) */}
          {redFlags.length === 0 && sintomasVisiveis > 0 && (
            <Card className="border-leaf/40">
              <div className="flex items-center gap-2">
                <span className="text-leaf text-lg">✓</span>
                <div>
                  <div className="text-sm font-medium text-text">Sem red flags</div>
                  <div className="text-xs text-muted">Ideação suicida, dor refratária &gt;8, eventos adversos graves — nenhum detectado.</div>
                </div>
              </div>
            </Card>
          )}

          {/* CID sugerido */}
          <Card>
            <CardHeader title="CID-10 sugerido" />
            <div className="space-y-2 mt-3">
              {CID_SUGERIDOS.map((c) => (
                <div key={c.cid} className={`flex items-center gap-3 p-2 rounded-lg ${c.atual ? "bg-primary/5 border border-primary/20" : "border border-border"}`}>
                  <span className="font-mono text-xs font-semibold text-text">{c.cid}</span>
                  <span className="flex-1 text-xs text-text min-w-0">{c.desc}</span>
                  {c.atual && <Badge tone="success">atual</Badge>}
                  <span className="text-[10px] text-muted tnum">{c.conf}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Interações medicamentosas */}
      {sintomasVisiveis > 2 && (
        <Card>
          <CardHeader
            title="Interações medicamentosas"
            action={<Badge tone="warm">2 alertas</Badge>}
          />
          <div className="space-y-2 mt-3">
            {INTERACOES.map((i, idx) => (
              <div key={idx} className="border border-border rounded-lg p-3 flex flex-col md:flex-row gap-3">
                <Badge tone={i.severidade === "grave" ? "danger" : i.severidade === "moderada" ? "warm" : "neutral"}>{i.severidade}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{i.drugs}</div>
                  <div className="text-xs text-muted mt-1 leading-relaxed">{i.efeito}</div>
                  <div className="text-xs text-primary mt-1 flex items-center gap-1">
                    <span>→</span><span>{i.acao}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SOAP gerado */}
      {finalizada && (
        <Card>
          <CardHeader
            title="Nota SOAP gerada por IA"
            action={<Badge tone="primary">✨ GPT-4o-mini · 1.2s</Badge>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <SoapSection letter="S" label="Subjetivo" color="leaf" content={soapGenerado.S} />
            <SoapSection letter="O" label="Objetivo" color="sky" content={soapGenerado.O} />
            <SoapSection letter="A" label="Avaliação" color="ochre" content={soapGenerado.A} />
            <SoapSection letter="P" label="Plano" color="primary" content={soapGenerado.P} />
          </div>
          <div className="text-[10px] text-muted mt-3 leading-relaxed border-l-2 border-primary/30 pl-2">
            Médico valida antes de assinar. Nota pode ser editada. Hash SHA-256 da versão final entra na cadeia audit-trail LGPD.
          </div>
        </Card>
      )}

      {/* Dose calculator + Cohort comparison */}
      {sintomasVisiveis > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Cálculo de dose (próximo passo)" />
            <div className="mt-3 space-y-3">
              <div className="bg-surface rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-muted uppercase">Dose atual</span>
                  <span className="text-xs text-muted">CBD 20:1</span>
                </div>
                <div className="font-mono tnum text-2xl text-text">40mg/d <span className="text-xs text-muted">(20mg BID)</span></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted">→</span>
                <span className="text-sm text-primary font-medium">Recomendação Co-Pilot</span>
              </div>
              <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
                <div className="text-xs text-muted uppercase mb-2">Próxima titulação (se sintoma persistir)</div>
                <div className="font-mono tnum text-2xl text-primary">50mg/d <span className="text-xs">(25mg BID)</span></div>
                <div className="text-[10px] text-muted mt-2">+25% · avaliar em 14d · custo ~R$ 46/mês adicional</div>
              </div>
              <div className="text-[10px] text-muted leading-relaxed">
                Baseado em Delphi 2021 + cohort Meridiana (n=23 fibromialgia). Paciente em faixa de dose ideal 30-60mg/d.
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Comparação com cohort (k=23)" />
            <div className="mt-3 space-y-3">
              {[
                { label: "Dor (0-10)", paciente: 4, cohort: 4.5, unidade: "" },
                { label: "Dias até resposta (TTE)", paciente: 12, cohort: 14, unidade: "d" },
                { label: "Aderência tracker", paciente: 95, cohort: 82, unidade: "%" },
                { label: "Dose atual", paciente: 40, cohort: 32, unidade: "mg/d" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text">{m.label}</span>
                    <span className="font-mono tnum">
                      <span className="text-primary">{m.paciente}{m.unidade}</span>
                      <span className="text-muted"> vs </span>
                      <span className="text-muted">{m.cohort}{m.unidade}</span>
                    </span>
                  </div>
                  <div className="flex h-2 bg-surface rounded-full overflow-hidden">
                    <div className="bg-muted/30" style={{ width: `${(m.cohort / Math.max(m.paciente, m.cohort)) * 100}%` }} />
                    <div className="bg-primary -ml-[100%]" style={{ width: `${(m.paciente / Math.max(m.paciente, m.cohort)) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-muted border-l-2 border-primary/30 pl-2 leading-relaxed">
                Paciente Maria performa melhor que a média da cohort em 3/4 métricas. k≥5 garantido (LGPD).
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Exames sugeridos */}
      {finalizada && (
        <Card>
          <CardHeader title="Exames laboratoriais sugeridos" action={<Badge tone="primary">✨ IA</Badge>} />
          <div className="space-y-2 mt-3">
            {EXAMES_SUGERIDOS.map((e, i) => (
              <label key={i} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:border-primary/40 cursor-pointer">
                <input type="checkbox" defaultChecked={i < 2} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-sm font-medium text-text">{e.exame}</div>
                    <Badge tone="neutral">{e.prazo}</Badge>
                  </div>
                  <div className="text-xs text-muted mt-1">{e.motivo}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => toast.show("Exames solicitados — Maria receberá WhatsApp com link Fleury", "success")}>Solicitar exames selecionados</Button>
          </div>
        </Card>
      )}

      {/* Histórico estruturado + ações finais */}
      {finalizada && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
          <Card>
            <CardHeader title="Timeline de evolução clínica" />
            <div className="mt-3 relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
              {HISTORICO_CONSULTAS.map((h, i) => (
                <div key={i} className={`relative pb-4 last:pb-0 ${h.atual ? "" : "opacity-70"}`}>
                  <div className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 ${h.atual ? "bg-primary border-primary" : "bg-bg border-border"}`} />
                  <div className="text-xs text-muted tnum">{h.data}</div>
                  <div className="text-sm font-medium text-text">{h.titulo}</div>
                  <div className="text-xs text-muted mt-1 leading-relaxed">{h.notas}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Ações rápidas" />
            <div className="space-y-2 mt-3">
              <Button size="sm" className="w-full" onClick={() => toast.show("SOAP salvo no prontuário · hash entrou no audit chain", "success")}>✓ Confirmar SOAP no prontuário</Button>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => toast.show("Abrindo receituário com dose atual pré-preenchida", "info")}>📄 Emitir receita (ICP-Brasil)</Button>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => toast.show("Retorno agendado 17/mai 10h · WhatsApp enviado", "success")}>📅 Agendar retorno em 30d</Button>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => toast.show("Resumo PDF enviado para maria.silva@email.com", "success")}>📧 Enviar resumo ao paciente</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SoapSection({ letter, label, color, content }: { letter: string; label: string; color: string; content: string }) {
  return (
    <div className={`border border-border rounded-lg p-3 bg-surface ${!content ? "animate-pulseSoft" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-md bg-${color}/20 text-${color} flex items-center justify-center text-xs font-bold`}>{letter}</div>
        <div className="text-xs font-medium text-text uppercase tracking-wide">{label}</div>
      </div>
      {content ? (
        <div className="text-xs text-text leading-relaxed">{content}</div>
      ) : (
        <div className="text-xs text-muted italic">Gerando…</div>
      )}
    </div>
  );
}
