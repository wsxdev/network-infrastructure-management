import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { User } from './models/user.model.js';
import { Device } from './models/device.model.js';
import { DeviceType } from './models/deviceType.model.js';
import { USER_ROLES, DEVICE_TYPES, DEVICE_STATUS } from './config/constants.js';

/** Catálogo canónico de tipos de dispositivos — T-03.01.01 */
const DEVICE_TYPE_CATALOG = [
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

export async function seedDatabase() {
  await connectDatabase();

  console.log('🌱 Inicializando siembra de datos (Seed)...');

  // 0. Catálogo de tipos de dispositivos — T-03.01.01
  const typesCount = await DeviceType.countDocuments();
  if (typesCount === 0) {
    await DeviceType.insertMany(DEVICE_TYPE_CATALOG);
    console.log(`📋 ${DEVICE_TYPE_CATALOG.length} tipos de dispositivos sembrados en device_types.`);
  } else {
    console.log(`📋 Catálogo device_types ya existe (${typesCount} tipos). Omitiendo siembra.`);
  }

  // 1. Usuarios predeterminados
  const adminExists = await User.findOne({ email: 'admin@espoch.edu.ec' });
  if (!adminExists) {
    await User.create({
      name: 'Licet Ibarra (QA & DB Lead)',
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
  if (devicesCount <= 1) {
    await Device.deleteMany({});
    console.log('🌐 Sembrando inventario y topología inicial de red con campos normalizados...');

    // Nivel 1: Router de Borde / Gateway
    const router = await Device.create({
      name: 'Router Mikrotik RB4011 (Gateway)',
      ipAddress: '192.168.1.1',
      macAddress: 'CC:2D:E0:11:22:33',
      type: DEVICE_TYPES.ROUTER,
      vendor: 'MikroTik',
      model: 'RB4011iGS+5HacQ2HnD-IN',
      location: 'Laboratorio 1 - Rack A',
      notes: 'Gateway principal de salida a internet y enrutamiento perimetral',
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
      vendor: 'Cisco Systems',
      model: 'Catalyst 2960-X 24TS-L',
      location: 'Laboratorio 1 - Rack A',
      notes: 'Switch de conmutación troncal para los laboratorios',
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
      vendor: 'TP-Link',
      model: 'TL-SG1024D',
      location: 'Laboratorio 1 - Rack B',
      notes: 'Switch no administrable de distribución a terminales',
      parentId: switchCore._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 4
    });

    // Servidores (conectados al Core)
    await Device.create({
      name: 'Servidor Debian 12 (NOC & Base de Datos)',
      ipAddress: '192.168.1.10',
      macAddress: '52:54:00:AA:BB:01',
      type: DEVICE_TYPES.SERVER,
      vendor: 'Dell Technologies',
      model: 'PowerEdge R640',
      location: 'Laboratorio 1 - Rack A',
      notes: 'Host central del sistema de monitoreo de red y MongoDB Atlas Sync',
      parentId: switchCore._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 1
    });

    await Device.create({
      name: 'Servidor DNS & DHCP Local',
      ipAddress: '192.168.1.11',
      macAddress: '52:54:00:AA:BB:02',
      type: DEVICE_TYPES.SERVER,
      vendor: 'HP Enterprise',
      model: 'ProLiant DL360 Gen10',
      location: 'Laboratorio 1 - Rack A',
      notes: 'Resolución de nombres y concesión dinámica de direcciones LAN',
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
      vendor: 'Cisco Systems',
      model: 'Aironet 2802I',
      location: 'Laboratorio 1 - Techo Central',
      notes: 'Punto de acceso para conexiones inalámbricas estudiantiles',
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
      vendor: 'HP',
      model: 'EliteDesk 800 G5',
      location: 'Laboratorio 1 - Módulo Docente',
      notes: 'Equipo principal para el catedrático',
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
      vendor: 'Lenovo',
      model: 'ThinkCentre M720s',
      location: 'Laboratorio 1 - Mesa 1 Puesto A',
      notes: 'Puesto de estudiante para prácticas de redes',
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
      vendor: 'Lenovo',
      model: 'ThinkCentre M720s',
      location: 'Laboratorio 1 - Mesa 1 Puesto B',
      notes: 'Puesto de estudiante para prácticas de redes',
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
      vendor: 'HP',
      model: 'LaserJet Pro M404dw',
      location: 'Laboratorio 1 - Rack A',
      notes: 'Impresora compartida del laboratorio',
      parentId: switchAccess._id,
      status: DEVICE_STATUS.UP,
      isManaged: true,
      responseTimeMs: 12
    });

    console.log('✅ 10 Dispositivos de topología del laboratorio creados con todos los campos normalizados.');
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
