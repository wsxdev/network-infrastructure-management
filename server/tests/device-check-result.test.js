import assert from "node:assert/strict";
import test from "node:test";
import { prepareDeviceCheckResult } from "../src/services/device-check-result.service.js";

const checkedAt = new Date("2026-11-11T15:00:00Z");
const device = {
  _id: "equipo-1",
  ipAddress: "192.0.2.10",
  status: "pending",
  consecutiveFailures: 0,
};
const failure = {
  checkedAt,
  probeType: "icmp",
  isSuccess: false,
  technicalCause: "timeout",
};

test("prepara el historial del primer fallo y conserva el estado pendiente", () => {
  const { log, deviceUpdate, statusChange } = prepareDeviceCheckResult(
    device,
    failure,
  );

  assert.deepEqual(log, {
    deviceId: device._id,
    ipAddress: device.ipAddress,
    status: "down",
    responseTimeMs: null,
    isSuccess: false,
    errorMessage: "timeout",
    createdAt: checkedAt,
    probeType: "icmp",
  });
  assert.equal(statusChange, null);
});

test("incluye la fecha de comprobación en el cambio al tercer fallo", () => {
  const { deviceUpdate, statusChange } = prepareDeviceCheckResult(
    { ...device, consecutiveFailures: 2 },
    failure,
  );

  assert.equal(deviceUpdate.consecutiveFailures, 3);
  assert.deepEqual(statusChange, {
    deviceId: device._id,
    previousStatus: "pending",
    status: "down",
    checkedAt,
  });
});

test("registra la fecha del último éxito al recuperar disponibilidad", () => {
  const { log, deviceUpdate, statusChange } = prepareDeviceCheckResult(
    { ...device, status: "down", consecutiveFailures: 3 },
    { checkedAt, probeType: "icmp", isSuccess: true },
  );

  assert.equal(log.errorMessage, null);
  assert.deepEqual(deviceUpdate, {
    status: "up",
    consecutiveFailures: 0,
    lastCheckedAt: checkedAt,
    lastSuccessAt: checkedAt,
  });
  assert.equal(statusChange.status, "up");
});
