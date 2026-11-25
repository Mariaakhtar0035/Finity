import type { NextRequest } from "next/server";

/**
 * Small in-memory rate limiter for the public showcase.
 *
 * Limits are per server instance (serverless instances don't share memory),
 * so treat this as a speed bump against abuse, not a hard guarantee. Set a
 * budget or quota on your AI provider account as the real ceiling.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const PER_VISITOR_LIMIT = 25; // AI calls per visitor per window
const GLOBAL_LIMIT = 300; // AI calls per instance per window

type Bucket = { count: number; resetAt: number };
const visitors = new Map<string, Bucket>();
let global: Bucket = { count: 0, resetAt: Date.now() + WINDOW_MS };

function clientId(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Returns true if the request may proceed, and counts it. */
export function allowAiRequest(req: NextRequest): boolean {
  const now = Date.now();

  if (now > global.resetAt) global = { count: 0, resetAt: now + WINDOW_MS };
  if (global.count >= GLOBAL_LIMIT) return false;

  const id = clientId(req);
  let bucket = visitors.get(id);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    visitors.set(id, bucket);
  }
  if (bucket.count >= PER_VISITOR_LIMIT) return false;

  bucket.count += 1;
  global.count += 1;

  // Keep the map from growing without bound
  if (visitors.size > 5000) {
    for (const [key, b] of visitors) if (now > b.resetAt) visitors.delete(key);
  }
  return true;
}
