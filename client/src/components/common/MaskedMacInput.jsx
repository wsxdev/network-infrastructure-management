import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Expresión regular canónica para MAC de 6 octetos hexadecimales en mayúsculas.
 */
const CANONICAL_MAC_REGEX = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;

/**
 * Componente de entrada para dirección MAC con máscara automática de dos puntos y validación inline.
 * Satisface los Criterios de Aceptación (Escenario 2).
 *
 * @param {Object} props
 * @param {string} props.value - Valor actual de la MAC
 * @param {Function} props.onChange - Callback de actualización
 * @param {boolean} [props.isRequired=false] - Si la MAC es obligatoria
 * @param {string} [props.label='Dirección MAC'] - Etiqueta superior
 * @param {string} [props.placeholder='00:1A:2B:3C:4D:5E'] - Placeholder
 * @param {boolean} [props.disabled=false] - Estado deshabilitado
 */
export function MaskedMacInput({
  value = '',
  onChange,
  isRequired = false,
  label = 'Dirección MAC',
  placeholder = '00:1A:2B:3C:4D:5E',
  disabled = false
}) {
  const [touched, setTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validar inline
  useEffect(() => {
    const trimmed = (value || '').trim();

    if (!trimmed) {
      if (isRequired) {
        setErrorMessage('La dirección MAC es obligatoria.');
      } else {
        setErrorMessage('');
      }
      return;
    }

    if (!CANONICAL_MAC_REGEX.test(trimmed)) {
      setErrorMessage('Dirección MAC no válida. Formato admitido: AA:BB:CC:DD:EE:FF o aa:bb:cc:dd:ee:ff.');
    } else {
      setErrorMessage('');
    }
  }, [value, isRequired]);

  /**
   * Aplica máscara automática separando cada 2 caracteres hexadecimales con ':'.
   */
  const handleInputChange = (e) => {
    const inputVal = e.target.value;

    // Extraer únicamente caracteres hexadecimales y pasarlos a mayúsculas
    const hex = inputVal.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 12);

    // Formatear en pares separados por ':'
    const pairs = [];
    for (let i = 0; i < hex.length; i += 2) {
      pairs.push(hex.substring(i, i + 2));
    }

    const formatted = pairs.join(':');
    onChange(formatted);
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
          maxLength={17}
          className={`w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border transition-all duration-150 outline-none
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
          Separadores automáticos ':' (ej. 00:1A:2B:3C:4D:5E)
        </p>
      )}
    </div>
  );
}
