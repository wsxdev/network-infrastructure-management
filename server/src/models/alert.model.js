import mongoose from 'mongoose';
import { ALERT_SEVERITY, ALERT_STATUS } from '../config/constants.js';

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      default: null,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: Object.values(ALERT_SEVERITY),
      default: ALERT_SEVERITY.WARNING,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(ALERT_STATUS),
      default: ALERT_STATUS.OPEN,
      index: true
    },
    // Usuario que reconoció la alerta (RF-07)
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

alertSchema.index({ status: 1, createdAt: -1 });

export const Alert = mongoose.model('Alert', alertSchema);
