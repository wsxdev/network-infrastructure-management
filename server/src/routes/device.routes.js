import { Router } from 'express';
import * as deviceController from '../controllers/device.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createDeviceSchema, updateDeviceSchema, idParamSchema } from '../validators/device.validator.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

// Rutas de consulta (Accesibles por administrador y operador)
router.get('/', deviceController.getDevices);
router.get('/topology', deviceController.getTopology);
// Catálogo de tipos dinámico — T-03.01.01 (antes de /:id para evitar colisión de rutas)
router.get('/types', deviceController.getDeviceTypes);
router.get('/:id', validateRequest(idParamSchema, 'params'), deviceController.getDeviceById);
router.post('/:id/ping', validateRequest(idParamSchema, 'params'), deviceController.pingDeviceNow);

// Rutas de modificación de inventario (Exclusivas para administrador - RNF-06)
router.post(
  '/',
  authorizeRoles([USER_ROLES.ADMINISTRATOR]),
  validateRequest(createDeviceSchema),
  deviceController.createDevice
);

router.put(
  '/:id',
  authorizeRoles([USER_ROLES.ADMINISTRATOR]),
  validateRequest(idParamSchema, 'params'),
  validateRequest(updateDeviceSchema),
  deviceController.updateDevice
);

router.delete(
  '/:id',
  authorizeRoles([USER_ROLES.ADMINISTRATOR]),
  validateRequest(idParamSchema, 'params'),
  deviceController.deleteDevice
);

export default router;
