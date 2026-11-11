import { Router } from 'express';
import deviceRouter from './device.routes.js';

const apiRouter = Router();

/**
 * Endpoint base de comprobación de salud del servidor (Health Check).
 * Proporciona verificación instantánea del estado del servicio backend.
 */
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'NOC API Base Operativa',
    timestamp: new Date().toISOString()
  });
});

// RF-03.08: registro manual de dispositivos.
apiRouter.use('/devices', deviceRouter);

export default apiRouter;
