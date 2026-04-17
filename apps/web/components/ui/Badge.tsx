import clsx from "clsx";

type Tone = "neutral" | "primary" | "success" | "warm" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-bg text-muted border border-border",
  primary: "bg-primarySoft text-primaryText border border-primary/20",
  success: "bg-successSoft text-success border border-success/20",
  warm: "bg-warmSoft text-warm border border-warm/20",
  danger: "bg-dangerSoft text-danger border border-danger/20",
  info: "bg-infoSoft text-info border border-info/20",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
