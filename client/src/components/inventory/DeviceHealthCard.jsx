import React from "react";
import { Badge } from "../common/Badge";
import { Card } from "../common/Card";
import { FailureThresholdMeter } from "./FailureThresholdMeter";

export function DeviceHealthCard({
  status = "pending",
  consecutiveFailures = 0,
  lastCheckedAt,
  monitoringStatus,
}) {
  const isPending = status === "pending";

  return (
    <Card title="Estado de verificación" bodyClassName="space-y-4 p-5">
      <Badge
        status={status}
        label={isPending ? "PENDIENTE DE VERIFICACIÓN" : undefined}
        className={
          isPending ? "!border-amber-400 !bg-amber-50 !text-amber-800" : ""
        }
      />

      {monitoringStatus === "idle" && (
        <p className="text-sm text-slate-600">Sin monitoreo directo</p>
      )}

      <FailureThresholdMeter consecutiveFailures={consecutiveFailures} />

      <p className="text-sm text-slate-600">
        Último chequeo{" "}
        {lastCheckedAt ? (
          <time dateTime={lastCheckedAt}>
            {new Date(lastCheckedAt).toLocaleString("es-EC")}
          </time>
        ) : (
          "Pendiente"
        )}
      </p>
    </Card>
  );
}
