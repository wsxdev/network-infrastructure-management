import assert from "node:assert/strict";
import test from "node:test";
import { DEVICE_STATUS } from "../src/config/constants.js";
import { evaluateDeviceHealth } from "../src/services/health-evaluation.service.js";

test("marca No disponible al tercer fallo consecutivo", () => {
  const first = evaluateDeviceHealth({}, false);
  const second = evaluateDeviceHealth(first, false);
  const third = evaluateDeviceHealth(second, false);

  assert.deepEqual(first, {
    status: DEVICE_STATUS.PENDING,
    consecutiveFailures: 1,
  });
  assert.deepEqual(second, {
    status: DEVICE_STATUS.PENDING,
    consecutiveFailures: 2,
  });
  assert.deepEqual(third, {
    status: DEVICE_STATUS.DOWN,
    consecutiveFailures: 3,
  });
});

test("un éxito reinicia la racha de fallos", () => {
  const first = evaluateDeviceHealth({}, false);
  const success = evaluateDeviceHealth(first, true);
  const next = evaluateDeviceHealth(success, false);

  assert.deepEqual(success, {
    status: DEVICE_STATUS.UP,
    consecutiveFailures: 0,
  });
  assert.deepEqual(next, {
    status: DEVICE_STATUS.UP,
    consecutiveFailures: 1,
  });
});
