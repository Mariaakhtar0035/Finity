"use client";

import { useParams } from "next/navigation";
import { MarketLeaderboard } from "@/components/MarketLeaderboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveIndicator } from "@/components/ui/Feedback";
import { getLastChangedAt, getMissions, getStudent } from "@/lib/store";
import { useStore } from "@/lib/useStore";

export default function StudentLeaderboardPage() {
  const params = useParams();
  const studentId = params.id as string;
  useStore();
  const student = getStudent(studentId);

  return (
    <div>
      <PageHeader
        eyebrow="Market trends"
        title="What's hot in class"
        description="See which missions everyone wants and how that changes their rewards."
        action={<LiveIndicator lastUpdate={getLastChangedAt()} />}
      />
      <MarketLeaderboard missions={[...getMissions()]} studentId={studentId} studentName={student?.name} />
    </div>
  );
}
