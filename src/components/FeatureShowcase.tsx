"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Users } from "lucide-react";
import { Coin } from "@/components/ui/Coin";
import { BagDoodle, CoinStackDoodle, PencilDoodle, SproutDoodle } from "@/components/ui/Doodles";
import { RewardIcon } from "@/components/RewardIcon";
import { StudentAvatar } from "@/components/StudentAvatar";
import { RoomScene } from "@/components/room/RoomArt";
import { calculateReward } from "@/lib/store";
import type { PlacedRoomItem } from "@/lib/roomCatalog";

/*
 * Landing page features: tabs and a heading on the left, a phone-sized card
 * in the middle, and a description on the right. The button in the phone
 * works: each feature has a tiny demo. Moves on by itself every few seconds
 * until someone picks a tab or plays with a demo.
 */

const AUTO_MS = 5500;

/* ------------------------------------------------------------------
   Pieces shared by the demos
------------------------------------------------------------------- */

const Row = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl bg-surface border border-line px-4 py-3 flex items-center gap-3 shadow-soft ${className}`}>{children}</div>
);

/** The phone's contents: a picture, a title and subtitle, and the button */
function Screen({
  visual,
  title,
  subtitle,
  button,
  done,
  onPress,
}: {
  visual: React.ReactNode;
  title: string;
  subtitle: string;
  button: string;
  done: boolean;
  onPress: () => void;
}) {
  return (
    <>
      <div className="flex-1 flex items-center justify-center px-6 pt-10">{visual}</div>
      <div className="px-7 pt-6 text-center min-h-[104px]">
        <p className="font-display text-2xl tracking-tight">{title}</p>
        <p key={subtitle} className="text-sm text-muted mt-2 leading-relaxed text-pretty animate-fade-up">
          {subtitle}
        </p>
      </div>
      <div className="p-4 pt-6">
        <button
          type="button"
          onClick={onPress}
          disabled={done}
          className={`w-full flex items-center justify-center gap-2 h-14 rounded-full font-medium transition-colors ${
            done ? "bg-surface border-2 border-ink text-ink" : "bg-ink text-white hover:bg-ink/90 active:scale-[0.99]"
          }`}
        >
          {done && <Check className="w-4 h-4" />}
          {button}
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
   The four demos
------------------------------------------------------------------- */

function MissionsDemo({ onPlay }: { onPlay: () => void }) {
  const [requests, setRequests] = useState(3);
  const price = calculateReward(130, requests);
  const requested = requests > 3;
  return (
    <Screen
      visual={
        <div className="w-full space-y-2.5">
          <div className="rounded-3xl bg-surface border border-line p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Peer Tutoring Session</span>
              <span className="h-6 px-2.5 rounded-full bg-pink-soft text-xs flex items-center">Popular</span>
            </div>
            <div className="flex items-end gap-2 mt-3">
              <Coin type="spend" size={34} />
              <span key={price} className="display text-5xl num leading-none animate-pop-in">
                {price}
              </span>
              <span className="text-sm text-muted line-through num mb-1">130</span>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-ink-soft mt-3">
              <Users className="w-4 h-4" /> <span className="num">{requests}</span> classmates want this
            </p>
          </div>
          <Row>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Water the Class Plants</p>
              <p className="text-xs text-muted">Nobody else wants it</p>
            </div>
            <Coin type="spend" size={22} />
            <span className="font-display text-xl num">80</span>
          </Row>
        </div>
      }
      title="Popular jobs pay less"
      subtitle={
        requested
          ? `Now ${requests} of you want it, so it pays ${price}. Watering the plants still pays 80.`
          : `Three classmates want this one, so it's down to ${price}.`
      }
      button={requested ? "Requested" : "Request mission"}
      done={requested}
      onPress={() => {
        onPlay();
        setRequests(4);
      }}
    />
  );
}

const REWARDS = [
  { id: "hw", title: "Homework Pass", icon: "notebook", cost: 80, tint: "#fce9f2" },
  { id: "game", title: "Choose the Class Game", icon: "gamepad", cost: 45, tint: "#eef0fd" },
  { id: "seat", title: "Sit by a Friend", icon: "chair", cost: 25, tint: "#e5f5ec" },
];

function ShopDemo({ onPlay }: { onPlay: () => void }) {
  const [bought, setBought] = useState(false);
  const balance = bought ? 120 : 165;
  return (
    <Screen
      visual={
        <div className="w-full space-y-2.5">
          <Row className="justify-between">
            <span className="text-sm text-muted">Spend balance</span>
            <span className="inline-flex items-center gap-1.5">
              <Coin type="spend" size={22} />
              <span key={balance} className="font-display text-xl num animate-pop-in">
                {balance}
              </span>
            </span>
          </Row>
          {REWARDS.map((r) => (
            <Row key={r.id} className={bought && r.id === "game" ? "ring-2 ring-ink" : ""}>
              <span className="w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center shrink-0" style={{ background: r.tint }}>
                <RewardIcon icon={r.icon} className="w-4 h-4" />
              </span>
              <p className="flex-1 min-w-0 font-medium text-sm truncate">{r.title}</p>
              {bought && r.id === "game" ? (
                <span className="h-7 px-2.5 rounded-full bg-mint-soft text-xs flex items-center gap-1 animate-pop-in">
                  <Check className="w-3.5 h-3.5" /> Yours
                </span>
              ) : (
                <>
                  <Coin type="spend" size={20} />
                  <span className="font-display text-lg num">{r.cost}</span>
                </>
              )}
            </Row>
          ))}
        </div>
      }
      title="Now, or later?"
      subtitle={bought ? "120 left. The Homework Pass just got a little further away." : "You have 165 tokens. What's worth it?"}
      button={bought ? "Bought" : "Buy the class game for 45"}
      done={bought}
      onPress={() => {
        onPlay();
        setBought(true);
      }}
    />
  );
}

const SAMPLE_ROOM_ITEMS: PlacedRoomItem[] = [
  { uid: "s1", itemId: "room-sunny-window", wall: "left", x: 4.6, y: 100 },
  { uid: "s2", itemId: "room-bookshelf", wall: "right", x: 3.8, y: 128 },
  { uid: "s3", itemId: "room-cozy-bed", x: 0.75, y: 1.6 },
  { uid: "s4", itemId: "room-couch", x: 3.8, y: 0.55, flip: true },
  { uid: "s5", itemId: "room-bookcase", x: 0.35, y: 3.6 },
  { uid: "s6", itemId: "room-cozy-lamp", x: 6.3, y: 0.4 },
  { uid: "s7", itemId: "room-monstera", x: 0.45, y: 6.4 },
  { uid: "s8", itemId: "room-mint-rug", x: 4.2, y: 3.9, flip: true },
  { uid: "s9", itemId: "room-cat", x: 4.4, y: 4.3 },
];
const NEW_ITEM: PlacedRoomItem = { uid: "s10", itemId: "room-fishbowl", x: 6.1, y: 5.6 };

function RoomDemo({ onPlay }: { onPlay: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <Screen
      visual={
        <div className="w-full aspect-square rounded-3xl overflow-hidden">
          <RoomScene
            still
            animated
            room={{
              style: "room-style-classic",
              wallpaper: "room-paper-lavender-stars",
              flooring: "room-floor-checker",
              items: added ? [...SAMPLE_ROOM_ITEMS, NEW_ITEM] : SAMPLE_ROOM_ITEMS,
            }}
            className="w-full h-full"
          />
        </div>
      }
      title="A room of their own"
      subtitle={added ? "A goldfish bowl, for 70 Spend tokens. Bigger things take saving." : "Decorated with Spend tokens, one piece at a time."}
      button={added ? "Added" : "Add a goldfish bowl"}
      done={added}
      onPress={() => {
        onPlay();
        setAdded(true);
      }}
    />
  );
}

const CLASS = [
  { id: "alex", name: "Alex", other: 225, grow: 95 },
  { id: "jordan", name: "Jordan", other: 204, grow: 80 },
  { id: "sam", name: "Sam", other: 181, grow: 70 },
];

function TeacherDemo({ onPlay }: { onPlay: () => void }) {
  const [week, setWeek] = useState(12);
  const [grow, setGrow] = useState(CLASS.map((s) => s.grow));
  const [lastInterest, setLastInterest] = useState<number[] | null>(null);
  const startWeek = () => {
    onPlay();
    const interest = grow.map((g) => Math.max(1, Math.round(g * 0.02)));
    setGrow(grow.map((g, i) => g + interest[i]));
    setLastInterest(interest);
    setWeek((w) => w + 1);
  };
  return (
    <Screen
      visual={
        <div className="w-full space-y-2.5">
          <Row className="justify-between">
            <div>
              <p className="text-xs text-muted">This week</p>
              <p key={week} className="font-display text-xl tracking-tight num animate-pop-in">
                Week {week}
              </p>
            </div>
            <span className="h-8 px-3 rounded-full bg-mint-soft text-sm flex items-center gap-1">+2% on Grow</span>
          </Row>
          <div className="rounded-2xl bg-surface border border-line px-4 py-1 shadow-soft divide-y divide-line">
            {CLASS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <StudentAvatar studentId={s.id} studentName={s.name} size="sm" />
                <p className="flex-1 font-medium text-sm">{s.name}</p>
                {lastInterest && (
                  <span key={`${week}-${s.id}`} className="text-xs text-positive num animate-fade-up">
                    +{lastInterest[i]}
                  </span>
                )}
                <span className="font-display text-lg num">{s.other + grow[i]}</span>
              </div>
            ))}
          </div>
        </div>
      }
      title="Teachers run the week"
      subtitle={
        week > 12
          ? `Week ${week} started. Everyone's Grow tokens earned 2% interest.`
          : "Approve work, then start the new week. That's when interest gets paid."
      }
      button={`Start week ${week + 1}`}
      done={false}
      onPress={startWeek}
    />
  );
}

/* ------------------------------------------------------------------
   The section
------------------------------------------------------------------- */

const FEATURES = [
  {
    tab: "Missions",
    title: "A mission marketplace",
    bg: "from-[#eef0fd] to-[#f7f5fd]",
    Demo: MissionsDemo,
    Sticker: CoinStackDoodle,
    body: "Students ask for classroom jobs, like tutoring or tidying the library. The more classmates who want the same job, the less it pays, so the overlooked ones are often the better deal.",
  },
  {
    tab: "Shop",
    title: "A reward shop",
    bg: "from-[#fdf6dc] to-[#fbf8ef]",
    Demo: ShopDemo,
    Sticker: BagDoodle,
    body: "The reward shop has perks the teacher sets up, like a homework pass or picking the class game. Buying something small today can mean waiting longer for the one they really want.",
  },
  {
    tab: "Room",
    title: "A room of their own",
    bg: "from-[#efe9fb] to-[#f8f5fd]",
    Demo: RoomDemo,
    Sticker: SproutDoodle,
    body: "Every student gets a room to make their own. Small things are cheap, but a cat or a bigger room takes a few weeks of saving. They can visit classmates' rooms too.",
  },
  {
    tab: "Teachers",
    title: "A teacher dashboard",
    bg: "from-[#e5f5ec] to-[#f4faf6]",
    Demo: TeacherDemo,
    Sticker: PencilDoodle,
    body: "Teachers create missions, approve finished work and see everyone's balances. Starting each new week is when interest gets paid, so kids can watch their Grow tokens add up.",
  },
];

export function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // Each time a tab comes back into view its demo starts fresh
  const [visits, setVisits] = useState(() => FEATURES.map(() => 0));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
  }, []);

  const show = (i: number) => {
    setActive((current) => {
      if (current !== i) setVisits((v) => v.map((n, j) => (j === i ? n + 1 : n)));
      return i;
    });
  };

  // Only cycle while the section is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The progress line under the open row runs the clock: when it fills, move on
  const running = auto && inView && !paused;
  const next = () => show((active + 1) % FEATURES.length);

  const pick = (i: number) => {
    show(i);
    setAuto(false);
  };
  const stopAuto = () => setAuto(false);

  return (
    <div
      ref={rootRef}
      className="max-w-6xl mx-auto grid md:grid-cols-[minmax(0,360px)_1fr] md:grid-rows-[auto_1fr] gap-x-12 lg:gap-x-20 gap-y-10 md:gap-y-8"
    >
      {/* Heading (first on phones, top right on wider screens) */}
      <h2 className="display text-4xl md:text-5xl text-balance text-center md:text-left md:col-start-2 md:row-start-1 md:self-end">
        <span className="text-ink">A whole economy</span> <span className="text-faint">that fits in one classroom</span>
      </h2>

      {/* The phone */}
      <div
        className="relative mx-auto w-full max-w-[360px] h-[580px] sm:h-[600px] md:col-start-1 md:row-start-1 md:row-span-2 md:self-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          id="feature-panel"
          role="region"
          aria-label={`${FEATURES[active].title} demo`}
          className="relative h-full rounded-[2.5rem] border border-line bg-surface shadow-soft overflow-hidden"
        >
          {FEATURES.map(({ tab, bg, Demo }, i) => (
            <div
              key={tab}
              data-demo={i}
              aria-hidden={i !== active}
              inert={i !== active}
              className={`absolute inset-0 flex flex-col bg-gradient-to-b ${bg} transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            >
              <Demo key={visits[i]} onPlay={stopAuto} />
            </div>
          ))}
        </div>

        {/* A sticker for each feature, peeking over the corner */}
        {FEATURES.map(({ tab, Sticker }, i) => (
          <div
            key={tab}
            aria-hidden
            className={`absolute -top-9 -right-2 sm:-right-7 w-20 sm:w-28 pointer-events-none transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,1.4,.4,1)] ${
              i === active ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-12"
            }`}
          >
            <Sticker className="w-full h-auto bob" />
          </div>
        ))}
      </div>

      {/* The features: pick one and it opens up */}
      <div className="md:col-start-2 md:row-start-2 md:self-start border-t border-line">
        {FEATURES.map(({ tab, title, body, Sticker }, i) => {
          const on = i === active;
          return (
            <div key={tab} className="relative border-b border-line">
              <button
                type="button"
                data-feature={i}
                aria-expanded={on}
                aria-controls={`feature-body-${i}`}
                onClick={() => pick(i)}
                className="w-full flex items-center gap-4 py-5 text-left group"
              >
                <span
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    on ? "bg-surface border border-line shadow-soft" : "bg-transparent"
                  }`}
                  aria-hidden
                >
                  <Sticker className={`w-7 h-7 transition-[opacity,filter] ${on ? "" : "opacity-50 grayscale group-hover:opacity-80"}`} />
                </span>
                <span className={`flex-1 text-xl font-medium transition-colors ${on ? "text-ink" : "text-ink-soft group-hover:text-ink"}`}>{title}</span>
                <span
                  className={`text-2xl leading-none text-muted transition-transform duration-300 ${on ? "rotate-45" : ""}`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <div
                id={`feature-body-${i}`}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <p className="overflow-hidden text-lg text-ink-soft leading-relaxed pl-15 pr-8">
                  <span className="block pb-6">{body}</span>
                </p>
              </div>
              {on && auto && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 overflow-hidden" aria-hidden>
                  <span
                    key={`${active}-${visits[active]}`}
                    className="block h-full bg-ink origin-left feature-progress"
                    style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                    onAnimationEnd={next}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
