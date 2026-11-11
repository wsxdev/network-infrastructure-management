import mongoose from 'mongoose';
import { env } from './environment.js';

let isConnected = false;

/**
 * Establece la conexión a MongoDB con soporte de reconexión automática.
 * Conforme a RNF-04 (Recuperación ante fallos) y RNF-08 (Integridad).
 */
export async function connectDatabase() {
  if (isConnected) {
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;
    console.log(`✅ Base de Datos MongoDB conectada: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB (${env.MONGODB_URI}):`, error.message);
    // Si estamos en desarrollo y MongoDB no está corriendo, no salimos de inmediato para permitir diagnóstico
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ MongoDB desconectado. Intentando reconexión automática...');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('🔄 MongoDB reconectado exitosamente.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Error en el hilo de MongoDB:', err.message);
  });
}
