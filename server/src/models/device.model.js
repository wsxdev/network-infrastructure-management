import mongoose from 'mongoose';
import net from 'node:net';
import {
  DEVICE_STATUS,
  DEVICE_TYPES,
  MONITORING_CAPABILITIES
} from '../config/constants.js';
import {
  normalizeIpAddress,
  resolveMonitoringProfile
} from '../domain/monitoring.js';

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    // RF-03.08: opcional; un switch no administrable se guarda con null.
    ipAddress: {
      type: String,
      trim: true,
      default: null,
      index: true,
      set: (value) =>
        typeof value === 'string' ? normalizeIpAddress(value) : value,
      validate: {
        validator: (value) => value === null || net.isIP(value) !== 0,
        message: 'La dirección IP no es válida (IPv4 o IPv6).'
      }
    },
    macAddress: {
      type: String,
      trim: true,
      uppercase: true,
      set: (value) =>
        typeof value === 'string' ? value.replace(/-/g, ':') : value,
      default: null
    },
    type: {
      type: String,
      enum: Object.values(DEVICE_TYPES),
      required: true,
      index: true
    },
    brand: {
      type: String,
      trim: true,
      default: null
    },
    model: {
      type: String,
      trim: true,
      default: null
    },
    location: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.PENDING,
      index: true
    },
    // --- RF-03.08: capacidad real de monitoreo ---
    isMonitorable: {
      type: Boolean,
      default: true,
      index: true
    },
    monitoringCapability: {
      type: String,
      enum: Object.values(MONITORING_CAPABILITIES),
      default: MONITORING_CAPABILITIES.NONE
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/**
 * Invariante de dominio a nivel de documento.
 * Ningún punto de entrada puede dejar un equipo sin monitoreo directo dentro
 * de la cola de sondeos.
 */
deviceSchema.pre('validate', function syncMonitoringFields(next) {
  if (!this.type) return next();

  if (this.ipAddress === '') this.ipAddress = null;

  const profile = resolveMonitoringProfile({
    type: this.type,
    ipAddress: this.ipAddress
  });

  this.isMonitorable = profile.isMonitorable;
  this.monitoringCapability = profile.monitoringCapability;

  if (!profile.isMonitorable) {
    this.status = DEVICE_STATUS.UNMONITORED;
  } else if (this.status === DEVICE_STATUS.UNMONITORED) {
    // Si el equipo deja de ser pasivo, vuelve a evaluación.
    this.status = DEVICE_STATUS.PENDING;
  }

  return next();
});

// Índice para las consultas del motor de monitoreo (RF-03.08).
deviceSchema.index({ isMonitorable: 1, ipAddress: 1 });

export const Device =
  mongoose.models.Device ?? mongoose.model('Device', deviceSchema);

export default Device;
