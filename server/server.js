import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './src/app.js';
import { env } from './src/config/environment.js';
import { connectDatabase } from './src/config/database.js';
import { seedDatabase } from './src/seed.js';
import { startPingWorker, stopPingWorker } from './src/daemon/ping-worker.js';
import { startArpScanner, stopArpScanner } from './src/daemon/arp-scanner.js';

const server = http.createServer(app);

// Configuración de WebSockets con Socket.io (Torre de Control)
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Compartir instancia de Socket.io en la aplicación Express
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado a Torre de Control Socket.io: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado de Socket.io: ${socket.id}`);
  });
});

async function bootstrap() {
  try {
    // 1. Conexión a Base de Datos NoSQL MongoDB
    await connectDatabase();

    // 2. Sembrado automático si la base de datos está vacía
    await seedDatabase();

    // 3. Inicio del Servidor HTTP
    server.listen(env.PORT, () => {
      console.log(`🚀 Servidor NOC ESPOCH escuchando en el puerto ${env.PORT} (${env.NODE_ENV})`);
      console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);

      // 4. Despliegue del Escuadrón Centinela (Daemon de Monitoreo)
      startPingWorker(io);
      startArpScanner(io);
    });
  } catch (error) {
    console.error('❌ Error crítico al arrancar el servidor:', error);
    process.exit(1);
  }
}

// Apagado ordenado (Graceful Shutdown)
function handleShutdown(signal) {
  console.log(`\n🛑 Señal ${signal} recibida. Cerrando servicios ordenadamente...`);
  stopPingWorker();
  stopArpScanner();

  server.close(() => {
    console.log('✅ Servidor HTTP cerrado.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

bootstrap();
