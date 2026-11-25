"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PinPad } from "@/components/PinPad";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";

export default function TeacherLoginPage() {
  const router = useRouter();

  const verify = async (pin: string) => {
    const response = await fetch("/api/teacher/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await response.json();
    return !!data.success;
  };

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center mb-8">
        <MrsPennyworthAvatar size="lg" className="w-20! h-20!" />
        <h1 className="font-display text-3xl tracking-tight mt-5">Teacher sign in</h1>
        <p className="text-muted mt-1">Enter your 4-digit PIN to manage your class</p>
      </div>
      <PinPad verify={verify} onSuccess={() => router.push("/teacher")} />
    </AuthShell>
  );
}
