"use client";

import React from "react";
import { Check, Pencil, RotateCcw, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Coin } from "@/components/ui/Coin";
import { getStudent } from "@/lib/store";
import { bandFor } from "@/lib/palette";
import { Mission, MissionStatus } from "@/types";

interface MissionCardProps {
  mission: Mission;
  variant?: "marketplace" | "myMission" | "teacher";
  studentId?: string;
  onRequest?: (missionId: string) => void;
  status?: MissionStatus;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  /** Optional message below the card body (e.g. "Waiting for teacher to assign") */
  actionHint?: string;
  /** When variant is myMission and status is COMPLETED, optional callback to explain reward split */
  onExplainRewardSplit?: (mission: Mission) => void;
  /** Optional: pass assigned student name (e.g. from teacher view). If omitted, resolves from store when possible. */
  assignedStudentName?: string;
  /** Teacher variant: callbacks for Edit, Delete, Assign */
  onEdit?: (mission: Mission) => void;
  onDelete?: (mission: Mission) => void;
  onAssign?: (mission: Mission) => void;
  /** Marketplace: when reward dropped, callback to explain why */
  onExplainPriceDrop?: (mission: Mission) => void;
}

export function MissionCard({
  mission,
  variant = "marketplace",
  studentId,
  onRequest,
  status: statusProp,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionHint,
  onExplainRewardSplit,
  assignedStudentName: assignedStudentNameProp,
  onEdit,
  onDelete,
  onAssign,
  onExplainPriceDrop,
}: MissionCardProps) {
  const isMarketplace = variant === "marketplace";
  const isTeacher = variant === "teacher";
  const isMine = variant === "myMission";
  const alreadyRequested =
    isMarketplace && studentId ? mission.requestedBy.includes(studentId) : false;
  const isPopular = mission.requestCount > 2;
  const isHighDemand = mission.requestCount > 1 && mission.requestCount <= 2;
  const priceDropped = mission.currentReward < mission.baseReward;

  const band = bandFor(mission.id, mission.bandColor);
  const displayStatus = statusProp ?? mission.status;

  const assignedStudentName =
    assignedStudentNameProp ??
    (mission.assignedStudentId ? getStudent(mission.assignedStudentId)?.name : undefined);
  const requestedByNames = mission.requestedBy
    .map((id) => getStudent(id)?.name)
    .filter((n): n is string => !!n);

  let metaLine: string | null = null;
  if (isTeacher) {
    metaLine = assignedStudentName
      ? `Assigned to ${assignedStudentName}`
      : requestedByNames.length > 0
        ? `Asked for by ${requestedByNames.join(", ")}`
        : "Not assigned yet";
  } else if (isMarketplace && mission.requestCount > 0) {
    metaLine =
      mission.requestCount === 1
        ? alreadyRequested
          ? "You asked for this"
          : "1 classmate wants this"
        : `${mission.requestCount} classmates want this`;
  }

  return (
    <article className="flex flex-col bg-surface rounded-card border border-line overflow-hidden lift">
      {/* Reward panel */}
      <div className="m-2 mb-0 rounded-[1.25rem] px-5 pt-4 pb-5 relative" style={{ background: band.soft }}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-ink" style={{ background: band.fill }} />
            Mission
          </span>
          {isMarketplace ? (
            isPopular ? (
              <Badge type="popular" className="bg-surface!" />
            ) : isHighDemand ? (
              <Badge type="high_demand" className="bg-surface!" />
            ) : null
          ) : (
            <Badge status={displayStatus} className="bg-surface!" />
          )}
        </div>

        <div className="flex items-end gap-2.5 mt-5">
          <Coin type="spend" size={34} className="mb-1" />
          <span className="font-display text-5xl leading-none tracking-tight num text-ink">
            {mission.currentReward}
          </span>
          {priceDropped && (
            <span className="text-sm text-muted line-through mb-1 num">{mission.baseReward}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-ink-soft">
          <span>token reward</span>
          {priceDropped && isMarketplace && onExplainPriceDrop && (
            <>
              <span className="text-faint">·</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExplainPriceDrop(mission);
                }}
                className="underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
              >
                Why less?
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
        <h3 className="text-lg font-medium leading-snug text-ink">{mission.title}</h3>
        <p className="text-[15px] text-muted mt-1 leading-relaxed">{mission.description}</p>

        {metaLine && (
          <p className="flex items-center gap-1.5 text-sm text-ink-soft mt-3">
            <Users className="w-4 h-4 text-muted" strokeWidth={1.75} />
            {metaLine}
          </p>
        )}

        {isMine && actionHint && <p className="text-sm text-muted mt-3">{actionHint}</p>}

        <div className="mt-auto pt-5">
          {isMarketplace && (
            <Button
              variant={alreadyRequested ? "secondary" : "primary"}
              onClick={() => onRequest?.(mission.id)}
              disabled={alreadyRequested}
              fullWidth
            >
              {alreadyRequested ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.25} /> Requested
                </>
              ) : (
                "Request mission"
              )}
            </Button>
          )}

          {isTeacher && onEdit && onDelete && onAssign && (
            <div className="flex gap-2">
              <Button variant={displayStatus === "COMPLETED" ? "secondary" : "primary"} size="sm" onClick={() => onAssign(mission)} className="flex-1">
                {displayStatus === "COMPLETED" ? (
                  <>
                    <RotateCcw className="w-4 h-4" strokeWidth={2} /> Reset
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" strokeWidth={2} /> {assignedStudentName ? "Reassign" : "Assign"}
                  </>
                )}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onEdit(mission)} aria-label={`Edit ${mission.title}`} className="px-3!">
                <Pencil className="w-4 h-4" strokeWidth={2} />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onDelete(mission)} aria-label={`Delete ${mission.title}`} className="px-3! hover:text-negative hover:border-negative">
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>
          )}

          {isMine && actionLabel && onAction && (
            <Button
              variant={displayStatus === "COMPLETED" ? "secondary" : "primary"}
              onClick={onAction}
              disabled={actionDisabled}
              fullWidth
            >
              {actionLabel}
            </Button>
          )}

          {isMine && displayStatus === "COMPLETED" && onExplainRewardSplit && (
            <button
              type="button"
              onClick={() => onExplainRewardSplit(mission)}
              className="text-sm text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink"
            >
              Where did my tokens go?
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
