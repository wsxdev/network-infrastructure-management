import { asyncHandler } from '../middlewares/async-handler.js';
import * as deviceService from '../services/device.service.js';
import * as topologyService from '../services/topology.service.js';
import { executeSafePing } from '../daemon/ping-worker.js';

export const getDevices = asyncHandler(async (req, res) => {
  const result = await deviceService.listDevices(req.query);
  return res.status(200).json({
    success: true,
    data: result.devices,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit
    }
  });
});

export const getDeviceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const device = await deviceService.getDeviceById(id);

  if (!device || device.isDeleted) {
    return res.status(404).json({
      success: false,
      message: `Dispositivo con identificador ${id} no encontrado.`
    });
  }

  return res.status(200).json({
    success: true,
    data: device
  });
});

export const createDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.createDevice(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: 'Dispositivo registrado satisfactoriamente en el inventario.',
    data: device
  });
});

export const updateDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const device = await deviceService.updateDevice(id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: 'Dispositivo actualizado satisfactoriamente.',
    data: device
  });
});

export const deleteDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deviceService.softDeleteDevice(id, req.user);

  return res.status(200).json({
    success: true,
    message: 'Dispositivo dado de baja lógicamente (historial preservado conforme a RF-02.04).'
  });
});

export const getTopology = asyncHandler(async (req, res) => {
  const graph = await topologyService.getTopologyGraph();
  return res.status(200).json({
    success: true,
    data: graph
  });
});

export const pingDeviceNow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const device = await deviceService.getDeviceById(id);

  if (!device || device.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'Dispositivo no encontrado.'
    });
  }

  if (!device.ipAddress) {
    return res.status(400).json({
      success: false,
      message: 'El dispositivo no posee dirección IP para sondeo ICMP.'
    });
  }

  const pingResult = await executeSafePing(device.ipAddress, 3000);
  const updateResult = await deviceService.recordPingResult(device._id, pingResult);

  return res.status(200).json({
    success: true,
    data: {
      pingResult,
      deviceStatus: updateResult ? updateResult.device.status : device.status
    }
  });
});
