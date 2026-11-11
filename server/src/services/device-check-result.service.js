import { DEVICE_STATUS } from "../config/constants.js";
import { evaluateDeviceHealth } from "./health-evaluation.service.js";

export function prepareDeviceCheckResult(device, result) {
  const { checkedAt, probeType, isSuccess, technicalCause, responseTimeMs } =
    result;
  const previousStatus = device.status ?? DEVICE_STATUS.PENDING;
  const nextHealth = evaluateDeviceHealth(device, isSuccess);

  const log = {
    deviceId: device._id,
    ipAddress: device.ipAddress,
    status: isSuccess ? DEVICE_STATUS.UP : DEVICE_STATUS.DOWN,
    responseTimeMs: isSuccess ? (responseTimeMs ?? null) : null,
    isSuccess,
    errorMessage: isSuccess ? null : technicalCause,
    createdAt: checkedAt,
    probeType,
  };

  const deviceUpdate = {
    ...nextHealth,
    lastCheckedAt: checkedAt,
  };

  if (isSuccess) {
    deviceUpdate.lastSuccessAt = checkedAt;
  }

  const statusChange =
    nextHealth.status === previousStatus
      ? null
      : {
          deviceId: device._id,
          previousStatus,
          status: nextHealth.status,
          checkedAt,
        };

  return { log, deviceUpdate, statusChange };
}
