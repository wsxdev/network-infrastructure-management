import { DEVICE_STATUS } from "../config/constants.js";
import { evaluateDeviceHealth } from "./health-evaluation.service.js";

export function prepareDeviceCheckResult(device, result) {
  const { checkedAt, probeType, isSuccess, technicalCause } = result;
  const previousStatus = device.status ?? DEVICE_STATUS.PENDING;
  const nextHealth = evaluateDeviceHealth(device, isSuccess);

  const log = {
    deviceId: device._id,
    checkedAt,
    probeType,
    isSuccess,
    technicalCause: isSuccess ? null : technicalCause,
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
