/**
 * Modelo Mongoose para el catálogo normalizado de tipos de dispositivos de red.
 * Satisface T-03.01.01: catálogo persistido en la colección `device_types`.
 * ESPOCH FIE - PAO 5
 *
 * @module models/deviceType.model
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Esquema del catálogo de tipos de dispositivos.
 * Cada documento representa un tipo canónico admitido por el inventario.
 */
const deviceTypeSchema = new Schema(
  {
    /** Identificador técnico único en snake_case (ej. 'switch_managed'). Inmutable. */
    code: {
      type: String,
      required: [true, 'El código del tipo de dispositivo es obligatorio.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_]+$/, 'El código solo puede contener letras minúsculas, dígitos y guiones bajos.']
    },

    /** Etiqueta legible en español para mostrar en la interfaz. */
    label: {
      type: String,
      required: [true, 'La etiqueta del tipo de dispositivo es obligatoria.'],
      trim: true,
      maxlength: [100, 'La etiqueta no puede exceder 100 caracteres.']
    },

    /** Indica si el tipo está habilitado en el catálogo activo. */
    isActive: {
      type: Boolean,
      default: true
    },

    /** Orden de aparición en el selector del formulario (menor = primero). */
    order: {
      type: Number,
      default: 99
    }
  },
  {
    collection: 'device_types',
    timestamps: true,
    versionKey: false
  }
);

/** Índice compuesto de consulta para listado activo ordenado. */
deviceTypeSchema.index({ isActive: 1, order: 1 });

export const DeviceType = mongoose.model('DeviceType', deviceTypeSchema);
