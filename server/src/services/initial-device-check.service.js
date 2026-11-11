import { isIP } from "node:net";

export async function enqueueInitialDeviceCheck(device, queue) {
  const ipAddress = device.ipAddress?.trim() ?? "";

  if (device.isMonitorable !== true || isIP(ipAddress) === 0) {
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
