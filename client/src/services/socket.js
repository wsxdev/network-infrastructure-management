import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('📡 Conexión WebSocket establecida con Torre de Control NOC.');
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Desconectado de WebSocket Torre de Control NOC.');
    });
  }

  return socket;
}
