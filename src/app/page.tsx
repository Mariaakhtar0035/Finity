"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Backpack, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { Logo, Wordmark } from "@/components/ui/Logo";
import {
  CoinStackDoodle,
  PencilDoodle,
  PiggyDoodle,
  SproutDoodle,
  StarDoodle,
} from "@/components/ui/Doodles";
import { PennyworthPortrait } from "@/components/MrsPennyworthAvatar";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { SplitShowcase } from "@/components/SplitShowcase";
import { PennyworthChatDemo } from "@/components/PennyworthChatDemo";
import { FooterWordmark } from "@/components/FooterWordmark";
import { FinityCard } from "@/components/FinityCard";
import { formatClassCode, resetDemo } from "@/lib/store";
import { useEffect, useState } from "react";




export default function HomePage() {
  const [cardName, setCardName] = useState("Alex");

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
      <section className="relative pt-20 md:pt-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-ink leading-none pb-4 md:pb-6">
            <Wordmark className="text-[96px] sm:text-[140px] md:text-[184px] tracking-[-0.03em]" />
          </h1>
          <p className="font-display text-2xl md:text-3xl text-ink-soft tracking-tight mt-2">Learn money by using it.</p>
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

        {/* Card + doodle tabletop */}
        <div className="relative h-[300px] sm:h-[360px] md:h-[460px] mt-10 md:mt-8 select-none max-w-6xl mx-auto">
          <div aria-hidden className="pointer-events-none">
            <StarDoodle className="absolute top-0 left-[24%] w-9 md:w-14 bob" style={{ animationDelay: "1.2s", ["--r" as string]: "12deg" }} />
            <StarDoodle fill="#f4e297" className="absolute top-6 right-[22%] w-8 md:w-12 bob" style={{ animationDelay: "2s", ["--r" as string]: "-10deg" }} />
            <PiggyDoodle className="absolute bottom-2 -left-6 sm:left-[2%] w-[130px] sm:w-[180px] md:w-[240px] bob" style={{ ["--r" as string]: "-4deg" }} />
            <SproutDoodle className="absolute bottom-2 -right-4 sm:right-[3%] w-[100px] sm:w-[130px] md:w-[160px] bob" style={{ animationDelay: "1.6s", ["--r" as string]: "3deg" }} />
            <PencilDoodle className="absolute bottom-0 left-[17%] w-[170px] hidden lg:block z-20 -rotate-6" />
          </div>

          {/* The card, resting on the table */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-10 md:bottom-14 w-[230px] sm:w-[320px] md:w-[440px] z-10">
            <div className="bob" style={{ ["--r" as string]: "0deg", animationDuration: "6s" }}>
              <FinityCard tilted interactive name={cardName} subtitle="Student · Grade 4" />
            </div>
          </div>

          <CoinStackDoodle
            aria-hidden
            className="absolute bottom-0 left-[60%] sm:left-[62%] md:left-[63%] w-[84px] sm:w-[110px] md:w-[140px] z-20 bob pointer-events-none"
            style={{ animationDelay: "0.6s" }}
          />
        </div>

        {/* Put your name on it */}
        <div className="relative z-10 flex flex-col items-center gap-2 mt-6 px-6">
          <label htmlFor="card-name" className="text-sm text-muted">
            Put your name on the card · tap it to flip
          </label>
          <div className="relative">
            <Pencil className="w-4 h-4 text-faint absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="card-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.slice(0, 16))}
              placeholder="Your name"
              autoComplete="off"
              spellCheck={false}
              className="h-11 w-60 rounded-full border border-line-strong bg-surface pl-10 pr-4 text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ========== PURPOSE ========== */}
      <section className="px-6 pt-28 md:pt-44 pb-28 md:pb-44">
        <p className="max-w-4xl mx-auto text-center font-display text-[34px] sm:text-5xl md:text-6xl leading-[1.15] tracking-tight text-ink text-balance">
          Most kids learn about money from a worksheet. With Finity, they earn it, spend it and save it every week in
          class, so the lessons actually stick.
        </p>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="px-6 pb-28 md:pb-44 scroll-mt-24">
        <SplitShowcase />
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="px-6 pb-28 md:pb-44 scroll-mt-24">
        <FeatureShowcase />
      </section>

      {/* ========== MRS. PENNYWORTH ========== */}
      <section id="pennyworth" className="px-3 sm:px-6 pb-28 md:pb-44 scroll-mt-24">
        <div className="max-w-6xl mx-auto rounded-4xl overflow-hidden bg-[linear-gradient(120deg,#3f4160_0%,#62668f_55%,#9097c8_100%)] text-white">
          <div className="grid md:grid-cols-2 gap-10 p-8 md:p-16 items-center">
            <div>
              <PennyworthPortrait className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[3px] border-ink mb-8" />
              <p className="font-display text-lg text-white/70 mb-3">Meet Mrs. Pennyworth</p>
              <h2 className="display text-5xl md:text-6xl">A money coach for every student</h2>
              <p className="text-lg text-white/80 mt-6 leading-relaxed max-w-md">
                Mrs. Pennyworth is an AI guide on every student page. Kids can ask her things like why a
                mission pays less today, and she answers in plain words using their own balances.
              </p>
            </div>
            <PennyworthChatDemo />
          </div>
        </div>
      </section>

      {/* ========== CHOOSE YOUR PLAYER ========== */}
      <section id="get-started" className="px-6 pb-28 md:pb-40 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="display text-5xl md:text-6xl text-ink">Ready to start?</h2>
            <p className="text-lg text-muted mt-4">Recommended for grades 3 to 6. Students join with a class code, and teachers set everything up.</p>
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
      <footer className="border-t border-line bg-surface overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-20">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="text-ink-soft mt-4 max-w-xs leading-relaxed">A classroom economy, recommended for grades 3 to 6.</p>
              <Link href="/join" className="inline-block mt-6">
                <Button size="sm">
                  Join your class <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <nav aria-label="Explore">
              <p className="text-sm text-muted mb-4">Explore</p>
              <ul className="space-y-3 text-[15px]">
                <li><a href="#how-it-works" className="hover:underline underline-offset-4">How it works</a></li>
                <li><a href="#features" className="hover:underline underline-offset-4">Features</a></li>
                <li><a href="#pennyworth" className="hover:underline underline-offset-4">Mrs. Pennyworth</a></li>
              </ul>
            </nav>

            <nav aria-label="Get started">
              <p className="text-sm text-muted mb-4">Get started</p>
              <ul className="space-y-3 text-[15px]">
                <li><Link href="/join" className="hover:underline underline-offset-4">Join your class</Link></li>
                <li><Link href="/teacher/login" className="hover:underline underline-offset-4">Teacher login</Link></li>
              </ul>
            </nav>

            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-muted mb-4">Try the demo</p>
              <dl className="space-y-3 text-[15px]">
                <div className="flex gap-2">
                  <dt className="text-ink-soft">Class code</dt>
                  <dd className="font-medium tracking-wider">{formatClassCode()}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-ink-soft">PIN</dt>
                  <dd className="font-medium tracking-wider">1234</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-16 pt-6 border-t border-line text-sm text-muted">
            <p>© {new Date().getFullYear()} Finity</p>
            <p>Tokens only. No real money changes hands.</p>
          </div>
        </div>

        {/* Big wordmark, cut off by the bottom edge. Point at the letters. */}
        <div className="text-center mt-6 -mb-[0.22em]">
          <FooterWordmark className="inline-block text-[34vw] md:text-[27vw] tracking-[-0.04em]" />
        </div>
      </footer>
    </div>
  );
}
