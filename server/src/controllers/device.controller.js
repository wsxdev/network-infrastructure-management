/**
 * Controlador HTTP para el inventario de dispositivos de red.
 * Sigue la regla de asincronía con exclusividad de async/await y envoltura asyncHandler.
 * ESPOCH FIE - PAO 5
 *
 * @module controllers/device.controller
 */

import { asyncHandler } from '../middlewares/async-handler.js';
import * as deviceService from '../services/device.service.js';
import * as topologyService from '../services/topology.service.js';
import { executeSafePing } from '../daemon/ping-worker.js';
import { DeviceType } from '../models/deviceType.model.js';

/**
 * Consulta y lista dispositivos con soporte para paginación y filtros.
 *
 * @param {import('express').Request} req - Petición HTTP Express
 * @param {import('express').Response} res - Respuesta HTTP Express
 * @returns {Promise<void>}
 */
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

const DEFAULT_CATALOG_TYPES = [
  { code: 'desktop',          label: 'Computadora de escritorio',    order: 1 },
  { code: 'laptop',           label: 'Laptop',                       order: 2 },
  { code: 'server',           label: 'Servidor',                     order: 3 },
  { code: 'router',           label: 'Router',                       order: 4 },
  { code: 'switch_managed',   label: 'Switch administrable',         order: 5 },
  { code: 'switch_unmanaged', label: 'Switch no administrable',      order: 6 },
  { code: 'access_point',     label: 'Punto de acceso inalámbrico',  order: 7 },
  { code: 'network_printer',  label: 'Impresora de red',             order: 8 },
  { code: 'smartphone',       label: 'Smartphone',                   order: 9 },
  { code: 'other',            label: 'Otro',                         order: 10 }
];

/**
 * Retorna el catálogo activo de tipos de dispositivos ordenado para el selector de formularios.
 * Satisface T-03.01.01: tipos cargados dinámicamente desde la colección `device_types`.
 *
 * @param {import('express').Request} req - Petición HTTP Express
 * @param {import('express').Response} res - Respuesta HTTP Express
 * @returns {Promise<void>}
 */
export const getDeviceTypes = asyncHandler(async (req, res) => {
  try {
    const types = await DeviceType.find({ isActive: true }).sort({ order: 1 }).maxTimeMS(3000).lean();
    return res.status(200).json({
      success: true,
      data: types && types.length > 0 ? types : DEFAULT_CATALOG_TYPES
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      data: DEFAULT_CATALOG_TYPES
    });
  }
});

/**
 * Obtiene el detalle técnico de un dispositivo por su ID interno único de MongoDB.
 *
 * @param {import('express').Request} req - Petición HTTP con id en params
 * @param {import('express').Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
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

/**
 * Registra un nuevo dispositivo con validación de campos y auditoría DEVICE_CREATED.
 * Responde HTTP 201 Created conforme a los Criterios de Aceptación.
 *
 * @param {import('express').Request} req - Petición con cuerpo validado por Zod
 * @param {import('express').Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export const createDevice = asyncHandler(async (req, res) => {
  const device = await deviceService.createDevice(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: 'Dispositivo registrado satisfactoriamente en el inventario.',
    data: device
  });
});

/**
 * Actualiza los campos de un dispositivo existente.
 *
 * @param {import('express').Request} req - Petición HTTP
 * @param {import('express').Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export const updateDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const device = await deviceService.updateDevice(id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: 'Dispositivo actualizado satisfactoriamente.',
    data: device
  });
});

/**
 * Ejecuta una baja lógica del dispositivo preservando históricos (RF-02.04).
 *
 * @param {import('express').Request} req - Petición HTTP
 * @param {import('express').Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export const deleteDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deviceService.softDeleteDevice(id, req.user);

  return res.status(200).json({
    success: true,
    message: 'Dispositivo dado de baja lógicamente (historial preservado conforme a RF-02.04).'
  });
});

/**
 * Obtiene el grafo consolidado de topología de red.
 *
 * @param {import('express').Request} req - Petición HTTP
 * @param {import('express').Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export const getTopology = asyncHandler(async (req, res) => {
  const graph = await topologyService.getTopologyGraph();
  return res.status(200).json({
    success: true,
    data: graph
  });
});

/**
 * Ejecuta una sonda ICMP inmediata y segura contra la dirección IP del dispositivo.
 *
 * @param {import('express').Request} req - Petición HTTP
 * @param {import('express').Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
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
