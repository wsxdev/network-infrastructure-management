import { asyncHandler } from '../middlewares/async-handler.js';
import { Alert } from '../models/alert.model.js';
import { ALERT_STATUS, ALERT_SEVERITY } from '../config/constants.js';

export const getAlerts = asyncHandler(async (req, res) => {
  const { status, severity, limit = 50, page = 1 } = req.query;
  const filter = {};

  if (status && Object.values(ALERT_STATUS).includes(status)) {
    filter.status = status;
  }
  if (severity && Object.values(ALERT_SEVERITY).includes(severity)) {
    filter.severity = severity;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .populate('deviceId', 'name ipAddress type location')
      .populate('acknowledgedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Alert.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    data: alerts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit)
    }
  });
});

export const getAlertStats = asyncHandler(async (req, res) => {
  const [openCritical, openWarning, openInfo, totalOpen] = await Promise.all([
    Alert.countDocuments({ status: ALERT_STATUS.OPEN, severity: ALERT_SEVERITY.CRITICAL }),
    Alert.countDocuments({ status: ALERT_STATUS.OPEN, severity: ALERT_SEVERITY.WARNING }),
    Alert.countDocuments({ status: ALERT_STATUS.OPEN, severity: ALERT_SEVERITY.INFO }),
    Alert.countDocuments({ status: ALERT_STATUS.OPEN })
  ]);

  return res.status(200).json({
    success: true,
    data: {
      totalOpen,
      critical: openCritical,
      warning: openWarning,
      info: openInfo
    }
  });
});

export const acknowledgeAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await Alert.findById(id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alerta no encontrada.'
    });
  }

  alert.status = ALERT_STATUS.ACKNOWLEDGED;
  alert.acknowledgedBy = req.user._id;
  alert.acknowledgedAt = new Date();
  await alert.save();

  return res.status(200).json({
    success: true,
    message: 'Alerta reconocida satisfactoriamente.',
    data: alert
  });
});

export const resolveAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await Alert.findById(id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alerta no encontrada.'
    });
  }

  alert.status = ALERT_STATUS.RESOLVED;
  alert.resolvedAt = new Date();
  await alert.save();

  return res.status(200).json({
    success: true,
    message: 'Alerta marcada como resuelta.',
    data: alert
  });
});
