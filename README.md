# Sistema de Monitoreo de Infraestructura de Red (NOC ESPOCH)

Plataforma de alta disponibilidad para la supervisión continua, detección de incidentes y visualización topológica de la infraestructura de red del laboratorio de telecomunicaciones.

Desarrollado en el marco del **Proyecto Integrador de Saberes (PAO 5)** de la **Escuela Superior Politécnica de Chimborazo (ESPOCH)** - Facultad de Informática y Electrónica.

---

## Metáforas del Sistema y Arquitectura

1. **Torre de Control (Frontend React):** Interfaz centralizada del operador NOC que ofrece visualización en tiempo real mediante *React Flow*, métricas clave y centro de alarmas con accesibilidad WCAG 2.1 AA.
2. **Escuadrón Centinela (Daemon de Monitoreo):** Proceso autónomo en segundo plano que ejecuta comprobaciones ICMP concurrentes (`p-limit` a 15 hilos), escaneo nativo ARP y evaluación de quórum (Regla 8.1).
3. **Fábrica de Precisión (Estándar de Código):** Arquitectura desacoplada (`server/` y `client/`), ejecución asíncrona exclusiva con `async/await`, prevención estricta de inyección de comandos mediante `child_process.spawn` y validación defensiva con *Zod*.
4. **Patio Ferroviario (Flujo Git):** Estrategia GitFlow estricta (`main`, `develop`, `feature/*`), con control de calidad y revisiones cruzadas.

---

## Equipo de Desarrollo y Code Ownership

| Integrante | Rol en el Proyecto | Responsabilidad Técnica Principal |
| :--- | :--- | :--- |
| **William Chisag** | Tech Lead & Backend Specialist | Arquitectura de API REST, Daemon Centinela, Seguridad JWT y Quórum |
| **Karen Maje** | Frontend & UI/UX Lead | Torre de Control React, Topología con React Flow, Tailwind y Accesibilidad |
| **Licet Ibarra** | Big Data, Base de Datos & QA Lead | Esquemas Mongoose, Índices TTL (30d/90d), Agregaciones y Planes de Prueba |
| **Alejandro Rodríguez** | DevOps, Redes & Infraestructura Lead | Despliegue Debian 12, Escaneo nativo ARP, Systemd y Nginx |

---

## Stack Tecnológico

- **Frontend:** React 18, Vite 5, Tailwind CSS v3.4, React Flow (`@xyflow/react`), Lucide React, Axios, TanStack Query.
- **Backend:** Node.js 20 LTS (ES Modules), Express 4, Socket.io, Zod, p-limit, bcrypt, JSON Web Token (Access + Refresh tokens).
- **Base de Datos:** MongoDB 7.0 con Mongoose 8 (Colecciones polimórficas con TTL automático: 30 días para checks, 90 días para eventos).
- **Herramientas del Sistema Operativo:** Linux `ping` (ICMP seguro vía `spawn`), `arp-scan` nativo.

---

## Identidad Visual y Paleta de Colores

- **Color Primario Institucional:** Mineral Green 700 (`#395649`)
- **Hover Primario:** Mineral Green 600 (`#3f6252`)
- **Active Primario:** Mineral Green 800 (`#2d4239`)
- **Estados de Red (Triple Codificación: Color + Ícono + Texto):**
  - **Disponible (Up):** Verde Esmeralda (`#10B981`) - Check
  - **No Disponible (Down):** Rojo Carmesí (`#EF4444`) - Cruz / Warning
  - **Inaccesible (Unreachable):** Ámbar Dorado (`#F59E0B`) - Enlace roto (Quórum / Router padre)
  - **Pendiente (Pending):** Gris Neutro (`#6B7280`) - Reloj de arena
- **Tipografía Oficial:** Inter (`font-family: 'Inter', sans-serif;`)

---

## Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js >= 20.x LTS
- npm >= 9.x
- MongoDB Server 7.x en ejecución (`mongodb://localhost:27017`)
- Utilidades de red en Linux (`iputils-ping`, opcional `arp-scan`)

### 1. Clonar el repositorio
```bash
git clone git@github.com:wsxdev/network-infrastructure-management.git
cd network-infrastructure-management
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno
Copie los ejemplos de variables de entorno en el servidor:
```bash
cp server/.env.example server/.env
```

### 4. Sembrar datos iniciales (Seed)
Inicializa usuarios por defecto (`admin@espoch.edu.ec`, `operador@espoch.edu.ec`) y topología de red de ejemplo (Router central, switches y estaciones de trabajo):
```bash
npm run seed
```

### 5. Iniciar en modo desarrollo
Inicia simultáneamente el servidor backend (puerto 5000) y el cliente Vite (puerto 5173):
```bash
npm run dev
```

Abra el navegador en `http://localhost:5173`.

---

## Credenciales Predeterminadas (Entorno de Desarrollo)

- **Administrador:**
  - Correo: `admin@espoch.edu.ec`
  - Contraseña: `AdminPassword123!`
  - Rol: `administrador` (Acceso total, configuración de guardrails, auditoría, altas y bajas)

- **Operador:**
  - Correo: `operador@espoch.edu.ec`
  - Contraseña: `OperadorPassword123!`
  - Rol: `operador` (Visualización del panel, topología, reconocimiento de alertas)
