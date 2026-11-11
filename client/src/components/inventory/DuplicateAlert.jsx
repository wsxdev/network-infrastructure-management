import { AlertTriangle, Cpu } from "lucide-react";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

export function DuplicateAlert({
  isOpen,
  onClose,
  onViewDevice,
  ipAddress = "",
  macAddress = "",
  ipConflict = null,
  macConflict = null,
}) {
  const matches = [
    { label: "IP", entered: ipAddress, field: "ipAddress", device: ipConflict },
    {
      label: "MAC",
      entered: macAddress,
      field: "macAddress",
      device: macConflict,
    },
  ].filter(({ device }) => device);

  return (
    <Modal
      isOpen={isOpen && matches.length > 0}
      onClose={onClose}
      title="Dirección ya registrada"
    >
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>Revisa la coincidencia antes de registrar el equipo.</p>
        </div>

        {matches.map(({ label, entered, field, device }) => (
          <section
            key={field}
            className="rounded-lg border border-slate-200 p-4"
          >
            <h4 className="mb-2 font-semibold text-slate-900">
              Coincidencia por {label}
            </h4>
            <dl className="grid grid-cols-2 gap-2">
              <dt>Dirección ingresada</dt>
              <dd className="break-all font-mono">{entered}</dd>
              <dt>Dirección registrada</dt>
              <dd className="break-all font-mono">{device[field]}</dd>
              <dt>Equipo existente</dt>
              <dd className="font-medium">{device.name}</dd>
              <dt>Tipo de equipo</dt>
              <dd className="flex items-center gap-2">
                <Cpu className="h-4 w-4" aria-hidden="true" />
                <span className="uppercase">
                  {device.type || "No informado"}
                </span>
              </dd>

              <dt>Ubicación física</dt>
              <dd>{device.location || "No informada"}</dd>

              <dt>Estado actual</dt>
              <dd>
                {device.status ? (
                  <Badge status={device.status} />
                ) : (
                  "No informado"
                )}
              </dd>

              <dt>Fecha de alta</dt>
              <dd>
                {device.createdAt
                  ? new Date(device.createdAt).toLocaleDateString("es-EC")
                  : "No informada"}
              </dd>

              <dt>Código institucional</dt>
              <dd>No disponible en el inventario actual</dd>
            </dl>
            {onViewDevice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onViewDevice(device)}
              >
                Ir a la ficha del dispositivo existente
              </Button>
            )}
          </section>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar y corregir
        </Button>
      </div>
    </Modal>
  );
}
