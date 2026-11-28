import { beforeEach, describe, expect, it } from "vitest";
import { footprintOf, getRoomItem, roomGeometry } from "@/lib/roomCatalog";
import { defaultLook, lookOf } from "@/lib/avatar";
import {
  adjustBalance,
  advanceWeek,
  applyRoomFinish,
  buyAccessory,
  setLook,
  wearAccessory,
  getGrowAvailable,
  GROW_LOCK_WEEKS,
  buyRoomItem,
  flipRoomItem,
  getRoom,
  getRoomStorage,
  moveRoomItem,
  placeRoomItem,
  removeRoomItem,
  toggleRoomLike,
  buyWithSavings,
  getClassHistory,
  getClassInterestPaid,
  getSaveGoal,
  getWeeklySavePace,
  setSaveGoalReward,
  deleteReward,
  assignMission,
  assignOrReassignMission,
  calculateReward,
  claimPendingReward,
  completeMission,
  createStudent,
  formatClassCode,
  getActivity,
  getCurrentWeek,
  getMission,
  getMissions,
  getPendingRewardsForStudent,
  getRecommendedSplit,
  getRewards,
  getStudent,
  getStudents,
  getTour,
  normalizeClassCode,
  purchaseReward,
  removeStudent,
  requestMission,
  resetDemo,
  setStudentPin,
  transferTokens,
  verifyClassCode,
  verifyStudentPin,
} from "@/lib/store";

/** First mission nobody has requested or been assigned */
function freshMission() {
  const m = getMissions().find((x) => !x.assignedStudentId && x.requestCount === 0);
  if (!m) throw new Error("no fresh mission in seed data");
  return m;
}

/** Request → assign → approve, returning the pending reward */
function earnReward(studentId: string) {
  const mission = freshMission();
  requestMission(studentId, mission.id);
  assignMission(mission.id, studentId);
  const result = completeMission(mission.id);
  if (!result) throw new Error("completeMission failed");
  return result.pendingReward;
}

beforeEach(() => {
  resetDemo();
});

describe("supply & demand pricing", () => {
  it("pays full price with zero or one request", () => {
    expect(calculateReward(100, 0)).toBe(100);
    expect(calculateReward(100, 1)).toBe(100);
  });

  it("drops 10% per extra request", () => {
    expect(calculateReward(100, 2)).toBe(90);
    expect(calculateReward(100, 3)).toBe(80);
  });

  it("never drops below half price", () => {
    expect(calculateReward(100, 50)).toBe(50);
    expect(calculateReward(95, 50)).toBe(47);
  });

  it("lowers a mission's reward as classmates request it", () => {
    const m = freshMission();
    requestMission("alex", m.id);
    requestMission("jordan", m.id);
    expect(getMission(m.id)!.requestCount).toBe(2);
    expect(getMission(m.id)!.currentReward).toBe(calculateReward(m.baseReward, 2));
  });

  it("ignores a duplicate request from the same student", () => {
    const m = freshMission();
    expect(requestMission("alex", m.id)).not.toBeNull();
    expect(requestMission("alex", m.id)).toBeNull();
    expect(getMission(m.id)!.requestCount).toBe(1);
  });
});

describe("recommended split", () => {
  it.each([1, 7, 50, 99, 100, 133])("always adds up to the reward (%i)", (total) => {
    const { spend, save, grow } = getRecommendedSplit(total);
    expect(spend + save + grow).toBe(total);
    expect(Math.min(spend, save, grow)).toBeGreaterThanOrEqual(0);
  });

  it("follows the 50/20/30 guideline", () => {
    expect(getRecommendedSplit(100)).toEqual({ spend: 50, save: 20, grow: 30 });
  });
});

describe("mission lifecycle", () => {
  it("approval creates a pending reward the student can claim", () => {
    const pending = earnReward("alex");
    expect(getPendingRewardsForStudent("alex")).toHaveLength(1);

    const before = getStudent("alex")!;
    const [spend0, save0, grow0] = [before.spendTokens, before.saveTokens, before.growTokens];
    const split = getRecommendedSplit(pending.totalAmount);
    expect(claimPendingReward(pending.id, split.spend, split.save, split.grow)).not.toBeNull();

    const after = getStudent("alex")!;
    expect(after.spendTokens).toBe(spend0 + split.spend);
    expect(after.saveTokens).toBe(save0 + split.save);
    expect(after.growTokens).toBe(grow0 + split.grow);
    expect(getPendingRewardsForStudent("alex")).toHaveLength(0);
    expect(getActivity("alex")[0]).toMatchObject({ kind: "earned" });
  });

  it("rejects a split that doesn't add up", () => {
    const pending = earnReward("alex");
    expect(claimPendingReward(pending.id, pending.totalAmount, 1, 0)).toBeNull();
    expect(claimPendingReward(pending.id, -1, pending.totalAmount + 1, 0)).toBeNull();
    expect(getPendingRewardsForStudent("alex")).toHaveLength(1);
  });

  it("reassigns a mission from one student to another", () => {
    const m = freshMission();
    assignMission(m.id, "alex");
    assignOrReassignMission(m.id, "jordan");
    expect(getMission(m.id)!.assignedStudentId).toBe("jordan");
    expect(getStudent("alex")!.assignedMissions).not.toContain(m.id);
  });
});

describe("spending and moving tokens", () => {
  it("moves tokens between accounts and records it", () => {
    const s = getStudent("alex")!;
    const [spend0, grow0] = [s.spendTokens, s.growTokens];
    expect(transferTokens("alex", 10, "spend", "grow")).not.toBeNull();
    expect(getStudent("alex")!.spendTokens).toBe(spend0 - 10);
    expect(getStudent("alex")!.growTokens).toBe(grow0 + 10);
    expect(getActivity("alex")[0]).toMatchObject({ kind: "moved", spend: -10, grow: 10 });
  });

  it("refuses transfers that overdraw, are zero, or go nowhere", () => {
    const spend = getStudent("alex")!.spendTokens;
    expect(transferTokens("alex", spend + 1, "spend", "save")).toBeNull();
    expect(transferTokens("alex", 0, "spend", "save")).toBeNull();
    expect(transferTokens("alex", 5, "spend", "spend")).toBeNull();
  });

  it("buys a reward it can afford", () => {
    const reward = getRewards().find((r) => !r.soldOut && !getStudent("sam")!.purchasedRewards.includes(r.id))!;
    const spend0 = getStudent("sam")!.spendTokens;
    expect(purchaseReward("sam", reward.id)).not.toBeNull();
    expect(getStudent("sam")!.spendTokens).toBe(spend0 - reward.cost);
    expect(getActivity("sam")[0]).toMatchObject({ kind: "spent", spend: -reward.cost });
  });

  it("can't buy sold-out or unaffordable rewards", () => {
    const soldOut = getRewards().find((r) => r.soldOut)!;
    expect(purchaseReward("sam", soldOut.id)).toBeNull();
    const priciest = [...getRewards()].filter((r) => !r.soldOut).sort((a, b) => b.cost - a.cost)[0];
    adjustBalance("sam", "spend", -10_000);
    expect(purchaseReward("sam", priciest.id)).toBeNull();
  });
});

describe("weeks and compound growth", () => {
  it("advances the week and pays 2% interest on Grow", () => {
    const week0 = getCurrentWeek();
    const grow0 = getStudent("alex")!.growTokens;
    advanceWeek();
    expect(getCurrentWeek()).toBe(week0 + 1);
    expect(getStudent("alex")!.growTokens).toBe(grow0 + Math.max(1, Math.round(grow0 * 0.02)));
  });

  it("records a history point for the new week", () => {
    advanceWeek();
    const s = getStudent("alex")!;
    const last = s.balanceHistory!.at(-1)!;
    expect(last.week).toBe(getCurrentWeek());
    expect(last.growBalance).toBe(s.growTokens);
  });

  it("pays nothing on an empty Grow balance", () => {
    adjustBalance("alex", "grow", -10_000);
    advanceWeek();
    expect(getStudent("alex")!.growTokens).toBe(0);
  });

  it("every seeded student's history ends at today's balances", () => {
    for (const s of getStudents()) {
      const last = s.balanceHistory!.at(-1)!;
      expect(last.week).toBe(getCurrentWeek());
      expect(last.spendBalance + last.saveBalance + last.growBalance).toBe(s.spendTokens + s.saveTokens + s.growTokens);
    }
  });
});

describe("teacher tools", () => {
  it("never takes a balance below zero", () => {
    adjustBalance("alex", "save", -10_000);
    expect(getStudent("alex")!.saveTokens).toBe(0);
  });

  it("only accepts 4-digit PINs", () => {
    expect(setStudentPin("alex", "12a4")).toBe(false);
    expect(setStudentPin("alex", "4321")).toBe(true);
    expect(verifyStudentPin("alex", "4321")).toBe(true);
    expect(verifyStudentPin("alex", "1234")).toBe(false);
  });

  it("removing a student clears their requests and re-prices missions", () => {
    const m = freshMission();
    requestMission("alex", m.id);
    requestMission("jordan", m.id);
    removeStudent("jordan");
    expect(getStudent("jordan")).toBeUndefined();
    expect(getMission(m.id)!.requestedBy).toEqual(["alex"]);
    expect(getMission(m.id)!.currentReward).toBe(m.baseReward);
  });

  it("gives new students unique ids", () => {
    const a = createStudent({ name: "Alex" });
    expect(a.id).not.toBe("alex");
    expect(a.balanceHistory).toHaveLength(1);
  });
});

describe("class codes", () => {
  it("accepts any casing or separators", () => {
    expect(normalizeClassCode(" fin-482 ")).toBe("FIN482");
    expect(verifyClassCode("fin 482")).toBe(true);
    expect(verifyClassCode("FIN-483")).toBe(false);
    expect(formatClassCode()).toBe("FIN-482");
  });
});

describe("getting-started checklist", () => {
  it("ticks off steps as real actions happen", () => {
    const pending = earnReward("alex");
    const split = getRecommendedSplit(pending.totalAmount);
    claimPendingReward(pending.id, split.spend, split.save, split.grow);
    advanceWeek();
    expect(getTour()).toMatchObject({ request: true, approve: true, claim: true, advance: true });
    expect(getTour().buy).toBeUndefined();
  });

  it("resets with the demo", () => {
    advanceWeek();
    resetDemo();
    expect(getTour()).toEqual({});
    expect(getCurrentWeek()).toBe(12);
  });
});

describe("saving toward a reward", () => {
  it("uses the chosen reward's price as the target", () => {
    const reward = getRewards().find((r) => r.id === "reward-3")!;
    expect(getSaveGoal(getStudent("alex")!)).toMatchObject({ kind: "reward", target: reward.cost });
  });

  it("falls back to an amount goal when no reward is picked", () => {
    setSaveGoalReward("alex", null);
    expect(getSaveGoal(getStudent("alex")!)).toEqual({ kind: "amount", target: 200 });
  });

  it("won't buy with savings until the student has enough", () => {
    adjustBalance("alex", "save", -10_000);
    expect(buyWithSavings("alex", "reward-3")).toBeNull();
  });

  it("buys with Save tokens, records it and clears the goal", () => {
    const cost = getRewards().find((r) => r.id === "reward-3")!.cost;
    adjustBalance("alex", "save", cost);
    const save0 = getStudent("alex")!.saveTokens;
    const spend0 = getStudent("alex")!.spendTokens;
    expect(buyWithSavings("alex", "reward-3")).not.toBeNull();
    const alex = getStudent("alex")!;
    expect(alex.saveTokens).toBe(save0 - cost);
    expect(alex.spendTokens).toBe(spend0);
    expect(alex.purchasedRewards).toContain("reward-3");
    expect(alex.saveGoalRewardId).toBeUndefined();
    expect(getActivity("alex")[0]).toMatchObject({ kind: "spent", save: -cost });
  });

  it("clears goals that point at a deleted reward", () => {
    deleteReward("reward-3");
    expect(getStudent("alex")!.saveGoalRewardId).toBeUndefined();
  });

  it("estimates weekly pace from recent history, never negative", () => {
    expect(getWeeklySavePace(getStudent("alex")!)).toBeGreaterThan(0);
    adjustBalance("alex", "save", -10_000);
    expect(getWeeklySavePace(getStudent("alex")!)).toBe(0);
  });
});

describe("class insights", () => {
  it("adds every student's balances for each week", () => {
    const last = getClassHistory().at(-1)!;
    const students = getStudents();
    expect(last.week).toBe(getCurrentWeek());
    expect(last.spendBalance).toBe(students.reduce((s, x) => s + x.spendTokens, 0));
    expect(last.growBalance).toBe(students.reduce((s, x) => s + x.growTokens, 0));
  });

  it("totals interest paid across the class", () => {
    expect(getClassInterestPaid()).toBe(0);
    const before = getStudents().reduce((s, x) => s + x.growTokens, 0);
    advanceWeek();
    const after = getStudents().reduce((s, x) => s + x.growTokens, 0);
    expect(getClassInterestPaid()).toBe(after - before);
  });
});

describe("my room", () => {
  const placedIds = (id: string) => getRoom(id).items.map((p) => p.itemId);
  const inRoom = (id: string) => {
    const room = getRoom(id);
    const N = roomGeometry(room.style).size;
    return room.items.every((p) => {
      const item = getRoomItem(p.itemId)!;
      if (item.place === "wall") return p.x > 0 && p.x < N && !!p.wall;
      const [a, b] = footprintOf(item, p.flip);
      return p.x - a / 2 >= -1e-9 && p.x + a / 2 <= N + 1e-9 && p.y - b / 2 >= -1e-9 && p.y + b / 2 <= N + 1e-9;
    });
  };

  it("every student starts with the free starters, arranged inside the room", () => {
    for (const s of getStudents()) {
      const room = getRoom(s.id);
      expect(room.owned["room-cozy-bed"]).toBe(1);
      expect(placedIds(s.id)).toContain("room-cozy-bed");
      expect(inRoom(s.id)).toBe(true);
    }
    const fresh = createStudent({ name: "Newbie" }).id;
    expect(placedIds(fresh)).toEqual(expect.arrayContaining(["room-sunny-window", "room-lavender-rug", "room-cozy-bed"]));
    expect(getRoom(fresh).style).toBe("room-style-classic");
  });

  it("buying spends Spend tokens, puts the item in a free spot and records it", () => {
    const spend0 = getStudent("riley")!.spendTokens;
    const result = buyRoomItem("riley", "room-cozy-lamp");
    expect(result?.uid).toBeDefined();
    expect(getStudent("riley")!.spendTokens).toBe(spend0 - 45);
    expect(placedIds("riley")).toContain("room-cozy-lamp");
    expect(inRoom("riley")).toBe(true);
    expect(getActivity("riley")[0]).toMatchObject({ kind: "spent", spend: -45 });
  });

  it("you can own several of most things, but pets are one of a kind", () => {
    adjustBalance("riley", "spend", 1000);
    buyRoomItem("riley", "room-cactus");
    buyRoomItem("riley", "room-cactus");
    expect(getRoom("riley").owned["room-cactus"]).toBe(2);
    expect(placedIds("riley").filter((id) => id === "room-cactus")).toHaveLength(2);
    expect(buyRoomItem("riley", "room-cat")).not.toBeNull();
    expect(buyRoomItem("riley", "room-cat")).toBeNull();
  });

  it("won't sell something you can't afford", () => {
    adjustBalance("riley", "spend", -10_000);
    expect(buyRoomItem("riley", "room-cat")).toBeNull();
    expect(getRoom("riley").owned["room-cat"]).toBeUndefined();
  });

  it("moving keeps things inside the room, on the floor or a wall", () => {
    const room = getRoom("riley");
    const bed = room.items.find((p) => p.itemId === "room-cozy-bed")!;
    expect(moveRoomItem("riley", bed.uid, { x: 99, y: -5 })).toBe(true);
    expect(inRoom("riley")).toBe(true);
    const win = room.items.find((p) => p.itemId === "room-sunny-window")!;
    moveRoomItem("riley", win.uid, { x: 3, y: 90, wall: "right" });
    expect(getRoom("riley").items.find((p) => p.uid === win.uid)).toMatchObject({ wall: "right", x: 3, y: 90 });
    expect(flipRoomItem("riley", bed.uid)).toBe(true);
    expect(inRoom("riley")).toBe(true);
    expect(flipRoomItem("riley", win.uid)).toBe(false);
  });

  it("putting away keeps it owned, and it can be placed again", () => {
    const rug = getRoom("riley").items.find((p) => p.itemId === "room-lavender-rug")!;
    expect(removeRoomItem("riley", rug.uid)).toBe(true);
    expect(placedIds("riley")).not.toContain("room-lavender-rug");
    expect(getRoomStorage("riley")).toEqual({ "room-lavender-rug": 1 });
    expect(placeRoomItem("riley", "room-lavender-rug")).toBeTruthy();
    expect(placeRoomItem("riley", "room-lavender-rug")).toBeNull();
    expect(placeRoomItem("riley", "room-cat")).toBeNull();
  });

  it("walls, floors and rooms are bought once and switched between", () => {
    adjustBalance("riley", "spend", 1000);
    buyRoomItem("riley", "room-paper-mint-stripes");
    expect(getRoom("riley").wallpaper).toBe("room-paper-mint-stripes");
    expect(buyRoomItem("riley", "room-paper-mint-stripes")).toBeNull();
    expect(applyRoomFinish("riley", "room-paper-cream")).toBe(true);
    expect(getRoom("riley").wallpaper).toBe("room-paper-cream");
    expect(applyRoomFinish("riley", "room-floor-checker")).toBe(false);
  });

  it("moving back to a smaller room pulls everything inside", () => {
    adjustBalance("riley", "spend", 1000);
    buyRoomItem("riley", "room-style-loft");
    const bed = getRoom("riley").items.find((p) => p.itemId === "room-cozy-bed")!;
    moveRoomItem("riley", bed.uid, { x: 8, y: 8 });
    applyRoomFinish("riley", "room-style-classic");
    expect(inRoom("riley")).toBe(true);
  });

  it("classmates can like a room once, and not their own", () => {
    const before = getRoom("riley").likes.length;
    expect(toggleRoomLike("alex", "riley")).toBe(true);
    expect(getRoom("riley").likes).toHaveLength(before + 1);
    expect(toggleRoomLike("alex", "riley")).toBe(false);
    expect(getRoom("riley").likes).toHaveLength(before);
    expect(toggleRoomLike("riley", "riley")).toBe(false);
  });

  it("a room item can be a savings goal and bought with Save tokens", () => {
    setSaveGoalReward("riley", "room-cat");
    expect(getSaveGoal(getStudent("riley")!)).toMatchObject({ kind: "room", target: 120 });
    adjustBalance("riley", "save", 200);
    const save0 = getStudent("riley")!.saveTokens;
    const spend0 = getStudent("riley")!.spendTokens;
    expect(buyWithSavings("riley", "room-cat")).toMatchObject({ title: "Sunny the cat" });
    expect(getStudent("riley")!.saveTokens).toBe(save0 - 120);
    expect(getStudent("riley")!.spendTokens).toBe(spend0);
    expect(placedIds("riley")).toContain("room-cat");
    expect(getStudent("riley")!.saveGoalRewardId).toBeUndefined();
  });
});

describe("grow lock", () => {
  it("new Grow tokens stay put for a few weeks; older ones and interest can move", () => {
    const s = getStudent("riley")!;
    const old = s.growTokens;
    expect(getGrowAvailable(s)).toBe(old);
    expect(transferTokens("riley", 20, "spend", "grow")).not.toBeNull();
    expect(getGrowAvailable(getStudent("riley")!)).toBe(old);
    expect(transferTokens("riley", old + 1, "grow", "spend")).toBeNull();
    expect(transferTokens("riley", old, "grow", "spend")).not.toBeNull();
    for (let i = 0; i < GROW_LOCK_WEEKS; i++) advanceWeek();
    const after = getStudent("riley")!;
    expect(getGrowAvailable(after)).toBe(after.growTokens);
    expect(after.growLocks).toEqual([]);
  });
});

describe("character", () => {
  it("starts with a default look, and only accepts real options", () => {
    const s = getStudent("riley")!;
    expect(s.look).toBeUndefined();
    expect(lookOf(s)).toEqual(defaultLook("riley"));
    setLook("riley", { hair: "braids", skin: "#5e3b26", shirt: "not-a-colour" as string });
    const look = lookOf(getStudent("riley")!);
    expect(look.hair).toBe("braids");
    expect(look.skin).toBe("#5e3b26");
    expect(look.shirt).toBe(defaultLook("riley").shirt);
  });

  it("accessories cost Spend tokens, are bought once, and can be taken off and put back on", () => {
    const spend0 = getStudent("riley")!.spendTokens;
    expect(buyAccessory("riley", "acc-glasses")).toBe(true);
    expect(getStudent("riley")!.spendTokens).toBe(spend0 - 20);
    expect(lookOf(getStudent("riley")!).accessory).toBe("acc-glasses");
    expect(buyAccessory("riley", "acc-glasses")).toBe(false);
    expect(wearAccessory("riley", null)).toBe(true);
    expect(lookOf(getStudent("riley")!).accessory).toBeNull();
    expect(wearAccessory("riley", "acc-crown")).toBe(false);
    expect(wearAccessory("riley", "acc-glasses")).toBe(true);
    adjustBalance("riley", "spend", -10_000);
    expect(buyAccessory("riley", "acc-crown")).toBe(false);
  });
});
