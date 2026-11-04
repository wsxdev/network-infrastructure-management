import { useEffect, useRef } from 'react';

/**
 * Hook declarativo para intervalos seguros sin fugas de memoria (RNF-02).
 *
 * @param {Function} callback - Función a ejecutar periódicamente
 * @param {number|null} delayMs - Intervalo en milisegundos o null para pausar
 */
export function useInterval(callback, delayMs) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null || delayMs === undefined) return;

    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}
