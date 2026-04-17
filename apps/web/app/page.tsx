import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/decorative/Sparkline";

export default function Landing() {
  const cohortDor = [7.2, 7.0, 6.5, 6.3, 5.8, 5.4, 5.0, 4.6, 4.3, 4.1, 3.8, 3.5];
  const cohortSono = [4.0, 4.2, 4.5, 4.8, 5.1, 5.5, 5.8, 6.0, 6.2, 6.4, 6.7, 6.9];

  return (
    <main className="bg-bg text-text">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold">M</span>
            <span className="font-semibold text-base">Meridiana</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted">
            <a href="#produto" className="hover:text-text transition-colors">Produto</a>
            <a href="#evidencia" className="hover:text-text transition-colors">Evidência</a>
            <a href="#preco" className="hover:text-text transition-colors">Preço</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button href="/co-pilot/titulacao" variant="ghost" size="sm">Co-Pilot</Button>
            <Button href="/entrar" size="sm">Entrar →</Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primarySoft text-primaryText text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulseSoft" />
              Para o médico que prescreve cannabis no Brasil
            </div>

            <h1 className="text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tightest text-text">
              Cada prescrição vira <span className="text-primary">evidência</span> clínica.
            </h1>

            <p className="mt-6 text-lg text-muted leading-relaxed max-w-xl">
              O primeiro prontuário do Brasil onde o médico de cannabis titula com dados, não com fé.
              Conformidade ANVISA e CFM automática. Coorte nacional anonimizada em tempo real.
            </p>

            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <Button href="/entrar" size="lg">Entrar como médico →</Button>
              <Button href="/co-pilot/titulacao" variant="secondary" size="lg">
                Testar o Co-Pilot
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
              <Stat label="Ciclo prescrição → efeito" value="14d" />
              <Stat label="Custo de IA / paciente / mês" value="≤R$2,50" />
              <Stat label="Dados sensíveis locais" value="100%" />
            </div>
          </div>

          {/* Demo card */}
          <div className="lg:col-span-5">
            <div className="bg-surface rounded-2xl shadow-floating p-6 border border-border">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-medium text-muted uppercase tracking-wide">ao vivo · coorte BR</span>
              </div>

              <div className="space-y-5">
                <DemoMetric label="Dor (fibromialgia)" value="3.5/10" delta="−51% em 12 semanas" sparkline={cohortDor} color="#14b8a6" />
                <DemoMetric label="Qualidade do sono" value="6.9/10" delta="+72% em 12 semanas" sparkline={cohortSono} color="#f59e0b" />

                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Adesão ao diário</span>
                    <span className="text-xs font-mono tnum text-success">82% após 90 dias</span>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {[60, 72, 78, 80, 82, 84, 83, 82, 82, 82, 81, 82].map((v, i) => (
                      <div key={i} className="flex-1 bg-primary/70 rounded-sm" style={{ height: `${v}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border text-[11px] text-muted leading-relaxed">
                Concorrentes globais: ~40-50%. Meridiana alcança <span className="text-primary font-medium">82%</span> com lembretes por SMS.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTO */}
      <section id="produto" className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">A tese</div>
              <h2 className="text-3xl font-semibold tracking-tight">O problema não é demanda.</h2>
            </div>
            <div className="lg:col-span-2 text-lg text-muted leading-relaxed">
              <p>
                <span className="text-primary font-mono tnum text-text">873k</span> pacientes ativos no Brasil.
                <span className="text-primary font-mono tnum text-text"> 50k</span> médicos prescreveram —
                só <span className="text-warm font-mono tnum">15k</span> mantêm prescrição ativa.
              </p>
              <p className="mt-4 text-text">
                70% dos médicos abandonaram não por convicção,
                mas porque o ciclo prescrição→efeito leva 60–90 dias e o paciente some pelo caminho.
                <strong className="text-primary"> Meridiana comprime esse ciclo para 14 dias.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Módulos</div>
        <h2 className="text-3xl font-semibold tracking-tight mb-2">Seis módulos que se reforçam.</h2>
        <p className="text-muted mb-12">Um único prontuário. Sem aplicativos paralelos.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: "M1", titulo: "Co-Pilot de Titulação", desc: "Protocolos Padrão / Conservador / Rápido (Delphi 2021). Motor de regras para interações medicamentosas." },
            { num: "M2", titulo: "Prontuário cannabis-first", desc: "SOAP estruturado por IA a partir de áudio. CID-10 sugerido automaticamente." },
            { num: "M3", titulo: "Receituário ANVISA", desc: "Tipo A/B automático. Notificação serializada. Ofício RDC 660 pré-preenchido." },
            { num: "M4", titulo: "Diário do paciente", desc: "Escala visual 1–10. Voz, SMS ou app. Resumos semanais sem dados sensíveis." },
            { num: "M5", titulo: "Telemedicina + preparação por IA", desc: "Sessão de vídeo nativa. IA prepara o resumo antes da chamada." },
            { num: "M11", titulo: "Motor de conformidade", desc: "Trilha de auditoria com cadeia de hash. Diário regulatório. Relatório por módulo." },
          ].map((m) => (
            <div key={m.num} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-cardHover transition-all">
              <div className="text-xs font-mono tnum text-primary font-semibold mb-2">{m.num}</div>
              <h3 className="text-base font-semibold mb-1.5">{m.titulo}</h3>
              <p className="text-sm text-muted leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇO */}
      <section id="preco" className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="text-xs font-medium text-warm uppercase tracking-wide mb-3">Preço</div>
            <h2 className="text-3xl font-semibold tracking-tight">Grátis para os mil primeiros médicos.</h2>
            <p className="text-muted mt-3">Doze meses sem cartão. Limite: 30 pacientes ativos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <PriceCard
              tier="Free · 12 meses"
              price="R$0"
              hint="primeiros 1.000 médicos · 30 pacientes"
              features={["Todos os módulos", "IA inclusa", "App do paciente", "Migração assistida"]}
            />
            <PriceCard
              tier="Solo"
              price="R$199"
              priceSuffix="/mês"
              recommended
              hint="médico autônomo · pacientes ilimitados"
              features={["Tudo do Free", "Insights ilimitados", "Suporte 48h", "Cohort Lab nacional", "Compliance jurídica"]}
            />
            <PriceCard
              tier="Clínica"
              price="R$149"
              priceSuffix="/médico"
              hint="3+ médicos · multi-user"
              features={["Tudo do Solo", "Dashboards consolidados", "Suporte 24h", "White-label opcional"]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-bg">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold">M</span>
                <span className="font-semibold">Meridiana</span>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-md">
                Farmacopeia digital para cannabis medicinal no Brasil.
                Construída sob as normas da ANVISA (RDC 327/660/1.015) e do CFM (Resolução 2.324/22).
                Hospedada em São Paulo, com privacidade por design conforme a LGPD.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Produto</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/co-pilot/titulacao" className="hover:text-primary">Co-Pilot Titulação</Link></li>
                <li><Link href="/medico/dashboard" className="hover:text-primary">Painel do médico</Link></li>
                <li><Link href="/paciente/log" className="hover:text-primary">App do paciente</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Regulatório</div>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.gov.br/anvisa/" target="_blank" rel="noreferrer" className="hover:text-primary">ANVISA</a></li>
                <li><a href="https://portal.cfm.org.br/" target="_blank" rel="noreferrer" className="hover:text-primary">CFM</a></li>
                <li><a href="#" className="hover:text-primary">Política LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex justify-between items-center text-xs text-muted">
            <span>© Meridiana · 2026</span>
            <span className="font-mono tnum">v.0.0.1 · alpha · São Paulo</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold stat-num text-text">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

function DemoMetric({ label, value, delta, sparkline, color }: { label: string; value: string; delta: string; sparkline: number[]; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
          <div className="text-xl font-semibold stat-num text-text">{value}</div>
        </div>
        <div className="text-xs font-mono tnum text-success">{delta}</div>
      </div>
      <Sparkline values={sparkline} color={color} width={320} height={36} className="w-full" showLast={false} />
    </div>
  );
}

function PriceCard({ tier, price, priceSuffix, hint, features, recommended }: { tier: string; price: string; priceSuffix?: string; hint: string; features: string[]; recommended?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 border ${recommended ? "border-primary bg-primarySoft/30 ring-1 ring-primary/30" : "border-border bg-surface"}`}>
      {recommended && (
        <div className="inline-block mb-2 text-[10px] font-semibold uppercase tracking-wide text-primaryText bg-primarySoftStrong px-2 py-0.5 rounded-full">
          Recomendado
        </div>
      )}
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{tier}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold stat-num text-text">{price}</span>
        {priceSuffix && <span className="text-sm text-muted">{priceSuffix}</span>}
      </div>
      <div className="text-xs text-muted mt-1 mb-5">{hint}</div>
      <ul className="space-y-2 text-sm">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary text-xs mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
