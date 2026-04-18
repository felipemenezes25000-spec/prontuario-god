/**
 * Helper para botões de mock/demo sentirem vivos.
 * Uso: <Button onClick={demoAction("Ofício gerado", "success")}>Gerar ofício</Button>
 *
 * Por que: a Meridiana é demo visual, muitas ações ainda não têm backend. Cada clique
 * precisa dar feedback para a Dra. não sentir que o sistema está quebrado.
 */
"use client";

export function demoAction(message: string, variant: "success" | "info" | "error" = "success"): () => void {
  return () => {
    if (typeof window === "undefined") return;
    const toast = (window as unknown as { __toast?: { show: (m: string, v?: "success" | "info" | "error") => void } }).__toast;
    toast?.show(message, variant);
  };
}
