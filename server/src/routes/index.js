import { Router } from 'express';
import authRoutes from './auth.routes.js';
import deviceRoutes from './device.routes.js';
import alertRoutes from './alert.routes.js';
import metricRoutes from './metric.routes.js';
import configRoutes from './config.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/metrics', metricRoutes);
apiRouter.use('/config', configRoutes);

export default apiRouter;
