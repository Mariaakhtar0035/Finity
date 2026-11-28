"use client";

import { useParams } from "next/navigation";
import { RoomExperience } from "@/components/room/RoomExperience";

export default function RoomPage() {
  const params = useParams();
  return <RoomExperience studentId={params.id as string} />;
}
