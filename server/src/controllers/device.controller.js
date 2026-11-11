import { asyncHandler } from '../middlewares/async-handler.js';
import * as deviceService from '../services/device.service.js';

export const listDevices = asyncHandler(async (req, res) => {
  const devices = await deviceService.listDevices();
  res.status(200).json({ success: true, data: devices });
});

export const createDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.createDevice(req.body);

  res.status(201).json({
    success: true,
    message: device.isMonitorable
      ? 'Dispositivo registrado y habilitado para monitoreo.'
      : 'Dispositivo registrado sin monitoreo directo.',
    data: device
  });
});
