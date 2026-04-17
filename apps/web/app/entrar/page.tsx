"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function EntrarPage() {
  const router = useRouter();
  const [crm, setCrm] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);

  function entrar(e?: React.FormEvent) {
    e?.preventDefault();
    setEntrando(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "meridiana.auth",
        JSON.stringify({
          user_id: "00000000-0000-0000-0000-000000000001",
          role: "medico",
          nome: "Dra. Ana Beatriz Lima",
          crm: crm || "123456/SP",
        }),
      );
    }
    setTimeout(() => router.push("/medico/dashboard"), 350);
  }

  function entrarDemo() {
    setCrm("123456/SP");
    setSenha("demo");
    setTimeout(() => entrar(), 100);
  }

  return (
    <main className="min-h-screen bg-bg flex">
      {/* Visual side */}
      <aside className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebarText relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,#14b8a6_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_70%,#0ea5e9_0%,transparent_50%)]" />

        <div className="relative max-w-md p-12">
          <div className="flex items-center gap-2.5 mb-12">
            <span className="w-9 h-9 rounded-xl bg-primary text-white grid place-items-center font-bold">M</span>
            <span className="font-semibold text-xl">Meridiana</span>
          </div>

          <blockquote className="text-2xl font-medium text-sidebarTextStrong leading-snug mb-6">
            "Reduzi o tempo de cada consulta de 40 para 12 minutos. O Co-Pilot sugere a dose, eu valido."
          </blockquote>
          <div className="text-sm text-sidebarMuted">
            <div className="font-medium text-sidebarText">Dra. Ana Beatriz Lima</div>
            <div>Médica da Dor · CRM 123456/SP · 47 pacientes ativos</div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-xs">
            <div>
              <div className="text-2xl font-semibold text-sidebarTextStrong stat-num">14d</div>
              <div className="text-sidebarMuted mt-1">Tempo até efeito</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-sidebarTextStrong stat-num">82%</div>
              <div className="text-sidebarMuted mt-1">adesão tracker</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-sidebarTextStrong stat-num">100%</div>
              <div className="text-sidebarMuted mt-1">PII local</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <section className="w-full lg:w-1/2 flex flex-col">
        <header className="px-8 pt-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm">
            <span className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center text-xs font-bold">M</span>
            <span className="font-semibold">Meridiana</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-text">← voltar</Link>
        </header>

        <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-[440px] mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-text mb-3">
              Bem-vindo de <span className="text-primary">volta.</span>
            </h1>
            <p className="text-muted">
              Entre com seu CRM para abrir o painel dos seus pacientes.
            </p>
          </div>

          {/* Banner demo visível pra quem chegou via link de demonstração */}
          <div className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none">🎯</span>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-text mb-1">Está testando a demo?</div>
                <div className="text-muted mb-3">
                  Clique abaixo em <span className="text-primary font-medium">"Entrar como Dra. Ana Beatriz"</span> —
                  nenhuma credencial necessária. Todos os dados são fictícios.
                </div>
                <div className="text-xs text-subtle font-mono">
                  CRM demo: 123456/SP · Senha: qualquer · Paciente: Maria Silva
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={entrar} className="space-y-4">
            <Field label="CRM / UF">
              <input
                type="text"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                placeholder="123456/SP"
                autoComplete="username"
                className="w-full bg-surface border border-border focus:border-primary outline-none px-4 py-3 rounded-lg text-text font-mono tnum text-base"
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-surface border border-border focus:border-primary outline-none px-4 py-3 rounded-lg text-text text-base"
              />
            </Field>

            <Button type="submit" disabled={entrando} size="lg" className="w-full">
              {entrando ? "abrindo painel…" : "Entrar →"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-subtle">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button onClick={entrarDemo} variant="secondary" size="lg" className="w-full">
            Entrar como Dra. Ana Beatriz (conta de demonstração)
          </Button>

          <p className="mt-10 text-xs text-muted leading-relaxed border-l-2 border-primary/30 pl-3">
            É seu primeiro acesso? A Meridiana está em programa piloto gratuito para os primeiros{" "}
            <span className="text-primary font-medium">1.000 médicos prescritores</span>.{" "}
            <Link href="/" className="underline hover:text-primary">Saiba mais</Link>.
          </p>
        </div>

        <footer className="px-8 py-6 text-xs text-muted flex justify-between border-t border-border">
          <span>🔒 LGPD · ICP-Brasil · dados em SP</span>
          <span className="font-mono">v.0.0.1</span>
        </footer>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text mb-1.5">{label}</span>
      {children}
    </label>
  );
}
