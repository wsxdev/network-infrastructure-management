import { Router } from 'express';
import * as metricController from '../controllers/metric.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/kpis', metricController.getSummaryKpis);
router.get('/events', metricController.getRecentEvents);
router.get('/availability-trends', metricController.getAvailabilityTrends);

export default router;
