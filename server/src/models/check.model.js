import mongoose from "mongoose";
import { GUARDRAILS } from "../config/constants.js";

const deviceLogSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    probeType: {
      type: String,
      enum: ["icmp", "snmp"],
      required: true,
    },
    isSuccess: {
      type: Boolean,
      required: true,
    },
    technicalCause: {
      type: String,
      trim: true,
      default: null,
      required() {
        return this.isSuccess === false;
      },
    },
  },
  {
    collection: "health_logs",
    versionKey: false,
  },
);

deviceLogSchema.index(
  { checkedAt: 1 },
  { expireAfterSeconds: GUARDRAILS.TTL_CHECKS_DAYS * 24 * 60 * 60 },
);
deviceLogSchema.index({ deviceId: 1, checkedAt: -1 });

export const DeviceLog = mongoose.model("DeviceLog", deviceLogSchema);
