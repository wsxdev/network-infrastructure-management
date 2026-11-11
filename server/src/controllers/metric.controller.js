import { asyncHandler } from '../middlewares/async-handler.js';
import { Device } from '../models/device.model.js';
import { Event } from '../models/event.model.js';
import { Check } from '../models/check.model.js';
import { DEVICE_STATUS } from '../config/constants.js';

export const getSummaryKpis = asyncHandler(async (req, res) => {
  const [totalDevices, upCount, downCount, unreachableCount, pendingCount] = await Promise.all([
    Device.countDocuments({ isDeleted: false }),
    Device.countDocuments({ isDeleted: false, status: DEVICE_STATUS.UP }),
    Device.countDocuments({ isDeleted: false, status: DEVICE_STATUS.DOWN }),
    Device.countDocuments({ isDeleted: false, status: DEVICE_STATUS.UNREACHABLE }),
    Device.countDocuments({ isDeleted: false, status: DEVICE_STATUS.PENDING })
  ]);

  // Cálculo de disponibilidad global (porcentaje UP sobre dispositivos evaluados)
  const evaluatedCount = upCount + downCount + unreachableCount;
  const availabilityPct = evaluatedCount > 0
    ? Number(((upCount / evaluatedCount) * 100).toFixed(2))
    : 100.0;

  // Promedio de tiempo de respuesta de equipos UP
  const avgLatencyResult = await Device.aggregate([
    { $match: { isDeleted: false, status: DEVICE_STATUS.UP, responseTimeMs: { $ne: null } } },
    { $group: { _id: null, avgRtt: { $avg: '$responseTimeMs' } } }
  ]);

  const avgResponseTimeMs = avgLatencyResult.length > 0
    ? Math.round(avgLatencyResult[0].avgRtt)
    : 0;

  return res.status(200).json({
    success: true,
    data: {
      totalDevices,
      upCount,
      downCount,
      unreachableCount,
      pendingCount,
      availabilityPct,
      avgResponseTimeMs,
      timestamp: new Date()
    }
  });
});

export const getRecentEvents = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const events = await Event.find()
    .populate('deviceId', 'name ipAddress type location')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  return res.status(200).json({
    success: true,
    data: events
  });
});

export const getAvailabilityTrends = asyncHandler(async (req, res) => {
  // Downsampling diario de disponibilidad (Big Data - RF-11)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const checksAggregate = await Check.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);

  return res.status(200).json({
    success: true,
    data: checksAggregate
  });
});
