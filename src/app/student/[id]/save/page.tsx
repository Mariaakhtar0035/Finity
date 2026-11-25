"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { PageHeader } from "@/components/ui/PageHeader";
import { JarDoodle } from "@/components/ui/Doodles";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";
import { getStudent, updateStudent } from "@/lib/store";

const DEFAULT_SAVE_GOAL = 200;

const TIPS = [
  { title: "Start small", body: "Even a few tokens each time adds up faster than you'd think." },
  { title: "Name your goal", body: "Saving for something specific makes waiting a lot easier." },
  { title: "Save first", body: "Put a little in Save before you spend the rest." },
];

export default function SaveTokensPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [, setRefresh] = useState(0);
  const refresh = () => setRefresh((r) => r + 1);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editValue, setEditValue] = useState("");

  const student = getStudent(studentId);
  if (!student) return null;

  const saveGoal = student.saveGoal ?? DEFAULT_SAVE_GOAL;
  const progress = Math.min(100, Math.round((student.saveTokens / saveGoal) * 100));
  const remaining = Math.max(0, saveGoal - student.saveTokens);
  const editNum = parseInt(editValue, 10);
  const editValid = !isNaN(editNum) && editNum >= 1 && editNum <= 9999;

  const handleSaveGoal = () => {
    if (!editValid) return;
    updateStudent(studentId, { saveGoal: editNum });
    setIsEditingGoal(false);
    setEditValue("");
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Save"
        title="Saving for something big"
        description="Save tokens are set aside for a goal you choose. Watch the jar fill up."
      />

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[1fr_auto]">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Coin type="save" size={40} />
              <div>
                <p className="text-sm text-muted">Save balance</p>
                <p className="display text-5xl num">{student.saveTokens}</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                {isEditingGoal ? (
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveGoal();
                    }}
                  >
                    <label htmlFor="save-goal-input" className="text-sm text-muted">
                      New goal
                    </label>
                    <input
                      id="save-goal-input"
                      type="number"
                      min={1}
                      max={9999}
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input w-28! py-2! num"
                      aria-invalid={editValue !== "" && !editValid}
                    />
                    <Button type="submit" size="sm" disabled={!editValid}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingGoal(false)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <p className="text-ink-soft">
                    Goal: <span className="font-medium text-ink num">{saveGoal}</span> tokens
                    <button
                      type="button"
                      onClick={() => {
                        setEditValue(String(saveGoal));
                        setIsEditingGoal(true);
                      }}
                      className="ml-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </p>
                )}
                <span className="font-display text-2xl num shrink-0">{progress}%</span>
              </div>

              <div
                className="h-4 w-full rounded-full bg-periwinkle-soft overflow-hidden border border-[#d9def8]"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Save goal progress"
              >
                <div className="h-full rounded-full bg-periwinkle-deep bar-grow" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-muted mt-3">
                {remaining === 0 ? "You reached your goal. Amazing work!" : `${remaining} tokens to go`}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-end justify-center bg-periwinkle-soft px-12 pt-8">
            <JarDoodle className="w-36 h-auto" />
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {TIPS.map((tip, i) => (
          <Card key={tip.title} className="p-6">
            <span className="w-8 h-8 rounded-full bg-paper font-display flex items-center justify-center num">{i + 1}</span>
            <h3 className="text-lg font-medium mt-4">{tip.title}</h3>
            <p className="text-muted mt-1 text-[15px] leading-relaxed">{tip.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 md:p-8 flex gap-4 items-start">
        <MrsPennyworthAvatar size="md" />
        <div>
          <p className="text-sm text-muted">Mrs. Pennyworth says</p>
          <p className="font-display text-xl md:text-2xl tracking-tight leading-snug mt-1">
            &ldquo;Saving is like planting a tiny seed. Keep planting, and soon you&apos;ll have a whole garden.&rdquo;
          </p>
        </div>
      </Card>
    </div>
  );
}
