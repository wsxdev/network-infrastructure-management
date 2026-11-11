import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import { Device } from "../src/models/device.model.js";
import {
  checkDeviceDuplicates,
  createDeviceWithDuplicateCheck,
} from "../src/services/device-duplicate.service.js";
import { once } from "node:events";
import express from "express";
import { asyncHandler } from "../src/middlewares/async-handler.js";
import { errorHandler } from "../src/middlewares/error.middleware.js";
import { createDeviceDuplicateRouter } from "../src/routes/device-duplicate.routes.js";

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

  const conflicts = await checkDeviceDuplicates({
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

  assert.deepEqual(await checkDeviceDuplicates({ ip, mac }), {
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

test("devuelve la coincidencia en la consulta y HTTP 409 al guardar", async (t) => {
  const app = express();
  const allowTestRequest = (_req, _res, next) => next();

  app.use(express.json());
  app.use(
    "/api/devices",
    createDeviceDuplicateRouter({
      authenticate: allowTestRequest,
      authorizeAdmin: allowTestRequest,
    }),
  );
  app.post(
    "/api/devices",
    asyncHandler(async (req, res) => {
      const device = await createDeviceWithDuplicateCheck(req.body);
      res.status(201).json({ success: true, data: device });
    }),
  );
  app.use(errorHandler);

  const ipAddress = "192.0.2.90";
  const original = await Device.create({ name: "Equipo HTTP", ipAddress });
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, "listening");

  const url = `http://127.0.0.1:${server.address().port}/api/devices`;

  const check = await fetch(`${url}/check-duplicate?ip=${ipAddress}`);
  assert.equal(check.status, 200);
  const result = await check.json();
  assert.equal(result.data.ipConflict._id, String(original._id));

  const invalid = await fetch(`${url}/check-duplicate?ip=invalida`);
  assert.equal(invalid.status, 400);
  await invalid.json();

  t.mock.method(console, "error", () => {});
  const save = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Equipo repetido", ipAddress }),
  });
  assert.equal(save.status, 409);
  const duplicate = await save.json();
  assert.equal(duplicate.code, "DUPLICATE_IP");
  assert.equal(duplicate.field, "ip");
  assert.equal(duplicate.data.ipConflict._id, String(original._id));
});
