import { Router } from 'express';
import * as configController from '../controllers/config.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { updateConfigSchema } from '../validators/config.validator.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

// Ver configuración (Ambos roles)
router.get('/', configController.getConfig);

// Modificar guardrails (Exclusivo administrador - RNF-06)
router.put(
  '/',
  authorizeRoles([USER_ROLES.ADMINISTRATOR]),
  validateRequest(updateConfigSchema),
  configController.updateConfig
);

router.post(
  '/reset',
  authorizeRoles([USER_ROLES.ADMINISTRATOR]),
  configController.resetConfig
);

export default router;
