import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Validador IPv4 en notación decimal punteada estándar (0-255 en 4 octetos).
 */
const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/**
 * Componente de entrada de dirección IP con máscara en tiempo real y validación inline.
 * Satisface los Criterios de Aceptación (Escenario 1 y Escenario 2).
 *
 * @param {Object} props
 * @param {string} props.value - Valor actual de la IP
 * @param {Function} props.onChange - Callback de actualización
 * @param {boolean} [props.isRequired=true] - Si la IP es obligatoria
 * @param {string} [props.label='Dirección IPv4'] - Etiqueta superior
 * @param {string} [props.placeholder='192.168.1.X'] - Placeholder
 * @param {boolean} [props.disabled=false] - Estado deshabilitado
 */
export function MaskedIpInput({
  value = '',
  onChange,
  isRequired = true,
  label = 'Dirección IPv4',
  placeholder = '192.168.1.X',
  disabled = false
}) {
  const [touched, setTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validar valor actual inline
  useEffect(() => {
    const trimmed = (value || '').trim();

    if (!trimmed) {
      if (isRequired) {
        setErrorMessage('La dirección IP es obligatoria para equipos con monitoreo directo.');
      } else {
        setErrorMessage('');
      }
      return;
    }

    if (!IPV4_REGEX.test(trimmed)) {
      setErrorMessage('Formato IPv4 inválido. Ingrese 4 octetos decimales entre 0 y 255 (ej. 192.168.1.50).');
    } else {
      setErrorMessage('');
    }
  }, [value, isRequired]);

  /**
   * Manejador de cambio con máscara en tiempo real para IPv4.
   * Filtra caracteres no válidos, limita a 4 octetos y previene números > 255.
   */
  const handleInputChange = (e) => {
    let raw = e.target.value;

    // Permitir solo números y puntos
    raw = raw.replace(/[^0-9.]/g, '');

    // Evitar puntos múltiples consecutivos o más de 3 puntos
    const parts = raw.split('.');

    // Limitar a máximo 4 octetos
    if (parts.length > 4) {
      parts.splice(4);
    }

    // Limitar cada octeto a números entre 0 y 255 y máximo 3 dígitos
    const sanitizedParts = parts.map((part) => {
      let segment = part.slice(0, 3);
      if (segment.length > 0) {
        const num = parseInt(segment, 10);
        if (num > 255) {
          segment = '255';
        }
      }
      return segment;
    });

    const maskedValue = sanitizedParts.join('.');
    onChange(maskedValue);
  };

  const hasError = touched && errorMessage !== '';
  const isValid = touched && !errorMessage && (value || '').trim() !== '';

  return (
    <div className="w-full">
      {/* Label superior estandarizado */}
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={15}
          className={`w-full px-3 py-2 text-xs font-mono rounded-lg border transition-all duration-150 outline-none
            ${
              disabled
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : hasError
                ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : isValid
                ? 'border-emerald-500 bg-emerald-50/10 text-slate-900 focus:border-mineral-green-600 focus:ring-2 focus:ring-mineral-green-500/20'
                : 'border-slate-300 bg-white text-slate-900 focus:border-mineral-green-600 focus:ring-2 focus:ring-mineral-green-500/20'
            }`}
        />

        {/* Indicador de estado visual inline */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
          {isValid && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        </div>
      </div>

      {/* Mensaje de validación inline */}
      {hasError && (
        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium animate-fadeIn">
          {errorMessage}
        </p>
      )}
      {!hasError && !disabled && (
        <p className="text-[10px] text-slate-400 mt-0.5">
          Formato decimal con puntos RFC 791 (ej. 192.168.1.1)
        </p>
      )}
    </div>
  );
}
