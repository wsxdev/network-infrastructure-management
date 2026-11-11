import { isIP } from "node:net";

export function canCheckDevice(device) {
  const ipAddress = device?.ipAddress?.trim() ?? "";
  return device?.isMonitorable === true && isIP(ipAddress) !== 0;
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
