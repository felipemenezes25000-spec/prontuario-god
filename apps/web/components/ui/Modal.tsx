"use client";

import { useEffect } from "react";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8 animate-rise">
      <button
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className={clsx("relative w-full bg-bg border border-border rounded-2xl shadow-2xl my-8", widths[size])}>
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-text">{title}</h2>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1.5 rounded-md hover:bg-surface shrink-0"
            aria-label="Fechar modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="p-4 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function ModalInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text",
        props.className,
      )}
    />
  );
}

export function ModalSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text",
        props.className,
      )}
    />
  );
}

export function ModalTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full bg-surface border border-border focus:border-primary outline-none px-3 py-2 rounded-lg text-sm text-text",
        props.className,
      )}
    />
  );
}
