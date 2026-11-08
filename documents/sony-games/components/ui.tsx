import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { STORE } from "@/lib/store";

type Variant = "primary" | "blue" | "ghost" | "whatsapp";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-bright",
  blue: "bg-ps text-white shadow-lg shadow-ps/25 hover:bg-ps-bright",
  ghost:
    "border border-white/15 bg-white/[0.03] text-ink hover:border-white/30 hover:bg-white/[0.07]",
  whatsapp: "bg-wa text-navy-950 hover:brightness-110",
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  external,
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  external?: boolean;
}) {
  const sizes = {
    sm: "h-9 px-3.5 text-sm gap-1.5",
    md: "h-11 px-5 text-[0.95rem] gap-2",
    lg: "h-13 px-6 text-base gap-2.5",
  };
  return (
    <a
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ps-bright ${sizes[size]} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold tracking-[0.2em] text-accent-bright uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl leading-tight font-bold text-balance text-ink sm:text-4xl">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">
          {children}
        </p>
      ) : null}
    </div>
  );
}

// Text wordmark until the owner's logo file is set in STORE.logo.
export function Wordmark({ className = "" }: { className?: string }) {
  if (STORE.logo) {
    return (
      <Image
        src={STORE.logo}
        alt={STORE.name}
        width={160}
        height={48}
        priority
        className={`h-10 w-auto object-contain ${className}`}
      />
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-accent to-[#8f0f18] font-display text-sm font-extrabold text-white shadow-md shadow-accent/30 ring-1 ring-white/15"
      >
        SG
      </span>
      <span className="font-display text-xl leading-none font-bold tracking-tight">
        <span className="text-ink">Sony</span>{" "}
        <span className="text-accent-bright">Game</span>
      </span>
    </span>
  );
}
