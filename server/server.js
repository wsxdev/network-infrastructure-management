import http from 'http';
import app from './src/app.js';
import { env } from './src/config/environment.js';
import { connectDatabase } from './src/config/database.js';

const server = http.createServer(app);

async function bootstrap() {
  try {
    await connectDatabase();

    server.listen(env.PORT, () => {
      console.log(`Servidor NOC Base escuchando en el puerto ${env.PORT} (${env.NODE_ENV})`);
      console.log(`API Base: http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    console.error('[ERROR] Error critico al arrancar el servidor:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Servidor HTTP cerrado.');
    process.exit(0);
  });
});

bootstrap();
