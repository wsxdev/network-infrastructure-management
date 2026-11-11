import { Router } from 'express';
import * as alertController from '../controllers/alert.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { idParamSchema } from '../validators/device.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', alertController.getAlerts);
router.get('/stats', alertController.getAlertStats);
router.patch('/:id/acknowledge', validateRequest(idParamSchema, 'params'), alertController.acknowledgeAlert);
router.patch('/:id/resolve', validateRequest(idParamSchema, 'params'), alertController.resolveAlert);

export default router;
