import { canCheckDevice } from "../services/initial-device-check.service.js";
import { prepareDeviceCheckResult } from "../services/device-check-result.service.js";

export function createInitialDeviceCheckProcessor({
  findDevice,
  probeDevice,
  saveResult,
  events,
}) {
  return async function processInitialDeviceCheck(job) {
    const device = await findDevice(job.data.deviceId);

    if (!canCheckDevice(device)) {
      return;
    }

    const check = await probeDevice(device);
    const { log, deviceUpdate, statusChange } = prepareDeviceCheckResult(
      device,
      check,
    );

    const saved = await saveResult({
      jobId: job.id,
      device,
      log,
      deviceUpdate,
    });

    if (saved && statusChange) {
      events.emit("device:status_changed", statusChange);
    }
  };
}
