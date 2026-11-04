import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function DeviceModal({ isOpen, onClose, onSave, device = null, availableParents = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    macAddress: '',
    type: 'workstation',
    location: 'Laboratorio de Telecomunicaciones',
    parentId: '',
    isManaged: true
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        ipAddress: device.ipAddress || '',
        macAddress: device.macAddress || '',
        type: device.type || 'workstation',
        location: device.location || 'Laboratorio de Telecomunicaciones',
        parentId: device.parentId?._id || device.parentId || '',
        isManaged: device.isManaged !== undefined ? device.isManaged : true
      });
    } else {
      setFormData({
        name: '',
        ipAddress: '',
        macAddress: '',
        type: 'workstation',
        location: 'Laboratorio de Telecomunicaciones',
        parentId: '',
        isManaged: true
      });
    }
    setError(null);
  }, [device, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        ipAddress: formData.ipAddress.trim() || null,
        macAddress: formData.macAddress.trim() || null,
        parentId: formData.parentId || null
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
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Nombre del Dispositivo *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej. Switch Acceso Módulo 2"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dirección IPv4</label>
            <input
              type="text"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              placeholder="192.168.1.50"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dirección MAC</label>
            <input
              type="text"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Hardware *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-mineral-green-600"
            >
              <option value="router">Router / Gateway</option>
              <option value="switch">Switch</option>
              <option value="server">Servidor</option>
              <option value="workstation">Estación de Trabajo / PC</option>
              <option value="ap">Punto de Acceso (AP)</option>
              <option value="other">Otro Periférico</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dispositivo Padre (Jerarquía)</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-mineral-green-600"
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

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Ubicación Física</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Rack Principal, Mesa 2, etc."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isManaged"
            checked={formData.isManaged}
            onChange={(e) => setFormData({ ...formData, isManaged: e.target.checked })}
            className="rounded border-slate-300 text-mineral-green-700 focus:ring-mineral-green-500"
          />
          <label htmlFor="isManaged" className="text-slate-700 select-none">
            Dispositivo administrable con comprobación ICMP activa
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
