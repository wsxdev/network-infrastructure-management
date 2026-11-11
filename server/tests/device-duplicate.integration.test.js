import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import { Device } from "../src/models/device.model.js";
import {
  checkDeviceConflicts,
  createDeviceWithDuplicateCheck,
} from "../src/services/device-duplicate.service.js";

const databaseName = `rf0303_test_${randomUUID()}`;

before(async () => {
  await mongoose.connect(`mongodb://127.0.0.1:27017/${databaseName}`, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true,
  });
  await Device.init();
});

after(async () => {
  try {
    if (
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === databaseName
    ) {
      await mongoose.connection.dropDatabase();
    }
  } finally {
    await mongoose.disconnect();
  }
});

test("detecta duplicados activos y permite reutilizar direcciones dadas de baja", async () => {
  const ip = "192.0.2.73";
  const mac = "02-00-00-00-03-AB";
  const original = await Device.create({
    name: "Equipo original",
    ipAddress: ip,
    macAddress: mac,
  });

  const conflicts = await checkDeviceConflicts({
    ip,
    mac: "02:00:00:00:03:ab",
  });
  assert.equal(String(conflicts.ipConflict?._id), String(original._id));
  assert.equal(String(conflicts.macConflict?._id), String(original._id));

  await assert.rejects(
    Device.create({ name: "IP repetida", ipAddress: ip }),
    (error) => error.code === 11000 && error.keyPattern?.ipAddress === 1,
  );
  await assert.rejects(
    Device.create({
      name: "MAC repetida",
      ipAddress: "192.0.2.74",
      macAddress: mac,
    }),
    (error) => error.code === 11000 && error.keyPattern?.macAddress === 1,
  );

  original.isDeleted = true;
  await original.save();

  assert.deepEqual(await checkDeviceConflicts({ ip, mac }), {
    ipConflict: null,
    macConflict: null,
  });

  const replacement = await Device.create({
    name: "Equipo reemplazo",
    ipAddress: ip,
    macAddress: mac,
  });
  assert.notEqual(String(replacement._id), String(original._id));
});

test("rechaza el alta duplicada y conserva el equipo original", async () => {
  const ipAddress = "192.0.2.81";
  const macAddress = "02:00:00:00:03:AC";
  const original = await createDeviceWithDuplicateCheck({
    name: "Equipo original",
    ipAddress,
    macAddress,
  });

  await assert.rejects(
    createDeviceWithDuplicateCheck({ name: "IP repetida", ipAddress }),
    (error) =>
      error.statusCode === 409 &&
      error.code === "DUPLICATE_IP" &&
      String(error.conflicts.ipConflict?._id) === String(original._id),
  );

  await assert.rejects(
    createDeviceWithDuplicateCheck({ name: "MAC repetida", macAddress }),
    { statusCode: 409, code: "DUPLICATE_MAC", field: "mac" },
  );

  assert.equal(await Device.countDocuments({ ipAddress }), 1);
  assert.equal((await Device.findById(original._id)).name, "Equipo original");
});
