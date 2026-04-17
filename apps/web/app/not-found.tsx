import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primarySoft text-primary grid place-items-center mb-6 text-xl font-semibold">
          ✦
        </div>
        <div className="font-mono tnum text-xs text-muted mb-3">404 · página não encontrada</div>
        <h1 className="text-3xl font-semibold tracking-tight text-text mb-3">
          Essa receita não existe por aqui.
        </h1>
        <p className="text-muted leading-relaxed mb-8">
          Você seguiu um link expirado ou digitou um endereço com typo.
          Nada foi perdido — voltar ao painel resolve.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button href="/medico/dashboard">Ir ao painel</Button>
          <Button href="/" variant="secondary">Página inicial</Button>
        </div>
      </div>
    </main>
  );
}
