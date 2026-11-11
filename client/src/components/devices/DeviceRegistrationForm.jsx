import { useMemo, useState } from 'react';
import { EyeOff, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import {
  CAPABILITY_LABELS,
  DEVICE_TYPE_OPTIONS,
  previewMonitoringProfile
} from '../../constants/devices';

const INITIAL_FORM = {
  name: '',
  type: 'switch',
  ipAddress: '',
  macAddress: '',
  brand: '',
  model: '',
  location: ''
};

const inputClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-mineral-green-500 focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20';

export function DeviceRegistrationForm({ onSubmit, onCancel, isSubmitting = false, error }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [localError, setLocalError] = useState(null);

  const isUnmanaged = form.type === 'switch_unmanaged';

  const preview = useMemo(
    () => previewMonitoringProfile(form.type, form.ipAddress),
    [form.type, form.ipAddress]
  );

  const update = (field) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setLocalError('El nombre del dispositivo es obligatorio (mínimo 2 caracteres).');
      return;
    }

    setLocalError(null);

    onSubmit?.({
      name: form.name.trim(),
      type: form.type,
      // RF-03.08: un switch no administrable se guarda con IP null.
      ipAddress: form.ipAddress.trim() || null,
      macAddress: form.macAddress.trim() || null,
      brand: form.brand.trim() || undefined,
      model: form.model.trim() || undefined,
      location: form.location.trim() || undefined
    });
  };

  const apiErrors = error?.response?.data?.errors ?? [];
  const apiMessage = error?.response?.data?.message ?? error?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {localError || error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <p className="font-semibold">{localError ?? apiMessage}</p>
          {apiErrors.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {apiErrors.map((item) => (
                <li key={`${item.field}-${item.message}`}>
                  {item.field}: {item.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="device-name" className="mb-1 block text-xs font-semibold text-slate-700">
            Nombre del dispositivo <span className="text-red-500">*</span>
          </label>
          <input
            id="device-name"
            type="text"
            value={form.name}
            onChange={update('name')}
            placeholder="Ej. Switch laboratorio de redes"
            className={inputClassName}
            autoComplete="off"
            required
          />
        </div>

        <div>
          <label htmlFor="device-type" className="mb-1 block text-xs font-semibold text-slate-700">
            Tipo de dispositivo <span className="text-red-500">*</span>
          </label>
          <select
            id="device-type"
            value={form.type}
            onChange={update('type')}
            className={inputClassName}
          >
            {DEVICE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="device-ip" className="mb-1 block text-xs font-semibold text-slate-700">
            Dirección IP{' '}
            <span className="font-normal text-slate-400">
              {isUnmanaged ? '(opcional)' : ''}
            </span>
          </label>
          <input
            id="device-ip"
            type="text"
            value={form.ipAddress}
            onChange={update('ipAddress')}
            placeholder={isUnmanaged ? 'Opcional · solo documentación' : 'Ej. 192.168.50.2'}
            className={`${inputClassName} font-mono`}
            autoComplete="off"
            aria-describedby="device-ip-help"
          />
          <p id="device-ip-help" className="mt-1 text-xs text-slate-500">
            {isUnmanaged
              ? 'Puedes dejarla vacía: se guardará como null y no se sondeará.'
              : 'Sin IP, el equipo también queda sin monitoreo directo.'}
          </p>
        </div>

        <div>
          <label htmlFor="device-mac" className="mb-1 block text-xs font-semibold text-slate-700">
            Dirección MAC
          </label>
          <input
            id="device-mac"
            type="text"
            value={form.macAddress}
            onChange={update('macAddress')}
            placeholder="AA:BB:CC:DD:EE:FF"
            className={`${inputClassName} font-mono`}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="device-location" className="mb-1 block text-xs font-semibold text-slate-700">
            Ubicación física
          </label>
          <input
            id="device-location"
            type="text"
            value={form.location}
            onChange={update('location')}
            placeholder="Ej. Bloque B · Laboratorio 204"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="device-brand" className="mb-1 block text-xs font-semibold text-slate-700">
            Marca
          </label>
          <input
            id="device-brand"
            type="text"
            value={form.brand}
            onChange={update('brand')}
            placeholder="Ej. TP-Link"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="device-model" className="mb-1 block text-xs font-semibold text-slate-700">
            Modelo
          </label>
          <input
            id="device-model"
            type="text"
            value={form.model}
            onChange={update('model')}
            placeholder="Ej. TL-SG1024D"
            className={inputClassName}
          />
        </div>
      </div>

      {isUnmanaged ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-stone-300 bg-stone-100 px-3 py-2.5 text-xs text-stone-700">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Los <strong>switches no administrables</strong> no son monitorizables
            directamente: no reciben sondeos ni generan alertas de caída por una
            IP inexistente.
          </p>
        </div>
      ) : null}

      <div
        className={`flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${
          preview.isMonitorable
            ? 'border-emerald-200 bg-emerald-50/70'
            : 'border-stone-300 bg-stone-50'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {preview.isMonitorable ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {preview.isMonitorable
                ? 'Monitoreable directamente'
                : 'No monitorizable directamente'}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              {preview.isMonitorable
                ? `Método: ${CAPABILITY_LABELS[preview.monitoringCapability]}.`
                : 'Se guardará en el inventario, sin sondeos ni alertas de caída.'}
            </p>
          </div>
        </div>
        <DeviceStatusBadge status={preview.status} className="self-start sm:self-auto" />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Guardar dispositivo
        </Button>
      </div>
    </form>
  );
}

export default DeviceRegistrationForm;
