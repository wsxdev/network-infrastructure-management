import mongoose from "mongoose";
import { DEVICE_STATUS, DEVICE_TYPES } from "../config/constants.js";

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    macAddress: {
      type: String,
      trim: true,
      uppercase: true,
      set: (value) =>
        typeof value === "string" ? value.replace(/-/g, ":") : value,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(DEVICE_TYPES),
      default: DEVICE_TYPES.WORKSTATION,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Laboratorio de Telecomunicaciones",
    },
    // Jerarquía Topológica: Padre en el árbol de red (ej. switch o router al que está conectado)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },
    // Estado operativo actual
    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.PENDING,
      index: true,
    },
    // Contadores para histéresis de cambio de estado (Regla 8.1)
    consecutiveFailures: {
      type: Number,
      default: 0,
    },
    consecutiveSuccesses: {
      type: Number,
      default: 0,
    },
    responseTimeMs: {
      type: Number,
      default: null,
    },
    // Switch no administrable sin IP asignable
    isManaged: {
      type: Boolean,
      default: true,
    },
    // Baja lógica (RF-02.04: Preservar histórico sin borrar físico)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    customMetadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Índice compuesto para evitar colisiones de IPs activas
deviceSchema.index({ ipAddress: 1, isDeleted: 1 });

// RF-03.03: IP y MAC únicas entre dispositivos activos.
deviceSchema.index(
  { ipAddress: 1 },
  {
    name: "unique_active_ip",
    unique: true,
    partialFilterExpression: {
      ipAddress: { $type: "string" },
      isDeleted: false,
    },
  },
);

deviceSchema.index(
  { macAddress: 1 },
  {
    name: "unique_active_mac",
    unique: true,
    partialFilterExpression: {
      macAddress: { $type: "string" },
      isDeleted: false,
    },
  },
);

export const Device = mongoose.model("Device", deviceSchema);
