import { useState } from 'react';
import { CheckCircle2, EyeOff, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DeviceRegistrationForm } from '../components/devices/DeviceRegistrationForm';
import { DeviceTable } from '../components/devices/DeviceTable';
import { useCreateDevice, useDevices } from '../hooks/useDevices';

export function DeviceInventoryPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const devicesQuery = useDevices();
  const createDevice = useCreateDevice();

  const devices = devicesQuery.data ?? [];

  const closeModal = () => {
    setIsRegisterOpen(false);
    createDevice.reset();
  };

  const handleCreate = (payload) => {
    createDevice.mutate(payload, {
      onSuccess: (device) => {
        closeModal();
        setNotice({
          tone: device?.isMonitorable === false ? 'passive' : 'success',
          message:
            device?.isMonitorable === false
              ? `"${device.name}" se registró sin monitoreo directo. No recibirá sondeos ni generará alertas de caída.`
              : `"${device.name}" se registró y quedó pendiente de verificación.`
        });
      }
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 md:text-xl">
            Inventario de dispositivos
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Registro manual de equipos y su capacidad de monitoreo.
          </p>
        </div>

        <Button type="button" variant="primary" onClick={() => setIsRegisterOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar dispositivo
        </Button>
      </header>

      {notice ? (
        <div
          role="status"
          className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            notice.tone === 'passive'
              ? 'border-stone-300 bg-stone-100 text-stone-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {notice.tone === 'passive' ? (
              <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <p>{notice.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 rounded px-1.5 text-xs font-semibold opacity-70 hover:opacity-100"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      ) : null}

      <DeviceTable
        devices={devices}
        isLoading={devicesQuery.isLoading}
        error={devicesQuery.error}
        onRetry={devicesQuery.refetch}
      />

      <Modal
        isOpen={isRegisterOpen}
        onClose={closeModal}
        title="Registrar dispositivo"
        maxWidth="max-w-2xl"
      >
        <DeviceRegistrationForm
          onSubmit={handleCreate}
          onCancel={closeModal}
          isSubmitting={createDevice.isPending}
          error={createDevice.error}
        />
      </Modal>
    </div>
  );
}

export default DeviceInventoryPage;
