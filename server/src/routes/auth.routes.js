import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);

export default router;
