"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, FlipHorizontal2, Heart, Package, Paintbrush, Store, Target, Undo2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { Segmented, TypingDots } from "@/components/ui/Feedback";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { lookOf } from "@/lib/avatar";
import { RoomScene, RoomThumb, type RoomPerson } from "@/components/room/RoomArt";
import {
  ROOM_ITEMS,
  getRoomItem,
  isRoomItemId,
  itemsInStorage,
  type RoomCategory,
  type RoomItem,
  type RoomPos,
} from "@/lib/roomCatalog";
import {
  applyRoomFinish,
  buyRoomItem,
  flipRoomItem,
  getRoom,
  getStudent,
  getStudents,
  moveRoomItem,
  placeRoomItem,
  removeRoomItem,
  setSaveGoalReward,
  toggleRoomLike,
} from "@/lib/store";
import { useStore } from "@/lib/useStore";
import type { Student, StudentRoom } from "@/types";

type Filter = "all" | RoomCategory;
type Drawer = "shop" | "stuff" | "visit" | null;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "furniture", label: "Furniture" },
  { value: "decor", label: "Decor" },
  { value: "pets", label: "Pets" },
  { value: "finishes", label: "Walls & floors" },
  { value: "rooms", label: "Rooms" },
];

const TILE_BG: Record<RoomCategory, string> = {
  furniture: "bg-mint-soft",
  decor: "bg-butter-soft",
  pets: "bg-peach-soft",
  finishes: "bg-lavender-soft",
  rooms: "bg-sky-soft",
};

const CATEGORY_ORDER: RoomCategory[] = ["furniture", "decor", "pets", "finishes", "rooms"];

/** How long the door shows before the room zooms in */
const ENTRANCE_MS = 1000;

/** Floating frosted control over the room */
const FLOAT = "bg-surface/90 backdrop-blur shadow-soft border border-white/60";

const IDLE_LINES = ["I love my room!", "Saving is my superpower.", "What should I get next?", "Hi there!"];

function DoorDoodle() {
  return (
    <svg viewBox="0 0 120 150" className="w-24 h-auto room-door" aria-hidden>
      <ellipse cx="60" cy="144" rx="46" ry="5" fill="#141414" opacity="0.9" />
      <rect x="20" y="8" width="80" height="136" rx="12" fill="#fff" stroke="#141414" strokeWidth="4" />
      <g className="room-door-leaf">
        <rect x="28" y="16" width="64" height="128" rx="8" fill="#d6c6f4" stroke="#141414" strokeWidth="4" />
        <rect x="38" y="28" width="44" height="36" rx="6" fill="#efe8fb" stroke="#141414" strokeWidth="3" />
        <rect x="38" y="76" width="44" height="50" rx="6" fill="none" stroke="#141414" strokeWidth="3" opacity="0.3" />
        <circle cx="80" cy="84" r="5" fill="#f4e297" stroke="#141414" strokeWidth="3" />
      </g>
    </svg>
  );
}

function Tile({ item, chip, children }: { item: RoomItem; chip?: string; children: React.ReactNode }) {
  return (
    <div className="w-44 shrink-0 snap-start rounded-2xl border border-line bg-surface p-2 flex flex-col">
      <div className={`relative h-24 rounded-xl flex items-center justify-center overflow-hidden ${TILE_BG[item.category]}`}>
        <RoomThumb itemId={item.id} className="h-20 w-full max-w-37.5" />
        {chip && <span className="absolute top-1.5 left-1.5 h-6 px-2 rounded-full bg-ink text-white text-xs flex items-center num">{chip}</span>}
        <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 h-6 pl-0.5 pr-2 rounded-full bg-surface/90 text-sm">
          <Coin type="spend" size={18} />
          <span className="font-display num leading-none">{item.cost === 0 ? "Free" : item.cost}</span>
        </span>
      </div>
      <p className="text-sm font-medium leading-snug px-1 mt-2 truncate">{item.name}</p>
      <div className="mt-auto pt-2.5">{children}</div>
    </div>
  );
}

const SaveButton = (props: React.ComponentProps<typeof Button>) => (
  <Button variant="ghost" size="sm" fullWidth {...props} className="bg-periwinkle-soft! hover:bg-periwinkle/50!" />
);
const StatusPill = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center gap-1 h-9 rounded-full bg-paper text-sm whitespace-nowrap">{children}</div>
);

function ShopTile({
  item,
  student,
  room,
  onBuy,
  onPlace,
  onUse,
  onSaveFor,
}: {
  item: RoomItem;
  student: Student;
  room: StudentRoom;
  onBuy: (item: RoomItem) => void;
  onPlace: (item: RoomItem) => void;
  onUse: (item: RoomItem) => void;
  onSaveFor: (item: RoomItem) => void;
}) {
  const have = room.owned[item.id] ?? 0;
  const canAfford = student.spendTokens >= item.cost;
  const isGoal = student.saveGoalRewardId === item.id;
  const inUse = room.style === item.id || room.wallpaper === item.id || room.flooring === item.id;
  const maxed = item.kind !== "item" ? have > 0 : item.max !== undefined && have >= item.max;
  const chip = item.kind === "item" && have > 0 && !maxed ? `You have ${have}` : undefined;

  let action: React.ReactNode;
  if (maxed && item.kind !== "item") {
    action = inUse ? (
      <StatusPill>
        <Check className="w-4 h-4" /> {item.kind === "style" ? "You live here" : "Using it"}
      </StatusPill>
    ) : (
      <Button variant="secondary" size="sm" fullWidth onClick={() => onUse(item)}>
        {item.kind === "style" ? "Move in" : "Use it"}
      </Button>
    );
  } else if (maxed) {
    action = room.items.some((p) => p.itemId === item.id) ? (
      <StatusPill>
        <Check className="w-4 h-4" /> In your room
      </StatusPill>
    ) : (
      <Button variant="secondary" size="sm" fullWidth onClick={() => onPlace(item)}>
        Place it
      </Button>
    );
  } else if (canAfford) {
    action = (
      <Button size="sm" fullWidth onClick={() => onBuy(item)}>
        {have > 0 ? "Buy another" : `Buy for ${item.cost}`}
      </Button>
    );
  } else if (isGoal) {
    action = (
      <>
        <Link href={`/student/${student.id}/save`}>
          <SaveButton>
            <Target className="w-4 h-4" /> Your goal
          </SaveButton>
        </Link>
        <p className="text-xs text-muted text-center mt-1 num">
          {Math.min(student.saveTokens, item.cost)} of {item.cost} saved
        </p>
      </>
    );
  } else {
    action = (
      <>
        <SaveButton onClick={() => onSaveFor(item)}>Save for this</SaveButton>
        <p className="text-xs text-muted text-center mt-1 num">{item.cost - student.spendTokens} more to go</p>
      </>
    );
  }
  return (
    <Tile item={item} chip={chip}>
      {action}
    </Tile>
  );
}

function DrawerShell({ title, subtitle, onClose, controls, children }: { title: string; subtitle: string; onClose: () => void; controls?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="w-10 h-1.5 rounded-full bg-line-strong mx-auto mb-3" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start justify-between gap-3 w-full sm:w-auto">
          <div>
            <h2 className="font-display text-2xl tracking-tight leading-tight">{title}</h2>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="sm:hidden w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 max-w-full">
          {controls}
          <button type="button" onClick={onClose} className="hidden sm:flex w-10 h-10 shrink-0 rounded-full items-center justify-center text-muted hover:text-ink hover:bg-paper" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x pb-2 mt-4 -mx-1 px-1">{children}</div>
    </div>
  );
}

/**
 * The full-screen room: your own (decorate, shop, visit friends) or a
 * classmate's (look around, leave a like).
 */
export function RoomExperience({ studentId, visitId }: { studentId: string; visitId?: string }) {
  const router = useRouter();
  useStore();

  const [entered, setEntered] = useState(false);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [message, setMessage] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  const [narrow, setNarrow] = useState(false);
  const visiting = !!visitId && visitId !== studentId;
  const ownerId = visiting ? visitId! : studentId;

  const exit = useCallback(() => {
    router.push(visiting ? `/student/${studentId}/room` : `/student/${studentId}`);
  }, [router, studentId, visiting]);

  // Entrance: the door swings open, then the room zooms in
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setEntered(true), reduced ? 0 : ENTRANCE_MS);
    return () => clearTimeout(t);
  }, []);

  // Phones in portrait: let the room use the full width
  useEffect(() => {
    const mq = window.matchMedia("(max-aspect-ratio: 4/5)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // No page scrolling underneath
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage((m) => (m === msg ? "" : m)), 3200);
  };

  const student = getStudent(studentId);
  const owner = getStudent(ownerId);
  const room = owner ? getRoom(ownerId) : null;
  const selectedPlaced = room?.items.find((p) => p.uid === selected);
  const selectedDef = getRoomItem(selectedPlaced?.itemId);

  // Keys: Esc backs out one step at a time; arrows nudge the selected thing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector("[role=dialog]")) return;
      if (e.key === "Escape") {
        if (drawer) setDrawer(null);
        else if (selected) setSelected(null);
        else if (editing) setEditing(false);
        else exit();
        return;
      }
      if (!editing || !selectedPlaced || !selectedDef || !e.key.startsWith("Arrow")) return;
      e.preventDefault();
      const p = selectedPlaced;
      const step = 0.25;
      let next: RoomPos;
      if (selectedDef.place === "wall") {
        const along = (p.wall === "left" ? -1 : 1) * step;
        next = {
          wall: p.wall,
          x: p.x + (e.key === "ArrowRight" ? along : e.key === "ArrowLeft" ? -along : 0),
          y: p.y + (e.key === "ArrowUp" ? 6 : e.key === "ArrowDown" ? -6 : 0),
        };
      } else {
        const d = { ArrowLeft: [-step, step], ArrowRight: [step, -step], ArrowUp: [-step, -step], ArrowDown: [step, step] }[e.key] ?? [0, 0];
        next = { x: p.x + d[0], y: p.y + d[1] };
      }
      moveRoomItem(studentId, p.uid, next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, selected, editing, exit, selectedPlaced, selectedDef, studentId]);

  if (!student || !owner || !room) return null;

  const goalItem = isRoomItemId(student.saveGoalRewardId) ? getRoomItem(student.saveGoalRewardId) : undefined;
  const storage = itemsInStorage(room.owned, room.items);
  const storageCount = Object.values(storage).reduce((a, b) => a + b, 0);
  const collected = ROOM_ITEMS.filter((i) => (room.owned[i.id] ?? 0) > 0).length;

  const shopItems = ROOM_ITEMS.filter((i) => filter === "all" || i.category === filter).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.cost - b.cost,
  );

  const people: RoomPerson[] = visiting
    ? [
        { id: student.id, name: student.name, look: lookOf(student), you: true, lines: [`Cool room, ${owner.name}!`, "I like it here!", "Hi there!"] },
        { id: owner.id, name: owner.name, look: lookOf(owner), lines: [`Hi ${student.name}!`, "Welcome to my room!", "Do you like it?"] },
      ]
    : [
        {
          id: student.id,
          name: student.name,
          look: lookOf(student),
          you: true,
          lines: goalItem ? [`Saving for ${goalItem.name}!`, ...IDLE_LINES] : IDLE_LINES,
        },
      ];

  const startEditingWith = (uid: string | null | undefined) => {
    setDrawer(null);
    setEditing(true);
    setSelected(uid ?? null);
    setCelebrateKey((k) => k + 1);
  };

  const buy = (item: RoomItem) => {
    const result = buyRoomItem(studentId, item.id);
    if (!result) return;
    setCelebrate(true);
    if (item.kind === "item") {
      startEditingWith(result.uid);
      flash(`${item.name} is in your room! Drag it wherever you like.`);
    } else {
      setDrawer(null);
      setCelebrateKey((k) => k + 1);
      flash(item.kind === "style" ? `Welcome to your ${item.name.toLowerCase()}!` : `${item.name}: looking good!`);
    }
  };
  const place = (item: RoomItem) => startEditingWith(placeRoomItem(studentId, item.id));
  const use = (item: RoomItem) => {
    if (applyRoomFinish(studentId, item.id)) {
      setDrawer(null);
      setCelebrateKey((k) => k + 1);
    }
  };
  const saveFor = (item: RoomItem) => {
    setSaveGoalReward(studentId, item.id);
    flash(`You're saving for ${item.name} now. Watch your jar fill up on the Save page.`);
  };

  const liked = room.likes.includes(studentId);
  const like = () => {
    const now = toggleRoomLike(studentId, ownerId);
    if (now) flash(`You liked ${owner.name}'s room`);
  };

  const classmates = getStudents()
    .filter((s) => s.id !== studentId)
    .map((s) => ({ s, room: getRoom(s.id) }))
    .sort((a, b) => b.room.likes.length - a.room.likes.length || a.s.name.localeCompare(b.s.name));

  const show = entered ? "opacity-100" : "opacity-0 pointer-events-none";
  const bottomVisible = entered && !drawer;

  return (
    <div className="fixed inset-0 z-70 overflow-hidden bg-paper" role="region" aria-label={`${owner.name}'s room`}>
      {/* The room */}
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] ${
          entered ? "opacity-100 scale-100" : "opacity-0 scale-[1.12]"
        }`}
        onPointerDown={() => drawer && setDrawer(null)}
      >
        <RoomScene
          room={room}
          editing={editing}
          selectedUid={selected}
          onSelect={setSelected}
          onMove={(uid, pos) => moveRoomItem(studentId, uid, pos)}
          ghostItemId={!visiting && goalItem && !room.owned[goalItem.id] ? goalItem.id : undefined}
          people={people}
          celebrateKey={celebrateKey}
          narrow={narrow}
          className="w-full h-full block"
        />
      </div>

      {/* Entrance */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-paper transition-opacity duration-500 ${
          entered ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-hidden={entered}
      >
        <DoorDoodle />
        <p className="font-display text-2xl tracking-tight text-center px-6">
          {visiting ? `Visiting ${owner.name}'s room` : `Opening ${owner.name}'s room`}
        </p>
        <TypingDots />
      </div>

      {/* Top bar */}
      <div className={`absolute top-0 inset-x-0 z-10 flex items-start justify-between gap-2 p-3 sm:p-5 transition-opacity duration-700 delay-300 ${show}`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={exit}
            className={`h-11 pl-3 pr-3 sm:pr-4 rounded-full inline-flex items-center gap-2 text-[15px] hover:bg-surface ${FLOAT}`}
            aria-label={visiting ? "Back to my room" : "Leave room"}
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">{visiting ? "My room" : "Back"}</span>
          </button>
          <div className={`hidden md:flex flex-col justify-center h-11 px-4 rounded-full ${FLOAT}`}>
            {visiting && <p className="text-[11px] uppercase tracking-wide text-muted leading-none">Visiting</p>}
            <p className="font-display text-lg leading-tight tracking-tight truncate">{owner.name}&apos;s room</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visiting ? (
            <button
              type="button"
              onClick={like}
              aria-pressed={liked}
              className={`h-11 pl-3 pr-4 rounded-full inline-flex items-center gap-2 text-[15px] transition-colors ${
                liked ? "bg-pink text-ink shadow-soft border border-white/60" : `${FLOAT} hover:bg-surface`
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-ink animate-pop-in" : ""}`} />
              <span className="num">{room.likes.length}</span>
              <span className="hidden sm:inline">{liked ? "Liked" : "Like"}</span>
            </button>
          ) : (
            <>
              <div className={`flex items-center gap-1.5 h-11 px-3.5 rounded-full text-sm num ${FLOAT}`} title={`${room.likes.length} classmates liked your room`}>
                <Heart className="w-4 h-4" /> {room.likes.length}
              </div>
              <div className={`hidden sm:flex items-center gap-2 h-11 px-4 rounded-full text-sm num ${FLOAT}`}>
                <span className="w-2 h-2 rounded-full bg-periwinkle-deep" aria-hidden />
                {collected}/{ROOM_ITEMS.length} collected
              </div>
              <div className={`flex items-center gap-2 h-11 pl-1.5 pr-4 rounded-full ${FLOAT}`} title="Spend balance">
                <Coin type="spend" size={30} />
                <span className="font-display text-xl num leading-none">{student.spendTokens}</span>
                <span className="sr-only">Spend tokens</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="absolute top-20 inset-x-0 z-20 flex justify-center px-4 pointer-events-none" role="status">
          <p className="max-w-md text-center px-4 py-2.5 rounded-full bg-ink text-white text-sm shadow-lift animate-fade-up">{message}</p>
        </div>
      )}

      {/* Bottom bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-10 flex flex-col items-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 transition-all duration-500 ${
          bottomVisible ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {visiting ? (
          <>
            <p className={`h-9 px-4 rounded-full text-sm flex items-center ${FLOAT}`}>Tap the floor to walk around</p>
            <div className="flex items-center gap-2">
              <Button size="lg" variant="secondary" onClick={() => setDrawer("visit")} className="bg-surface/90! backdrop-blur shadow-soft">
                <Users className="w-4 h-4" /> Visit someone else
              </Button>
              <Button size="lg" onClick={exit} className="shadow-lift">
                <Undo2 className="w-4 h-4" /> My room
              </Button>
            </div>
          </>
        ) : editing ? (
          <>
            <p className="h-9 px-4 rounded-full bg-ink text-white text-sm flex items-center text-center animate-fade-up">
              {selectedDef ? selectedDef.name : "Drag things to move them. Tap one for more."}
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {selectedDef && selectedPlaced ? (
                <>
                  {selectedDef.place !== "wall" && (
                    <Button size="lg" variant="secondary" onClick={() => flipRoomItem(studentId, selectedPlaced.uid)} className="bg-surface/90! backdrop-blur shadow-soft">
                      <FlipHorizontal2 className="w-4 h-4" /> Turn
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      removeRoomItem(studentId, selectedPlaced.uid);
                      setSelected(null);
                    }}
                    className="bg-surface/90! backdrop-blur shadow-soft"
                  >
                    <Package className="w-4 h-4" /> Put away
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" variant="secondary" onClick={() => setDrawer("stuff")} className="bg-surface/90! backdrop-blur shadow-soft">
                    <Package className="w-4 h-4" /> My stuff{storageCount > 0 && <span className="num">({storageCount})</span>}
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => setDrawer("shop")} className="bg-surface/90! backdrop-blur shadow-soft">
                    <Store className="w-4 h-4" /> Shop
                  </Button>
                </>
              )}
              <Button
                size="lg"
                onClick={() => {
                  setSelected(null);
                  setEditing(false);
                }}
                className="shadow-lift"
              >
                <Check className="w-4 h-4" /> Done
              </Button>
            </div>
          </>
        ) : (
          <>
            {goalItem && !room.owned[goalItem.id] ? (
              <Link href={`/student/${studentId}/save`} className={`h-9 px-4 rounded-full text-sm inline-flex items-center gap-1.5 ${FLOAT}`}>
                <Target className="w-4 h-4" /> Saving for {goalItem.name}
              </Link>
            ) : (
              <p className={`h-9 px-4 rounded-full text-sm flex items-center ${FLOAT}`}>Tap the floor to walk. Tap a seat to sit.</p>
            )}
            <div className="flex items-center gap-2">
              <Button size="lg" variant="secondary" onClick={() => setEditing(true)} className="bg-surface/90! backdrop-blur shadow-soft">
                <Paintbrush className="w-4 h-4" /> Decorate
              </Button>
              <Button size="lg" onClick={() => setDrawer("shop")} className="shadow-lift">
                <Store className="w-4 h-4" /> Shop
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setDrawer("visit")} className="bg-surface/90! backdrop-blur shadow-soft" aria-label="Visit classmates">
                <Users className="w-4 h-4" /> <span className="hidden sm:inline">Visit</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      <section
        aria-label={drawer === "visit" ? "Visit a classmate" : drawer === "stuff" ? "My stuff" : "Room shop"}
        inert={!drawer}
        className={`absolute bottom-0 inset-x-0 z-20 bg-surface rounded-t-4xl shadow-lift transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          drawer ? "translate-y-0" : "translate-y-[105%]"
        }`}
      >
        {drawer === "visit" ? (
          <DrawerShell title="Visit a classmate" subtitle="Peek inside their rooms and leave a like." onClose={() => setDrawer(null)}>
            {classmates.map(({ s, room: r }) => (
              <Link
                key={s.id}
                href={`/student/${studentId}/room/${s.id}`}
                className="w-52 shrink-0 snap-start rounded-2xl border border-line bg-surface p-2 flex flex-col hover:border-ink transition-colors"
              >
                <div className="h-28 rounded-xl overflow-hidden bg-paper">
                  <RoomScene still room={r} className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between gap-2 px-1 mt-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted truncate">{getRoomItem(r.style)?.name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-ink-soft num shrink-0">
                    <Heart className={`w-4 h-4 ${r.likes.includes(studentId) ? "fill-ink" : ""}`} /> {r.likes.length}
                  </span>
                </div>
              </Link>
            ))}
          </DrawerShell>
        ) : drawer === "stuff" ? (
          <DrawerShell title="My stuff" subtitle="Things you own that aren't in your room right now." onClose={() => setDrawer(null)}>
            {storageCount === 0 && <p className="text-sm text-muted py-6">Everything you own is out in your room. Nice!</p>}
            {Object.entries(storage).map(([id, n]) => {
              const item = getRoomItem(id)!;
              return (
                <Tile key={id} item={item} chip={n > 1 ? `×${n}` : undefined}>
                  <Button variant="secondary" size="sm" fullWidth onClick={() => place(item)}>
                    Place it
                  </Button>
                </Tile>
              );
            })}
          </DrawerShell>
        ) : (
          <DrawerShell
            title="Room shop"
            subtitle={filter === "rooms" ? "Save up and move somewhere bigger." : "Just for fun. Bigger things take some saving."}
            onClose={() => setDrawer(null)}
            controls={
              <div className="overflow-x-auto [scrollbar-width:none] max-w-[calc(100vw-2rem)] sm:max-w-none">
                <Segmented ariaLabel="Room shop category" value={filter} onChange={setFilter} options={FILTERS} />
              </div>
            }
          >
            {shopItems.map((item) => (
              <ShopTile key={item.id} item={item} student={student} room={room} onBuy={buy} onPlace={place} onUse={use} onSaveFor={saveFor} />
            ))}
          </DrawerShell>
        )}
      </section>

      <SuccessSparkle show={celebrate} onComplete={() => setCelebrate(false)} />
    </div>
  );
}
