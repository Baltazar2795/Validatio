import type { ReactNode } from "react";

export type SectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function Section({ title, description, actions, className = "", children }: SectionProps) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
          {description ? <p className="mt-1 text-xs text-white/60 sm:text-sm">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2 text-xs text-white">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4 text-sm text-white/70">{children}</div> : null}
    </section>
  );
}

export default Section;
