/**
 * Modelo de Datos Mongoose para Dispositivos de Red (Inventario FIE).
 * Cumple con RNF-12 (Modularidad), RNF-08 (Integridad de datos) y normas de calidad ISO/IEC 25010.
 *
 * @module models/device.model
 */

import mongoose from 'mongoose';
import { DEVICE_STATUS, DEVICE_TYPES } from '../config/constants.js';

/**
 * Esquema de Mongoose para la colección de dispositivos de red.
 * Normaliza campos técnicos: ID interno único, tipo, nombre, IP, MAC, fabricante, modelo, ubicación y observaciones.
 */
const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del dispositivo es obligatorio.'],
      trim: true,
      maxlength: [120, 'El nombre no puede exceder 120 caracteres.']
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null
    },
    macAddress: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    type: {
      type: String,
      enum: {
        values: Object.values(DEVICE_TYPES),
        message: 'Tipo de dispositivo `{VALUE}` no admitido en el catálogo del sistema.'
      },
      default: DEVICE_TYPES.WORKSTATION,
      required: [true, 'El tipo de hardware es obligatorio.']
    },
    vendor: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'El fabricante no puede exceder 100 caracteres.']
    },
    model: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'El modelo no puede exceder 100 caracteres.']
    },
    location: {
      type: String,
      trim: true,
      default: 'Laboratorio 1 - Rack A',
      maxlength: [150, 'La ubicación no puede exceder 150 caracteres.']
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres.']
    },
    // Jerarquía Topológica: Dispositivo padre en el árbol de infraestructura
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      default: null
    },
    // Estado operativo actual de conectividad
    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.PENDING,
      index: true
    },
    // Contadores para histéresis de cambio de estado (Regla 8.1)
    consecutiveFailures: {
      type: Number,
      default: 0
    },
    consecutiveSuccesses: {
      type: Number,
      default: 0
    },
    responseTimeMs: {
      type: Number,
      default: null
    },
    // Indicador de monitoreo directo / equipo administrable (si false, no requiere IP)
    isManaged: {
      type: Boolean,
      default: true
    },
    // Baja lógica (RF-02.04: Preservar histórico sin borrado físico)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    lastSeen: {
      type: Date,
      default: null
    },
    lastChecked: {
      type: Date,
      default: null
    },
    customMetadata: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals de interoperabilidad en español
deviceSchema.virtual('fabricante')
  .get(function () { return this.vendor; })
  .set(function (val) { this.vendor = val; });

deviceSchema.virtual('modelo')
  .get(function () { return this.model; })
  .set(function (val) { this.model = val; });

deviceSchema.virtual('ubicacion')
  .get(function () { return this.location; })
  .set(function (val) { this.location = val; });

deviceSchema.virtual('observaciones')
  .get(function () { return this.notes; })
  .set(function (val) { this.notes = val; });

// Índices compuestos para optimización de consultas BSON y prevención de duplicados
deviceSchema.index({ ipAddress: 1, isDeleted: 1 });
deviceSchema.index({ macAddress: 1, isDeleted: 1 });
deviceSchema.index({ type: 1, isDeleted: 1 });
deviceSchema.index({ status: 1, isDeleted: 1 });
deviceSchema.index({ name: 1, isDeleted: 1 });

/**
 * Modelo Mongoose Device exportado para persistencia en MongoDB.
 * @type {mongoose.Model}
 */
export const Device = mongoose.model('Device', deviceSchema);
