import React from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
      <div className="max-w-2xl">
        {eyebrow && <p className="font-display text-lg text-muted mb-2">{eyebrow}</p>}
        <h1 className="display text-[40px] md:text-[52px] text-ink">{title}</h1>
        {description && <p className="text-muted text-lg mt-3 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
