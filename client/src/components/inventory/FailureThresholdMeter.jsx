import React from "react";

const FAILURE_THRESHOLD = 3;

export function FailureThresholdMeter({ consecutiveFailures = 0 }) {
  const progress = Math.min(consecutiveFailures, FAILURE_THRESHOLD);

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-700">
        Fallos consecutivos {consecutiveFailures} de {FAILURE_THRESHOLD}
      </p>
      <progress
        aria-label="Fallos consecutivos"
        className="w-full accent-amber-600"
        value={progress}
        max={FAILURE_THRESHOLD}
      />
    </div>
  );
}
