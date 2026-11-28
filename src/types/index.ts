import type { PlacedRoomItem } from "@/lib/roomCatalog";
import type { AvatarLook } from "@/lib/avatar";
export type MissionStatus = "AVAILABLE" | "REQUESTED" | "IN_PROGRESS" | "COMPLETED";

/** Weekly balance snapshot for Spend vs Grow chart history */
export interface BalanceHistoryEntry {
  week: number;
  spendBalance: number;
  saveBalance: number;
  growBalance: number;
}

export interface Student {
  id: string;
  name: string;
  spendTokens: number;
  growTokens: number;
  saveTokens: number;
  assignedMissions: string[]; // mission IDs
  purchasedRewards: string[]; // reward IDs
  /** Optional; if missing, generated from current balances */
  balanceHistory?: BalanceHistoryEntry[];
  /** 4-digit PIN for student login */
  pin: string;
  /** Optional save goal in tokens; default 200 when undefined */
  saveGoal?: number;
  /** Optional reward or room item the student is saving toward (takes priority over saveGoal) */
  saveGoalRewardId?: string;
  /** The character they made (missing until they make one; a default is used) */
  look?: AvatarLook;
  /** Accessories they've bought for their character */
  accessories?: string[];
  /** Recent Grow deposits that can't be moved out yet */
  growLocks?: GrowLock[];
  /** "My room": what's owned, where everything is, and how it looks */
  room?: StudentRoom;
}

export interface GrowLock {
  amount: number;
  /** The week these tokens can be moved out of Grow */
  untilWeek: number;
}

export interface StudentRoom {
  /** room item id → how many are owned (walls, floors and rooms: 1) */
  owned: Record<string, number>;
  /** Things placed in the room, in the order they were put there */
  items: PlacedRoomItem[];
  style: string;
  wallpaper: string;
  flooring: string;
  /** Ids of classmates who liked this room */
  likes: string[];
}

/** Top band color for mission card (board-game sets) */
export type MissionBandColor = "green" | "darkBlue" | "lightBlue" | "red" | "yellow" | "orange" | "brown" | "purple";

export const MISSION_BAND_COLORS: MissionBandColor[] = ["green", "darkBlue", "lightBlue", "red", "yellow", "orange", "brown", "purple"];

export interface Mission {
  id: string;
  title: string;
  description: string;
  baseReward: number;
  currentReward: number;
  requestCount: number;
  requestedBy: string[]; // student IDs
  assignedStudentId?: string;
  status: MissionStatus;
  /** Optional: category/top color for card. If not set, derived from id. */
  bandColor?: MissionBandColor;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  soldOut?: boolean;
}

export interface TokenBalance {
  spend: number;
  grow: number;
  save: number;
}

/** One line in a student's money activity feed */
export interface ActivityEntry {
  id: string;
  studentId: string;
  week: number;
  kind: "earned" | "spent" | "moved" | "interest" | "adjusted";
  title: string;
  /** Change to each balance (positive = in, negative = out) */
  spend: number;
  save: number;
  grow: number;
  at: number;
}

/** Steps in the first-visit checklist */
export type TourStep = "request" | "approve" | "claim" | "advance" | "buy";

export interface PendingReward {
  id: string;
  missionId: string;
  studentId: string;
  missionTitle: string;
  totalAmount: number;
}

export type ExplanationType = "SUPPLY_DEMAND" | "SPEND_VS_GROW" | "COMPOUND_GROWTH" | "MISSION_APPROVAL" | "NARRATOR" | "MONEY_STORY_INSIGHT" | "SPENDING_BEHAVIOR_INSIGHT" | "TRANSFER_INSIGHT" | "MISSION_SUGGESTION";

export type NarratorPage = "dashboard" | "marketplace" | "missions" | "grow" | "save" | "shop";

export interface NarratorContext {
  page: NarratorPage;
  studentName: string;
  spendTokens?: number;
  growTokens?: number;
  saveTokens?: number;
  missionCount?: number;
  availableMissions?: number;
  recentAction?: string;
}
