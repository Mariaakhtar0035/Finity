import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Adds a gentle hover lift for clickable cards */
  interactive?: boolean;
  as?: "div" | "section" | "article";
}

export function Card({
  children,
  className = "",
  onClick,
  interactive = false,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={`bg-surface rounded-[var(--radius-card)] border border-line ${
        interactive || onClick ? "lift cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

interface SectionHeadingProps {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** Heading used at the top of a card or page section */
export function SectionHeading({ title, description, action, className = "" }: SectionHeadingProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 ${className}`}>
      <div>
        <h2 className="font-display text-2xl tracking-tight text-ink">{title}</h2>
        {description && <p className="text-muted mt-1 text-[15px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
