import { Router } from 'express';
import authRoutes from './auth.routes.js';
import deviceRoutes from './device.routes.js';
import alertRoutes from './alert.routes.js';
import metricRoutes from './metric.routes.js';
import configRoutes from './config.routes.js';

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

apiRouter.use('/auth', authRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/metrics', metricRoutes);
apiRouter.use('/config', configRoutes);

export default apiRouter;
