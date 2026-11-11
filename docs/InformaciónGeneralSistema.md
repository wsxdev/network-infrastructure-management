# Sistema web de monitoreo y administración de una red de computadoras

**Proyecto integrador universitario**

**Área de aplicación:** Laboratorio de cómputo de la universidad.

**Asignaturas involucradas:**

- Infraestructura TI.
- Tecnología Web.
- Conmutación y Enrutamiento.
- Big Data.

**Estado del proyecto:** Planificación inicial.

---

## 1. Descripción general del proyecto

El proyecto consiste en desarrollar un sistema web para el monitoreo y la administración centralizada de los dispositivos conectados a una red de computadoras del laboratorio de la universidad.

La aplicación tomará como referencia herramientas como Fing, que permiten descubrir dispositivos conectados a una red y consultar información como direcciones IP, direcciones MAC, nombres de dispositivos y fabricantes cuando estos datos estén disponibles.

A diferencia de una aplicación móvil, el proyecto se desarrollará como una aplicación web, accesible desde un navegador.

El sistema contará con un servidor local encargado de realizar el descubrimiento de dispositivos, comprobar su disponibilidad, almacenar la información y generar eventos relacionados con los cambios de estado de la red.

La interfaz web permitirá a los usuarios autorizados visualizar los dispositivos detectados, consultar sus características disponibles, revisar su estado y recibir notificaciones cuando se produzcan eventos relevantes.

### 1.1. Objetivo general

Desarrollar un sistema web de monitoreo y administración centralizada que permita descubrir, visualizar y supervisar en tiempo real los dispositivos conectados a la red del laboratorio de cómputo, facilitando la identificación de cambios de disponibilidad y la gestión de la información de la red.

### 1.2. Alcance inicial

Para mantener el proyecto viable durante el semestre, se establecen los siguientes límites:

- Monitorear una sola red LAN.
- Trabajar inicialmente con aproximadamente 30 dispositivos.
- Utilizar una computadora con Debian como servidor local.
- Desarrollar el backend y la interfaz web.
- Utilizar MongoDB para almacenar la información.
- Implementar descubrimiento periódico y comprobaciones de disponibilidad.
- Mostrar información de los dispositivos en un panel web.
- Registrar eventos como la aparición o posible desconexión de dispositivos.
- Dejar el acceso remoto seguro como una fase posterior, después de validar el funcionamiento local.

La administración de varias redes independientes no formará parte de la primera versión.

---

## 2. Infraestructura física prevista

La solución utilizará equipos disponibles en el laboratorio y algunos componentes que deberán conseguirse o confirmarse.

### 2.1. Servidor

Se utilizará una computadora destinada a ejecutar los servicios del sistema.

Características conocidas:

- Sistema operativo: Debian Linux.
- Procesador: Intel Core i5 vPro, modelo exacto pendiente de confirmar.
- Memoria RAM: 8 GB.
- Almacenamiento: unidad SSD.
- Conexión: Ethernet al router de la red de pruebas.

Este equipo funcionará como el centro del sistema. Se encargará del descubrimiento de dispositivos, las comprobaciones periódicas, el almacenamiento de datos y la comunicación con la aplicación web.

La intención es que el servidor permanezca encendido y ejecutando los servicios de monitoreo de forma continua cuando el sistema esté desplegado.

Para la exposición universitaria, se encenderá el servidor y se demostrará su funcionamiento con los dispositivos disponibles.

### 2.2. Router

Se utilizará un router para crear y administrar la LAN de pruebas.

Idealmente, será un router Wi-Fi que permita realizar simultáneamente las siguientes funciones:

- Enrutar el tráfico entre la LAN y la red externa.
- Asignar direcciones IP a los dispositivos mediante DHCP.
- Proporcionar conectividad inalámbrica.
- Permitir la conexión de un switch mediante sus puertos LAN.

La conexión con la infraestructura universitaria dependerá de la autorización y de las condiciones establecidas por el responsable de la red.

### 2.3. Switch

El switch permitirá conectar varios dispositivos mediante cables Ethernet.

Se utilizará para conectar computadoras y otros equipos que formen parte de la red de pruebas.

Para el alcance inicial, un switch no administrable puede ser suficiente, siempre que solo se necesite ampliar la conectividad de la LAN.

Si se dispone de un switch administrable, posteriormente se podrían evaluar funcionalidades adicionales mediante SNMP, VLAN u otros mecanismos compatibles.

### 2.4. Punto de acceso inalámbrico (AP)

Un AP independiente será opcional.

Si el router seleccionado ya dispone de Wi-Fi, no será indispensable conseguir otro dispositivo.

Si se utiliza un AP separado, se configurará normalmente en modo punto de acceso, evitando que funcione como un segundo servidor DHCP cuando no sea necesario.

De esta manera, los dispositivos conectados por cable y por Wi-Fi podrán pertenecer a la misma LAN de pruebas.

### 2.5. Dispositivos cliente

Se utilizarán los equipos disponibles en el laboratorio, por ejemplo:

- Computadoras de escritorio.
- Laptops.
- Celulares.
- Otros dispositivos compatibles que estén autorizados para las pruebas.

La cantidad inicial prevista es de aproximadamente 30 dispositivos, aunque se comenzará con un número menor para validar el sistema.

---

## 3. Topología de red propuesta

La red se diseñará para que el servidor de monitoreo y los dispositivos de prueba pertenezcan a la misma LAN.

La topología lógica inicial será la siguiente:

```text
           Red de la universidad
                    |
             Toma Ethernet
               de la pared
                    |
                  WAN
              +-----------+
              |  Router   |
              | del       |
              | proyecto  |
              +-----------+
                |       |
              LAN       Wi-Fi
                |         |
          +-----------+   +----------------+
          |  Switch   |   | Laptops,       |
          +-----------+   | celulares y    |
            |       |     | otros equipos  |
            |       |     +----------------+
            |       |
       +---------+  +----------------+
       | Servidor|  | Computadoras   |
       | Debian  |  | de prueba      |
       +---------+  +----------------+
```

El esquema representa la idea general. La conexión física definitiva dependerá de los puertos disponibles en el router y del equipo de conmutación utilizado.

### 3.1. Conexiones principales

1. Si la universidad lo autoriza, la toma Ethernet de la pared se conectará al puerto WAN del router del proyecto.
2. El servidor Debian se conectará por Ethernet a un puerto LAN del router o a un puerto del switch que pertenezca a la misma LAN.
3. El switch se conectará a un puerto LAN del router.
4. Las computadoras cableadas se conectarán al switch.
5. Las laptops y los celulares se conectarán al Wi-Fi del router o a un AP configurado correctamente.

### 3.2. Consideraciones importantes

El puerto WAN se utiliza para conectar el router con la red externa. Los dispositivos que se desean monitorear se conectan a la LAN del router.

El uso de un router propio no garantiza por sí solo que la red quede aislada de todas las formas posibles. El aislamiento efectivo depende de la configuración del router, las rutas, el firewall y las características de la red universitaria.

Antes de conectar el router a la infraestructura institucional, se deberá confirmar que está permitido y que la configuración propuesta no genera conflictos ni afecta a otros usuarios.

---

## 4. Direccionamiento IP

Se propone utilizar una subred privada propia para la LAN de pruebas.

Como ejemplo, se puede considerar la siguiente configuración:

| Elemento | Dirección IP de ejemplo |
|---|---|
| Red del laboratorio | `192.168.50.0/24` |
| Router, interfaz LAN | `192.168.50.1` |
| Servidor Debian | `192.168.50.10` |
| Rango DHCP para clientes | `192.168.50.100` - `192.168.50.200` |

Estos valores son ilustrativos y todavía no están configurados.

### 4.1. Configuración del router

El router tendrá una dirección IP para su interfaz LAN y podrá asignar direcciones automáticamente mediante DHCP.

Los dispositivos que se conecten recibirán una dirección IP dentro del rango configurado.

La dirección IP del servidor deberá mantenerse estable. Esto puede conseguirse mediante una configuración estática adecuada o una reserva DHCP.

### 4.2. Prevención de conflictos

Antes de elegir la subred definitiva, se deberá comprobar que no se superpone con la red de entrada ni con otras redes necesarias para el funcionamiento del sistema.

También será necesario evitar que dos dispositivos reciban la misma dirección IP.

La configuración de la interfaz WAN dependerá de cómo la universidad proporcione conectividad: DHCP, IP estática, VLAN, autenticación u otro mecanismo.

No se asumirá ninguna de estas posibilidades hasta obtener información del responsable de la red.

---

## 5. Arquitectura lógica del sistema

Se propone separar la interfaz web, la lógica de negocio, el servicio de monitoreo y el almacenamiento.

En la primera versión, estos componentes se ejecutarán en la computadora Debian del laboratorio.

```text
+-------------------------------------+
|          Administrador              |
|          Navegador web              |
+------------------+------------------+
                   |
                   | HTTP/HTTPS
                   v
+-------------------------------------+
|           Servidor Debian           |
|                                     |
|  +-------------------------------+  |
|  |       Frontend React           |  |
|  +-------------------------------+  |
|                  |                  |
|  +-------------------------------+  |
|  |        Backend Node.js         |  |
|  |          API REST              |  |
|  +-------------------------------+  |
|                  |                  |
|  +-------------------------------+  |
|  | Servicio de monitoreo           |  |
|  | - arp-scan                      |  |
|  | - Nmap                          |  |
|  | - Comprobación de disponibilidad| |
|  +-------------------------------+  |
|                  |                  |
|  +-------------------------------+  |
|  |           MongoDB              |  |
|  +-------------------------------+  |
|                                     |
|  +-------------------------------+  |
|  | WebSocket para actualizaciones |  |
|  +-------------------------------+  |
+------------------+------------------+
                   |
                   v
+-------------------------------------+
|           Red del laboratorio       |
|                                     |
|  Router / Switch / AP               |
|  Computadoras / Laptops / Celulares |
+-------------------------------------+
```

### 5.1. Frontend

El frontend será desarrollado con React.

Se encargará de presentar la información obtenida por el backend y ofrecer una interfaz para consultar el estado de la red.

### 5.2. Backend

El backend será desarrollado con Node.js.

Se encargará de:

- Exponer la API que utilizará el frontend.
- Coordinar los procesos de descubrimiento y monitoreo.
- Consultar y actualizar la información almacenada.
- Registrar eventos.
- Aplicar las reglas de negocio y controles de acceso.
- Enviar actualizaciones al panel web.

El backend no dependerá de que el administrador mantenga abierto el navegador para que continúe el monitoreo.

### 5.3. Servicio de monitoreo

Será el componente encargado de descubrir dispositivos y comprobar su disponibilidad.

Utilizará herramientas del sistema operativo y mecanismos de red para obtener información sobre los equipos conectados.

Se ejecutará en Debian, dentro de la LAN que se desea monitorear.

### 5.4. Base de datos

MongoDB almacenará los dispositivos conocidos, sus datos observados, los eventos y el historial de disponibilidad.

La estructura definitiva de los documentos se definirá durante la etapa de diseño del backend.

### 5.5. Comunicación en tiempo real

Se propone utilizar WebSocket para enviar actualizaciones al frontend cuando cambien los datos relevantes.

Por ejemplo, cuando el servidor detecte que un equipo ha aparecido o que posiblemente se ha desconectado, podrá registrar el evento y comunicarlo al panel web.

---

## 6. Tecnologías propuestas

| Tecnología | Área | Uso previsto |
|---|---|---|
| Debian Linux | Infraestructura TI | Sistema operativo del servidor |
| Node.js | Backend | Lógica del sistema y API |
| React | Tecnología Web | Interfaz de usuario |
| MongoDB | Base de datos | Almacenamiento de dispositivos y eventos |
| ARP-scan | Redes | Descubrimiento de equipos en la LAN local |
| Nmap | Redes | Descubrimiento complementario y comprobaciones autorizadas |
| WebSocket | Comunicación web | Actualizaciones en tiempo real |
| SSH | Administración | Acceso administrativo al servidor |
| VPN | Acceso remoto | Conexión segura desde otras redes, como mejora posterior |

La selección es preliminar y podrá ajustarse durante las pruebas.

---

## 7. Descubrimiento de dispositivos

Una de las funciones centrales será identificar qué dispositivos están conectados a la LAN.

Para ello, se evaluarán principalmente ARP-scan y Nmap.

### 7.1. ARP-scan

ARP-scan permite descubrir dispositivos IPv4 en el segmento de red local mediante solicitudes ARP.

Puede ayudar a obtener:

- Dirección IP.
- Dirección MAC.
- Fabricante estimado, cuando se dispone de una correspondencia válida entre el prefijo de la MAC y el fabricante.

Es una herramienta apropiada para explorar la LAN de pruebas, aunque sus resultados dependen de las condiciones de la red y de los dispositivos.

ARP no atraviesa routers para descubrir directamente las direcciones MAC de dispositivos que se encuentran en otras subredes.

### 7.2. Nmap

Nmap es una herramienta de descubrimiento y exploración de redes.

Puede utilizarse para:

- Detectar hosts que responden a las comprobaciones seleccionadas.
- Realizar comprobaciones de disponibilidad.
- Identificar determinados servicios y puertos cuando sea necesario.
- Obtener información complementaria de los dispositivos, según los permisos y métodos empleados.

No será necesario ejecutar todos los tipos de escaneo en cada ciclo de monitoreo.

### 7.3. ¿Por qué no escanear toda la red constantemente?

Ejecutar escaneos completos con mucha frecuencia puede generar tráfico innecesario y aumentar los tiempos de respuesta.

Para mejorar la eficiencia, el sistema separará el descubrimiento de dispositivos nuevos de la comprobación de los dispositivos conocidos.

La estrategia será:

1. Realizar un descubrimiento inicial.
2. Guardar los dispositivos detectados.
3. Realizar descubrimientos generales a intervalos moderados.
4. Comprobar con mayor frecuencia la disponibilidad de los dispositivos conocidos.
5. Registrar los cambios de estado.
6. Actualizar el panel web.

### 7.4. Intervalos iniciales de prueba

Se proponen los siguientes valores para comenzar las pruebas:

| Proceso | Intervalo inicial propuesto |
|---|---|
| Descubrimiento general | Cada 2 a 5 minutos |
| Comprobaciones ligeras de dispositivos conocidos | Cada 10 a 15 segundos |
| Escaneos de puertos y servicios | Solo cuando sean necesarios y estén autorizados |

Los intervalos no son definitivos. Se ajustarán según los resultados de las pruebas, la capacidad del servidor y el tiempo de detección requerido.

### 7.5. Limitaciones del descubrimiento

No todos los dispositivos proporcionan la misma información.

El sistema deberá considerar que:

- El nombre del dispositivo puede no estar disponible.
- El fabricante inferido por la dirección MAC puede ser desconocido o incorrecto.
- La dirección MAC puede cambiar o estar aleatorizada, especialmente en dispositivos móviles.
- Algunos dispositivos bloquean ping o ICMP aunque continúen conectados.
- Una sola comprobación fallida no demuestra necesariamente que un equipo se haya desconectado.
- El modelo exacto puede requerir mecanismos adicionales, como SNMP, APIs específicas o agentes instalados.

Por ello, la interfaz distinguirá entre información detectada, información estimada e información desconocida.

---

## 8. Monitoreo continuo y notificaciones

El sistema deberá continuar monitoreando aunque el administrador cierre la página web.

Para conseguirlo, el proceso de monitoreo se ejecutará en el servidor Debian como un servicio independiente del navegador.

### 8.1. Funcionamiento previsto

1. El servidor descubre los dispositivos de la LAN.
2. Guarda o actualiza su información en MongoDB.
3. Comprueba periódicamente su disponibilidad.
4. Detecta cambios relevantes.
5. Registra los eventos.
6. Envía actualizaciones al frontend cuando haya usuarios conectados.

### 8.2. Eventos que se podrían registrar

- Dispositivo detectado por primera vez.
- Dispositivo que vuelve a aparecer.
- Posible desconexión.
- Cambio de dirección IP.
- Cambio de información observada.
- Error durante un ciclo de monitoreo.

### 8.3. Prevención de falsas alarmas

Una comprobación fallida puede deberse a pérdida de paquetes, bloqueo de ICMP o problemas temporales.

Por eso, el sistema no debería marcar un dispositivo como desconectado tras un único fallo.

Se establecerá una política de comprobaciones consecutivas y tiempos de espera para reducir falsas alarmas.

El tiempo final para declarar una desconexión se definirá durante las pruebas.

---

## 9. Información de los dispositivos

El panel web mostrará los datos que el servidor pueda obtener de forma fiable.

La información prevista incluye:

| Campo | Descripción |
|---|---|
| Dirección IP | Dirección IPv4 observada |
| Dirección MAC | Dirección MAC detectada, cuando esté disponible |
| Nombre | Nombre del host, si se puede obtener |
| Fabricante | Fabricante estimado a partir de la MAC u otra fuente |
| Estado | Disponible, posible desconexión o desconocido |
| Primera observación | Fecha y hora en que se detectó por primera vez |
| Última observación | Fecha y hora de la última detección |
| Método de detección | Herramienta o mecanismo que obtuvo la información |
| Historial | Eventos relevantes registrados por el sistema |

El modelo exacto del dispositivo no se garantizará para todos los equipos. Se incorporará únicamente cuando exista una fuente fiable que permita obtenerlo.

---

## 10. Base de datos MongoDB

MongoDB se utilizará para persistir la información del sistema.

Como diseño preliminar, se consideran las siguientes entidades o colecciones:

### 10.1. Dispositivos

Almacenará los datos de los dispositivos conocidos, como:

- Identificador interno.
- Dirección IP observada.
- Dirección MAC, cuando esté disponible.
- Nombre del host.
- Fabricante estimado.
- Estado actual.
- Fecha de primera observación.
- Fecha de última observación.

### 10.2. Eventos

Registrará los cambios relevantes, como:

- Aparición de un dispositivo.
- Posible desconexión.
- Reaparición.
- Cambio de IP.
- Errores de monitoreo.

Cada evento incluirá una marca de tiempo y una referencia al dispositivo correspondiente, cuando sea posible.

### 10.3. Historial de disponibilidad

Almacenará los resultados de las comprobaciones realizadas a lo largo del tiempo.

Se establecerá una política de retención para evitar el crecimiento indefinido de la base de datos.

### 10.4. Usuarios

Si el sistema requiere autenticación, esta colección almacenará los datos mínimos necesarios para administrar cuentas, roles y permisos.

Las contraseñas se almacenarán utilizando mecanismos seguros de hash, nunca en texto plano.

### 10.5. Configuración

Podrá almacenar parámetros como los intervalos de monitoreo y otras opciones administrables.

El esquema definitivo se establecerá cuando se definan los requisitos funcionales y no funcionales.

---

## 11. Capacidad del servidor

La computadora disponible cuenta con:

- Intel Core i5 vPro, modelo pendiente de confirmar.
- 8 GB de RAM.
- SSD.
- Debian Linux.

En principio, parece una base razonable para un prototipo que monitoree aproximadamente 30 dispositivos, siempre que la configuración y el estado del equipo sean adecuados.

Para mantener un funcionamiento estable, se recomienda:

- Conectar el servidor por Ethernet.
- Evitar escaneos completos excesivamente frecuentes.
- Configurar el arranque automático de los servicios.
- Supervisar el uso de CPU, RAM y almacenamiento.
- Implementar copias de seguridad de MongoDB.
- Establecer límites de retención del historial.
- Registrar errores para facilitar el diagnóstico.

El modelo exacto del procesador se podrá consultar en Debian mediante:

```bash
lscpu
```

La capacidad real se validará mediante pruebas de rendimiento, no únicamente por las especificaciones del equipo.

---

## 12. Despliegue de la aplicación web

### 12.1. Primera versión: despliegue local

Se recomienda desplegar todos los componentes principales en el servidor Debian.

El servidor alojará el frontend, el backend, MongoDB y el servicio de monitoreo.

Los usuarios conectados a la LAN podrán abrir el panel desde un navegador utilizando la IP local del servidor.

Por ejemplo:

`http://192.168.50.10:3000`

La dirección y el puerto son ilustrativos y se definirán durante la implementación.

### 12.2. ¿La aplicación puede abrirse desde otra red?

Sí, pero será necesario configurar un mecanismo de acceso remoto.

Una opción recomendada es implementar una VPN después de validar el sistema local. De esta forma, un administrador podrá conectarse desde otra red y acceder al panel y al servidor de forma controlada.

El servidor del laboratorio deberá permanecer encendido, conectado a la LAN y ejecutando los servicios de monitoreo.

### 12.3. ¿Qué ocurre si se aloja la aplicación en Internet?

El frontend podría alojarse en un servicio externo, pero eso no permite que el backend externo descubra directamente los dispositivos de una LAN privada.

Para ese escenario, el servidor local tendría que enviar los resultados a un servicio externo mediante una conexión segura, o utilizar otro mecanismo de comunicación remota.

Como esta alternativa aumenta la complejidad, no será la prioridad inicial.

### 12.4. Administración mediante SSH

SSH permitirá administrar el servidor Debian desde una terminal.

Se utilizará para tareas como:

- Revisar logs.
- Actualizar paquetes.
- Reiniciar servicios.
- Diagnosticar problemas.
- Administrar el sistema.

Se probará primero dentro de la LAN. Para el acceso desde otra red, se preferirá una VPN y autenticación mediante claves SSH, evitando exponer directamente el servicio a Internet.

---

## 13. Seguridad

El sistema tendrá acceso a información de los dispositivos conectados a una red, por lo que deberá incorporar controles de seguridad.

Se consideran las siguientes medidas:

- Autenticación de los usuarios.
- Control de permisos para las acciones administrativas.
- Validación de las solicitudes recibidas por el backend.
- Restricción de las operaciones que pueden ejecutar las herramientas del sistema.
- Protección de las credenciales y claves.
- Restricción del acceso a MongoDB.
- Uso de HTTPS cuando corresponda.
- Acceso remoto mediante VPN.
- Registro de errores y eventos relevantes.
- Ejecución de escaneos únicamente en redes autorizadas.

El backend no deberá permitir que una solicitud del navegador ejecute comandos arbitrarios en el servidor.

Antes de conectar el router propio a la infraestructura universitaria, se deberá obtener autorización y confirmar las condiciones técnicas de conexión.

---

## 14. Relación con las asignaturas del semestre

El proyecto integrará las materias de la siguiente manera.

### 14.1. Infraestructura TI

Se aplicará en:

- Preparación del servidor Debian.
- Instalación y configuración de servicios.
- Administración del sistema operativo.
- Despliegue de la aplicación.
- Supervisión de recursos.
- Administración de MongoDB.
- Configuración de servicios que arranquen automáticamente.
- Administración remota mediante SSH.

### 14.2. Tecnología Web

Se aplicará en:

- Desarrollo del frontend con React.
- Desarrollo del backend con Node.js.
- Diseño e implementación de una API.
- Comunicación entre frontend y backend.
- Actualizaciones en tiempo real mediante WebSocket.
- Autenticación y autorización.
- Diseño de la interfaz del panel de monitoreo.

### 14.3. Conmutación y Enrutamiento

Se aplicará en:

- Diseño de la topología física y lógica.
- Configuración del router.
- Configuración de la LAN.
- Direccionamiento IPv4.
- DHCP.
- Conexión del switch.
- Conectividad cableada e inalámbrica.
- Análisis del tráfico y del descubrimiento de dispositivos.
- Comprensión de las diferencias entre LAN, WAN, subred y VLAN.

### 14.4. Big Data

Se aplicará en el almacenamiento y análisis de los datos generados por el monitoreo.

Por ejemplo:

- Registro histórico de disponibilidad.
- Análisis de frecuencia de desconexiones.
- Identificación de dispositivos con fallos recurrentes.
- Consulta de eventos por fecha.
- Cálculo de métricas de disponibilidad.
- Visualización de tendencias de funcionamiento.

Aunque el prototipo inicial no necesariamente constituirá una plataforma de Big Data a gran escala, permitirá trabajar con la captura, persistencia y análisis de datos de una infraestructura de red.

---

## 15. Plan de trabajo

### Fase 1. Confirmación de requisitos e infraestructura

- Confirmar las condiciones de conexión a la red universitaria.
- Identificar el router y el switch disponibles.
- Determinar si se necesita un AP independiente.
- Confirmar el modelo del procesador del servidor.
- Definir la subred de pruebas.
- Elaborar la topología definitiva.

### Fase 2. Preparación del servidor

- Actualizar Debian.
- Configurar una dirección IP estable.
- Comprobar la conectividad de red.
- Instalar y probar SSH dentro de la LAN.
- Instalar Nmap y ARP-scan.
- Probar el descubrimiento con dispositivos autorizados.

### Fase 3. Desarrollo del descubrimiento

- Implementar un primer proceso de descubrimiento.
- Evaluar los resultados de ARP-scan y Nmap.
- Determinar qué datos se obtienen de forma fiable.
- Medir los tiempos de respuesta.
- Definir los intervalos de monitoreo.

### Fase 4. Desarrollo del backend

- Configurar el proyecto Node.js.
- Diseñar la API.
- Diseñar los documentos de MongoDB.
- Implementar el almacenamiento de dispositivos.
- Implementar el monitoreo periódico.
- Implementar el registro de eventos.
- Configurar las actualizaciones en tiempo real.

### Fase 5. Desarrollo del frontend

- Crear la interfaz con React.
- Diseñar el panel principal.
- Mostrar los dispositivos detectados.
- Mostrar los datos disponibles de cada dispositivo.
- Mostrar el estado y la última observación.
- Incorporar notificaciones e historial.
- Integrar el frontend con el backend.

### Fase 6. Integración y pruebas

- Probar la solución con dispositivos autorizados.
- Desconectar y reconectar equipos para comprobar la detección.
- Medir el tiempo necesario para detectar cambios.
- Evaluar falsos positivos.
- Verificar el funcionamiento continuo del servidor.
- Medir el consumo de recursos.
- Documentar los resultados.

### Fase 7. Acceso remoto opcional

- Evaluar la implementación de una VPN.
- Probar el acceso al panel desde otra red.
- Probar la administración remota mediante SSH.
- Revisar la configuración de seguridad.
- Documentar las limitaciones y condiciones de acceso.

---

## 16. Decisiones tomadas hasta el momento

Las siguientes decisiones representan el planteamiento actual del proyecto:

1. El sistema monitoreará inicialmente una sola LAN.
2. Se utilizará una computadora con Debian como servidor local.
3. El servidor realizará el descubrimiento y monitoreo de los dispositivos.
4. El servidor se conectará por Ethernet a la LAN del router.
5. Se utilizará MongoDB como base de datos.
6. Se utilizará Node.js para el backend.
7. Se utilizará React para el frontend.
8. Se evaluarán ARP-scan y Nmap para el descubrimiento de dispositivos.
9. El monitoreo combinará descubrimiento periódico y comprobaciones ligeras.
10. La aplicación registrará los cambios de disponibilidad y permitirá consultarlos en el panel.
11. El monitoreo no dependerá de que un administrador mantenga abierta la página web.
12. El acceso remoto se evaluará después de validar el funcionamiento local.
13. SSH se utilizará para la administración del servidor.
14. Se comenzará con una cantidad reducida de dispositivos y luego se ampliarán las pruebas.
15. La infraestructura universitaria se utilizará únicamente bajo las condiciones autorizadas por la institución.

---

## 17. Aspectos pendientes por confirmar

Antes de implementar la solución definitiva, deberán resolverse los siguientes puntos:

- Modelo exacto del procesador del servidor.
- Marca y modelo del router.
- Marca y modelo del switch.
- Disponibilidad de un AP independiente.
- Autorización para conectar el router a la red de la universidad.
- Configuración de la toma Ethernet de la pared.
- Método de asignación de direcciones IP en la conexión WAN.
- Posible uso de VLAN u otras restricciones institucionales.
- Subred definitiva de la LAN de pruebas.
- Requisitos funcionales y no funcionales definitivos.
- Datos que se mostrarán de cada dispositivo.
- Tiempo máximo aceptable para detectar una desconexión.
- Política de usuarios, roles y permisos.
- Tiempo de conservación del historial.
- Mecanismo de copias de seguridad.
- Alcance definitivo de las funciones de administración.
- Inclusión o exclusión del acceso remoto en la entrega final.

---

## 18. Criterios de éxito de la primera versión

La primera versión se considerará funcional cuando cumpla los siguientes objetivos:

1. El servidor Debian permanece ejecutando el servicio de monitoreo.
2. El sistema descubre dispositivos de prueba de la LAN autorizada.
3. La aplicación muestra la información realmente obtenida de cada dispositivo.
4. El sistema registra la última observación de cada dispositivo.
5. El sistema detecta cambios de disponibilidad con una estrategia que reduzca falsas alarmas.
6. Los eventos se almacenan en MongoDB.
7. El panel web presenta la información actualizada.
8. La interfaz recibe cambios sin necesitar una recarga manual constante.
9. El sistema puede probarse con computadoras, laptops y otros dispositivos autorizados.
10. La solución funciona de manera estable con los recursos disponibles.

---

## 19. Consideraciones finales

La propuesta consiste en construir primero un sistema local, centralizado y funcional, con una arquitectura que permita añadir mejoras posteriormente.

El servidor Debian será el componente encargado del descubrimiento y monitoreo de la LAN. El backend coordinará la lógica del sistema, MongoDB almacenará los datos y React permitirá visualizarlos desde un navegador.

El uso de ARP-scan y Nmap permitirá iniciar las pruebas de descubrimiento sin tener que desarrollar desde cero todos los mecanismos de exploración de red. No obstante, la información disponible dependerá de las características de los dispositivos y de las condiciones de la red.

La prioridad será validar la topología, configurar la LAN, comprobar el descubrimiento y construir el sistema paso a paso. El acceso remoto, el análisis histórico avanzado y otras funciones se incorporarán únicamente cuando la primera versión esté estable.

**Nota:** este documento consolida la planificación inicial conversada. Los valores de direccionamiento, intervalos de monitoreo y componentes de la arquitectura son propuestas preliminares que deberán validarse durante el desarrollo.
