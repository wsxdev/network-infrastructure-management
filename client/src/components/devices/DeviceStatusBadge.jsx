import { EyeOff } from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * Badge de estado del dispositivo.
 *
 * RF-03.08: el estado `unmonitored` se muestra en gris con el icono `EyeOff`
 * para indicar que el equipo no es monitorizable directamente y no debe
 * confundirse con una caída real.
 */
export function DeviceStatusBadge({ status = 'pending', label, className = '' }) {
  if (status === 'unmonitored') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border bg-stone-100 text-stone-700 border-stone-300 ${className}`}
        title="Equipo sin monitoreo directo: no recibe sondeos ni genera alertas de caída"
      >
        <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{label ?? 'SIN MONITOREO DIRECTO'}</span>
      </span>
    );
  }

  return <Badge status={status} label={label} className={className} />;
}

export default DeviceStatusBadge;
