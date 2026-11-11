import { isIP } from "node:net";
import { Queue } from "bullmq";

export const INITIAL_DEVICE_CHECK_QUEUE = "initial-device-checks";

export function createInitialDeviceCheckQueue({
  name = INITIAL_DEVICE_CHECK_QUEUE,
  connection = { host: "127.0.0.1", port: 6379 },
} = {}) {
  return new Queue(name, { connection });
}
export function canCheckDevice(device) {
  const isMonitorable = device?.isMonitorable ?? device?.isManaged;
  const ipAddress = device?.ipAddress?.trim() ?? "";

  return (
    isMonitorable === true &&
    device?.isDeleted !== true &&
    isIP(ipAddress) !== 0
  );
}
export async function enqueueInitialDeviceCheck(device, queue) {
  if (!canCheckDevice(device)) {
    return { enqueued: false, monitoringStatus: "idle" };
  }

  if (!device._id) {
    throw new Error(
      "El dispositivo debe estar guardado antes de encolar el sondeo.",
    );
  }

  const deviceId = String(device._id);

  await queue.add(
    "initial-device-check",
    { deviceId },
    { jobId: `initial-device-check-${deviceId}` },
  );

  return { enqueued: true };
}
