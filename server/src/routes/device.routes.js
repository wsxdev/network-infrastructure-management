import { Router } from 'express';
import {
  createDevice,
  listDevices
} from '../controllers/device.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createDeviceSchema } from '../validators/device.validator.js';

const router = Router();

router.get('/', listDevices);
router.post('/', validateRequest(createDeviceSchema), createDevice);

export default router;
