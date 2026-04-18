import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/decorative/Sparkline";

export default function Landing() {
  const cohortDor = [7.2, 7.0, 6.5, 6.3, 5.8, 5.4, 5.0, 4.6, 4.3, 4.1, 3.8, 3.5];
  const cohortSono = [4.0, 4.2, 4.5, 4.8, 5.1, 5.5, 5.8, 6.0, 6.2, 6.4, 6.7, 6.9];
  const cohortAnsiedade = [7.0, 6.8, 6.2, 5.8, 5.2, 4.8, 4.5, 4.2, 4.0, 3.8, 3.7, 3.5];

  return (
    <main className="bg-bg text-text">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold shadow-lg shadow-primary/20">M</span>
            <span className="font-semibold text-base">Meridiana</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#produto" className="hover:text-text transition-colors">Produto</a>
            <a href="#como-funciona" className="hover:text-text transition-colors">Como funciona</a>
            <a href="#evidencia" className="hover:text-text transition-colors">Evidência</a>
            <a href="#compliance" className="hover:text-text transition-colors">Compliance</a>
            <a href="#preco" className="hover:text-text transition-colors">Preço</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button href="/co-pilot/titulacao" variant="ghost" size="sm" className="hidden sm:inline-flex">Testar Co-Pilot</Button>
            <Button href="/entrar" size="sm">Entrar →</Button>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Gradient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-warm/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 animate-rise">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primarySoft text-primaryText text-xs font-medium mb-6 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulseSoft" />
                Programa piloto · 1.000 médicos prescritores no BR
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold leading-[1.02] tracking-tightest text-text">
                O prontuário onde <br className="hidden md:block" />
                <span className="text-primary">cannabis vira evidência.</span>
              </h1>

              <p className="mt-5 md:mt-6 text-base md:text-lg text-muted leading-relaxed max-w-xl">
                Titulação guiada por IA, receituário ANVISA em 1 clique, ofício RDC 660
                pré-preenchido. Conformidade CFM 2.324/22 nativa. 873k pacientes esperando.
              </p>

              <div className="mt-7 md:mt-8 flex items-center gap-3 flex-wrap">
                <Button href="/entrar" size="lg">Entrar na demo →</Button>
                <Button href="/co-pilot/titulacao" variant="secondary" size="lg">
                  Testar Co-Pilot IA
                </Button>
              </div>

              <div className="mt-10 md:mt-12 grid grid-cols-3 gap-4 md:gap-6 max-w-2xl">
                <Stat label="Tempo até efeito clínico" value="14d" sub="↓ 76% vs média BR" />
                <Stat label="Custo de IA por paciente" value="R$2,50" sub="budget guard ativo" />
                <Stat label="Dados sensíveis locais" value="100%" sub="LGPD art.11" />
              </div>
            </div>

            {/* Hero card */}
            <div className="lg:col-span-5 animate-rise" style={{ animationDelay: "0.15s" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-warm/10 rounded-3xl blur-2xl" />
                <div className="relative bg-surface rounded-2xl shadow-floating p-5 md:p-6 border border-border">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulseSoft" />
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Coorte ao vivo · n=196 · k≥5</span>
                  </div>

                  <div className="space-y-5">
                    <DemoMetric label="Dor (fibromialgia, n=23)" value="3.5/10" delta="−51% · 12 semanas" sparkline={cohortDor} color="#14b8a6" />
                    <DemoMetric label="Qualidade do sono" value="6.9/10" delta="+72% · 12 semanas" sparkline={cohortSono} color="#f59e0b" />
                    <DemoMetric label="Ansiedade (TAG, n=18)" value="3.5/10" delta="−50% · 8 semanas" sparkline={cohortAnsiedade} color="#0ea5e9" />

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs font-medium text-muted uppercase tracking-wide">Adesão ao tracker diário</span>
                        <span className="text-xs font-mono tnum text-success">82% após 90d</span>
                      </div>
                      <div className="flex items-end gap-1 h-8">
                        {[60, 72, 78, 80, 82, 84, 83, 82, 82, 82, 81, 82].map((v, i) => (
                          <div key={i} className="flex-1 bg-primary/70 rounded-sm transition-all hover:bg-primary" style={{ height: `${v}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border text-[11px] text-muted leading-relaxed">
                    Concorrentes globais: 40-50%. Meridiana: <span className="text-primary font-medium">82%</span> com lembretes WhatsApp Business.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-14 md:mt-20 pt-8 border-t border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted text-center mb-6">Construído sob os padrões regulatórios</div>
            <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap opacity-70">
              <TrustBadge nome="ANVISA" sub="RDC 327/660/1015" />
              <TrustBadge nome="CFM" sub="Res. 2.324/22" />
              <TrustBadge nome="LGPD" sub="art. 11" />
              <TrustBadge nome="ICP-Brasil" sub="MP 2.200-2" />
              <TrustBadge nome="ISO 27001" sub="em andamento" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEMA ============ */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">A tese</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">O problema não é demanda.</h2>
            </div>
            <div className="lg:col-span-2 text-base md:text-lg text-muted leading-relaxed space-y-4">
              <p>
                <span className="text-text font-mono tnum">873k</span> pacientes ativos no Brasil.{" "}
                <span className="text-text font-mono tnum">50k</span> médicos já prescreveram —{" "}
                só <span className="text-warm font-mono tnum">15k</span> mantêm prescrição ativa.
              </p>
              <p className="text-text">
                70% dos médicos abandonaram não por convicção, mas porque o ciclo
                prescrição→efeito leva 60–90 dias e o paciente some pelo caminho.
                <strong className="text-primary"> Meridiana comprime esse ciclo para 14 dias.</strong>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-6">
                <PainPoint label="Titulação" antes="60d" depois="14d" />
                <PainPoint label="Emissão receita" antes="12min" depois="45s" />
                <PainPoint label="RDC 660 ofício" antes="40min" depois="1 clique" />
                <PainPoint label="SOAP da consulta" antes="manual" depois="auto-IA" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Como funciona</div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-2">De primeira consulta ao ofício ANVISA.</h2>
        <p className="text-muted mb-10 md:mb-14 text-base md:text-lg">Um fluxo. Quatro etapas. Quinze minutos.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: "01", titulo: "Grava a consulta", desc: "Whisper transcreve ao vivo. PII redigido local com Llama 3.1 8B. Zero dado sensível sai sem redação.", icon: "🎙", tempo: "0-20min" },
            { num: "02", titulo: "Co-Pilot sugere protocolo", desc: "Sintomas extraídos, CID sugerido, red flags verificados. Protocolo Delphi 2021 recomendado com ratio CBD:THC específico.", icon: "✨", tempo: "2min" },
            { num: "03", titulo: "Receita + ofício 660", desc: "Tipo A/B automático, NR controlada, ofício ANVISA pré-preenchido, assinatura ICP-Brasil (VIDaaS).", icon: "📄", tempo: "45s" },
            { num: "04", titulo: "Tracker + cohort", desc: "Paciente loga sintomas diariamente via app/WhatsApp. Sua cohort anonimizada contribui para evidência nacional.", icon: "📊", tempo: "contínuo" },
          ].map((s, i) => (
            <div key={s.num} className="relative bg-surface border border-border rounded-2xl p-5 md:p-6 hover:border-primary/40 hover:shadow-cardHover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{s.icon}</div>
                <div className="text-xs font-mono tnum text-primary font-bold bg-primarySoft px-2 py-1 rounded">{s.num}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.titulo}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              <div className="mt-4 text-xs text-muted border-t border-border pt-3">⏱ {s.tempo}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRODUTO / MÓDULOS ============ */}
      <section id="produto" className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Módulos</div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-2">Nove módulos que se reforçam.</h2>
          <p className="text-muted mb-10 md:mb-14 text-base md:text-lg">Um prontuário. Sem aplicativos paralelos. Sem planilhas espalhadas.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: "M1", titulo: "Co-Pilot de Titulação", desc: "Protocolos Padrão / Conservador / Rápido (Delphi 2021). Motor de regras para interações medicamentosas. Sugestão de dose baseada em peso+idade+comorbidades.", gem: "Gemini 2.5 Flash Lite" },
              { num: "M2", titulo: "Prontuário cannabis-first", desc: "SOAP estruturado por IA a partir do áudio. CID-10 sugerido. Red flags verificados em tempo real (ideação, EA grave).", gem: "GPT-4o-mini" },
              { num: "M3", titulo: "Receituário ANVISA", desc: "Tipo A/B automático conforme concentração. NR serializada. Ofício RDC 660 pré-preenchido com 2 anos de validade.", gem: "Determinístico (seguro p/ CFM)" },
              { num: "M4", titulo: "Tracker sintoma-first", desc: "Paciente loga dor/sono/humor via app ou WhatsApp. Escala visual 1-10. Insights semanais com IA.", gem: "Gemini Flash Lite" },
              { num: "M5", titulo: "Telemedicina + resumo IA", desc: "LiveKit hospedado no BR. Gravação automática. Transcrição Whisper. Resumo pré-consulta gerado do histórico.", gem: "Whisper próprio + GPT-4o-mini" },
              { num: "M6", titulo: "Trilho 14d (logística)", desc: "Integração com distribuidores. Rastreio ANVISA. Alerta de validade RDC 660 com 6 meses de antecedência.", gem: "Motor de regras + webhook" },
              { num: "M7", titulo: "Marketplace transparente", desc: "Catálogo 40+ SKUs (Prati, Aurora, Bedrocan, HempMeds). Preços comparados. Ratio CBD:THC filtrado.", gem: "—" },
              { num: "M8", titulo: "Coorte & Lab de Evidências", desc: "Dados anonimizados (k≥5) + privacidade diferencial. Publicável como evidência do mundo real brasileiro.", gem: "Estatística clássica + IA" },
              { num: "M11", titulo: "Motor de Compliance", desc: "Audit hash-chained (tamper-evident). Soft-delete 20 anos CFM 1.821. Consent granular LGPD art.11.", gem: "SHA-256 chain" },
            ].map((m) => (
              <div key={m.num} className="bg-bg border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-cardHover transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-mono tnum text-primary font-semibold">{m.num}</div>
                  {m.gem !== "—" && (
                    <div className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded border border-border font-mono">
                      {m.gem}
                    </div>
                  )}
                </div>
                <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">{m.titulo}</h3>
                <p className="text-sm text-muted leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARAÇÃO ============ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Comparação</div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-2">Por que não iClinic ou AuraMed?</h2>
        <p className="text-muted mb-10 md:mb-14 text-base md:text-lg">EMRs genéricos não entendem cannabis. E o médico sabe.</p>

        <div className="bg-surface border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 md:px-6 text-muted font-medium text-xs uppercase tracking-wide">Recurso</th>
                <th className="py-4 px-4 md:px-6 text-primary font-semibold">Meridiana</th>
                <th className="py-4 px-4 md:px-6 text-muted">iClinic</th>
                <th className="py-4 px-4 md:px-6 text-muted">AuraMed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { r: "Tipo A/B automático por concentração", m: true, i: false, a: false },
                { r: "Ofício RDC 660 pré-preenchido", m: true, i: false, a: false },
                { r: "Co-Pilot de titulação CBD:THC", m: true, i: false, a: false },
                { r: "Coorte nacional anonimizada", m: true, i: false, a: false },
                { r: "Catálogo cannabis com ratios", m: true, i: false, a: false },
                { r: "Tracker sintoma-first (paciente)", m: true, i: false, a: false },
                { r: "SOAP auto da consulta por IA", m: true, i: "parcial", a: false },
                { r: "Agenda + telemedicina", m: true, i: true, a: true },
                { r: "Receita eletrônica genérica", m: true, i: true, a: true },
              ].map((l, i) => (
                <tr key={i} className="hover:bg-bg/50">
                  <td className="py-3 px-4 md:px-6 text-text">{l.r}</td>
                  <td className="py-3 px-4 md:px-6 text-center">{l.m === true ? "✓" : l.m === false ? "—" : l.m}</td>
                  <td className="py-3 px-4 md:px-6 text-center text-muted">{l.i === true ? "✓" : l.i === false ? "—" : l.i}</td>
                  <td className="py-3 px-4 md:px-6 text-center text-muted">{l.a === true ? "✓" : l.a === false ? "—" : l.a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ DEPOIMENTOS ============ */}
      <section id="evidencia" className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Quem já usa</div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-10 md:mb-14">Médicos que prescrevem cannabis diariamente.</h2>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                quote: "Reduzi o tempo de cada consulta de 40 para 12 minutos. O Co-Pilot sugere a dose, eu valido. Mudou minha semana.",
                nome: "Dra. Ana Beatriz Lima",
                crm: "CRM 123456/SP",
                esp: "Medicina da Dor · 47 pacientes",
              },
              {
                quote: "A integração RDC 660 era meu maior inferno. Agora gero o ofício em um clique e o paciente recebe o link via WhatsApp para preencher.",
                nome: "Dr. João Marques",
                crm: "CRM 234567/SP",
                esp: "Neurologia · 32 pacientes",
              },
              {
                quote: "Em oncologia paliativa, o tempo é tudo. A titulação em 14d ao invés de 60d muda a qualidade de morte dos meus pacientes.",
                nome: "Dr. Rafael Prado",
                crm: "CRM 456789/RJ",
                esp: "Oncologia · 24 pacientes",
              },
            ].map((t, i) => (
              <div key={i} className="bg-bg border border-border rounded-2xl p-5 md:p-6 flex flex-col">
                <div className="text-3xl text-primary/40 mb-3 leading-none">"</div>
                <p className="text-sm md:text-base text-text leading-relaxed flex-1">{t.quote}</p>
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                      {t.nome.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-text text-sm">{t.nome}</div>
                      <div className="text-xs text-muted">{t.crm} · {t.esp}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Logos partners */}
          <div className="mt-12 md:mt-16 pt-8 border-t border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted text-center mb-5">Partners e integradores</div>
            <div className="flex items-center justify-center gap-5 md:gap-10 flex-wrap opacity-60 text-muted text-sm">
              <span className="font-semibold">ASBRACAM</span>
              <span>·</span>
              <span className="font-semibold">SBEC</span>
              <span>·</span>
              <span className="font-semibold">Valid (VIDaaS)</span>
              <span>·</span>
              <span className="font-semibold">LiveKit</span>
              <span>·</span>
              <span className="font-semibold">Stripe</span>
              <span>·</span>
              <span className="font-semibold">Gov.br (SEI)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPLIANCE ============ */}
      <section id="compliance" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Compliance</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-4">Privacidade e regulação não são opcionais.</h2>
            <p className="text-muted text-base md:text-lg leading-relaxed mb-6">
              Cada prescrição entra numa cadeia de hashes SHA-256 tamper-evident.
              Cada acesso a paciente gera evento auditável. Soft-delete de 20 anos conforme CFM 1.821.
            </p>
            <div className="space-y-3">
              <CheckItem txt="Dados sensíveis nunca saem sem redação local (Llama 3.1 8B)" />
              <CheckItem txt="Consentimento granular por finalidade (LGPD art.11)" />
              <CheckItem txt="Audit hash-chain verifica integridade em tempo real" />
              <CheckItem txt="Residência de dados em São Paulo (DO BR region)" />
              <CheckItem txt="DPO dedicado + parecer jurídico de saúde" />
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-5 md:p-6">
            <div className="text-xs text-muted uppercase mb-3 tracking-wide">Audit log ao vivo · últimos eventos</div>
            <div className="font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
              {[
                { ts: "16:42:18", u: "Dra. Ana", a: "prescricao_signed", r: "rx:mar-abr-024", ok: true },
                { ts: "16:41:04", u: "Dra. Ana", a: "paciente_read", r: "paciente:maria-silva", ok: true },
                { ts: "16:38:55", u: "Dra. Ana", a: "ai_call", r: "feature:titulacao", ok: true },
                { ts: "16:35:22", u: "sistema", a: "rdc660_submitted", r: "rx:abr-017", ok: true },
                { ts: "16:33:10", u: "Dr. João", a: "prescricao_emitted", r: "rx:abr-016", ok: true },
                { ts: "16:30:45", u: "Dr. João", a: "telemed_finished", r: "sessao:tel-321", ok: true },
                { ts: "16:28:00", u: "Luiza", a: "paciente_created", r: "paciente:novo-047", ok: true },
                { ts: "16:20:33", u: "paciente-maria", a: "consent_granted", r: "consent:telemed", ok: true },
                { ts: "16:15:12", u: "Dra. Ana", a: "login", r: "user:ana-beatriz", ok: true },
                { ts: "16:12:58", u: "sistema", a: "anonymization_exec", r: "cohort:fibromialgia", ok: true },
              ].map((e, i) => (
                <div key={i} className="flex gap-2 text-muted hover:bg-bg/50 -mx-1 px-1 py-0.5 rounded">
                  <span className="text-muted shrink-0 tnum">{e.ts}</span>
                  <span className="text-text shrink-0 w-20 truncate">{e.u}</span>
                  <span className="text-primary shrink-0 w-36 truncate">{e.a}</span>
                  <span className="truncate">{e.r}</span>
                  <span className="text-success shrink-0 ml-auto">✓</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted">Hash chain</span>
              <span className="text-success font-mono">1.842 eventos · íntegra</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PREÇO ============ */}
      <section id="preco" className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Preço</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">Grátis para os mil primeiros.</h2>
            <p className="text-muted mt-3 text-base md:text-lg">Doze meses sem cartão. Sem letra miúda.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <PriceCard
              tier="Wedge · 12 meses"
              price="R$0"
              hint="primeiros 1.000 médicos · até 30 pacientes"
              features={["Todos os módulos M1-M11", "Co-Pilot Titulação ilimitado", "IA inclusa (budget R$2,50/pac)", "App paciente + WhatsApp", "Migração assistida do iClinic"]}
              cta="Começar grátis"
            />
            <PriceCard
              tier="Solo"
              price="R$149"
              priceSuffix="/mês"
              recommended
              hint="médico autônomo · até 200 pacientes"
              features={["Tudo do Wedge", "Pacientes ilimitados", "Assinatura ICP-Brasil (1 cert)", "Acompanhamento RDC 660 automático", "WhatsApp Business com modelos", "Coorte Lab · insights IA", "Suporte 48h"]}
              cta="Assinar Solo"
            />
            <PriceCard
              tier="Clínica"
              price="R$499"
              priceSuffix="/mês"
              hint="até 5 médicos · 1000 pacientes"
              features={["Tudo do Solo", "Multi-médico com permissões (5)", "5 certificados ICP", "Relatórios epidemiológicos", "API de integração", "Painel consolidado", "Suporte 24h"]}
              cta="Falar com vendas"
            />
          </div>

          <div className="text-center mt-10 text-xs text-muted">
            Enterprise (SSO SAML, DPO dedicado, SLA 99.9%, Evidence Lab):{" "}
            <a href="#" className="underline hover:text-primary">Contato</a>.
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3 text-center">Perguntas</div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-10 md:mb-14 text-center">As 6 dúvidas que mais ouvimos.</h2>

        <div className="space-y-3">
          {[
            { q: "A IA decide a dose do meu paciente?", a: "Não. O Co-Pilot sugere com base em Delphi 2021 + peso/idade/comorbidades/cohort — o médico sempre valida e assina. Motor de regras tem prioridade sobre IA em decisões safety-critical (interações graves)." },
            { q: "Como vocês cumprem a CFM 2.324/22?", a: "Validamos especialidade do prescritor antes de cada receita (integração CFM), alertamos quando CID exige especialidade específica e sugerimos via ANVISA alternativa quando necessário. Assinatura ICP-Brasil A3 obrigatória." },
            { q: "O paciente precisa baixar app?", a: "Não. Tracker funciona via WhatsApp Business com templates aprovados. App nativo (Expo) é opcional para usuários que preferem. SMS funciona para pacientes sem smartphone." },
            { q: "E se a Valid (VIDaaS) sair do ar?", a: "Adapter pattern — se falhar, temos fallback Soluti + Birdid + modo offline temporário com selo 'pendente de assinatura'. Nenhum paciente fica bloqueado." },
            { q: "Meus dados vão pro exterior?", a: "Não. DB + backups + IA residem em São Paulo (DigitalOcean BR region). Gemini/OpenAI só recebem payloads com PII redigido local via Llama 3.1. Evidence Lab anonimiza k≥5 antes de qualquer análise." },
            { q: "Posso exportar e sair?", a: "Sempre. LGPD art. 18 direito de portabilidade. Exportamos FHIR R4 em um clique. Sem vendor lock-in." },
          ].map((f, i) => (
            <details key={i} className="group bg-surface border border-border rounded-xl overflow-hidden">
              <summary className="cursor-pointer p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-bg/30 transition-colors list-none">
                <span className="text-sm md:text-base font-medium text-text">{f.q}</span>
                <span className="text-primary shrink-0 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-muted leading-relaxed border-t border-border pt-3">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-bg to-warm/5 border-y border-border">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Entre antes de virar fila.
          </h2>
          <p className="text-base md:text-lg text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
            Grátis para os primeiros <span className="text-primary font-semibold">1.000 médicos prescritores</span> até 31/12/2026.
            Setup em 5 minutos. Sem contrato, sem cartão.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button href="/entrar" size="lg">Entrar como médico agora →</Button>
            <Button href="/co-pilot/titulacao" variant="secondary" size="lg">Testar Co-Pilot primeiro</Button>
          </div>
          <div className="mt-8 text-xs text-muted flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><span className="text-success">✓</span> Setup &lt; 5min</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1"><span className="text-success">✓</span> Migração do iClinic inclusa</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1"><span className="text-success">✓</span> Cancelamento a qualquer momento</span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-bg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold">M</span>
                <span className="font-semibold text-base">Meridiana</span>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-md">
                Prontuário vertical para cannabis medicinal no Brasil.
                Construído sob ANVISA (RDC 327/660/1.015), CFM (2.324/22) e LGPD.
                Hospedagem em São Paulo · privacidade por design.
              </p>
              <div className="mt-5 flex items-center gap-3 text-muted text-sm">
                <a href="mailto:dpo@meridiana.health" className="hover:text-primary">DPO</a>
                <span>·</span>
                <a href="mailto:contato@meridiana.health" className="hover:text-primary">Contato</a>
                <span>·</span>
                <a href="#" className="hover:text-primary">Imprensa</a>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Produto</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/co-pilot/titulacao" className="text-muted hover:text-primary">Co-Pilot Titulação</Link></li>
                <li><Link href="/medico/dashboard" className="text-muted hover:text-primary">Painel médico</Link></li>
                <li><Link href="/paciente/log" className="text-muted hover:text-primary">App do paciente</Link></li>
                <li><Link href="/clinica/catalogo" className="text-muted hover:text-primary">Catálogo cannabis</Link></li>
                <li><Link href="/clinica/relatorios" className="text-muted hover:text-primary">Evidence Lab</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Clínica</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/clinica/equipe" className="text-muted hover:text-primary">Multi-médico</Link></li>
                <li><Link href="/clinica/financeiro" className="text-muted hover:text-primary">Financeiro</Link></li>
                <li><Link href="/mensagens" className="text-muted hover:text-primary">WhatsApp</Link></li>
                <li><Link href="/compliance" className="text-muted hover:text-primary">Audit LGPD</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Regulatório</div>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.gov.br/anvisa/" target="_blank" rel="noreferrer" className="text-muted hover:text-primary">ANVISA</a></li>
                <li><a href="https://portal.cfm.org.br/" target="_blank" rel="noreferrer" className="text-muted hover:text-primary">CFM</a></li>
                <li><a href="#" className="text-muted hover:text-primary">Política LGPD</a></li>
                <li><a href="#" className="text-muted hover:text-primary">Termos de uso</a></li>
                <li><a href="#" className="text-muted hover:text-primary">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-muted">
            <span>© 2026 Meridiana Cannabis Medicinal LTDA · CNPJ 12.345.678/0001-90</span>
            <span className="font-mono tnum">v.0.1.0 · São Paulo · BR</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-xl md:text-2xl font-semibold stat-num text-text">{value}</div>
      <div className="text-xs text-muted mt-1 leading-tight">{label}</div>
      {sub && <div className="text-[10px] text-primary mt-0.5">{sub}</div>}
    </div>
  );
}

function DemoMetric({ label, value, delta, sparkline, color }: { label: string; value: string; delta: string; sparkline: number[]; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 gap-2">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted uppercase tracking-wide truncate">{label}</div>
          <div className="text-lg md:text-xl font-semibold stat-num text-text">{value}</div>
        </div>
        <div className="text-xs font-mono tnum text-success shrink-0">{delta}</div>
      </div>
      <Sparkline values={sparkline} color={color} width={320} height={36} className="w-full" showLast={false} />
    </div>
  );
}

function TrustBadge({ nome, sub }: { nome: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="text-base font-semibold text-text">{nome}</div>
      <div className="text-[10px] font-mono tnum text-muted">{sub}</div>
    </div>
  );
}

function PainPoint({ label, antes, depois }: { label: string; antes: string; depois: string }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-bg">
      <div className="text-[10px] text-muted uppercase tracking-wide">{label}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-mono tnum text-muted line-through">{antes}</span>
        <span className="text-primary">→</span>
        <span className="text-sm font-mono tnum text-primary font-semibold">{depois}</span>
      </div>
    </div>
  );
}

function CheckItem({ txt }: { txt: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
      <span className="text-text">{txt}</span>
    </div>
  );
}

function PriceCard({ tier, price, priceSuffix, hint, features, recommended, cta }: { tier: string; price: string; priceSuffix?: string; hint: string; features: string[]; recommended?: boolean; cta: string }) {
  return (
    <div className={`rounded-2xl p-5 md:p-6 border flex flex-col ${recommended ? "border-primary bg-primarySoft/30 ring-2 ring-primary/20 shadow-lg shadow-primary/10" : "border-border bg-bg"}`}>
      {recommended && (
        <div className="inline-block self-start mb-3 text-[10px] font-semibold uppercase tracking-wider text-white bg-primary px-2.5 py-1 rounded-full">
          Recomendado
        </div>
      )}
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{tier}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl md:text-4xl font-semibold stat-num text-text">{price}</span>
        {priceSuffix && <span className="text-sm text-muted">{priceSuffix}</span>}
      </div>
      <div className="text-xs text-muted mt-1 mb-5">{hint}</div>
      <ul className="space-y-2 text-sm flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary text-xs mt-0.5 shrink-0">✓</span>
            <span className="text-text">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/entrar" className={`block text-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${recommended ? "bg-primary text-white hover:bg-primary/90" : "bg-surface text-text border border-border hover:border-primary hover:text-primary"}`}>
          {cta}
        </Link>
      </div>
    </div>
  );
}
