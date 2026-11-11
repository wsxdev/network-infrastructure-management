import { asyncHandler } from "../middlewares/async-handler.js";
import { checkDeviceConflicts } from "../services/device-duplicate.service.js";

export const checkDuplicate = asyncHandler(async (req, res) => {
  const data = await checkDeviceConflicts(req.query);
  return res.status(200).json({ success: true, data });
});
