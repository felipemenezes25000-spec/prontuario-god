"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Toast {
  id: string;
  text: string;
  variant: "success" | "info" | "error";
  ts: number;
}

interface ToastApi {
  show: (text: string, variant?: Toast["variant"]) => void;
}

const ToastCtx = createContext<ToastApi>({ show: () => undefined });

export function useToast(): ToastApi {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<ToastApi["show"]>((text, variant = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((arr) => [...arr, { id, text, variant, ts: Date.now() }]);
    setTimeout(() => setToasts((arr) => arr.filter((t) => t.id !== id)), 4500);
  }, []);

  useEffect(() => {
    // expose para debug
    if (typeof window !== "undefined") {
      (window as unknown as { __toast: ToastApi }).__toast = { show };
    }
  }, [show]);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-rise px-5 py-3 rounded-full bg-surface border border-border shadow-floating flex items-center gap-3 max-w-sm"
          >
            <span
              className={`text-lg ${
                t.variant === "success"
                  ? "text-success"
                  : t.variant === "error"
                    ? "text-danger"
                    : "text-primary"
              }`}
            >
              {t.variant === "success" ? "✓" : t.variant === "error" ? "✕" : "✦"}
            </span>
            <div className="text-sm text-text">{t.text}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
