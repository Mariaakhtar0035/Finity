"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PinPad } from "@/components/PinPad";
import { StudentAvatar } from "@/components/StudentAvatar";
import { getStudent, isHydrated, verifyStudentPin } from "@/lib/store";
import { useStore } from "@/lib/useStore";
import { DemoHint } from "@/components/ui/Feedback";

const SESSION_KEY = "student_session";

export default function StudentLoginPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  useStore();
  const student = getStudent(studentId);

  if (!student) {
    if (!isHydrated()) return <AuthShell>{null}</AuthShell>;
    return (
      <AuthShell>
        <div className="text-center">
          <h1 className="font-display text-2xl">We couldn&apos;t find that student</h1>
          <Link href="/" className="inline-block mt-4 underline underline-offset-4">
            Back to home
          </Link>
        </div>
      </AuthShell>
    );
  }

  const verify = async (pin: string) => verifyStudentPin(studentId, pin);

  return (
    <AuthShell backHref="/join">
      <div className="flex flex-col items-center text-center mb-8">
        <StudentAvatar studentId={student.id} studentName={student.name} size="lg" />
        <h1 className="font-display text-3xl tracking-tight mt-5">Hi, {student.name}</h1>
        <p className="text-muted mt-1">
          Enter your 4-digit PIN ·{" "}
          <Link href="/join" className="underline underline-offset-4 decoration-line-strong hover:text-ink">
            Not you?
          </Link>
        </p>
        <DemoHint label="Demo PIN" value={student.pin} className="mt-4" />
      </div>
      <PinPad
        verify={verify}
        onSuccess={() => {
          localStorage.setItem(SESSION_KEY, studentId);
          router.push(`/student/${studentId}`);
        }}
      />
    </AuthShell>
  );
}
