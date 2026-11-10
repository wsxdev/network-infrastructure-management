import { Router } from 'express';

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

export default apiRouter;
