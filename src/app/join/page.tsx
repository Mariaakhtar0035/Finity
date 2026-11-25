"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { StudentAvatar } from "@/components/StudentAvatar";
import { CLASSROOM, formatClassCode, getStudents, normalizeClassCode, verifyClassCode } from "@/lib/store";
import { DemoHint } from "@/components/ui/Feedback";
import { useStore } from "@/lib/useStore";

const CLASS_CODE_KEY = "finity_class_code";

/** Formats as the student types: "fin482" → "FIN-482" */
function formatInput(raw: string): string {
  const code = normalizeClassCode(raw).slice(0, 6);
  return code.length > 3 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

export default function JoinPage() {
  const router = useRouter();
  useStore();
  const [step, setStep] = useState<"code" | "roster" | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // Returning students on this device skip straight to their class
  useEffect(() => {
    const saved = localStorage.getItem(CLASS_CODE_KEY);
    setStep(saved && verifyClassCode(saved) ? "roster" : "code");
  }, []);

  const students = getStudents();
  const roster = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...students]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((s) => !q || s.name.toLowerCase().includes(q));
    // students array is mutated in place by the store; length covers adds/removes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, students.length, query]);

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyClassCode(code)) {
      setError("We couldn't find a class with that code. Check with your teacher.");
      return;
    }
    localStorage.setItem(CLASS_CODE_KEY, normalizeClassCode(code));
    setError("");
    setStep("roster");
  };

  if (step === null) return <AuthShell>{null}</AuthShell>;

  if (step === "code") {
    return (
      <AuthShell>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-tight">Join your class</h1>
          <p className="text-muted mt-1">Enter the code your teacher shared.</p>
          <DemoHint
            label="Demo class code"
            value={formatClassCode()}
            onUse={() => {
              setCode(formatClassCode());
              setError("");
            }}
            className="mt-4"
          />
        </div>
        <form onSubmit={submitCode} noValidate>
          <label htmlFor="class-code" className="sr-only">
            Class code
          </label>
          <input
            id="class-code"
            value={code}
            onChange={(e) => {
              setCode(formatInput(e.target.value));
              setError("");
            }}
            placeholder="ABC-123"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus
            className="input text-center font-display text-3xl! tracking-[0.2em] uppercase py-4! placeholder:text-line-strong"
            aria-invalid={!!error}
            aria-describedby={error ? "class-code-error" : undefined}
          />
          <p id="class-code-error" role="alert" className={`text-sm text-center mt-3 min-h-5 ${error ? "text-negative" : ""}`}>
            {error}
          </p>
          <Button type="submit" size="lg" fullWidth className="mt-4" disabled={normalizeClassCode(code).length < 6}>
            Continue
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <p className="text-sm text-muted">{CLASSROOM.name}</p>
        <h1 className="font-display text-3xl tracking-tight mt-1">Find your name</h1>
        <p className="text-sm text-muted mt-2">Pick anyone to explore as that student.</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-faint absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          autoFocus
          className="input pl-10!"
          aria-label="Search for your name"
        />
      </div>

      <ul className="mt-3 max-h-[360px] overflow-y-auto -mx-2 px-2" aria-label="Students in this class">
        {roster.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => router.push(`/student/${s.id}/login`)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-paper transition-colors text-left group"
            >
              <StudentAvatar studentId={s.id} studentName={s.name} size="sm" />
              <span className="flex-1 font-medium">{s.name}</span>
              <ChevronRight className="w-4 h-4 text-faint group-hover:text-ink" />
            </button>
          </li>
        ))}
        {roster.length === 0 && (
          <li className="text-center text-sm text-muted py-8">
            No one by that name. Check the spelling or ask your teacher.
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => {
          localStorage.removeItem(CLASS_CODE_KEY);
          setCode("");
          setQuery("");
          setStep("code");
        }}
        className="block mx-auto mt-6 text-sm text-muted hover:text-ink underline underline-offset-4 decoration-line-strong"
      >
        Not your class? Enter a different code
      </button>
    </AuthShell>
  );
}
