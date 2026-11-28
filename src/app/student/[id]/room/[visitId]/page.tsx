"use client";

import { useParams } from "next/navigation";
import { RoomExperience } from "@/components/room/RoomExperience";

/** Visiting a classmate's room */
export default function VisitRoomPage() {
  const params = useParams();
  return <RoomExperience key={params.visitId as string} studentId={params.id as string} visitId={params.visitId as string} />;
}
