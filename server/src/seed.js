import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { User } from './models/user.model.js';
import { Device } from './models/device.model.js';
import { USER_ROLES, DEVICE_TYPES, DEVICE_STATUS } from './config/constants.js';

export async function seedDatabase() {
  await connectDatabase();

  console.log('🌱 Inicializando siembra de datos (Seed)...');

  // 1. Usuarios predeterminados
  const adminExists = await User.findOne({ email: 'admin@espoch.edu.ec' });
  if (!adminExists) {
    await User.create({
      name: 'William Chisag (Tech Lead)',
      email: 'admin@espoch.edu.ec',
      password: 'AdminPassword123!',
      role: USER_ROLES.ADMINISTRATOR,
      isActive: true
    });
    console.log('👤 Usuario Administrador creado: admin@espoch.edu.ec / AdminPassword123!');
  }

  const operatorExists = await User.findOne({ email: 'operador@espoch.edu.ec' });
  if (!operatorExists) {
    await User.create({
      name: 'Operador NOC ESPOCH',
      email: 'operador@espoch.edu.ec',
      password: 'OperadorPassword123!',
      role: USER_ROLES.OPERATOR,
      isActive: true
    });
    console.log('👤 Usuario Operador creado: operador@espoch.edu.ec / OperadorPassword123!');
  }

  // 2. Inventario y Topología del Laboratorio de Telecomunicaciones
  const devicesCount = await Device.countDocuments();
  if (devicesCount === 0) {
    console.log('🌐 Sembrando inventario y topología inicial de red...');

    // Nivel 1: Router de Borde / Gateway
    const router = await Device.create({
      name: 'Router Mikrotik RB4011 (Gateway)',
      ipAddress: '192.168.1.1',
      macAddress: 'CC:2D:E0:11:22:33',
      type: DEVICE_TYPES.ROUTER,
      location: 'Rack Principal - Laboratorio Telecomunicaciones',
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 2
    });

    // Nivel 2: Switch Core de Distribución (hijo del Router)
    const switchCore = await Device.create({
      name: 'Switch Core Cisco Catalyst 2960',
      ipAddress: '192.168.1.2',
      macAddress: '00:1E:13:44:55:66',
      type: DEVICE_TYPES.SWITCH,
      location: 'Rack Principal - Laboratorio Telecomunicaciones',
      parentId: router._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 3
    });

    // Nivel 3: Switch de Acceso (hijo del Switch Core)
    const switchAccess = await Device.create({
      name: 'Switch Acceso TP-Link SG1024',
      ipAddress: '192.168.1.3',
      macAddress: '98:48:27:77:88:99',
      type: DEVICE_TYPES.SWITCH,
      location: 'Rack Secundario - Mesas de Laboratorio',
      parentId: switchCore._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 4
    });

    // Servidores (conectados al Core)
    const debianServer = await Device.create({
      name: 'Servidor Debian 12 (NOC & Base de Datos)',
      ipAddress: '192.168.1.10',
      macAddress: '52:54:00:AA:BB:01',
      type: DEVICE_TYPES.SERVER,
      location: 'Rack Principal - Servidor FIE',
      parentId: switchCore._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 1
    });

    const dnsServer = await Device.create({
      name: 'Servidor DNS & DHCP Local',
      ipAddress: '192.168.1.11',
      macAddress: '52:54:00:AA:BB:02',
      type: DEVICE_TYPES.SERVER,
      location: 'Rack Principal - Servidor FIE',
      parentId: switchCore._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 2
    });

    // Puntos de acceso y terminales (conectados al switch de acceso)
    await Device.create({
      name: 'AP Cisco Aironet 2800 (WiFi Lab)',
      ipAddress: '192.168.1.20',
      macAddress: '70:6D:15:CC:DD:01',
      type: DEVICE_TYPES.ACCESS_POINT,
      location: 'Techo Central Laboratorio',
      parentId: switchAccess._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 6
    });

    await Device.create({
      name: 'PC Docente - Estación Maestro',
      ipAddress: '192.168.1.100',
      macAddress: '00:25:90:EE:FF:01',
      type: DEVICE_TYPES.WORKSTATION,
      location: 'Módulo Central Docente',
      parentId: switchAccess._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 5
    });

    await Device.create({
      name: 'PC Alumno 01 - FIE Lab',
      ipAddress: '192.168.1.101',
      macAddress: '00:25:90:EE:FF:02',
      type: DEVICE_TYPES.WORKSTATION,
      location: 'Mesa 1 - Puesto A',
      parentId: switchAccess._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 8
    });

    await Device.create({
      name: 'PC Alumno 02 - FIE Lab',
      ipAddress: '192.168.1.102',
      macAddress: '00:25:90:EE:FF:03',
      type: DEVICE_TYPES.WORKSTATION,
      location: 'Mesa 1 - Puesto B',
      parentId: switchAccess._id,
      status: DEVICE_STATUS.PENDING,
      isManaged: true,
      responseTimeMs: null
    });

    await Device.create({
      name: 'Impresora de Red HP LaserJet',
      ipAddress: '192.168.1.150',
      macAddress: '18:60:24:99:AA:BB',
      type: DEVICE_TYPES.OTHER,
      location: 'Rincón de Impresión Docente',
      parentId: switchAccess._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 12
    });

    console.log('✅ 10 Dispositivos de topología del laboratorio creados exitosamente.');
  }

  console.log('🎉 Sembrado completado.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  }).catch(err => {
    console.error('❌ Error ejecutando seed:', err);
    process.exit(1);
  });
}
