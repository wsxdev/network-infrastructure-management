import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonitoringFilter,
  canReceiveAlerts,
  normalizeIpAddress,
  resolveMonitoringProfile
} from '../src/domain/monitoring.js';
import { buildDevicePayload } from '../src/services/device.service.js';

test('RF-03.08: switch no administrable sin IP no es monitorizable', () => {
  assert.deepEqual(
    resolveMonitoringProfile({ type: 'switch_unmanaged', ipAddress: null }),
    {
      isMonitorable: false,
      monitoringCapability: 'none',
      status: 'unmonitored'
    }
  );
});

test('RF-03.08: switch no administrable con IP sigue sin monitoreo directo', () => {
  const profile = resolveMonitoringProfile({
    type: 'switch_unmanaged',
    ipAddress: '192.168.50.40'
  });

  assert.equal(profile.isMonitorable, false);
  assert.equal(profile.monitoringCapability, 'none');
  assert.equal(profile.status, 'unmonitored');
});

test('RF-03.08: cualquier equipo sin IP queda sin monitoreo directo', () => {
  for (const type of ['router', 'switch', 'server', 'workstation', 'ap']) {
    const profile = resolveMonitoringProfile({ type, ipAddress: null });
    assert.equal(profile.isMonitorable, false, `${type} sin IP no debe monitorearse`);
    assert.equal(profile.status, 'unmonitored');
  }
});

test('Switch administrable con IP usa ICMP + SNMP', () => {
  const profile = resolveMonitoringProfile({
    type: 'switch',
    ipAddress: '192.168.50.2'
  });

  assert.equal(profile.isMonitorable, true);
  assert.equal(profile.monitoringCapability, 'icmp_snmp');
});

test('Servidor con IP usa solo ICMP', () => {
  const profile = resolveMonitoringProfile({
    type: 'server',
    ipAddress: '192.168.50.10'
  });

  assert.equal(profile.isMonitorable, true);
  assert.equal(profile.monitoringCapability, 'icmp_only');
});

test('normalizeIpAddress convierte cadenas vacías en null', () => {
  assert.equal(normalizeIpAddress('   '), null);
  assert.equal(normalizeIpAddress(''), null);
  assert.equal(normalizeIpAddress(null), null);
  assert.equal(normalizeIpAddress(' 192.168.50.1 '), '192.168.50.1');
});

test('El filtro de sondeo excluye equipos sin monitoreo directo', () => {
  assert.deepEqual(buildMonitoringFilter(), {
    isMonitorable: true,
    ipAddress: { $ne: null }
  });
});

test('canReceiveAlerts bloquea equipos no monitorizables o sin IP', () => {
  assert.equal(
    canReceiveAlerts({ isMonitorable: false, ipAddress: '192.168.50.40' }),
    false
  );
  assert.equal(canReceiveAlerts({ isMonitorable: true, ipAddress: null }), false);
  assert.equal(
    canReceiveAlerts({ isMonitorable: true, ipAddress: '192.168.50.10' }),
    true
  );
});

test('buildDevicePayload guarda el switch no administrable con IP null', () => {
  const payload = buildDevicePayload({
    name: 'Switch laboratorio',
    type: 'switch_unmanaged',
    ipAddress: ''
  });

  assert.equal(payload.ipAddress, null);
  assert.equal(payload.isMonitorable, false);
  assert.equal(payload.monitoringCapability, 'none');
  assert.equal(payload.status, 'unmonitored');
});

test('buildDevicePayload deja pendiente un equipo monitorizable', () => {
  const payload = buildDevicePayload({
    name: 'Servidor NOC',
    type: 'server',
    ipAddress: '192.168.50.10'
  });

  assert.equal(payload.isMonitorable, true);
  assert.equal(payload.monitoringCapability, 'icmp_only');
  assert.equal(payload.status, 'pending');
});
