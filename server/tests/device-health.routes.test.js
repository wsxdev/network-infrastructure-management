import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Check } from "../src/models/check.model.js";
import { createDeviceHealthRouter } from "../src/routes/device-health.routes.js";

test("consulta y pagina solo el historial del equipo solicitado", async (t) => {
  const databaseName = `rf0305_history_${randomUUID().replaceAll("-", "")}`;

  await mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: databaseName,
    serverSelectionTimeoutMS: 4000,
  });

  t.after(async () => {
    try {
      if (mongoose.connection.name === databaseName) {
        await mongoose.connection.dropDatabase();
      }
    } finally {
      await mongoose.disconnect();
    }
  });

  const deviceId = new mongoose.Types.ObjectId();
  const otherId = new mongoose.Types.ObjectId();
  const newer = new Date();
  const older = new Date(newer.getTime() - 60000);
  const sample = { deviceId, ipAddress: "192.0.2.10", probeType: "icmp" };

  await Check.insertMany([
    { ...sample, status: "up", isSuccess: true, createdAt: older },
    {
      ...sample,
      status: "down",
      isSuccess: false,
      errorMessage: "timeout",
      createdAt: newer,
    },
    {
      ...sample,
      deviceId: otherId,
      status: "up",
      isSuccess: true,
      createdAt: newer,
    },
  ]);

  const app = express();
  app.use(
    "/api/devices",
    createDeviceHealthRouter({
      authenticate(req, res, next) {
        if (req.get("Authorization") === "Bearer rf0305-test") return next();
        return res.sendStatus(401);
      },
      idParamSchema: z.object({ id: z.string().regex(/^[0-9a-f]{24}$/i) }),
      getDeviceById: async (id) =>
        id === String(deviceId) ? { _id: deviceId } : null,
    }),
  );

  const server = app.listen(0, "127.0.0.1");
  t.after(
    () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );
  await once(server, "listening");

  const url = `http://127.0.0.1:${server.address().port}/api/devices/${deviceId}/health-checks`;
  const headers = { Authorization: "Bearer rf0305-test" };

  const denied = await fetch(url);
  assert.equal(denied.status, 401);

  const response = await fetch(`${url}?limit=1`, { headers });
  assert.equal(response.status, 200);
  const first = await response.json();
  assert.deepEqual(first.pagination, { total: 2, page: 1, limit: 1 });
  assert.equal(first.data.length, 1);
  assert.equal(first.data[0].deviceId, String(deviceId));
  assert.equal(first.data[0].errorMessage, "timeout");

  const secondResponse = await fetch(`${url}?limit=1&page=2`, { headers });
  assert.equal(secondResponse.status, 200);
  const second = await secondResponse.json();
  assert.equal(second.data.length, 1);
  assert.equal(second.data[0].deviceId, String(deviceId));
  assert.equal(second.data[0].createdAt, older.toISOString());
});
