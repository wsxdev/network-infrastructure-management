import mongoose from 'mongoose';
import { DEVICE_STATUS } from '../config/constants.js';

const checkSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      required: true
    },
    responseTimeMs: {
      type: Number,
      default: null
    },
    isSuccess: {
      type: Boolean,
      required: true
    },
    errorMessage: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Índice TTL nativo de MongoDB: Retención automática por 30 días (Big Data - Ing. Geovanny Silva)
      expires: 30 * 24 * 60 * 60
    }
  },
  {
    versionKey: false
  }
);

checkSchema.index({ deviceId: 1, createdAt: -1 });

export const Check = mongoose.model('Check', checkSchema);
