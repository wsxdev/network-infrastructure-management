import { Device } from '../models/device.model.js';

const MAC_ADDRESS_PATTERN = /^[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}$/i;
const CONFLICT_FIELDS = '_id name ipAddress macAddress type location status createdAt';

function findActiveDevice(addressFilter) {
  return Device.findOne({ isDeleted: false, ...addressFilter })
    .select(CONFLICT_FIELDS)
    .lean();
}

export async function checkDeviceConflicts({ ip, mac } = {}) {
  const ipAddress = ip?.trim();
  const macAddress = mac?.trim();
  const macPattern = macAddress && MAC_ADDRESS_PATTERN.test(macAddress)
    ? new RegExp(`^${macAddress.split(/[:-]/).join('[:-]')}$`, 'i')
    : null;

  const [ipConflict, macConflict] = await Promise.all([
    ipAddress ? findActiveDevice({ ipAddress }) : null,
    macPattern ? findActiveDevice({ macAddress: macPattern }) : null,
  ]);

  return { ipConflict, macConflict };
}