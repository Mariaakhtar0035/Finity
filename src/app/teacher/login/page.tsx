"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PinPad } from "@/components/PinPad";
import { DEMO_TEACHER_PIN, setTeacherSession } from "@/lib/useStore";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";

export default function TeacherLoginPage() {
  const router = useRouter();

  const verify = async (pin: string) => pin === DEMO_TEACHER_PIN;

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center mb-8">
        <MrsPennyworthAvatar size="lg" className="w-20! h-20!" />
        <h1 className="font-display text-3xl tracking-tight mt-5">Teacher sign in</h1>
        <p className="text-muted mt-1">Enter your 4-digit PIN to manage your class</p>
      </div>
      <PinPad
        verify={verify}
        onSuccess={() => {
          setTeacherSession(true);
          router.push("/teacher");
        }}
      />
    </AuthShell>
  );
}
