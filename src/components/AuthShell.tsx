import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/** Centered card layout shared by the student and teacher sign-in pages */
export function AuthShell({ children, backHref = "/" }: { children: React.ReactNode; backHref?: string }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="flex items-center justify-between px-6 h-20 max-w-6xl w-full mx-auto">
        <Logo />
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-[15px] text-muted hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm bg-surface rounded-4xl border border-line shadow-soft px-6 sm:px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
