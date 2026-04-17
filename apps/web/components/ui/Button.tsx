"use client";
import clsx from "clsx";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primaryHover shadow-sm",
  secondary: "bg-surface text-text border border-border hover:border-borderStrong hover:bg-bg",
  ghost: "text-muted hover:text-text hover:bg-bg",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-sm rounded-lg",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton extends BaseProps {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}
interface ButtonAsLink extends BaseProps {
  href: string;
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = clsx(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    styles[variant],
    sizes[size],
    className,
  );
  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  const { onClick, type = "button", disabled } = props as ButtonAsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
