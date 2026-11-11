import { Device } from "../models/device.model.js";

const MAC_ADDRESS_PATTERN = /^[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}$/i;
const CONFLICT_FIELDS =
  "_id name ipAddress macAddress type location status createdAt";

function findActiveDevice(addressFilter) {
  return Device.findOne({ isDeleted: false, ...addressFilter })
    .select(CONFLICT_FIELDS)
    .lean();
}

export async function checkDeviceConflicts({ ip, mac } = {}) {
  const ipAddress = ip?.trim();
  const macAddress = mac?.trim();
  const macPattern =
    macAddress && MAC_ADDRESS_PATTERN.test(macAddress)
      ? new RegExp(`^${macAddress.split(/[:-]/).join("[:-]")}$`, "i")
      : null;

  const [ipConflict, macConflict] = await Promise.all([
    ipAddress ? findActiveDevice({ ipAddress }) : null,
    macPattern ? findActiveDevice({ macAddress: macPattern }) : null,
  ]);

  return { ipConflict, macConflict };
}

function duplicateError(field, conflicts) {
  const isIp = field === "ip";
  const message = isIp
    ? "La IP ya está asignada a un dispositivo activo."
    : "La MAC ya está asignada a un dispositivo activo.";

  return Object.assign(new Error(message), {
    statusCode: 409,
    code: isIp ? "DUPLICATE_IP" : "DUPLICATE_MAC",
    field,
    conflicts,
  });
}

export async function createDeviceWithDuplicateCheck(data) {
  const addresses = { ip: data.ipAddress, mac: data.macAddress };
  const conflicts = await checkDeviceConflicts(addresses);

  if (conflicts.ipConflict || conflicts.macConflict) {
    throw duplicateError(conflicts.ipConflict ? "ip" : "mac", conflicts);
  }

  try {
    return await Device.create(data);
  } catch (error) {
    const { ipAddress, macAddress } = error.keyPattern ?? {};
    if (error.code !== 11000 || (!ipAddress && !macAddress)) {
      throw error;
    }

    const currentConflicts = await checkDeviceConflicts(addresses);
    throw duplicateError(ipAddress ? "ip" : "mac", currentConflicts);
  }
}
