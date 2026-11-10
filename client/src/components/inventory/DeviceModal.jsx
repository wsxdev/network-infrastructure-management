import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { MaskedIpInput } from '../common/MaskedIpInput';
import { MaskedMacInput } from '../common/MaskedMacInput';

/**
 * Modal para el registro y edición de dispositivos en el inventario.
 * Cumple con RNF-11 (Accesibilidad WCAG 2.1 AA) y los Criterios de Aceptación (Escenarios 1, 2, 3 y 4).
 */
export function DeviceModal({ isOpen, onClose, onSave, device = null, availableParents = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'workstation',
    ipAddress: '',
    macAddress: '',
    vendor: '',
    model: '',
    location: 'Laboratorio 1 - Rack A',
    notes: '',
    parentId: '',
    isManaged: true
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        type: device.type || 'workstation',
        ipAddress: device.ipAddress || '',
        macAddress: device.macAddress || '',
        vendor: device.vendor || device.fabricante || '',
        model: device.model || device.modelo || '',
        location: device.location || device.ubicacion || 'Laboratorio 1 - Rack A',
        notes: device.notes || device.observaciones || '',
        parentId: device.parentId?._id || device.parentId || '',
        isManaged: device.isManaged !== undefined ? device.isManaged : true
      });
    } else {
      setFormData({
        name: '',
        type: 'workstation',
        ipAddress: '',
        macAddress: '',
        vendor: '',
        model: '',
        location: 'Laboratorio 1 - Rack A',
        notes: '',
        parentId: '',
        isManaged: true
      });
    }
    setError(null);
  }, [device, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación previa del lado cliente
    if (!formData.name.trim()) {
      setError('El nombre del dispositivo es obligatorio.');
      return;
    }

    if (formData.isManaged && !formData.ipAddress.trim()) {
      setError('La dirección IP es obligatoria para dispositivos con monitoreo directo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        ipAddress: formData.ipAddress.trim() || null,
        macAddress: formData.macAddress.trim() || null,
        vendor: formData.vendor.trim(),
        model: formData.model.trim(),
        location: formData.location.trim() || 'Laboratorio 1 - Rack A',
        notes: formData.notes.trim(),
        parentId: formData.parentId || null,
        isManaged: formData.isManaged
      };

      await onSave(payload, device?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar el dispositivo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={device ? 'Editar Dispositivo de Red' : 'Registrar Nuevo Dispositivo'}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Fila 1: Nombre y Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Switch Acceso Módulo 2"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Dispositivo *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-mineral-green-600"
            >
              <option value="router">Router / Gateway</option>
              <option value="switch">Switch</option>
              <option value="server">Servidor</option>
              <option value="workstation">Estación de Trabajo / PC</option>
              <option value="ap">Punto de Acceso (AP)</option>
              <option value="other">Otro Periférico</option>
            </select>
          </div>
        </div>

        {/* Checkbox de Monitoreo Directo */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <input
            type="checkbox"
            id="isManaged"
            checked={formData.isManaged}
            onChange={(e) => setFormData({ ...formData, isManaged: e.target.checked })}
            className="rounded border-slate-300 text-mineral-green-700 focus:ring-mineral-green-500"
          />
          <label htmlFor="isManaged" className="text-xs text-slate-700 select-none">
            Dispositivo administrable con monitoreo directo (Requiere IP activa)
          </label>
        </div>

        {/* Fila 2: Inputs con máscara IP y MAC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MaskedIpInput
            label="IP"
            placeholder="192.168.1.X"
            value={formData.ipAddress}
            onChange={(val) => setFormData({ ...formData, ipAddress: val })}
            isRequired={formData.isManaged}
          />

          <MaskedMacInput
            label="MAC"
            placeholder="00:1A:2B:3C:4D:5E"
            value={formData.macAddress}
            onChange={(val) => setFormData({ ...formData, macAddress: val })}
            isRequired={false}
          />
        </div>

        {/* Fila 3: Fabricante y Modelo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fabricante
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="Ej. Cisco Systems / MikroTik / HP"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Ej. Catalyst 2960 / RB4011"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
            />
          </div>
        </div>

        {/* Fila 4: Ubicación y Dispositivo Padre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Laboratorio 1 - Rack A"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispositivo Padre (Jerarquía)
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-mineral-green-600"
            >
              <option value="">Sin padre (Nodo Raíz / Gateway)</option>
              {availableParents
                .filter((p) => !device || p._id !== device._id)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.ipAddress || p.type})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Observaciones
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Observaciones técnicas, notas de instalación o asignación..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600 resize-none"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {device ? 'Actualizar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
