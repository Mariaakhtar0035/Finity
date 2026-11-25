"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Backpack } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Coin, TOKEN_META, TokenType } from "@/components/ui/Coin";
import { Logo } from "@/components/ui/Logo";
import {
  CoinStackDoodle,
  JarDoodle,
  PencilDoodle,
  PiggyDoodle,
  SproutDoodle,
  StarDoodle,
} from "@/components/ui/Doodles";
import { MrsPennyworthAvatar, PennyworthPortrait } from "@/components/MrsPennyworthAvatar";
import { formatClassCode, resetDemo } from "@/lib/store";
import { useEffect } from "react";


const STATS = [
  { value: "64%", label: "of Canadians say they never learned financial literacy in school." },
  { value: "84%", label: "believe learning it earlier would have reduced their financial stress." },
  { value: "2026", label: "Financial literacy becomes part of the Grade 10 math graduation requirement." },
];

const TOKENS: { type: TokenType; title: string; body: string }[] = [
  {
    type: "spend",
    title: "Spend",
    body: "Tokens to use now in the class reward shop. Kids learn that every choice has a price.",
  },
  {
    type: "save",
    title: "Save",
    body: "Set aside toward a goal they pick themselves, and watch a progress bar fill up.",
  },
  {
    type: "grow",
    title: "Grow",
    body: "Locked away and compounding 2% every week. Patience, made visible.",
  },
];

const FEATURES = [
  {
    title: "A mission marketplace",
    body: "Students request classroom jobs. When a mission is popular, its reward drops, so supply and demand becomes something they feel.",
  },
  {
    title: "A reward shop",
    body: "Real perks, real prices. Deciding between now and later becomes a daily habit instead of a one-time lesson.",
  },
  {
    title: "A teacher dashboard",
    body: "Create missions, approve completed work and see every student's balances at a glance.",
  },
];

export default function HomePage() {

  // Hidden maintenance hook: visiting /?reset restores the starting data
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("reset")) {
      resetDemo();
      url.searchParams.delete("reset");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* ========== NAV ========== */}
      <div className="sticky top-0 z-50 px-3 sm:px-6 pt-3">
        <nav className="max-w-6xl mx-auto bg-surface/95 backdrop-blur rounded-2xl border border-line shadow-soft h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden md:flex items-center gap-6 text-[15px] text-ink-soft">
              <a href="#how-it-works" className="hover:text-ink">How it works</a>
              <a href="#features" className="hover:text-ink">Features</a>
              <a href="#pennyworth" className="hover:text-ink">Mrs. Pennyworth</a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/teacher/login" className="hidden sm:block">
              <Button variant="secondary" size="sm">Teacher login</Button>
            </Link>
            <Link href="/join">
              <Button size="sm">Join your class</Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* ========== HERO ========== */}
      <section className="relative pt-20 md:pt-28">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <p className="font-display text-lg md:text-xl text-muted mb-5">A classroom economy for kids</p>
          <h1 className="display text-[56px] sm:text-[80px] md:text-[112px] text-ink">
            Money lessons kids actually remember
          </h1>
          <p className="text-lg md:text-xl text-ink-soft max-w-2xl mx-auto mt-8 leading-relaxed">
            Students earn, save and grow tokens by doing real classroom missions, building money
            habits long before the stakes are real.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link href="/join">
              <Button size="lg">
                Join your class <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/teacher/login">
              <Button size="lg" variant="secondary">I&apos;m a teacher</Button>
            </Link>
          </div>
        </div>

        {/* Doodle tabletop */}
        <div className="relative h-[220px] md:h-[300px] mt-10 md:mt-6 pointer-events-none select-none" aria-hidden>
          <PiggyDoodle className="absolute bottom-0 left-[2%] md:left-[6%] w-[170px] md:w-[250px] bob" style={{ ["--r" as string]: "-4deg" }} />
          <StarDoodle className="absolute top-2 left-[30%] w-10 md:w-14 hidden sm:block bob" style={{ animationDelay: "1.2s", ["--r" as string]: "12deg" }} />
          <PencilDoodle className="absolute bottom-6 left-[34%] w-[180px] md:w-[240px] hidden md:block" />
          <CoinStackDoodle className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-[56%] md:translate-x-0 w-[120px] md:w-[160px] bob" style={{ animationDelay: "0.6s" }} />
          <StarDoodle fill="#f4e297" className="absolute top-10 right-[24%] w-8 md:w-12 hidden sm:block bob" style={{ animationDelay: "2s", ["--r" as string]: "-10deg" }} />
          <SproutDoodle className="absolute bottom-0 right-[3%] md:right-[8%] w-[120px] md:w-[160px] bob" style={{ animationDelay: "1.6s", ["--r" as string]: "3deg" }} />
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto bg-surface rounded-4xl border border-line grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
          {STATS.map((s) => (
            <div key={s.value} className="p-8 md:p-10">
              <p className="display text-6xl md:text-7xl text-ink">{s.value}</p>
              <p className="text-muted mt-4 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="px-6 pb-20 md:pb-28 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="font-display text-lg text-muted mb-3">How it works</p>
            <h2 className="display text-5xl md:text-6xl text-ink">Three tokens. One big idea.</h2>
            <p className="text-lg text-ink-soft mt-5 leading-relaxed">
              Every reward is split three ways, the same way grown-ups think about a paycheque.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TOKENS.map((t) => (
              <div key={t.type} className={`rounded-4xl p-8 ${TOKEN_META[t.type].soft}`}>
                <Coin type={t.type} size={72} />
                <h3 className="font-display text-3xl tracking-tight mt-8">{t.title}</h3>
                <p className="text-ink-soft mt-3 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="px-6 pb-20 md:pb-28 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.1fr] gap-12 md:gap-20 items-center">
          <div className="relative bg-butter-soft rounded-4xl aspect-[4/3.4] flex items-end justify-center overflow-hidden order-last md:order-first">
            <JarDoodle className="absolute left-[12%] bottom-[14%] w-[30%] bob" />
            <CoinStackDoodle className="absolute right-[12%] bottom-[14%] w-[34%] bob" style={{ animationDelay: "1s" }} />
            <StarDoodle className="absolute top-[14%] left-[44%] w-[12%] bob" style={{ animationDelay: "0.5s" }} />
          </div>
          <div>
            <p className="font-display text-lg text-muted mb-3">Learn by doing</p>
            <h2 className="display text-5xl md:text-6xl text-ink">Real decisions, every single day</h2>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="py-6 flex gap-5">
                  <span className="font-display text-xl text-faint num w-6 shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium text-ink">{f.title}</h3>
                    <p className="text-muted mt-1 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== MRS. PENNYWORTH ========== */}
      <section id="pennyworth" className="px-3 sm:px-6 pb-20 md:pb-28 scroll-mt-24">
        <div className="max-w-6xl mx-auto rounded-4xl overflow-hidden bg-[linear-gradient(120deg,#3f4160_0%,#62668f_55%,#9097c8_100%)] text-white">
          <div className="grid md:grid-cols-2 gap-10 p-8 md:p-16 items-center">
            <div>
              <PennyworthPortrait className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[3px] border-ink mb-8" />
              <p className="font-display text-lg text-white/70 mb-3">Meet Mrs. Pennyworth</p>
              <h2 className="display text-5xl md:text-6xl">A money coach who explains the why</h2>
              <p className="text-lg text-white/80 mt-6 leading-relaxed max-w-md">
                Mrs. Pennyworth is an AI guide built into every screen. She answers questions in
                kid-friendly language and offers options, not orders.
              </p>
            </div>
            <div className="bg-surface text-ink rounded-card p-5 shadow-lift max-w-md md:ml-auto w-full">
              <div className="flex items-center gap-3 pb-4 border-b border-line">
                <MrsPennyworthAvatar size="md" className="w-11! h-11!" />
                <div>
                  <p className="font-medium leading-tight">Mrs. Pennyworth</p>
                  <p className="text-sm text-muted">Your money coach</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 text-[15px]">
                <div className="flex justify-end">
                  <p className="bg-ink text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                    Why did my mission reward go down?
                  </p>
                </div>
                <div className="flex">
                  <p className="bg-paper rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[88%] leading-relaxed">
                    Lots of classmates wanted that mission! When more people want the same thing,
                    each one is worth a little less. That&apos;s supply and demand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CHOOSE YOUR PLAYER ========== */}
      <section id="get-started" className="px-6 pb-24 md:pb-32 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="display text-5xl md:text-6xl text-ink">Ready to start?</h2>
            <p className="text-lg text-muted mt-4">Students join with a class code. Teachers set everything up.</p>
            <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-6 px-4 py-2 rounded-full bg-butter-soft border border-[#efe3ae] text-sm text-ink-soft">
              <span className="font-medium text-ink">Try the demo</span>
              <span>· Class code <span className="font-medium text-ink tracking-wider">{formatClassCode()}</span></span>
              <span>· PIN <span className="font-medium text-ink tracking-wider">1234</span></span>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <Link
              href="/join"
              className="group bg-surface rounded-card border border-line p-8 md:p-10 flex flex-col lift"
            >
              <span className="w-14 h-14 rounded-full bg-peach-soft border-2 border-ink flex items-center justify-center">
                <Backpack className="w-6 h-6" strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-3xl tracking-tight mt-8">I&apos;m a student</h3>
              <p className="text-muted mt-2 leading-relaxed">
                Enter the class code from your teacher, find your name and sign in with your PIN.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-8 font-medium">
                Join your class <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/teacher/login"
              className="group bg-surface rounded-card border border-line p-8 md:p-10 flex flex-col lift"
            >
              <span className="w-14 h-14 rounded-full bg-periwinkle-soft border-2 border-ink flex items-center justify-center">
                <GraduationCap className="w-6 h-6" strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-3xl tracking-tight mt-8">I&apos;m a teacher</h3>
              <p className="text-muted mt-2 leading-relaxed">
                Create missions, stock the reward shop, approve work and track every student&apos;s progress.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-8 font-medium">
                Teacher sign in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-line bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Logo />
            <p className="text-sm text-muted mt-2">Financial literacy, learned by doing.</p>
          </div>
          <Link href="/teacher/login" className="text-[15px] text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink">
            Teacher login
          </Link>
        </div>
      </footer>
    </div>
  );
}
