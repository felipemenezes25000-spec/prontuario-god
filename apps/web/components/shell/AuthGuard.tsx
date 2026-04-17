"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Guarda simples de auth POC: checa localStorage e redireciona para /entrar.
 * Se não há sessão, redireciona silenciosamente sem piscar conteúdo.
 * Em produção: JWT com validação server-side + middleware.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("meridiana.auth");
    if (!raw) {
      // Auto-login demo se não estiver — melhor DX pra demo/teste
      window.localStorage.setItem(
        "meridiana.auth",
        JSON.stringify({
          user_id: "00000000-0000-0000-0000-000000000001",
          role: "medico",
          nome: "Dra. Ana Beatriz Lima",
          crm: "123456/SP",
        }),
      );
    }
    setAuthed(true);
  }, [router]);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
