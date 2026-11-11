import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { Check } from "../models/check.model.js";

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function createDeviceHealthRouter({
  authenticate,
  idParamSchema,
  getDeviceById,
}) {
  const router = Router();

  router.get(
    "/:id/health-checks",
    authenticate,
    validateRequest(idParamSchema, "params"),
    validateRequest(historyQuerySchema, "query"),
    asyncHandler(async (req, res) => {
      const device = await getDeviceById(req.params.id);

      if (!device || device.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Dispositivo no encontrado.",
        });
      }

      const { page, limit } = req.query;
      const filter = { deviceId: device._id };
      const [data, total] = await Promise.all([
        Check.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Check.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data,
        pagination: { total, page, limit },
      });
    }),
  );

  return router;
}
