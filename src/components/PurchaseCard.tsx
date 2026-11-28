import { TokenChip } from "@/components/ui/TokenChip";
import { rewardTint } from "@/lib/palette";
import { RewardIcon } from "@/components/RewardIcon";
import type { Reward } from "@/types";

interface PurchaseCardProps {
  reward: Reward;
}

/** Small tile for a reward the student owns */
export function PurchaseCard({ reward }: PurchaseCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: rewardTint(reward.id) }}
      >
        <RewardIcon icon={reward.icon} className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink truncate">{reward.title}</p>
        <p className="text-xs text-muted truncate">{reward.description}</p>
      </div>
      <TokenChip amount={reward.cost} size="sm" />
    </div>
  );
}
