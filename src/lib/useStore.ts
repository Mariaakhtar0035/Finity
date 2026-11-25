"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getVersion, hydrateStore, subscribe } from "@/lib/store";

/**
 * Re-render the calling component whenever demo data changes
 * (in this tab or another). Returns a version number that can be
 * used as a dependency.
 *
 * The server and the first client render both see the seed data;
 * saved data is loaded right after mount to avoid hydration mismatches.
 */
export function useStore(): number {
  useEffect(() => {
    hydrateStore();
  }, []);
  return useSyncExternalStore(subscribe, getVersion, () => 0);
}

const TEACHER_SESSION_KEY = "teacher_session";
export const DEMO_TEACHER_PIN = "1234";

export function setTeacherSession(on: boolean) {
  if (on) localStorage.setItem(TEACHER_SESSION_KEY, "1");
  else localStorage.removeItem(TEACHER_SESSION_KEY);
}

export function hasTeacherSession(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(TEACHER_SESSION_KEY) === "1";
}
