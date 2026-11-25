"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { StudentAvatar } from "@/components/StudentAvatar";
import { Check } from "lucide-react";
import { Student } from "@/types";

interface AssignMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  missionId: string;
  students: Student[];
  assignedStudentId?: string;
  onAssign: (missionId: string, studentId: string) => void;
}

export function AssignMissionModal({
  isOpen,
  onClose,
  missionTitle,
  missionId,
  students,
  assignedStudentId,
  onAssign,
}: AssignMissionModalProps) {
  const assignedStudent = assignedStudentId
    ? students.find((s) => s.id === assignedStudentId)
    : null;

  const handleAssign = (studentId: string) => {
    onAssign(missionId, studentId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign mission"
      description={
        assignedStudent ? (
          <>
            <span className="text-ink">{missionTitle}</span> is assigned to {assignedStudent.name}. Pick someone else to reassign it.
          </>
        ) : (
          <>
            Who should do <span className="text-ink">{missionTitle}</span>?
          </>
        )
      }
    >
      <ul className="space-y-2">
        {students.map((student) => {
          const isAssigned = assignedStudentId === student.id;
          return (
            <li key={student.id}>
              <button
                type="button"
                onClick={() => handleAssign(student.id)}
                className={`w-full flex items-center justify-between gap-3 pl-2 pr-4 py-2 rounded-2xl border text-left transition-colors ${
                  isAssigned ? "border-ink bg-paper" : "border-line hover:border-ink"
                }`}
              >
                <span className="flex items-center gap-3">
                  <StudentAvatar studentId={student.id} studentName={student.name} size="sm" />
                  <span className="font-medium">{student.name}</span>
                </span>
                {isAssigned ? (
                  <span className="inline-flex items-center gap-1 text-sm text-muted">
                    <Check className="w-4 h-4" /> Assigned
                  </span>
                ) : (
                  <span className="text-sm text-muted">Assign</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
