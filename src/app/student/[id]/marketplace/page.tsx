"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MissionCard } from "@/components/MissionCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { MissionTabs } from "@/components/MissionTabs";
import { Callout, LiveIndicator } from "@/components/ui/Feedback";
import { StarDoodle } from "@/components/ui/Doodles";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { getAvailableMissions, getLastChangedAt, getStudent, requestMission } from "@/lib/store";
import { useStore } from "@/lib/useStore";
import type { Mission } from "@/types";

const SUPPLY_DEMAND_FALLBACK =
  "When lots of kids want the same mission, it pays less. Pick one nobody else wants and you get the full reward!";

export default function MarketplacePage() {
  const params = useParams();
  const studentId = params.id as string;
  useStore();
  const missions = getAvailableMissions();
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [rewardAdjusted, setRewardAdjusted] = useState(false);
  const [supplyDemandExplanation, setSupplyDemandExplanation] = useState<
    string | null
  >(null);
  const [loadingSupplyDemand, setLoadingSupplyDemand] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  // Pre-request "Why less?" modal (when student clicks before requesting)
  const [priceDropModalMission, setPriceDropModalMission] =
    useState<Mission | null>(null);
  const [priceDropExplanation, setPriceDropExplanation] = useState<
    string | null
  >(null);
  const [loadingPriceDropExplanation, setLoadingPriceDropExplanation] =
    useState(false);

  const handleRequestMission = (missionId: string) => {
    const result = requestMission(studentId, missionId);
    if (result) {
      setShowSparkle(true);
      const adjusted =
        result.currentReward !== result.baseReward || result.requestCount > 1;
      setRewardAdjusted(adjusted);
      setSupplyDemandExplanation(null);

      setModalTitle("You asked for it!");
      setModalMessage(
        adjusted
          ? `Other kids want this mission too, so it now pays ${result.currentReward} tokens.`
          : `When your teacher says it's done, you'll get ${result.currentReward} tokens.`,
      );
      setShowModal(true);

      if (adjusted) {
        const studentName = getStudent(studentId)?.name ?? "Student";
        setLoadingSupplyDemand(true);
        fetch("/api/gemini/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SUPPLY_DEMAND",
            studentName,
            context: {
              baseReward: result.baseReward,
              currentReward: result.currentReward,
              requestCount: result.requestCount,
            },
          }),
        })
          .then((res) =>
            res.ok ? res.json() : Promise.reject(new Error("Failed")),
          )
          .then((data) =>
            setSupplyDemandExplanation(
              data.explanation ?? SUPPLY_DEMAND_FALLBACK,
            ),
          )
          .catch(() => setSupplyDemandExplanation(SUPPLY_DEMAND_FALLBACK))
          .finally(() => setLoadingSupplyDemand(false));
      }
    } else {
      setRewardAdjusted(false);
      setSupplyDemandExplanation(null);
      setModalTitle("You already asked");
      setModalMessage("You already asked for this mission. Your teacher will give it to you soon.");
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSupplyDemandExplanation(null);
    setLoadingSupplyDemand(false);
  };

  const handleExplainPriceDrop = (mission: Mission) => {
    setPriceDropModalMission(mission);
    setPriceDropExplanation(null);
    setLoadingPriceDropExplanation(true);
    const studentName = getStudent(studentId)?.name ?? "Student";
    fetch("/api/gemini/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "SUPPLY_DEMAND",
        studentName,
        context: {
          baseReward: mission.baseReward,
          currentReward: mission.currentReward,
          requestCount: mission.requestCount,
        },
      }),
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed")),
      )
      .then((data) =>
        setPriceDropExplanation(data.explanation ?? SUPPLY_DEMAND_FALLBACK),
      )
      .catch(() => setPriceDropExplanation(SUPPLY_DEMAND_FALLBACK))
      .finally(() => setLoadingPriceDropExplanation(false));
  };

  const closePriceDropModal = () => {
    setPriceDropModalMission(null);
    setPriceDropExplanation(null);
    setLoadingPriceDropExplanation(false);
  };

  const availableMissions = missions.filter((m) => !m.assignedStudentId);

  return (
    <div>
      <MissionTabs studentId={studentId} />
      <PageHeader
        eyebrow="Mission marketplace"
        title="Pick your next mission"
        description="Ask for a mission and your teacher will give it to you. If lots of kids want the same one, it pays less. Missions nobody else wants pay the most!"
        action={<LiveIndicator lastUpdate={getLastChangedAt()} />}
      />

      {availableMissions.length === 0 ? (
        <EmptyState
          title="No missions right now"
          description="Every mission has been taken. Check back soon for new ones."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {availableMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              studentId={studentId}
              onRequest={handleRequestMission}
              onExplainPriceDrop={handleExplainPriceDrop}
            />
          ))}
        </div>
      )}

      <SuccessSparkle show={showSparkle} onComplete={() => setShowSparkle(false)} />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalTitle}
        description={modalMessage}
        illustration={modalTitle === "You already asked" ? undefined : <StarDoodle className="w-16 h-16" />}
      >
        {rewardAdjusted && (
          <Callout loading={loadingSupplyDemand} className="mb-6">
            {supplyDemandExplanation}
          </Callout>
        )}
        <Button onClick={closeModal} fullWidth>
          Got it
        </Button>
      </Modal>

      <Modal
        isOpen={!!priceDropModalMission}
        onClose={closePriceDropModal}
        title="Why does it pay less?"
      >
        <Callout loading={loadingPriceDropExplanation} className="mb-6">
          {priceDropExplanation}
        </Callout>
        <Button onClick={closePriceDropModal} fullWidth>
          Got it
        </Button>
      </Modal>
    </div>
  );
}
