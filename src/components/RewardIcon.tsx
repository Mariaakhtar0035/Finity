import React from "react";
import {
  AlarmClock,
  Armchair,
  BookOpen,
  Gamepad2,
  Gift,
  Lightbulb,
  Music,
  NotebookPen,
  Palette,
  Shirt,
  Sparkles,
  Star,
  Target,
  Trophy,
  UtensilsCrossed,
  Volleyball,
  type LucideIcon,
} from "lucide-react";

/** Icon keys a reward can use (stored in Reward.icon) */
export const REWARD_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  clock: { icon: AlarmClock, label: "Clock" },
  lightbulb: { icon: Lightbulb, label: "Lightbulb" },
  notebook: { icon: NotebookPen, label: "Notebook" },
  gift: { icon: Gift, label: "Gift" },
  gamepad: { icon: Gamepad2, label: "Game" },
  chair: { icon: Armchair, label: "Seat" },
  lunch: { icon: UtensilsCrossed, label: "Lunch" },
  shirt: { icon: Shirt, label: "Shirt" },
  ball: { icon: Volleyball, label: "Ball" },
  music: { icon: Music, label: "Music" },
  star: { icon: Star, label: "Star" },
  trophy: { icon: Trophy, label: "Trophy" },
  target: { icon: Target, label: "Target" },
  sparkles: { icon: Sparkles, label: "Sparkles" },
  palette: { icon: Palette, label: "Art" },
  book: { icon: BookOpen, label: "Book" },
};

export const REWARD_ICON_KEYS = Object.keys(REWARD_ICONS);

/** Older data stored emojis; map them onto icon keys */
const LEGACY_EMOJI: Record<string, string> = {
  "⏰": "clock",
  "💡": "lightbulb",
  "📝": "notebook",
  "🎁": "gift",
  "🎮": "gamepad",
  "🪑": "chair",
  "🍽️": "lunch",
  "🍽": "lunch",
  "👕": "shirt",
  "⚽": "ball",
  "🎵": "music",
  "⭐": "star",
  "🏆": "trophy",
  "🎯": "target",
  "🌟": "sparkles",
  "🎨": "palette",
  "📚": "book",
};

export function resolveRewardIcon(key: string | undefined): LucideIcon {
  const k = key && (REWARD_ICONS[key] ? key : LEGACY_EMOJI[key]);
  return (k && REWARD_ICONS[k]?.icon) || Gift;
}

interface RewardIconProps {
  icon?: string;
  className?: string;
  strokeWidth?: number;
}

export function RewardIcon({ icon, className = "w-6 h-6", strokeWidth = 1.75 }: RewardIconProps) {
  const Icon = resolveRewardIcon(icon);
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
