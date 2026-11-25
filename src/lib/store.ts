import { Student, Mission, Reward, MissionStatus, MissionBandColor, BalanceHistoryEntry, PendingReward, ActivityEntry, TourStep } from "@/types";
import { generateHistoryFromCurrent, WEEKLY_RATE } from "@/lib/growthCalculator";
import { RECOMMENDED_SPEND_RATIO, RECOMMENDED_SAVE_RATIO, RECOMMENDED_GROW_RATIO } from "@/lib/constants";

/*
 * Demo data store.
 *
 * Finity's showcase build keeps all data in the visitor's browser: each
 * visitor gets their own sandbox, saved to localStorage so progress survives
 * a refresh. Changes are broadcast to subscribers (see useStore) and synced
 * across tabs, so a teacher tab and a student tab stay in step.
 */

// Seed data — prepopulated with varied activity
let students: Student[] = [
  {
    id: "alex",
    name: "Alex",
    pin: "1234",
    spendTokens: 165,
    saveTokens: 60,
    growTokens: 95,
    assignedMissions: ["mission-1", "mission-5"],
    purchasedRewards: ["reward-2"],
    saveGoalRewardId: "reward-3",
    balanceHistory: [
      { week: 1, spendBalance: 20, saveBalance: 6, growBalance: 10 },
      { week: 2, spendBalance: 55, saveBalance: 12, growBalance: 22 },
      { week: 3, spendBalance: 48, saveBalance: 18, growBalance: 35 },
      { week: 4, spendBalance: 72, saveBalance: 24, growBalance: 48 },
      { week: 5, spendBalance: 95, saveBalance: 30, growBalance: 62 },
      { week: 6, spendBalance: 78, saveBalance: 36, growBalance: 72 },
      { week: 7, spendBalance: 102, saveBalance: 42, growBalance: 78 },
      { week: 8, spendBalance: 125, saveBalance: 48, growBalance: 82 },
      { week: 9, spendBalance: 118, saveBalance: 52, growBalance: 85 },
      { week: 10, spendBalance: 142, saveBalance: 54, growBalance: 88 },
      { week: 11, spendBalance: 158, saveBalance: 58, growBalance: 91 },
      { week: 12, spendBalance: 165, saveBalance: 60, growBalance: 95 },
    ],
  },
  {
    id: "jordan",
    name: "Jordan",
    pin: "1234",
    spendTokens: 45,
    saveTokens: 30,
    growTokens: 82,
    assignedMissions: ["mission-2"],
    purchasedRewards: ["reward-1", "reward-2"],
    saveGoalRewardId: "reward-10",
    balanceHistory: [
      { week: 1, spendBalance: 30, saveBalance: 3, growBalance: 15 },
      { week: 2, spendBalance: 65, saveBalance: 6, growBalance: 28 },
      { week: 3, spendBalance: 52, saveBalance: 9, growBalance: 38 },
      { week: 4, spendBalance: 38, saveBalance: 12, growBalance: 48 },
      { week: 5, spendBalance: 55, saveBalance: 15, growBalance: 55 },
      { week: 6, spendBalance: 42, saveBalance: 18, growBalance: 62 },
      { week: 7, spendBalance: 48, saveBalance: 21, growBalance: 68 },
      { week: 8, spendBalance: 45, saveBalance: 24, growBalance: 74 },
      { week: 9, spendBalance: 50, saveBalance: 27, growBalance: 78 },
      { week: 10, spendBalance: 45, saveBalance: 30, growBalance: 82 },
    ],
  },
  {
    id: "sam",
    name: "Sam",
    pin: "1234",
    spendTokens: 230,
    saveTokens: 90,
    growTokens: 120,
    assignedMissions: ["mission-3"],
    purchasedRewards: ["reward-1", "reward-3"],
    saveGoalRewardId: "reward-4",
  },
  {
    id: "riley",
    name: "Riley",
    pin: "1234",
    spendTokens: 88,
    saveTokens: 40,
    growTokens: 65,
    assignedMissions: ["mission-4"],
    purchasedRewards: [],
  },
  {
    id: "morgan",
    name: "Morgan",
    pin: "1234",
    spendTokens: 142,
    saveTokens: 55,
    growTokens: 55,
    assignedMissions: ["mission-6"],
    purchasedRewards: ["reward-2", "reward-4"],
  },
  {
    id: "casey",
    name: "Casey",
    pin: "1234",
    spendTokens: 100,
    saveTokens: 35,
    growTokens: 50,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "aiden",
    name: "Aiden",
    pin: "1234",
    spendTokens: 122,
    saveTokens: 29,
    growTokens: 121,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "amara",
    name: "Amara",
    pin: "1234",
    spendTokens: 206,
    saveTokens: 16,
    growTokens: 38,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "ben",
    name: "Ben",
    pin: "1234",
    spendTokens: 250,
    saveTokens: 78,
    growTokens: 44,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "chloe",
    name: "Chloe",
    pin: "1234",
    spendTokens: 133,
    saveTokens: 84,
    growTokens: 34,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "daniel",
    name: "Daniel",
    pin: "1234",
    spendTokens: 169,
    saveTokens: 37,
    growTokens: 29,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "elena",
    name: "Elena",
    pin: "1234",
    spendTokens: 62,
    saveTokens: 65,
    growTokens: 127,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "ethan",
    name: "Ethan",
    pin: "1234",
    spendTokens: 57,
    saveTokens: 40,
    growTokens: 43,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "fatima",
    name: "Fatima",
    pin: "1234",
    spendTokens: 181,
    saveTokens: 64,
    growTokens: 35,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "grace",
    name: "Grace",
    pin: "1234",
    spendTokens: 251,
    saveTokens: 82,
    growTokens: 51,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "hiro",
    name: "Hiro",
    pin: "1234",
    spendTokens: 97,
    saveTokens: 90,
    growTokens: 35,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "isla",
    name: "Isla",
    pin: "1234",
    spendTokens: 187,
    saveTokens: 84,
    growTokens: 121,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "jamal",
    name: "Jamal",
    pin: "1234",
    spendTokens: 52,
    saveTokens: 38,
    growTokens: 31,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "leah",
    name: "Leah",
    pin: "1234",
    spendTokens: 182,
    saveTokens: 119,
    growTokens: 54,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "lucas",
    name: "Lucas",
    pin: "1234",
    spendTokens: 114,
    saveTokens: 63,
    growTokens: 56,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "maya",
    name: "Maya",
    pin: "1234",
    spendTokens: 178,
    saveTokens: 25,
    growTokens: 98,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "noah",
    name: "Noah",
    pin: "1234",
    spendTokens: 183,
    saveTokens: 114,
    growTokens: 66,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "olivia",
    name: "Olivia",
    pin: "1234",
    spendTokens: 66,
    saveTokens: 84,
    growTokens: 68,
    assignedMissions: [],
    purchasedRewards: [],
  },
  {
    id: "priya",
    name: "Priya",
    pin: "1234",
    spendTokens: 135,
    saveTokens: 22,
    growTokens: 36,
    assignedMissions: [],
    purchasedRewards: [],
  },
];

let missions: Mission[] = [
  {
    id: "mission-1",
    title: "Organize Classroom Library",
    description: "Sort books by genre and create a catalog system",
    baseReward: 100,
    currentReward: 100,
    requestCount: 0,
    requestedBy: [],
    status: "IN_PROGRESS",
    assignedStudentId: "alex",
    bandColor: "green",
  },
  {
    id: "mission-2",
    title: "Help Setup Science Lab",
    description: "Arrange equipment and label all materials",
    baseReward: 120,
    currentReward: 120,
    requestCount: 0,
    requestedBy: [],
    status: "IN_PROGRESS",
    assignedStudentId: "jordan",
    bandColor: "darkBlue",
  },
  {
    id: "mission-3",
    title: "Create Welcome Poster",
    description: "Design a colorful poster for new students",
    baseReward: 80,
    currentReward: 80,
    requestCount: 0,
    requestedBy: [],
    status: "IN_PROGRESS",
    assignedStudentId: "sam",
    bandColor: "lightBlue",
  },
  {
    id: "mission-4",
    title: "Tech Helper for Week",
    description: "Assist classmates with computer problems",
    baseReward: 150,
    currentReward: 150,
    requestCount: 0,
    requestedBy: [],
    status: "IN_PROGRESS",
    assignedStudentId: "riley",
    bandColor: "red",
  },
  {
    id: "mission-5",
    title: "Lunch Monitor Assistant",
    description: "Help organize lunch line and clean up",
    baseReward: 90,
    currentReward: 90,
    requestCount: 0,
    requestedBy: [],
    status: "IN_PROGRESS",
    assignedStudentId: "alex",
    bandColor: "yellow",
  },
  {
    id: "mission-6",
    title: "Garden Maintenance",
    description: "Water plants and remove weeds from school garden",
    baseReward: 110,
    currentReward: 110,
    requestCount: 0,
    requestedBy: [],
    status: "IN_PROGRESS",
    assignedStudentId: "morgan",
    bandColor: "orange",
  },
  {
    id: "mission-7",
    title: "Peer Tutoring Session",
    description: "Help a classmate with homework for 30 minutes",
    baseReward: 130,
    currentReward: 104, // 3 requests = 20% drop
    requestCount: 3,
    requestedBy: ["alex", "jordan", "sam"],
    status: "AVAILABLE",
    bandColor: "brown",
  },
  {
    id: "mission-8",
    title: "Event Planning Helper",
    description: "Assist with organizing the class celebration",
    baseReward: 140,
    currentReward: 126, // 2 requests = 10% drop
    requestCount: 2,
    requestedBy: ["riley", "morgan"],
    status: "AVAILABLE",
    bandColor: "purple",
  },
  {
    id: "mission-9",
    title: "Recycle Program Leader",
    description: "Collect and sort recyclables for one week",
    baseReward: 95,
    currentReward: 85, // 2 requests = 10% drop
    requestCount: 2,
    requestedBy: ["casey", "alex"],
    status: "AVAILABLE",
    bandColor: "green",
  },
  {
    id: "mission-10",
    title: "Morning Greeter",
    description: "Welcome classmates at the door each morning",
    baseReward: 75,
    currentReward: 75,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: "lightBlue",
  },
  {
    id: "mission-11",
    title: "Art Supply Organizer",
    description: "Tidy and label art supplies in the classroom",
    baseReward: 85,
    currentReward: 85,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: "red",
  },
  {
    id: "mission-12",
    title: "Weather Reporter",
    description: "Update the classroom weather chart each day",
    baseReward: 70,
    currentReward: 70,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: "yellow",
  },
  {
    id: "mission-13",
    title: "Class Photographer",
    description: "Take photos at the next class event",
    baseReward: 125,
    currentReward: 125,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: "purple",
  },
  {
    id: "mission-14",
    title: "Snack Helper",
    description: "Help pass out snacks and clean up after",
    baseReward: 65,
    currentReward: 65,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: "orange",
  },
  {
    id: "mission-15",
    title: "Math Game Host",
    description: "Lead a math review game for the class",
    baseReward: 160,
    currentReward: 160,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: "darkBlue",
  },
];

let rewards: Reward[] = [
  {
    id: "reward-1",
    title: "Extra Deadline Extension",
    description: "Get 2 extra days for any assignment",
    cost: 50,
    icon: "clock",
  },
  {
    id: "reward-2",
    title: "Test Hint Card",
    description: "Get one helpful hint during a test",
    cost: 30,
    icon: "lightbulb",
  },
  {
    id: "reward-3",
    title: "Homework Pass",
    description: "Skip one homework assignment",
    cost: 80,
    icon: "notebook",
  },
  {
    id: "reward-4",
    title: "Mystery Reward",
    description: "A surprise reward chosen by your teacher!",
    cost: 100,
    icon: "gift",
    soldOut: false,
  },
  {
    id: "reward-5",
    title: "Choose the Class Game",
    description: "Pick the game for Friday fun time",
    cost: 45,
    icon: "gamepad",
  },
  {
    id: "reward-6",
    title: "Sit by a Friend",
    description: "Choose your seat for one day",
    cost: 25,
    icon: "chair",
  },
  {
    id: "reward-7",
    title: "Lunch with the Teacher",
    description: "Special lunch in the classroom",
    cost: 120,
    icon: "lunch",
    soldOut: true,
  },
  {
    id: "reward-8",
    title: "No Uniform Day Pass",
    description: "Wear your favorite outfit to school",
    cost: 75,
    icon: "shirt",
  },
  {
    id: "reward-9",
    title: "Extra Recess Time",
    description: "5 extra minutes at recess",
    cost: 40,
    icon: "ball",
  },
  {
    id: "reward-10",
    title: "Class DJ for a Day",
    description: "Pick the music during work time",
    cost: 60,
    icon: "music",
  },
];

/* ------------------------------------------------------------------
   Classroom
------------------------------------------------------------------- */
export const CLASSROOM = {
  name: "Grade 7 · Room 204",
  /** Shown to teachers as FIN-482; students can type it with or without the dash */
  code: "FIN482",
};

/** Normalize what a student typed: uppercase, letters and digits only */
export function normalizeClassCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatClassCode(code: string = CLASSROOM.code): string {
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

export function verifyClassCode(input: string): boolean {
  return normalizeClassCode(input) === CLASSROOM.code;
}

/* ------------------------------------------------------------------
   Persistence + change notifications
------------------------------------------------------------------- */
const STORAGE_KEY = "finity-demo-v4";

type Snapshot = {
  students: Student[];
  missions: Mission[];
  rewards: Reward[];
  pendingRewards: PendingReward[];
  currentWeek: number;
  activity: ActivityEntry[];
  tour: Partial<Record<TourStep, boolean>>;
  tourDismissed: boolean;
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** The class starts in week 12 of the school term */
const SEED_WEEK = 12;
let currentWeek = SEED_WEEK;
let activity: ActivityEntry[] = [];
let tour: Partial<Record<TourStep, boolean>> = {};
let tourDismissed = false;

/* Give every seeded student a 12-week history that ends at today's balances,
   plus a few past purchases in their activity feed. */
(function prepareSeed() {
  students.forEach((s) => {
    let h = s.balanceHistory?.length
      ? s.balanceHistory
      : generateHistoryFromCurrent(s.spendTokens, s.saveTokens, s.growTokens, SEED_WEEK);
    const offset = SEED_WEEK - h[h.length - 1].week;
    h = h.map((e) => ({ ...e, week: e.week + offset }));
    while (h[0].week > 1) h.unshift({ week: h[0].week - 1, spendBalance: 0, saveBalance: 0, growBalance: 0 });
    h[h.length - 1] = { week: SEED_WEEK, spendBalance: s.spendTokens, saveBalance: s.saveTokens, growBalance: s.growTokens };
    s.balanceHistory = h;

    s.purchasedRewards.forEach((rid, i) => {
      const reward = rewards.find((r) => r.id === rid);
      if (!reward) return;
      const week = Math.max(1, SEED_WEEK - 2 - i * 3);
      activity.push({
        id: `seed-${s.id}-${rid}`,
        studentId: s.id,
        week,
        kind: "spent",
        title: `Bought ${reward.title}`,
        spend: -reward.cost,
        save: 0,
        grow: 0,
        at: week,
      });
    });
  });
  activity.sort((a, b) => b.week - a.week);
})();

// Captured before any mutation so "Reset demo" can restore it
const SEED: Snapshot = clone({
  students,
  missions,
  rewards,
  pendingRewards: [],
  currentWeek,
  activity,
  tour: {},
  tourDismissed: false,
});

let version = 0;
let lastChangedAt = Date.now();
let commitScheduled = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  lastChangedAt = Date.now();
  listeners.forEach((l) => l());
}

function save() {
  if (typeof window === "undefined") return;
  try {
    const snapshot: Snapshot = {
      students,
      missions,
      rewards,
      pendingRewards,
      currentWeek,
      activity,
      tour,
      tourDismissed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage full or unavailable — the demo still works in memory
  }
}

/** Mark state as changed; saves + notifies once after the current task */
function touch() {
  if (commitScheduled) return;
  commitScheduled = true;
  queueMicrotask(() => {
    commitScheduled = false;
    save();
    emit();
  });
}

function applySnapshot(snap: Snapshot) {
  students = snap.students;
  missions = snap.missions;
  rewards = snap.rewards;
  pendingRewards = snap.pendingRewards ?? [];
  currentWeek = snap.currentWeek ?? SEED_WEEK;
  activity = snap.activity ?? [];
  tour = snap.tour ?? {};
  tourDismissed = snap.tourDismissed ?? false;
}

function loadFromStorage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const snap = JSON.parse(raw) as Snapshot;
    if (!Array.isArray(snap.students) || !Array.isArray(snap.missions) || !Array.isArray(snap.rewards)) return false;
    applySnapshot(snap);
    return true;
  } catch {
    return false;
  }
}

/** Load saved demo data and start listening for changes from other tabs. Client-only, idempotent. */
export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  loadFromStorage();
  emit();
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    if (e.newValue === null) applySnapshot(clone(SEED));
    else loadFromStorage();
    emit();
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isHydrated(): boolean {
  return hydrated;
}

export function getVersion(): number {
  return version;
}

export function getLastChangedAt(): Date {
  return new Date(lastChangedAt);
}

/** Restore the original demo data (in this tab and any other open tabs) */
export function resetDemo() {
  applySnapshot(clone(SEED));
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  emit();
}

/* ------------------------------------------------------------------
   Weeks, balance history, activity feed and the first-visit checklist
------------------------------------------------------------------- */
const BUCKET_LABEL: Record<TokenBucket, string> = { spend: "Spend", save: "Save", grow: "Grow" };

/** Record a student's balances for the current week (replaces this week's entry) */
function snapshotBalances(student: Student) {
  const entry: BalanceHistoryEntry = {
    week: currentWeek,
    spendBalance: student.spendTokens,
    saveBalance: student.saveTokens,
    growBalance: student.growTokens,
  };
  const h = student.balanceHistory ?? (student.balanceHistory = []);
  if (h.length && h[h.length - 1].week === currentWeek) h[h.length - 1] = entry;
  else h.push(entry);
}

function logActivity(entry: Omit<ActivityEntry, "id" | "week" | "at">) {
  activity.unshift({
    ...entry,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    week: currentWeek,
    at: Date.now(),
  });
  if (activity.length > 1000) activity.length = 1000;
}

function markTour(step: TourStep) {
  tour[step] = true;
}

export function getCurrentWeek(): number {
  return currentWeek;
}

export function getActivity(studentId: string): ActivityEntry[] {
  return activity.filter((a) => a.studentId === studentId);
}

/** Total Grow tokens a student has earned from weekly interest */
export function getInterestEarned(studentId: string): number {
  return activity
    .filter((a) => a.studentId === studentId && a.kind === "interest")
    .reduce((sum, a) => sum + a.grow, 0);
}

/**
 * Move the class forward one week: every student's Grow balance earns 2%
 * (at least 1 token if they have any), and a new history point is recorded.
 */
export function advanceWeek(): { week: number; totalInterest: number } {
  touch();
  currentWeek += 1;
  let totalInterest = 0;
  students.forEach((s) => {
    const interest = s.growTokens > 0 ? Math.max(1, Math.round(s.growTokens * WEEKLY_RATE)) : 0;
    s.growTokens += interest;
    totalInterest += interest;
    snapshotBalances(s);
    if (interest > 0) {
      logActivity({ studentId: s.id, kind: "interest", title: "Weekly Grow interest", spend: 0, save: 0, grow: interest });
    }
  });
  markTour("advance");
  return { week: currentWeek, totalInterest };
}

export function getTour(): Partial<Record<TourStep, boolean>> {
  return tour;
}

export function isTourDismissed(): boolean {
  return tourDismissed;
}

export function setTourDismissed(dismissed: boolean) {
  touch();
  tourDismissed = dismissed;
}

/* ------------------------------------------------------------------
   Saving toward a reward
------------------------------------------------------------------- */
export const DEFAULT_SAVE_GOAL = 200;

export type SaveGoal =
  | { kind: "reward"; reward: Reward; target: number }
  | { kind: "amount"; target: number };

/** The student's current goal: a reward they picked, else a custom amount */
export function getSaveGoal(student: Student): SaveGoal {
  const reward = student.saveGoalRewardId ? getReward(student.saveGoalRewardId) : undefined;
  if (reward) return { kind: "reward", reward, target: reward.cost };
  return { kind: "amount", target: student.saveGoal ?? DEFAULT_SAVE_GOAL };
}

export function setSaveGoalReward(studentId: string, rewardId: string | null): boolean {
  touch();
  const student = getStudent(studentId);
  if (!student) return false;
  if (rewardId && !getReward(rewardId)) return false;
  student.saveGoalRewardId = rewardId ?? undefined;
  return true;
}

/**
 * Average Save tokens added per week over the last few weeks, or 0 if the
 * balance hasn't been growing. Used for "about N weeks to go".
 */
export function getWeeklySavePace(student: Student, weeks = 4): number {
  const h = student.balanceHistory ?? [];
  if (h.length < 2) return 0;
  const recent = h.slice(-(weeks + 1));
  const gained = recent[recent.length - 1].saveBalance - recent[0].saveBalance;
  const pace = gained / (recent.length - 1);
  return pace > 0 ? pace : 0;
}

/** Spend Save tokens on the goal reward once the student has saved enough */
export function buyWithSavings(studentId: string, rewardId: string): { student: Student; reward: Reward } | null {
  touch();
  const student = getStudent(studentId);
  const reward = getReward(rewardId);
  if (!student || !reward || reward.soldOut) return null;
  if (student.purchasedRewards.includes(rewardId)) return null;
  if (student.saveTokens < reward.cost) return null;

  student.saveTokens -= reward.cost;
  student.purchasedRewards.push(rewardId);
  if (student.saveGoalRewardId === rewardId) student.saveGoalRewardId = undefined;
  snapshotBalances(student);
  logActivity({ studentId, kind: "spent", title: `Bought ${reward.title} with savings`, spend: 0, save: -reward.cost, grow: 0 });
  markTour("buy");
  return { student, reward };
}

/* ------------------------------------------------------------------
   Class-wide insights
------------------------------------------------------------------- */

/** Sum of every student's Spend / Save / Grow balance for each week on record */
export function getClassHistory(): BalanceHistoryEntry[] {
  const byWeek = new Map<number, BalanceHistoryEntry>();
  students.forEach((s) => {
    (s.balanceHistory ?? []).forEach((e) => {
      const row = byWeek.get(e.week) ?? { week: e.week, spendBalance: 0, saveBalance: 0, growBalance: 0 };
      row.spendBalance += e.spendBalance;
      row.saveBalance += e.saveBalance;
      row.growBalance += e.growBalance;
      byWeek.set(e.week, row);
    });
  });
  return [...byWeek.values()].sort((a, b) => a.week - b.week);
}

/** Total Grow interest paid to the whole class */
export function getClassInterestPaid(): number {
  return activity.filter((a) => a.kind === "interest").reduce((sum, a) => sum + a.grow, 0);
}

/* ------------------------------------------------------------------
   Teacher tools
------------------------------------------------------------------- */

/** Add (positive) or remove (negative) tokens from one bucket. Balances never go below 0. */
export function adjustBalance(
  studentId: string,
  bucket: TokenBucket,
  delta: number,
  reason = "Teacher adjustment",
): Student | null {
  touch();
  const student = getStudent(studentId);
  if (!student || !Number.isFinite(delta) || delta === 0) return null;
  const key = bucket === "spend" ? "spendTokens" : bucket === "save" ? "saveTokens" : "growTokens";
  const before = student[key];
  const after = Math.max(0, before + Math.round(delta));
  if (after === before) return student;
  student[key] = after;
  snapshotBalances(student);
  logActivity({
    studentId,
    kind: "adjusted",
    title: reason.trim() || "Teacher adjustment",
    spend: bucket === "spend" ? after - before : 0,
    save: bucket === "save" ? after - before : 0,
    grow: bucket === "grow" ? after - before : 0,
  });
  return student;
}

export function setStudentPin(studentId: string, pin: string): boolean {
  touch();
  const student = getStudent(studentId);
  if (!student || !/^\d{4}$/.test(pin)) return false;
  student.pin = pin;
  return true;
}

/** Remove a student and everything tied to them (requests, assignments, pending rewards, activity) */
export function removeStudent(studentId: string): boolean {
  touch();
  const index = students.findIndex((s) => s.id === studentId);
  if (index === -1) return false;
  missions.forEach((m) => {
    if (m.assignedStudentId === studentId) {
      m.assignedStudentId = undefined;
      m.status = "AVAILABLE";
    }
    if (m.requestedBy.includes(studentId)) {
      m.requestedBy = m.requestedBy.filter((id) => id !== studentId);
      m.requestCount = m.requestedBy.length;
      m.currentReward = calculateReward(m.baseReward, m.requestCount);
      if (!m.assignedStudentId) m.status = m.requestCount > 0 ? "REQUESTED" : "AVAILABLE";
    }
  });
  pendingRewards = pendingRewards.filter((p) => p.studentId !== studentId);
  activity = activity.filter((a) => a.studentId !== studentId);
  students.splice(index, 1);
  return true;
}

// Supply & Demand calculation
export function calculateReward(baseReward: number, requestCount: number): number {
  if (requestCount === 0) return baseReward;
  
  const currentReward = baseReward * (1 - (requestCount - 1) * 0.1);
  const minimum = baseReward * 0.5;
  
  return Math.max(Math.floor(currentReward), Math.floor(minimum));
}

// Student functions
export function getStudents(): Student[] {
  return students;
}

export function getStudent(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export function verifyStudentPin(studentId: string, pin: string): boolean {
  const student = getStudent(studentId);
  if (!student) return false;
  return student.pin === pin;
}

/**
 * Returns balance history for chart. Uses student.balanceHistory if present,
 * otherwise generates plausible history from current spend/grow balances.
 */
export function getBalanceHistory(studentId: string): BalanceHistoryEntry[] {
  const student = getStudent(studentId);
  if (!student) return [];
  if (student.balanceHistory && student.balanceHistory.length > 0) {
    return student.balanceHistory;
  }
  return generateHistoryFromCurrent(student.spendTokens, student.saveTokens, student.growTokens);
}

export function updateStudent(id: string, data: Partial<Student>): Student | null {
  touch();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;
  
  students[index] = { ...students[index], ...data };
  return students[index];
}

export type CreateStudentData = {
  name: string;
  pin?: string;
};

export function createStudent(data: CreateStudentData): Student {
  touch();
  const slug = data.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const baseId = slug || "student";
  let id = baseId;
  let suffix = 1;
  while (students.some((s) => s.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  const student: Student = {
    id,
    name: data.name.trim(),
    pin: (data.pin && /^\d{4}$/.test(data.pin)) ? data.pin : "1234",
    spendTokens: 100,
    saveTokens: 40,
    growTokens: 50,
    assignedMissions: [],
    purchasedRewards: [],
  };
  snapshotBalances(student);
  students.push(student);
  return student;
}

// Mission functions
export function getMissions(): Mission[] {
  return missions;
}

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

export function updateMission(id: string, data: Partial<Mission>): Mission | null {
  touch();
  const index = missions.findIndex((m) => m.id === id);
  if (index === -1) return null;
  
  missions[index] = { ...missions[index], ...data };
  return missions[index];
}

export type CreateMissionData = {
  title: string;
  description: string;
  baseReward: number;
  bandColor?: MissionBandColor;
};

export function createMission(data: CreateMissionData): Mission {
  touch();
  const id = `mission-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const mission: Mission = {
    id,
    title: data.title,
    description: data.description,
    baseReward: data.baseReward,
    currentReward: data.baseReward,
    requestCount: 0,
    requestedBy: [],
    status: "AVAILABLE",
    bandColor: data.bandColor,
  };
  missions.push(mission);
  return mission;
}

export function deleteMission(missionId: string): boolean {
  touch();
  const index = missions.findIndex((m) => m.id === missionId);
  if (index === -1) return false;
  
  const mission = missions[index];
  if (mission.assignedStudentId) {
    const student = getStudent(mission.assignedStudentId);
    if (student) {
      const updated = student.assignedMissions.filter((id) => id !== missionId);
      updateStudent(student.id, { assignedMissions: updated });
    }
  }
  missions.splice(index, 1);
  return true;
}

export function unassignMission(missionId: string): Mission | null {
  touch();
  const mission = getMission(missionId);
  if (!mission || !mission.assignedStudentId) return null;
  
  const studentId = mission.assignedStudentId;
  const student = getStudent(studentId);
  if (student) {
    const updated = student.assignedMissions.filter((id) => id !== missionId);
    updateStudent(studentId, { assignedMissions: updated });
  }
  
  mission.assignedStudentId = undefined;
  mission.status = "AVAILABLE";
  return updateMission(missionId, mission);
}

export function requestMission(studentId: string, missionId: string): Mission | null {
  touch();
  const mission = getMission(missionId);
  const student = getStudent(studentId);
  
  if (!mission || !student) return null;
  if (mission.assignedStudentId) return null; // Already assigned
  if (mission.requestedBy.includes(studentId)) return null; // Already requested
  
  // Add student to requestedBy
  mission.requestedBy.push(studentId);
  mission.requestCount = mission.requestedBy.length;
  
  // Recalculate reward
  mission.currentReward = calculateReward(mission.baseReward, mission.requestCount);
  mission.status = "REQUESTED";
  markTour("request");
  
  // Update the mission in the array
  const updated = updateMission(missionId, mission);
  
  
  return updated;
}

export function assignMission(missionId: string, studentId: string): Mission | null {
  touch();
  const mission = getMission(missionId);
  const student = getStudent(studentId);
  
  if (!mission || !student) return null;
  if (mission.assignedStudentId) return null; // Already assigned
  
  // Assign mission to student
  mission.assignedStudentId = studentId;
  mission.status = "IN_PROGRESS";
  
  // Add to student's assigned missions
  if (!student.assignedMissions.includes(missionId)) {
    student.assignedMissions.push(missionId);
    updateStudent(studentId, student);
  }
  
  return updateMission(missionId, mission);
}

/** Assign a mission to a student, moving it off any previous student first */
export function assignOrReassignMission(missionId: string, studentId: string): Mission | null {
  const mission = getMission(missionId);
  if (mission?.assignedStudentId && mission.assignedStudentId !== studentId) {
    unassignMission(missionId);
  }
  return assignMission(missionId, studentId);
}

let pendingRewards: PendingReward[] = [];

export function getRecommendedSplit(total: number): { spend: number; save: number; grow: number } {
  const spend = Math.floor(total * RECOMMENDED_SPEND_RATIO);
  const save = Math.floor(total * RECOMMENDED_SAVE_RATIO);
  const grow = Math.max(0, total - spend - save);
  return { spend, save, grow };
}

export function getPendingRewardsForStudent(studentId: string): PendingReward[] {
  return pendingRewards.filter((p) => p.studentId === studentId);
}

export function claimPendingReward(
  pendingId: string,
  spendAmount: number,
  saveAmount: number,
  growAmount: number
): { mission: Mission; student: Student } | null {
  touch();
  const index = pendingRewards.findIndex((p) => p.id === pendingId);
  if (index === -1) return null;
  const pending = pendingRewards[index]!;
  if (spendAmount < 0 || saveAmount < 0 || growAmount < 0 || spendAmount + saveAmount + growAmount !== pending.totalAmount) {
    return null;
  }
  const student = getStudent(pending.studentId);
  const mission = getMission(pending.missionId);
  if (!student || !mission) return null;

  // Update student tokens
  const updatedStudent = updateStudent(student.id, {
    spendTokens: student.spendTokens + spendAmount,
    saveTokens: student.saveTokens + saveAmount,
    growTokens: student.growTokens + growAmount,
  });
  
  snapshotBalances(updatedStudent!);
  logActivity({
    studentId: student.id,
    kind: "earned",
    title: `Earned: ${pending.missionTitle}`,
    spend: spendAmount,
    save: saveAmount,
    grow: growAmount,
  });
  markTour("claim");

  // Remove pending reward
  pendingRewards.splice(index, 1);

  return { mission, student: updatedStudent! };
}

export type TokenBucket = "spend" | "save" | "grow";

export function transferTokens(
  studentId: string,
  amount: number,
  from: TokenBucket,
  to: TokenBucket
): { student: Student } | null {
  touch();
  const student = getStudent(studentId);
  if (!student) return null;
  if (amount <= 0) return null;
  if (from === to) return null;

  const balances = {
    spend: student.spendTokens,
    save: student.saveTokens,
    grow: student.growTokens,
  };

  if (balances[from] < amount) return null;

  const updated = { ...balances };
  updated[from] -= amount;
  updated[to] += amount;

  const updatedStudent = updateStudent(studentId, {
    spendTokens: updated.spend,
    saveTokens: updated.save,
    growTokens: updated.grow,
  });
  snapshotBalances(updatedStudent!);
  logActivity({
    studentId,
    kind: "moved",
    title: `Moved ${BUCKET_LABEL[from]} to ${BUCKET_LABEL[to]}`,
    spend: updated.spend - balances.spend,
    save: updated.save - balances.save,
    grow: updated.grow - balances.grow,
  });

  return { student: updatedStudent! };
}

export function completeMission(missionId: string): { mission: Mission; student: Student; pendingReward: PendingReward } | null {
  touch();
  const mission = getMission(missionId);
  if (!mission || !mission.assignedStudentId) return null;

  const student = getStudent(mission.assignedStudentId);
  if (!student) return null;

  const reward = mission.currentReward;
  mission.status = "COMPLETED";
  updateMission(missionId, mission);

  const pendingReward: PendingReward = {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    missionId,
    studentId: student.id,
    missionTitle: mission.title,
    totalAmount: reward,
  };
  pendingRewards.push(pendingReward);
  markTour("approve");

  return { mission, student, pendingReward };
}

// Reward functions
export function getRewards(): Reward[] {
  return rewards;
}

export function getReward(id: string): Reward | undefined {
  return rewards.find((r) => r.id === id);
}

export type CreateRewardData = {
  title: string;
  description: string;
  cost: number;
  icon: string;
  soldOut?: boolean;
};

export function createReward(data: CreateRewardData): Reward {
  touch();
  const id = `reward-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const reward: Reward = {
    id,
    title: data.title,
    description: data.description,
    cost: data.cost,
    icon: data.icon,
    soldOut: data.soldOut ?? false,
  };
  rewards.push(reward);
  return reward;
}

export function updateReward(id: string, data: Partial<Reward>): Reward | null {
  touch();
  const index = rewards.findIndex((r) => r.id === id);
  if (index === -1) return null;
  rewards[index] = { ...rewards[index], ...data };
  return rewards[index];
}

export function deleteReward(rewardId: string): boolean {
  touch();
  const index = rewards.findIndex((r) => r.id === rewardId);
  if (index === -1) return false;
  // Remove from all students' purchasedRewards and savings goals
  students.forEach((student) => {
    if (student.saveGoalRewardId === rewardId) student.saveGoalRewardId = undefined;
    if (student.purchasedRewards.includes(rewardId)) {
      const updated = student.purchasedRewards.filter((id) => id !== rewardId);
      updateStudent(student.id, { purchasedRewards: updated });
    }
  });
  rewards.splice(index, 1);
  return true;
}

export function purchaseReward(studentId: string, rewardId: string): { student: Student; reward: Reward } | null {
  touch();
  const student = getStudent(studentId);
  const reward = rewards.find((r) => r.id === rewardId);
  
  if (!student || !reward) return null;
  if (reward.soldOut) return null;
  if (student.spendTokens < reward.cost) return null;
  
  // Deduct tokens
  student.spendTokens -= reward.cost;
  
  if (student.saveGoalRewardId === rewardId) student.saveGoalRewardId = undefined;

  // Add to purchased rewards
  if (!student.purchasedRewards.includes(rewardId)) {
    student.purchasedRewards.push(rewardId);
  }
  
  updateStudent(studentId, student);
  snapshotBalances(student);
  logActivity({ studentId, kind: "spent", title: `Bought ${reward.title}`, spend: -reward.cost, save: 0, grow: 0 });
  markTour("buy");

  return { student, reward };
}

// Helper to get available missions (not assigned)
export function getAvailableMissions(): Mission[] {
  return missions.filter((m) => !m.assignedStudentId);
}

// Helper to get student's assigned missions
export function getStudentMissions(studentId: string): Mission[] {
  return missions.filter((m) => m.assignedStudentId === studentId);
}

// Helper to get missions pending approval
export function getPendingApprovalMissions(): Mission[] {
  return missions.filter((m) => m.status === "IN_PROGRESS" && m.assignedStudentId);
}
