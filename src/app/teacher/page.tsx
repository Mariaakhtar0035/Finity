"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, Copy, LogOut, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { SproutDoodle } from "@/components/ui/Doodles";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin, TOKEN_META } from "@/components/ui/Coin";
import { TokenChip } from "@/components/ui/TokenChip";
import { Logo } from "@/components/ui/Logo";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented, Toast } from "@/components/ui/Feedback";
import { EmptyState } from "@/components/EmptyState";
import { rewardTint } from "@/lib/palette";
import { RewardIcon } from "@/components/RewardIcon";
import { MissionCard } from "@/components/MissionCard";
import { MissionFormModal } from "@/components/MissionFormModal";
import { RewardFormModal } from "@/components/RewardFormModal";
import { StudentFormModal } from "@/components/StudentFormModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { AssignMissionModal } from "@/components/AssignMissionModal";
import { StudentAvatar } from "@/components/StudentAvatar";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import {
  advanceWeek,
  getCurrentWeek,
  CLASSROOM,
  formatClassCode,
  assignOrReassignMission,
  completeMission,
  getMissions,
  getPendingApprovalMissions,
  getRewards,
  getStudents,
  getRecommendedSplit,
  createStudent,
  createMission,
  updateMission,
  unassignMission,
  deleteMission,
  calculateReward,
  createReward,
  updateReward,
  deleteReward,
} from "@/lib/store";
import { Mission, Reward, MissionBandColor } from "@/types";
import { useStore, hasTeacherSession, setTeacherSession } from "@/lib/useStore";

type TeacherTab = "missions" | "rewards" | "requests" | "students";

export default function TeacherDashboard() {
  const router = useRouter();
  useStore();
  const students = getStudents();
  const missions = getMissions();
  const rewards = getRewards();
  const pendingMissions = getPendingApprovalMissions();
  const week = getCurrentWeek();
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [showSparkle, setShowSparkle] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [missionToAssign, setMissionToAssign] = useState<Mission | null>(null);
  const [showRewardFormModal, setShowRewardFormModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showRewardDeleteModal, setShowRewardDeleteModal] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [showStudentFormModal, setShowStudentFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TeacherTab>("missions");

  // Demo sign-in guard
  useEffect(() => {
    if (!hasTeacherSession()) router.replace("/teacher/login");
    else setAuthorized(true);
  }, [router]);

  const triggerSuccess = (msg: string, celebrate = false) => {
    setMessage(msg);
    if (celebrate) setShowSparkle(true);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleAssignMission = (missionId: string, studentId: string) => {
    if (assignOrReassignMission(missionId, studentId)) {
      const name = students.find((s) => s.id === studentId)?.name;
      triggerSuccess(`Mission assigned to ${name}.`);
    }
  };

  const handleAdvanceWeek = () => {
    const result = advanceWeek();
    triggerSuccess(
      `Week ${result.week} started. Students earned ${result.totalInterest} Grow tokens in interest.`,
      true,
    );
  };

  const handleApproveMission = (missionId: string) => {
    const result = completeMission(missionId);
    if (result) {
      triggerSuccess(
        `Approved. ${result.student.name} has ${result.pendingReward.totalAmount} tokens to claim.`,
        true,
      );
    }
  };

  const handleFormSubmit = (data: {
    title: string;
    description: string;
    baseReward: number;
    bandColor?: MissionBandColor;
  }) => {
    if (editingMission) {
      const newReward = calculateReward(
        data.baseReward,
        editingMission.requestCount,
      );
      updateMission(editingMission.id, {
        title: data.title,
        description: data.description,
        baseReward: data.baseReward,
        currentReward: newReward,
        bandColor: data.bandColor,
      });
      triggerSuccess("Mission updated");
    } else {
      createMission(data);
      triggerSuccess("Mission added");
    }
    setShowFormModal(false);
    setEditingMission(null);
  };

  const handleDeleteConfirm = () => {
    if (!missionToDelete) return;
    deleteMission(missionToDelete.id);
    triggerSuccess("Mission removed");
    setMissionToDelete(null);
    setShowDeleteModal(false);
  };

  const handleRewardFormSubmit = (data: {
    title: string;
    description: string;
    cost: number;
    icon: string;
    soldOut?: boolean;
  }) => {
    if (editingReward) {
      updateReward(editingReward.id, data);
      triggerSuccess("Reward updated");
    } else {
      createReward(data);
      triggerSuccess("Reward added");
    }
    setShowRewardFormModal(false);
    setEditingReward(null);
  };

  const handleStudentFormSubmit = (data: { name: string; pin?: string }) => {
    createStudent(data);
    triggerSuccess(`${data.name} added to your class`);
    setShowStudentFormModal(false);
  };

  const handleRewardDeleteConfirm = () => {
    if (!rewardToDelete) return;
    deleteReward(rewardToDelete.id);
    triggerSuccess("Reward removed");
    setRewardToDelete(null);
    setShowRewardDeleteModal(false);
  };

  const requestedMissions = missions.filter(
    (m) => m.requestedBy.length > 0 && !m.assignedStudentId,
  );

  const tabs: { value: TeacherTab; label: string; count?: number }[] = [
    { value: "missions", label: "Missions" },
    { value: "requests", label: "Requests", count: requestedMissions.length + pendingMissions.length },
    { value: "rewards", label: "Rewards" },
    { value: "students", label: "Students" },
  ];

  const summary = [
    { label: "Students", value: students.length },
    { label: "Open missions", value: missions.filter((m) => !m.assignedStudentId).length },
    { label: "Awaiting assignment", value: requestedMissions.length },
    { label: "Awaiting approval", value: pendingMissions.length },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo href="/teacher" suffix="for teachers" />
          <div className="flex items-center gap-2">
            <Link href="/leaderboard">
              <Button variant="secondary" size="sm">
                <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Market trends</span>
              </Button>
            </Link>
            <Link href="/" onClick={() => setTeacherSession(false)}>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign out</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <PageHeader
          eyebrow={CLASSROOM.name}
          title="Your classroom economy"
          action={
            <div className="flex items-center gap-4 bg-surface border border-line rounded-2xl pl-5 pr-2 py-2">
              <div>
                <p className="text-xs text-muted">Class code</p>
                <p className="font-display text-2xl tracking-[0.12em] num">{formatClassCode()}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(formatClassCode());
                  triggerSuccess("Class code copied. Students join at /join");
                }}
              >
                <Copy className="w-4 h-4" /> Copy
              </Button>
            </div>
          }
        />

        {!authorized ? (
          <Loading />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {summary.map((s) => (
                <Card key={s.label} className="p-5">
                  <p className="text-sm text-muted">{s.label}</p>
                  <p className="display text-4xl num mt-2">{s.value}</p>
                </Card>
              ))}
            </div>

            <Card className="relative overflow-hidden mb-10 p-5 md:p-6 pl-5 md:pl-36 flex flex-col sm:flex-row sm:items-center gap-4 bg-mint-soft! border-[#cfe9d8]!">
              <SproutDoodle className="hidden md:block absolute left-8 -bottom-3 w-20 h-auto" />
              <div className="flex-1">
                <p className="text-sm text-muted">Current week</p>
                <p className="font-display text-3xl tracking-tight">Week {week}</p>
                <p className="text-[15px] text-ink-soft mt-1">
                  When a new week starts, every student&apos;s Grow tokens earn 2% interest.
                </p>
              </div>
              <Button onClick={handleAdvanceWeek} className="shrink-0">
                <CalendarPlus className="w-4 h-4" /> Start week {week + 1}
              </Button>
            </Card>

            <div className="overflow-x-auto mb-6 -mx-4 px-4 [scrollbar-width:none]">
              <Segmented
                ariaLabel="Dashboard sections"
                value={activeTab}
                onChange={setActiveTab}
                options={tabs.map((t) => ({
                  value: t.value,
                  label: (
                    <>
                      {t.label}
                      {!!t.count && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-ink text-white text-xs flex items-center justify-center num">
                          {t.count}
                        </span>
                      )}
                    </>
                  ),
                }))}
              />
            </div>

            {activeTab === "missions" && (
              <section role="tabpanel" aria-label="Missions">
                <SectionHeading
                  title="All missions"
                  description="Jobs students can request. Popular missions pay less."
                  action={
                    <Button
                      onClick={() => {
                        setEditingMission(null);
                        setShowFormModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4" /> Add mission
                    </Button>
                  }
                  className="mb-6"
                />
                {missions.length === 0 ? (
                  <EmptyState title="No missions yet" description="Add your first mission to get the economy going." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {missions.map((mission) => {
                      const assignedStudent = mission.assignedStudentId
                        ? students.find((s) => s.id === mission.assignedStudentId)
                        : null;
                      return (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          variant="teacher"
                          assignedStudentName={assignedStudent?.name}
                          onEdit={() => {
                            setEditingMission(mission);
                            setShowFormModal(true);
                          }}
                          onDelete={() => {
                            setMissionToDelete(mission);
                            setShowDeleteModal(true);
                          }}
                          onAssign={() => {
                            // Completed missions are reset to available instead of reassigned
                            if (mission.status === "COMPLETED") {
                              unassignMission(mission.id);
                              triggerSuccess(`"${mission.title}" is available again.`);
                            } else {
                              setMissionToAssign(mission);
                              setShowAssignModal(true);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "rewards" && (
              <section role="tabpanel" aria-label="Rewards">
                <SectionHeading
                  title="Reward shop"
                  description="Perks students can buy with Spend tokens."
                  action={
                    <Button
                      onClick={() => {
                        setEditingReward(null);
                        setShowRewardFormModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4" /> Add reward
                    </Button>
                  }
                  className="mb-6"
                />
                {rewards.length === 0 ? (
                  <EmptyState title="No rewards yet" description="Add a reward so students have something to save up for." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewards.map((reward) => (
                      <Card key={reward.id} className="flex flex-col overflow-hidden">
                        <div
                          className="m-2 mb-0 rounded-[1.25rem] h-24 flex items-center justify-center relative"
                          style={{ background: rewardTint(reward.id) }}
                        >
                          <span className="w-12 h-12 rounded-full bg-surface border-2 border-ink flex items-center justify-center">
                            <RewardIcon icon={reward.icon} className="w-5 h-5" />
                          </span>
                          {reward.soldOut && (
                            <span className="absolute top-2.5 right-2.5 h-6 px-2.5 rounded-full bg-ink text-white text-xs flex items-center">
                              Sold out
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium leading-snug">{reward.title}</h3>
                            <TokenChip amount={reward.cost} size="sm" />
                          </div>
                          <p className="text-sm text-muted mt-1 line-clamp-2">{reward.description}</p>
                          <div className="flex gap-2 mt-auto pt-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setEditingReward(reward);
                                setShowRewardFormModal(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="px-3! hover:text-negative hover:border-negative"
                              aria-label={`Delete ${reward.title}`}
                              onClick={() => {
                                setRewardToDelete(reward);
                                setShowRewardDeleteModal(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "requests" && (
              <section role="tabpanel" aria-label="Requests" className="grid lg:grid-cols-2 gap-6 items-start">
                <Card className="p-6 md:p-8">
                  <SectionHeading title="Mission requests" description="Choose who gets each requested mission." className="mb-2" />
                  {requestedMissions.length === 0 ? (
                    <p className="text-muted py-8">No requests right now.</p>
                  ) : (
                    <ul className="divide-y divide-line">
                      {requestedMissions.map((mission) => (
                        <li key={mission.id} className="py-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium">{mission.title}</p>
                              <p className="text-sm text-muted mt-0.5">
                                {mission.requestedBy.length} request{mission.requestedBy.length === 1 ? "" : "s"}
                              </p>
                            </div>
                            <TokenChip amount={mission.currentReward} size="sm" />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {mission.requestedBy.map((studentId) => {
                              const student = students.find((s) => s.id === studentId);
                              if (!student) return null;
                              return (
                                <button
                                  key={studentId}
                                  type="button"
                                  onClick={() => handleAssignMission(mission.id, studentId)}
                                  className="inline-flex items-center gap-2 h-10 pl-1 pr-4 rounded-full border border-line-strong hover:border-ink hover:bg-paper transition-colors text-sm"
                                >
                                  <StudentAvatar studentId={student.id} studentName={student.name} size="xs" />
                                  Assign to {student.name}
                                </button>
                              );
                            })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card className="p-6 md:p-8">
                  <SectionHeading title="Ready for approval" description="Approve finished work to release tokens." className="mb-2" />
                  {pendingMissions.length === 0 ? (
                    <p className="text-muted py-8">Nothing waiting for approval.</p>
                  ) : (
                    <ul className="divide-y divide-line">
                      {pendingMissions.map((mission) => {
                        const student = students.find((s) => s.id === mission.assignedStudentId);
                        const split = getRecommendedSplit(mission.currentReward);
                        return (
                          <li key={mission.id} className="py-5 flex items-center gap-4">
                            {student && <StudentAvatar studentId={student.id} studentName={student.name} size="sm" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{mission.title}</p>
                              <p className="text-sm text-muted num">
                                {student?.name} · {mission.currentReward} tokens ({split.spend}/{split.save}/{split.grow})
                              </p>
                            </div>
                            <Button size="sm" onClick={() => handleApproveMission(mission.id)}>
                              Approve
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>
              </section>
            )}

            {activeTab === "students" && (
              <section role="tabpanel" aria-label="Students">
                <SectionHeading
                  title="Students"
                  description="Balances and progress for everyone in your class."
                  action={
                    <Button onClick={() => setShowStudentFormModal(true)}>
                      <Plus className="w-4 h-4" /> Add student
                    </Button>
                  }
                  className="mb-6"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => {
                    const completedCount = missions.filter(
                      (m) => m.assignedStudentId === student.id && m.status === "COMPLETED",
                    ).length;
                    const purchasedRewardItems = rewards.filter((r) => student.purchasedRewards.includes(r.id));
                    const total = student.spendTokens + student.saveTokens + student.growTokens;
                    return (
                      <Card key={student.id} className="p-6">
                        <div className="flex items-center gap-3">
                          <StudentAvatar studentId={student.id} studentName={student.name} size="md" />
                          <div>
                            <h3 className="font-display text-2xl tracking-tight leading-tight">{student.name}</h3>
                            <p className="text-sm text-muted num">
                              {total} tokens · {completedCount} mission{completedCount === 1 ? "" : "s"} done
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-5">
                          {(["spend", "save", "grow"] as const).map((t) => (
                            <div key={t} className={`rounded-2xl p-3 ${TOKEN_META[t].soft}`}>
                              <Coin type={t} size={22} />
                              <p className="font-display text-xl num mt-2">
                                {t === "spend" ? student.spendTokens : t === "save" ? student.saveTokens : student.growTokens}
                              </p>
                              <p className="text-xs text-muted">{TOKEN_META[t].label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-line">
                          <p className="text-sm text-muted mb-2">Purchases</p>
                          {purchasedRewardItems.length === 0 ? (
                            <p className="text-sm text-faint">None yet</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {purchasedRewardItems.map((reward) => (
                                <span key={reward.id} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-paper text-xs">
                                  <RewardIcon icon={reward.icon} className="w-3.5 h-3.5 text-muted" />
                                  {reward.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <MissionFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingMission(null);
        }}
        mission={editingMission}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMissionToDelete(null);
        }}
        title="Remove this mission?"
        message="This mission will be removed permanently. Students will no longer see it."
        onConfirm={handleDeleteConfirm}
        confirmLabel="Remove Mission"
      />

      <RewardFormModal
        isOpen={showRewardFormModal}
        onClose={() => {
          setShowRewardFormModal(false);
          setEditingReward(null);
        }}
        reward={editingReward}
        onSubmit={handleRewardFormSubmit}
      />

      <StudentFormModal
        isOpen={showStudentFormModal}
        onClose={() => setShowStudentFormModal(false)}
        onSubmit={handleStudentFormSubmit}
      />

      <ConfirmDeleteModal
        isOpen={showRewardDeleteModal}
        onClose={() => {
          setShowRewardDeleteModal(false);
          setRewardToDelete(null);
        }}
        title="Remove this reward?"
        message="This reward will be removed from the shop. Students who already bought it will keep it."
        onConfirm={handleRewardDeleteConfirm}
        confirmLabel="Remove Reward"
      />

      {missionToAssign && (
        <AssignMissionModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setMissionToAssign(null);
          }}
          missionTitle={missionToAssign.title}
          missionId={missionToAssign.id}
          students={students}
          assignedStudentId={missionToAssign.assignedStudentId}
          onAssign={handleAssignMission}
        />
      )}

      <Toast message={message} />

      <SuccessSparkle
        show={showSparkle}
        onComplete={() => setShowSparkle(false)}
        duration={1500}
      />
    </div>
  );
}
