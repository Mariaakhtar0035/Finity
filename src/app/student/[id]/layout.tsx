"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Gift,
  Home,
  ListChecks,
  LogOut,
  PiggyBank,
  Sprout,
  Store,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Loading } from "@/components/ui/Loading";
import { StudentAvatar } from "@/components/StudentAvatar";
import { MrsPennyworthPanel } from "@/components/MrsPennyworthPanel";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";
import {
  getStudent,
  getStudentMissions,
  getAvailableMissions,
  getMissions,
  getRewards,
} from "@/lib/store";
import { NarratorPage } from "@/types";

const SESSION_KEY = "student_session";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const studentId = params.id as string;
  const student = getStudent(studentId);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showPennyworthPanel, setShowPennyworthPanel] = useState(false);

  const isLoginPage = pathname.endsWith("/login");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoginPage) {
      const session = localStorage.getItem(SESSION_KEY);
      if (session !== studentId) {
        router.replace(`/student/${studentId}/login`);
        return;
      }
    }
    setSessionChecked(true);
  }, [isLoginPage, studentId, router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="display text-4xl mb-4">Student not found</h1>
          <Link href="/" className="underline underline-offset-4">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const base = `/student/${studentId}`;
  const navItems: { href: string; label: string; icon: LucideIcon }[] = [
    { href: base, label: "Home", icon: Home },
    { href: `${base}/marketplace`, label: "Missions", icon: Store },
    { href: `${base}/missions`, label: "Activity", icon: ListChecks },
    { href: `${base}/save`, label: "Save", icon: PiggyBank },
    { href: `${base}/grow`, label: "Grow", icon: Sprout },
    { href: `${base}/shop`, label: "Reward shop", icon: Gift },
    { href: `${base}/leaderboard`, label: "Market trends", icon: TrendingUp },
  ];

  // Determine current page for narrator
  const getPage = (): NarratorPage => {
    if (pathname.endsWith("/marketplace")) return "marketplace";
    if (pathname.endsWith("/missions")) return "missions";
    if (pathname.endsWith("/grow")) return "grow";
    if (pathname.endsWith("/save")) return "save";
    if (pathname.endsWith("/shop")) return "shop";
    if (pathname.endsWith("/leaderboard")) return "marketplace";
    return "dashboard";
  };

  const currentPage = getPage();
  const studentMissions = getStudentMissions(studentId);
  const availableMissions = getAvailableMissions();
  const allMissions = getMissions();
  const allRewards = getRewards();
  const completedMissions = allMissions.filter(
    (m) => m.assignedStudentId === studentId && m.status === "COMPLETED",
  );
  const purchasedRewardItems = allRewards.filter((r) => student.purchasedRewards.includes(r.id));
  const askNarratorContext = {
    spendTokens: student.spendTokens,
    saveTokens: student.saveTokens,
    growTokens: student.growTokens,
    currentPage,
    assignedMissionsCount: studentMissions.length,
    assignedMissionTitles: studentMissions.map((m) => m.title),
    completedMissionTitles: completedMissions.slice(-3).map((m) => m.title),
    purchasedRewardsCount: student.purchasedRewards.length,
    purchasedRewardTitles: purchasedRewardItems.map((r) => r.title),
    availableMissionsCount: availableMissions.length,
    availableMissions: availableMissions.map((m) => ({
      title: m.title,
      reward: m.currentReward,
    })),
    availableRewards: allRewards
      .filter((r) => !r.soldOut)
      .map((r) => ({ title: r.title, cost: r.cost })),
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface border-r border-line px-4 py-6 z-30">
        <div className="px-3">
          <Logo href={base} />
        </div>

        <div className="flex items-center gap-3 mx-1 mt-8 mb-6 p-3 rounded-2xl bg-paper">
          <StudentAvatar studentId={student.id} studentName={student.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium leading-tight truncate">{student.name}</p>
            <p className="text-xs text-muted">Student</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5" aria-label="Main">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] transition-colors ${
                  isActive ? "bg-ink text-white" : "text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            type="button"
            onClick={() => setShowPennyworthPanel(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-lavender-soft hover:bg-lavender/60 transition-colors text-left"
          >
            <MrsPennyworthAvatar size="sm" />
            <div>
              <p className="text-sm font-medium leading-tight">Ask Mrs. Pennyworth</p>
              <p className="text-xs text-muted">Your money coach</p>
            </div>
          </button>
          <Link
            href="/"
            onClick={handleLogout}
            className="flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] text-muted hover:text-ink hover:bg-paper"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            Sign out
          </Link>
        </div>
      </aside>

      {/* ===== Mobile header ===== */}
      <header className="lg:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
        <div className="flex items-center justify-between h-16 px-4">
          <Logo href={base} />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              onClick={handleLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.75} />
            </Link>
            <StudentAvatar studentId={student.id} studentName={student.name} size="sm" />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 -mt-1 [scrollbar-width:none]" aria-label="Main">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 h-9 px-4 rounded-full text-sm flex items-center transition-colors ${
                  isActive ? "bg-ink text-white" : "text-ink-soft bg-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ===== Content ===== */}
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 md:py-12">{children}</div>
      </main>

      {/* Floating coach button */}
      {!showPennyworthPanel && (
        <button
          type="button"
          onClick={() => setShowPennyworthPanel(true)}
          className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-surface border border-line shadow-lift flex items-center justify-center hover:scale-105 transition-transform lg:hidden"
          aria-label="Ask Mrs. Pennyworth"
        >
          <MrsPennyworthAvatar size="md" className="border-0" />
        </button>
      )}

      <MrsPennyworthPanel
        isOpen={showPennyworthPanel}
        onClose={() => setShowPennyworthPanel(false)}
        onToggle={() => setShowPennyworthPanel((prev) => !prev)}
        studentName={student.name}
        context={askNarratorContext}
      />
    </div>
  );
}
