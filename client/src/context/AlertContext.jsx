import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sintetizador acústico discreto NOC mediante Web Audio API (RNF-11)
  const playAlertSound = (type = 'warning') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'critical') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // La5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Re5
      }

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Navegadores pueden requerir interacción del usuario antes de reproducir audio
    }
  };

  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    if (toast.severity === 'critical' || toast.severity === 'warning') {
      playAlertSound(toast.severity);
    }

    // Auto eliminar a los 6 segundos
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cargar estadísticas iniciales de alertas solo cuando esté autenticado
  const fetchAlertStats = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/alerts/stats');
      setActiveAlertsCount(data.data.totalOpen);
    } catch (e) {
      // Ignorar silenciosamente si hay error de red
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveAlertsCount(0);
      return;
    }

    fetchAlertStats();
    const socket = getSocket();

    const handleStatusChanged = (event) => {
      if (event.newStatus === 'down') {
        addToast({
          title: `Caída: ${event.name}`,
          message: `El host ${event.ipAddress} ha dejado de responder.`,
          severity: 'critical'
        });
        setActiveAlertsCount((c) => c + 1);
      } else if (event.newStatus === 'up' && event.previousStatus === 'down') {
        addToast({
          title: `Restablecido: ${event.name}`,
          message: `El host ${event.ipAddress} está nuevamente disponible.`,
          severity: 'info'
        });
      }
    };

    const handleQuorumAlert = (event) => {
      addToast({
        title: `🚨 Alerta de Quórum: ${event.switchName}`,
        message: `${event.affectedDevices} de ${event.totalDevices} dispositivos caídos. Falla troncal.`,
        severity: 'critical'
      });
      setActiveAlertsCount((c) => c + 1);
    };

    const handleDiscovered = (event) => {
      addToast({
        title: `Nuevo Host Descubierto`,
        message: `Detectada IP ${event.device.ipAddress} (${event.device.macAddress})`,
        severity: 'info'
      });
    };

    socket.on('device:statusChanged', handleStatusChanged);
    socket.on('switch:quorumAlert', handleQuorumAlert);
    socket.on('device:discovered', handleDiscovered);

    return () => {
      socket.off('device:statusChanged', handleStatusChanged);
      socket.off('switch:quorumAlert', handleQuorumAlert);
      socket.off('device:discovered', handleDiscovered);
    };
  }, [isAuthenticated]);

  return (
    <AlertContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        activeAlertsCount,
        refreshAlertStats: fetchAlertStats,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts debe utilizarse dentro de un AlertProvider');
  }
  return context;
}
