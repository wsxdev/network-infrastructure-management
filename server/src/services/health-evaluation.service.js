import { DEVICE_STATUS, GUARDRAILS } from "../config/constants.js";

export function evaluateDeviceHealth(
  { status = DEVICE_STATUS.PENDING, consecutiveFailures = 0 },
  isSuccess,
) {
  if (isSuccess) {
    return { status: DEVICE_STATUS.UP, consecutiveFailures: 0 };
  }

  const failures = consecutiveFailures + 1;

  return {
    status:
      failures >= GUARDRAILS.FAILURES_FOR_DOWN_DEFAULT
        ? DEVICE_STATUS.DOWN
        : status,
    consecutiveFailures: failures,
  };
}
