import { Router } from "express";
import { checkDuplicate } from "../controllers/device-duplicate.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { checkDeviceDuplicateSchema } from "../validators/device-duplicate.validator.js";

export function createDeviceDuplicateRouter({ authenticate, authorizeAdmin }) {
  const router = Router();

  router.get(
    "/check-duplicate",
    authenticate,
    authorizeAdmin,
    validateRequest(checkDeviceDuplicateSchema, "query"),
    checkDuplicate,
  );

  return router;
}
