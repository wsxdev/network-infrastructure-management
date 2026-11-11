import { EventEmitter } from "node:events";
import { enqueueInitialDeviceCheck } from "./initial-device-check.service.js";

export function createDeviceEvents({ queue, reportError }) {
  const events = new EventEmitter({ captureRejections: true });

  events.on("error", reportError);
  events.on("device:created", (device) =>
    enqueueInitialDeviceCheck(device, queue),
  );

  return events;
}
