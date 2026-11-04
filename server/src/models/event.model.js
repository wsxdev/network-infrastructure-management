import mongoose from 'mongoose';
import { DEVICE_STATUS } from '../config/constants.js';

const eventSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true
    },
    previousStatus: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      required: true
    },
    newStatus: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    responseTimeMs: {
      type: Number,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Índice TTL nativo de MongoDB: Retención automática por 90 días (Sección 8.4)
      expires: 90 * 24 * 60 * 60
    }
  },
  {
    versionKey: false
  }
);

eventSchema.index({ createdAt: -1 });

export const Event = mongoose.model('Event', eventSchema);
