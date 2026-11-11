# ESPECIFICACIÓN DE REQUERIMIENTOS FUNCIONALES Y NO FUNCIONALES
## Sistema web de descubrimiento, monitoreo y administración de redes

**Versión:** 3.0  
**Estado:** Especificación definitiva aprobada y cerrada para desarrollo (Aspectos de Sección 8 resueltos)  
**Base de datos:** MongoDB  
**Tecnologías previstas:** React, Node.js y servicios de monitoreo compatibles con Linux.  
**Entorno de operación:** Red local del laboratorio y acceso remoto autorizado.

---

# 1. Descripción general del sistema

## 1.1. Propósito

El sistema permitirá descubrir, registrar, administrar y monitorear los dispositivos conectados a la red de un laboratorio informático mediante una aplicación web centralizada.

Su propósito es proporcionar al personal autorizado una visión clara del estado de la red, facilitar la identificación de problemas de conectividad, mantener un inventario actualizado y conservar un historial de los acontecimientos relevantes.

El sistema tomará como referencia las funcionalidades generales de herramientas de descubrimiento y monitoreo de redes, sin asumir que todos los dispositivos tienen las mismas capacidades de administración o que pueden detectarse mediante un único método.

## 1.2. Alcance funcional

La primera versión contemplará las siguientes capacidades:

1. Autenticación y administración de usuarios.
2. Control de permisos por rol.
3. Registro manual de dispositivos.
4. Descubrimiento automático de dispositivos.
5. Monitoreo periódico de disponibilidad.
6. Registro y consulta de eventos.
7. Generación y gestión de alertas e incidencias.
8. Panel general de monitoreo.
9. Búsqueda y filtrado del inventario.
10. Configuración del descubrimiento y monitoreo.
11. Estadísticas de disponibilidad.
12. Consulta del detalle y del historial de dispositivos.
13. Auditoría de operaciones administrativas.
14. Representación visual de las relaciones conocidas o inferidas entre dispositivos.

La aplicación no deberá limitarse a mostrar información cuando un usuario tenga abierto el navegador. Los procesos de descubrimiento y monitoreo se ejecutarán de manera independiente de la interfaz web.

## 1.3. Contexto de operación

El sistema está destinado inicialmente a una red de laboratorio con aproximadamente treinta computadoras o laptops, además de los equipos de infraestructura que existan en el entorno.

Los dispositivos cliente podrán conectarse mediante Wi-Fi. También podrán existir routers, puntos de acceso, impresoras, servidores, switches administrables y switches no administrables.

La infraestructura exacta podrá variar. Por tanto, el sistema no deberá depender de una marca específica ni asumir que todos los equipos permiten consultar información de administración.

## 1.4. Principios de funcionamiento

El sistema deberá respetar las siguientes reglas generales:

- La información mostrada deberá proceder de registros, comprobaciones o configuraciones identificables.
- No se considerará que un dispositivo está físicamente desconectado únicamente porque no responde a una comprobación.
- Un dispositivo no se eliminará del inventario por dejar de responder o por no aparecer en un escaneo.
- Los equipos sin capacidad de monitoreo directo deberán identificarse correctamente.
- Los estados, eventos, alertas e incidencias serán conceptos distintos.
- Las relaciones de red no confirmadas se mostrarán como inferencias, nunca como conexiones físicas verificadas.
- Los procesos automáticos deberán continuar funcionando aunque no haya usuarios conectados a la aplicación.
- Los cambios de configuración deberán persistir y poder auditarse.
- El sistema no ejecutará escaneos fuera de los rangos autorizados.
- Los errores individuales no deberán interrumpir innecesariamente el monitoreo del resto de la red.

---

# 2. Definiciones y conceptos del sistema

Para evitar interpretaciones diferentes durante el desarrollo, se utilizarán los siguientes términos.

## 2.1. Dispositivo

Es cualquier equipo que forme parte del inventario de la red, como una computadora, laptop, servidor, router, switch, punto de acceso, impresora o smartphone.

Cada dispositivo tendrá un identificador interno único, independiente de su dirección IP.

## 2.2. Descubrimiento

Es el proceso automático mediante el cual el sistema examina los rangos de red autorizados e intenta identificar dispositivos existentes.

El descubrimiento permite detectar equipos nuevos, pero no garantiza que se encuentren todos los dispositivos de la red.

## 2.3. Comprobación de disponibilidad

Es una prueba realizada sobre un dispositivo para determinar si responde mediante un método compatible, como ICMP.

Una comprobación puede resultar satisfactoria, fallida, no compatible o no ejecutada debido a un error del sistema.

## 2.4. Estado de disponibilidad

Representa la condición de respuesta del dispositivo según las comprobaciones realizadas.

Los estados serán:

- **Pendiente de verificación:** todavía no existe evidencia suficiente para determinar la disponibilidad.
- **Disponible:** se ha confirmado la disponibilidad mediante el método configurado.
- **No disponible:** se ha confirmado la falta de respuesta según la política de fallos consecutivos.
- **Inaccesible (Unreachable):** el dispositivo no responde a las comprobaciones debido a que su equipo padre, gateway o switch de enlace se encuentra confirmado como no disponible. Este estado previene la dispersión de falsas alarmas y tormentas de alertas.

El estado de disponibilidad no equivale a una confirmación física de que el equipo está encendido o apagado.

## 2.5. Capacidad de monitoreo

Indica si el dispositivo puede comprobarse directamente mediante los métodos que admite el sistema.

Un switch no administrable, por ejemplo, podrá existir en el inventario aunque no tenga una IP propia de administración.

La capacidad de monitoreo no debe confundirse con el estado de disponibilidad.

## 2.6. Evento

Es un registro histórico de algo que ocurrió, como un cambio de estado, un descubrimiento, un error, una modificación de configuración o una acción realizada por un usuario.

Los eventos sirven como evidencia histórica y no implican necesariamente que exista un problema que requiera atención.

## 2.7. Alerta

Es un registro que representa una condición que requiere atención, como una caída confirmada o un posible fallo compartido.

Una alerta puede estar abierta, reconocida o cerrada, según las reglas específicas que se definan para su ciclo de vida.

## 2.8. Incidencia

Es un registro de seguimiento operativo utilizado para investigar, documentar y resolver un problema.

Una incidencia puede mantenerse abierta aunque el dispositivo haya recuperado la disponibilidad y la alerta técnica se haya cerrado.

## 2.9. Auditoría

Es el registro de las acciones administrativas relevantes, indicando quién realizó la operación, cuándo ocurrió y qué datos fueron afectados.

## 2.10. Topología de red

Es la representación de las relaciones entre dispositivos y elementos de infraestructura.

Una relación podrá ser confirmada o inferida. La aplicación deberá distinguir claramente ambos casos.

---

# 3. Actores y permisos

## 3.1. Administrador

El administrador tendrá acceso a las funciones administrativas y operativas del sistema.

Podrá gestionar usuarios, asignar roles, configurar el monitoreo, administrar el inventario, consultar los registros y supervisar las incidencias.

## 3.2. Operador

El operador estará orientado a la supervisión y al soporte técnico.

Podrá consultar los dispositivos, revisar los estados, realizar pruebas de conectividad autorizadas, atender alertas, registrar observaciones y dar seguimiento a incidencias.

No podrá crear usuarios, modificar roles, configurar los parámetros globales del monitoreo ni crear, editar o eliminar dispositivos.

## 3.3. Reglas de autorización

El sistema deberá comprobar los permisos en el servidor para todas las operaciones restringidas.

Si un operador intenta ejecutar una operación exclusiva del administrador, el servidor deberá rechazarla y no deberá modificar los datos.

La interfaz ocultará o deshabilitará las acciones que el usuario no tenga permitidas, pero esto será únicamente una medida de usabilidad adicional. La seguridad efectiva dependerá de las validaciones del servidor.

---

# 4. Requerimientos funcionales

## RF-01. Autenticación y gestión de usuarios

### Objetivo

Garantizar que únicamente las personas autorizadas puedan acceder al sistema y que cada cuenta tenga los permisos correspondientes.

### RF-01.01. Inicio de sesión

El sistema deberá mostrar una pantalla de inicio de sesión con los campos:

- Correo electrónico.
- Contraseña.

El usuario deberá completar ambos campos para enviar la solicitud.

El servidor validará el formato del correo electrónico, comprobará que la cuenta exista y esté activa, verificará que no se encuentre bloqueada temporalmente y comprobará la contraseña.

Si las credenciales son correctas, el sistema iniciará la sesión y cargará la interfaz correspondiente al rol del usuario.

Si son incorrectas, mostrará un mensaje genérico que no revele si el correo existe o si la contraseña es incorrecta.

### RF-01.02. Creación de usuarios

No existirá un formulario de registro público.

Únicamente el administrador podrá crear cuentas desde el módulo de gestión de usuarios.

Para crear una cuenta, deberá proporcionar:

- Correo electrónico.
- Rol inicial.

El sistema generará un identificador único y registrará la fecha de creación y el administrador responsable.

Los correos deberán validarse y normalizarse para evitar cuentas duplicadas por diferencias de mayúsculas y minúsculas.

No se restringirá el registro exclusivamente a dominios institucionales.

### RF-01.03. Envío de contraseña temporal

Al crear una cuenta, el sistema generará una contraseña temporal aleatoria y la enviará al correo proporcionado.

La contraseña temporal deberá tener una vigencia definida y no podrá reutilizarse después de su uso.

Si el envío falla, la cuenta no deberá quedar habilitada de una forma que permita al usuario acceder sin recibir sus credenciales. El sistema deberá registrar el error y permitir al administrador volver a intentar el envío o generar nuevas credenciales temporales.

El sistema no almacenará la contraseña temporal en texto plano.

### RF-01.04. Primer acceso

Cuando el usuario ingrese con una contraseña temporal válida, el sistema lo dirigirá obligatoriamente al cambio de contraseña.

Hasta que complete el cambio, solo podrá acceder a las operaciones necesarias para establecer su contraseña definitiva y cerrar sesión.

No podrá consultar el panel de monitoreo ni utilizar las demás funciones antes de completar el procedimiento.

### RF-01.05. Cambio de contraseña

El usuario podrá cambiar su contraseña desde la aplicación cuando la sesión esté activa.

El formulario solicitará la contraseña actual y la nueva contraseña, junto con su confirmación.

El sistema comprobará que ambas entradas nuevas coincidan y que la contraseña cumpla la política de seguridad configurada.

Si la validación falla, no modificará la contraseña almacenada.

### RF-01.06. Recuperación de contraseña

El usuario podrá solicitar la recuperación de su contraseña desde la pantalla de inicio de sesión.

El sistema enviará un enlace de recuperación al correo asociado a la cuenta, siempre que corresponda.

El enlace deberá utilizar un token aleatorio, de un solo uso y con expiración. El token no se almacenará de forma que pueda recuperarse directamente desde la base de datos.

La pantalla de solicitud mostrará una respuesta genérica, evitando revelar si el correo está registrado.

Cuando el usuario abra un enlace válido, podrá establecer una nueva contraseña.

Un enlace vencido, inválido o utilizado anteriormente será rechazado.

### RF-01.07. Bloqueo temporal por intentos fallidos

Después de tres intentos consecutivos de autenticación fallidos, la cuenta quedará bloqueada temporalmente durante tres minutos.

Durante el bloqueo no se permitirá iniciar sesión, aunque se introduzca la contraseña correcta.

Al finalizar el período, la cuenta podrá volver a autenticarse. Los intentos fallidos deberán tratarse de manera consistente para evitar que se eluda el bloqueo mediante solicitudes concurrentes.

El sistema registrará los intentos relevantes para la seguridad.

### RF-01.08. Administración de cuentas

El administrador podrá consultar las cuentas existentes, su rol y su estado.

Podrá desactivar y reactivar cuentas. La desactivación impedirá nuevos accesos.

La desactivación no eliminará el historial de las acciones realizadas por esa cuenta.

El sistema no permitirá que una cuenta desactivada continúe ejecutando operaciones protegidas mediante una sesión previamente abierta.

### RF-01.09. Administración de roles

El administrador podrá asignar los roles permitidos por el sistema.

Los permisos deberán aplicarse tanto a la interfaz como a las operaciones del servidor.

El sistema deberá impedir que una modificación de rol conceda permisos que no estén definidos para el rol asignado.

### RF-01.10. Protección de contraseñas

Las contraseñas se almacenarán utilizando un algoritmo específico para contraseñas, como Argon2id o bcrypt, con parámetros seguros.

No se almacenarán contraseñas en texto plano ni se incluirán en registros de auditoría, mensajes de error o respuestas de la API.

### Criterios de aceptación de RF-01

- Una cuenta válida puede iniciar sesión.
- Una cuenta desactivada no puede iniciar sesión.
- Después de tres intentos fallidos consecutivos se aplica el bloqueo temporal de tres minutos.
- Una contraseña temporal obliga a cambiarla antes de acceder al resto de la aplicación.
- Un enlace de recuperación vencido o utilizado no permite cambiar la contraseña.
- Una cuenta duplicada no puede crearse con el mismo correo normalizado.
- Las contraseñas no aparecen en texto plano en la base de datos.

---

## RF-02. Control de permisos por rol

### Objetivo

Garantizar que cada usuario solo pueda ejecutar las operaciones permitidas para su rol.

### RF-02.01. Funciones del administrador

El administrador podrá:

- Crear, consultar, modificar, desactivar y reactivar cuentas.
- Asignar roles.
- Registrar dispositivos.
- Editar datos permitidos de los dispositivos.
- Gestionar los rangos de red autorizados.
- Modificar la configuración de descubrimiento y monitoreo.
- Restablecer los parámetros predeterminados.
- Consultar inventario, eventos, alertas, incidencias y estadísticas.
- Consultar registros de auditoría.
- Gestionar las relaciones de topología que se habiliten en la aplicación.

### RF-02.02. Funciones del operador

El operador podrá:

- Consultar el inventario.
- Buscar y filtrar dispositivos.
- Consultar fichas e historiales.
- Consultar el panel y la topología.
- Ejecutar pruebas de conectividad autorizadas.
- Consultar eventos, alertas e incidencias.
- Reconocer alertas.
- Añadir observaciones a incidencias.
- Dar seguimiento y marcar incidencias como resueltas.

### RF-02.03. Restricciones del operador

El operador no podrá crear, editar ni eliminar dispositivos, gestionar cuentas, cambiar roles ni modificar la configuración global.

### RF-02.04. Respuesta ante accesos no autorizados

Si un usuario intenta ejecutar una operación que no le corresponde, el servidor rechazará la solicitud y no realizará cambios parciales.

La respuesta de la API utilizará un código HTTP apropiado, como `403 Forbidden` para una operación no permitida o `401 Unauthorized` cuando falte una autenticación válida.

### Criterios de aceptación de RF-02

- Un operador no puede crear una cuenta ni modificar la configuración, incluso si envía manualmente una solicitud a la API.
- Un administrador puede realizar las operaciones administrativas autorizadas.
- Los permisos se aplican de manera uniforme a todas las rutas y servicios.

---

## RF-03. Registro manual de dispositivos

### Objetivo

Permitir la incorporación controlada de equipos al inventario, independientemente de que puedan monitorizarse directamente.

### RF-03.01. Formulario dinámico

El administrador abrirá un formulario de registro y seleccionará primero el tipo de dispositivo.

El sistema mostrará los campos generales y específicos correspondientes al tipo seleccionado.

Si el administrador cambia el tipo antes de guardar, el formulario actualizará sus campos sin conservar datos incompatibles como si fueran válidos.

### RF-03.02. Tipos admitidos

El catálogo inicial incluirá:

1. Computadora de escritorio.
2. Laptop.
3. Servidor.
4. Router.
5. Switch administrable.
6. Switch no administrable.
7. Punto de acceso inalámbrico.
8. Impresora de red.
9. Smartphone.
10. Otro.

El catálogo deberá poder ampliarse sin rediseñar todo el inventario.

### RF-03.03. Campos generales

Cada registro deberá incluir:

- **ID:** identificador interno único generado por el sistema.
- **Tipo:** obligatorio.
- **Nombre:** obligatorio y no vacío.
- **IP:** obligatoria cuando se utilice para el monitoreo directo del dispositivo.
- **MAC:** opcional.
- **Marca:** opcional.
- **Modelo:** opcional.
- **Ubicación:** opcional.
- **Origen:** manual o automático.
- **Fecha de creación:** generada por el servidor.
- **Usuario creador:** cuenta responsable, cuando corresponda.
- **Estado de disponibilidad:** administrado por el sistema.
- **Capacidad de monitoreo:** determinada por los métodos compatibles.
- **Estado del monitoreo:** administrado por el servicio.

El identificador interno no dependerá de la dirección IP, porque una dirección puede cambiar con el tiempo.

### RF-03.04. Validación de direcciones

El sistema validará que las direcciones IP tengan un formato admitido y que las MAC, cuando se proporcionen, tengan un formato válido.

Los dispositivos sin una IP propia de administración podrán registrarse sin ese dato.

### RF-03.05. Prevención de duplicados

Antes de guardar, el sistema buscará coincidencias con dispositivos existentes.

Si la IP ya está asignada a un dispositivo, mostrará la coincidencia y evitará un duplicado accidental.

Si la MAC coincide con la de un dispositivo existente, también mostrará la coincidencia para que el administrador pueda determinar si se trata del mismo equipo.

Las coincidencias no deberán provocar la fusión automática de dos registros cuando no exista evidencia suficiente de que representan el mismo dispositivo.

### RF-03.06. Estado inicial

Todo dispositivo nuevo que todavía no tenga resultados suficientes comenzará en estado «Pendiente de verificación».

El sistema iniciará su monitoreo si el tipo de dispositivo y los datos disponibles lo permiten.

### RF-03.07. Fallo de la primera comprobación

Si la primera comprobación falla, el sistema conservará el registro.

El fallo se almacenará como resultado de comprobación, pero no provocará por sí solo la transición a «No disponible», ya que la regla predeterminada requiere tres fallos consecutivos.

### RF-03.08. Dispositivos sin monitoreo directo

Un switch no administrable podrá registrarse sin IP de administración.

El sistema mostrará que no es monitorizable directamente mediante ese método y no generará una alerta de caída directa basándose únicamente en la ausencia de respuesta a una dirección inexistente.

### RF-03.09. Edición del registro

El administrador podrá editar los datos descriptivos permitidos.

Los cambios deberán validarse antes de guardarse. El sistema registrará las modificaciones relevantes en auditoría.

Una modificación de IP no deberá borrar el historial anterior ni crear artificialmente una transición de recuperación o caída.

### RF-03.10. Baja de un dispositivo

Si se habilita la baja lógica, el dispositivo dejará de participar en las tareas ordinarias de monitoreo cuando corresponda, pero conservará su ficha histórica.

La baja deberá registrar quién la realizó, cuándo y por qué, si el motivo es solicitado.

### Criterios de aceptación de RF-03

- Se puede registrar un switch no administrable sin IP.
- Un dispositivo nuevo comienza pendiente de verificación.
- Un fallo inicial no elimina el registro.
- El sistema detecta posibles duplicados y muestra la información existente.
- Editar una dirección IP no elimina el historial del dispositivo.

---

## RF-04. Descubrimiento automático

### Objetivo

Detectar dispositivos presentes en los segmentos de red autorizados e incorporarlos al inventario sin duplicar registros.

### RF-04.01. Rangos autorizados

El administrador configurará uno o varios rangos o segmentos de red.

Cada rango deberá validarse antes de guardarse. El sistema rechazará rangos inválidos o configuraciones que no puedan procesarse de forma segura.

Los descubrimientos automáticos solo podrán ejecutarse sobre rangos autorizados y activos.

### RF-04.02. Intervalo predeterminado

El intervalo de descubrimiento será de diez minutos.

El administrador podrá modificarlo mediante RF-10. El cambio afectará a las siguientes ejecuciones, de manera controlada, sin iniciar múltiples escaneos simultáneos.

### RF-04.03. Métodos

El sistema utilizará métodos adecuados al entorno, como Nmap o ARP-scan, según disponibilidad, permisos y tipo de red.

El método elegido deberá quedar registrado para cada ejecución.

El sistema no asumirá que un método encuentra todos los equipos. Por ejemplo, ARP no atraviesa routers para descubrir dispositivos en segmentos remotos y un escaneo puede no detectar equipos aislados o protegidos por firewalls.

### RF-04.04. Incorporación al inventario

Cuando se detecte un dispositivo que no exista en el inventario, el sistema podrá crear un registro automático con los datos que haya obtenido.

No inventará campos como marca, modelo, nombre o ubicación si no dispone de evidencia para completarlos.

Los datos desconocidos quedarán vacíos o se identificarán expresamente como no disponibles.

### RF-04.05. Identificación y duplicados

El sistema comprobará si el dispositivo ya está registrado antes de crear uno nuevo.

La dirección IP podrá utilizarse para detectar coincidencias, pero no será el único identificador permanente.

Cuando exista una MAC válida u otros identificadores, se utilizarán para mejorar la identificación.

Si la identidad no puede determinarse con suficiente confianza, el sistema evitará fusionar registros automáticamente.

### RF-04.06. Cambios de IP

Si un equipo conocido aparece con una dirección IP diferente, el sistema actualizará la IP automáticamente solo cuando exista evidencia suficiente de que se trata del mismo dispositivo.

Si la evidencia es insuficiente, registrará el hallazgo para revisión y evitará sobrescribir la identidad de otro equipo.

### RF-04.07. Equipos ausentes

La ausencia de un equipo en un escaneo no lo eliminará del inventario.

Tampoco será suficiente para marcarlo como no disponible. Esa decisión corresponderá al proceso de comprobación de disponibilidad.

### RF-04.08. Registro de ejecución

Cada ejecución deberá registrar:

- Identificador de ejecución.
- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Rangos examinados.
- Método empleado.
- Resultado general.
- Número de dispositivos detectados.
- Número de registros nuevos.
- Número de coincidencias con registros existentes.
- Errores y advertencias.

Si una ejecución falla parcialmente, el sistema conservará los resultados válidos obtenidos y registrará los errores.

### RF-04.09. Aislamiento de errores

Un error en un rango o dispositivo no deberá cancelar automáticamente el descubrimiento de los demás rangos.

### Criterios de aceptación de RF-04

- El descubrimiento se ejecuta cada diez minutos por defecto.
- No se crean duplicados cuando se vuelve a detectar un dispositivo conocido.
- Un dispositivo ausente en un escaneo se conserva en el inventario.
- Los rangos y resultados de cada ejecución pueden consultarse posteriormente.
- Los cambios de IP no provocan reasignaciones automáticas cuando la identidad es incierta.

---

## RF-05. Monitoreo de disponibilidad

### Objetivo

Comprobar de manera periódica si los dispositivos responden y mantener estados consistentes sin generar falsas alarmas por fallos aislados.

### RF-05.01. Servicio independiente

El monitoreo funcionará en un servicio independiente de la interfaz React.

El servicio ejecutará las comprobaciones programadas aunque ningún usuario tenga abierta la aplicación.

Deberá iniciar de forma controlada, recuperar la configuración persistida y evitar ejecutar tareas duplicadas cuando se reinicie.

### RF-05.02. Intervalo predeterminado

El intervalo de comprobación será de treinta segundos.

El intervalo será independiente del descubrimiento automático.

El administrador podrá modificarlo según RF-10.

### RF-05.03. Tiempo máximo de espera

Cada comprobación tendrá un tiempo máximo de espera predeterminado de tres segundos.

Si no se obtiene una respuesta antes de ese límite, la comprobación se registrará como fallida por tiempo de espera.

Este límite no significa que el sistema deba esperar tres segundos cuando la respuesta llega antes.

### RF-05.04. Métodos de comprobación

El método de comprobación se seleccionará de acuerdo con las capacidades del dispositivo.

Podrán utilizarse:

- **ICMP:** para comprobar si el dispositivo responde a solicitudes de eco, como ping.
- **TCP:** para verificar la respuesta de un servicio en un puerto configurado.
- **SNMP:** para consultar información de dispositivos que lo admitan y tengan habilitado ese servicio.

Los métodos adicionales solo se usarán cuando estén disponibles y configurados.

Una comprobación TCP satisfactoria podrá confirmar la respuesta del servicio consultado, pero no necesariamente todas las funciones del dispositivo.

La ausencia de respuesta ICMP no implicará por sí sola que un dispositivo esté caído si existe otro método válido configurado y este responde satisfactoriamente.

### RF-05.05. Fallos consecutivos

El umbral predeterminado será de tres comprobaciones fallidas consecutivas.

Una comprobación fallida incrementará la secuencia de fallos. Una comprobación satisfactoria interrumpirá esa secuencia.

Cuando se alcance el umbral, el sistema confirmará el estado «No disponible» y generará el evento correspondiente.

### RF-05.06. Recuperación

El umbral predeterminado será de dos comprobaciones satisfactorias consecutivas.

Cuando un dispositivo esté en estado «No disponible», el sistema no lo declarará recuperado por una única respuesta.

Después de dos respuestas satisfactorias consecutivas mediante el método configurado, cambiará su estado a «Disponible» y registrará la recuperación.

### RF-05.07. Estado inicial

Un dispositivo recién registrado comenzará como «Pendiente de verificación».

Cuando se obtengan resultados suficientes, pasará a «Disponible» o «No disponible», según las reglas de comprobación.

### RF-05.08. Diferenciación de estados

El sistema mantendrá separados:

1. Estado de disponibilidad del dispositivo.
2. Capacidad de monitoreo directo.
3. Estado operativo del servicio de monitoreo.

Un error del servicio no deberá interpretarse como una caída simultánea confirmada de todos los dispositivos.

### RF-05.09. Errores y resultados indeterminados

Los resultados se distinguirán al menos entre comprobación satisfactoria, comprobación fallida y comprobación no ejecutada por un error interno.

Un error interno del servicio no se contabilizará automáticamente como un fallo de red del dispositivo.

Si el sistema no puede ejecutar una comprobación, registrará el error y mantendrá el último estado confirmado hasta disponer de evidencia suficiente para cambiarlo. La interfaz deberá indicar si los datos están desactualizados.

### RF-05.10. Comprobaciones concurrentes

El servicio deberá administrar la ejecución de comprobaciones para evitar que un dispositivo lento bloquee a los demás.

El número de comprobaciones simultáneas deberá limitarse mediante una configuración o mecanismo interno seguro.

No deberán ejecutarse varias comprobaciones simultáneas redundantes sobre el mismo dispositivo cuando una comprobación anterior siga pendiente.

### RF-05.11. Historial de disponibilidad

El sistema registrará las transiciones confirmadas de estado, sus fechas y los eventos relacionados.

No será obligatorio crear un evento visible independiente por cada comprobación satisfactoria. La política de almacenamiento deberá evitar volúmenes innecesarios de registros sin perder la evidencia necesaria para calcular estadísticas.

### RF-05.12. Limitaciones

El sistema no afirmará que un equipo está físicamente apagado o desconectado basándose únicamente en la falta de respuesta.

La descripción de una alerta deberá referirse a la condición observada, por ejemplo: «No se obtuvo respuesta después de tres comprobaciones consecutivas».

### Criterios de aceptación de RF-05

- Las comprobaciones se ejecutan cada treinta segundos por defecto.
- Cada comprobación respeta el límite de tres segundos.
- Tres fallos consecutivos confirman una caída.
- Dos respuestas satisfactorias consecutivas confirman una recuperación.
- Un error interno de comprobación no equivale automáticamente a una caída.
- Los dispositivos no monitorizables directamente no reciben estados inventados.
- Un fallo de un dispositivo no detiene las comprobaciones de los demás.

---

## RF-06. Registro y consulta de eventos

### Objetivo

Mantener un historial verificable de los acontecimientos relevantes para la operación y administración de la red.

### RF-06.01. Datos de un evento

Cada evento tendrá:

- Identificador único.
- Tipo.
- Descripción.
- Fecha y hora generadas por el servidor.
- Origen.
- Dispositivo o dispositivos relacionados, cuando corresponda.
- Usuario responsable, si fue provocado por una acción humana.
- Resultado de la operación.
- Severidad, cuando corresponda.
- Identificador de ejecución o comprobación relacionada, cuando exista.

El sistema no deberá asignar un usuario humano a un evento automático si no hubo una acción humana que lo originara.

### RF-06.02. Tipos de eventos

Se contemplarán, como mínimo:

- Descubrimiento.
- Alta automática de dispositivos.
- Cambios de IP.
- Transiciones de disponibilidad.
- Recuperaciones.
- Errores de comprobación.
- Errores del servicio de monitoreo.
- Generación y cierre de alertas.
- Creación y resolución de incidencias.
- Cambios de configuración.
- Restablecimiento de valores predeterminados.
- Cambios administrativos.
- Pruebas manuales.
- Eventos de seguridad relevantes.

### RF-06.03. Consulta

Los usuarios autorizados podrán consultar los eventos desde la interfaz.

La consulta admitirá filtros por fecha, tipo, dispositivo, origen, resultado y severidad, cuando aplique.

### RF-06.04. Ordenamiento y paginación

Por defecto, los eventos se mostrarán del más reciente al más antiguo.

La consulta deberá admitir paginación para limitar el volumen de datos devuelto por cada solicitud.

### RF-06.05. Integridad

La interfaz ordinaria no permitirá editar ni eliminar eventos históricos.

Los errores de almacenamiento deberán registrarse por los mecanismos de diagnóstico disponibles, sin generar ciclos infinitos de eventos de error.

### RF-06.06. Relación con alertas e incidencias

Un evento podrá relacionarse con una alerta o incidencia sin convertirse automáticamente en una nueva alerta.

Una misma alerta podrá relacionarse con varios eventos.

### Criterios de aceptación de RF-06

- Los eventos pueden filtrarse y ordenarse.
- Las transiciones de disponibilidad pueden rastrearse hasta sus comprobaciones.
- Las acciones administrativas incluyen al usuario responsable.
- La interfaz no permite modificar el contenido histórico de los eventos.

---

## RF-07. Alertas e incidencias

### Objetivo

Identificar condiciones que requieren atención y permitir su seguimiento hasta la resolución operativa.

### RF-07.01. Generación de alertas de disponibilidad

Cuando un dispositivo alcance el umbral configurado de fallos consecutivos, el sistema generará una alerta de disponibilidad.

La alerta deberá relacionarse con el dispositivo y con el evento que confirmó la caída.

La descripción indicará que se confirmó la falta de respuesta según la política de comprobación, sin atribuir automáticamente una causa física.

### RF-07.02. Datos de una alerta

Cada alerta incluirá:

- Identificador único.
- Tipo.
- Descripción.
- Dispositivo o dispositivos relacionados.
- Fecha y hora de apertura.
- Severidad: clasificada en Informativa (`info`), Advertencia (`warning`) o Crítica (`critical`), según los criterios de la regla 8.2.
- Estado de la alerta.
- Eventos asociados.
- Fecha y motivo de cierre, cuando corresponda.

### RF-07.03. Estados de alerta

La primera versión distinguirá los siguientes estados:

- **Abierta:** condición detectada que requiere atención.
- **Reconocida:** un usuario ha indicado que la alerta está siendo atendida.
- **Cerrada:** la condición técnica se ha recuperado o la alerta se ha cerrado conforme a la regla correspondiente.

Reconocer una alerta no significa que el problema esté solucionado.

### RF-07.04. Evitar duplicados

Mientras exista una alerta activa para la misma condición continua de un dispositivo, los fallos adicionales se asociarán a esa alerta en lugar de crear una nueva por cada comprobación.

Si la condición se recupera y posteriormente vuelve a presentarse, el sistema podrá generar una nueva alerta y conservar la relación histórica con las anteriores.

Las reglas específicas de agrupación de alertas de múltiples dispositivos se definirán en el bloque de correlación.

### RF-07.05. Cierre automático

Cuando se confirme la recuperación del dispositivo mediante el umbral de respuestas satisfactorias, la alerta de disponibilidad asociada se cerrará automáticamente.

El sistema registrará la hora de recuperación y conservará la alerta en el historial.

### RF-07.06. Reconocimiento por un usuario

El operador o administrador podrá reconocer una alerta.

El sistema registrará quién la reconoció y cuándo.

El reconocimiento no cambiará por sí mismo el estado de disponibilidad del dispositivo.

### RF-07.07. Creación y seguimiento de incidencias

Los usuarios autorizados podrán abrir una incidencia relacionada con una alerta o con un problema detectado durante las operaciones de soporte.

La incidencia incluirá, como mínimo:

- Identificador.
- Título o descripción.
- Fecha de creación.
- Usuario creador.
- Dispositivos relacionados, cuando corresponda.
- Estado.
- Observaciones.
- Historial de seguimiento.
- Fecha de resolución, cuando corresponda.

### RF-07.08. Estados de incidencia

La incidencia podrá encontrarse en los estados:

- **Abierta:** pendiente de atención.
- **En seguimiento:** está siendo investigada o atendida.
- **Resuelta:** se considera solucionada según la evaluación del responsable.

El sistema registrará las transiciones de estado y el usuario que las realizó.

### RF-07.09. Observaciones

El usuario autorizado podrá añadir observaciones a una incidencia.

Cada observación conservará su autor y fecha. Las observaciones anteriores no deberán sobrescribirse silenciosamente.

### RF-07.10. Independencia de alerta e incidencia

El cierre automático de una alerta técnica no cerrará automáticamente una incidencia operativa.

Por ejemplo, si una computadora recupera la conexión, la alerta podrá cerrarse mientras la incidencia continúa abierta para documentar la causa y las acciones realizadas.

### RF-07.11. Historial

Las alertas cerradas y las incidencias resueltas permanecerán disponibles para consulta y estadísticas.

### Criterios de aceptación de RF-07

- Tres fallos consecutivos generan una alerta de disponibilidad con la configuración predeterminada.
- Los fallos posteriores de la misma condición no crean alertas duplicadas.
- Dos respuestas satisfactorias consecutivas permiten cerrar automáticamente la alerta de disponibilidad.
- Reconocer una alerta no la resuelve.
- Una incidencia puede continuar abierta aunque la alerta técnica se cierre.
- El historial identifica las acciones de seguimiento.

---

## RF-08. Panel general de monitoreo

### Objetivo

Mostrar una visión centralizada y actualizada de la red, sus dispositivos y las condiciones que requieren atención.

### RF-08.01. Resumen de inventario

El panel mostrará:

- Total de dispositivos registrados.
- Total de dispositivos disponibles.
- Total de dispositivos no disponibles.
- Total de dispositivos pendientes de verificación.
- Total de dispositivos no monitorizables directamente.

Los totales deberán derivarse del inventario y de los estados almacenados, evitando contar un mismo dispositivo en varias categorías de disponibilidad.

La capacidad de monitoreo se mostrará como una clasificación adicional, no como un estado de disponibilidad equivalente.

### RF-08.02. Resumen de alertas

El panel mostrará el número de alertas activas y facilitará la consulta de cada una.

Los conteos deberán distinguir alertas abiertas o reconocidas de alertas cerradas.

### RF-08.03. Actividad reciente

El panel mostrará los acontecimientos más recientes, incluyendo cambios de disponibilidad, nuevos dispositivos, errores importantes y acciones relevantes.

### RF-08.04. Estado del servicio

El panel mostrará si el servicio de monitoreo se encuentra operativo o presenta problemas.

La indicación se basará en señales reales de funcionamiento, como la última ejecución o comunicación válida del servicio, no únicamente en la existencia de un proceso registrado.

### RF-08.05. Actualización visual

La interfaz actualizará los datos del panel cada cinco segundos como valor definido para la primera versión.

Esta frecuencia será independiente de los intervalos de descubrimiento y comprobación.

### RF-08.06. Datos desactualizados

Si el servidor no proporciona datos recientes o falla la actualización, el panel indicará que la información puede estar desactualizada.

No deberá presentar datos antiguos como si acabaran de comprobarse.

### RF-08.07. Topología

El panel podrá representar visualmente los dispositivos y las relaciones conocidas entre ellos.

Las conexiones confirmadas y las inferidas deberán distinguirse mediante una señal visual y una descripción accesible.

La ausencia de información de topología no deberá interpretarse como prueba de que un dispositivo está aislado.

### RF-08.08. Acceso al detalle

Al seleccionar un dispositivo del panel o de la topología, el usuario podrá abrir su ficha de detalle, siempre que tenga permisos.

### RF-08.09. Preparación para tiempo real

La arquitectura podrá incorporar WebSockets en una versión posterior. La primera versión no estará obligada a implementarlos si la actualización periódica satisface los requisitos establecidos.

### Criterios de aceptación de RF-08

- Los totales coinciden con los estados de los dispositivos.
- La interfaz se actualiza periódicamente sin obligar al servicio a cambiar su frecuencia de comprobación.
- El panel identifica información desactualizada.
- Las conexiones inferidas se diferencian de las confirmadas.

---

## RF-09. Búsqueda y filtrado del inventario

### Objetivo

Permitir localizar dispositivos sin tener que recorrer manualmente todo el inventario.

### RF-09.01. Campos de búsqueda

El sistema permitirá buscar por nombre, dirección IP y dirección MAC.

### RF-09.02. Búsqueda parcial

La búsqueda por nombre admitirá coincidencias parciales y no distinguirá entre mayúsculas y minúsculas.

Las búsquedas por IP y MAC deberán tratar los identificadores de manera consistente con su formato normalizado.

### RF-09.03. Filtros

Los filtros disponibles incluirán:

- Tipo de dispositivo.
- Estado de disponibilidad.
- Capacidad o estado del monitoreo.
- Origen del registro.
- Ubicación.
- Fabricante.

### RF-09.04. Combinación de filtros

Cuando se utilicen varios filtros simultáneamente, el sistema devolverá únicamente los dispositivos que cumplan todos los criterios seleccionados.

La búsqueda textual y los filtros deberán combinarse de forma consistente.

### RF-09.05. Ordenamiento

El usuario podrá ordenar los resultados por los campos disponibles, en orden ascendente o descendente.

### RF-09.06. Paginación

Los resultados se devolverán por páginas. Los cambios de filtro deberán actualizar los resultados y evitar mostrar elementos que ya no cumplan los criterios.

### RF-09.07. Sin resultados

Si no existen coincidencias, el sistema mostrará un mensaje informativo y permitirá modificar la búsqueda.

### RF-09.08. Integridad

La búsqueda y el filtrado no modificarán los registros ni producirán efectos secundarios en el monitoreo.

### Criterios de aceptación de RF-09

- Una búsqueda parcial encuentra nombres que contienen el texto indicado.
- Varios filtros se aplican simultáneamente.
- La paginación no duplica registros dentro de una misma consulta estable.
- Una consulta sin coincidencias muestra un resultado vacío claramente indicado.

---

## RF-10. Configuración del descubrimiento y monitoreo

### Objetivo

Permitir al administrador adaptar los parámetros del sistema sin modificar el código fuente y restaurar los valores iniciales cuando sea necesario.

### RF-10.01. Acceso

Solo el administrador podrá modificar la configuración global del descubrimiento y monitoreo.

El servidor comprobará el rol en cada operación de lectura o modificación restringida.

### RF-10.02. Parámetros configurables

La pantalla permitirá administrar, como mínimo:

1. Rangos de red autorizados.
2. Intervalo de descubrimiento.
3. Intervalo de comprobación de disponibilidad.
4. Tiempo máximo de espera de las comprobaciones.
5. Número de fallos consecutivos para confirmar una caída.
6. Número de respuestas satisfactorias consecutivas para confirmar una recuperación.
7. Métodos de comprobación compatibles con los dispositivos.
8. Parámetros adicionales de correlación y alertas cuando se hayan definido sus reglas.

### RF-10.03. Valores iniciales

La instalación utilizará los siguientes valores predeterminados:

| Parámetro | Valor inicial |
|---|---:|
| Descubrimiento automático | Cada 10 minutos |
| Comprobación de disponibilidad | Cada 30 segundos |
| Tiempo máximo de espera | 3 segundos |
| Fallos consecutivos para confirmar caída | 3 |
| Respuestas consecutivas para confirmar recuperación | 2 |
| Estado inicial de un dispositivo | Pendiente de verificación |
| Rangos autorizados | Configurados por el administrador |
| Métodos de comprobación | ICMP y métodos adicionales según el dispositivo |

### RF-10.04. Modificación de parámetros

El administrador podrá modificar los valores permitidos.

El sistema mostrará el valor actual, validará la nueva entrada y solicitará confirmación antes de guardar cambios relevantes.

Si el valor no es válido, mostrará un mensaje específico y conservará la configuración anterior.

### RF-10.05. Restablecimiento de valores predeterminados

La pantalla incluirá una opción visible denominada «Restablecer valores predeterminados».

Al seleccionarla, el sistema mostrará una confirmación que explique que los parámetros de configuración volverán a sus valores iniciales.

Si el administrador confirma, el sistema:

1. Validará que la solicitud provenga de una cuenta autorizada.
2. Recuperará el conjunto de valores predeterminados definido para la instalación.
3. Aplicará los valores a los parámetros que correspondan.
4. Guardará la nueva configuración de forma persistente.
5. Registrará el restablecimiento en la auditoría.
6. Mostrará un resultado que indique si la operación se completó.

Si el administrador cancela, no se modificará ningún parámetro.

El restablecimiento no eliminará usuarios, dispositivos, eventos, comprobaciones históricas, alertas ni incidencias.

Los valores predeterminados estarán definidos en la aplicación como una referencia controlada. No se calcularán a partir de los valores que el administrador haya modificado.

### RF-10.06. Persistencia

La configuración deberá almacenarse de manera persistente, por ejemplo, en MongoDB.

Después de reiniciar el servicio, el sistema recuperará la última configuración válida guardada, salvo que se haya ejecutado expresamente un restablecimiento a valores predeterminados.

### RF-10.07. Aplicación de cambios

Los cambios deberán aplicarse de forma controlada.

Si se modifica el intervalo de descubrimiento, el cambio afectará a las próximas ejecuciones programadas. Si se modifica el intervalo de comprobación, se actualizará la programación correspondiente.

El servicio deberá evitar la creación de tareas duplicadas y administrar las comprobaciones que estén en curso sin interrumpirlas innecesariamente.

### RF-10.08. Validación de parámetros

El sistema validará los tipos de datos, límites permitidos y compatibilidad entre parámetros.

Los intervalos deberán ser positivos, los umbrales de consecutividad deberán ser enteros positivos y los rangos de red deberán tener un formato válido.

Los límites máximos y mínimos permitidos deberán definirse en la configuración técnica de la aplicación y documentarse. El sistema no permitirá valores que puedan producir una carga de trabajo insegura o impedir el funcionamiento del servicio.

### RF-10.09. Auditoría

Cada modificación de configuración registrará:

- Usuario responsable.
- Fecha y hora.
- Parámetros afectados.
- Valores anteriores.
- Valores nuevos.
- Resultado de la operación.

El restablecimiento a valores predeterminados se registrará como una operación diferenciada.

No se almacenarán contraseñas ni secretos en el registro de auditoría.

### RF-10.10. Independencia de parámetros

El intervalo de descubrimiento será independiente del intervalo de comprobación.

Cambiar uno no modificará automáticamente el otro.

### RF-10.11. Rangos autorizados

El sistema solo ejecutará escaneos dentro de los rangos configurados y autorizados.

Los cambios de rangos deberán validarse y guardarse antes de utilizarse en una ejecución nueva.

### Criterios de aceptación de RF-10

- Los valores iniciales coinciden con la tabla de parámetros predeterminados.
- El administrador puede cambiar los intervalos sin editar código.
- Los cambios persisten después de reiniciar el servicio.
- Una configuración inválida no reemplaza una configuración válida.
- El restablecimiento devuelve los parámetros a sus valores iniciales.
- Cancelar el restablecimiento no modifica la configuración.
- El restablecimiento no elimina el inventario ni el historial.
- Los cambios quedan registrados en auditoría.

---

## RF-11. Estadísticas de disponibilidad

### Objetivo

Proporcionar información histórica sobre la disponibilidad y el comportamiento de los dispositivos, utilizando los datos registrados por el sistema.

### RF-11.01. Selección del período

El usuario podrá seleccionar un período de análisis mediante fechas de inicio y fin.

El sistema validará que el período sea válido y utilizará una zona horaria definida para presentar fechas de manera consistente.

### RF-11.02. Estadísticas por dispositivo

Para los dispositivos monitorizables, el sistema mostrará, cuando existan datos suficientes:

- Porcentaje de disponibilidad estimada.
- Número de interrupciones confirmadas.
- Número de recuperaciones.
- Tiempo acumulado de indisponibilidad estimada.
- Fecha y hora de la última interrupción.
- Historial de transiciones de estado.

### RF-11.03. Estadísticas generales

El sistema permitirá consultar:

- Dispositivos con mayor cantidad de interrupciones.
- Dispositivos con mayor tiempo de indisponibilidad.
- Evolución de la disponibilidad durante el período.
- Distribución de dispositivos por estado.
- Cantidad de alertas generadas.
- Cantidad de incidencias abiertas, resueltas y totales durante el período.

### RF-11.04. Fórmula de disponibilidad

Cuando existan datos suficientes, la disponibilidad estimada se calculará utilizando el tiempo considerado disponible dividido para el tiempo total evaluable del período, multiplicado por cien.

El tiempo evaluable no incluirá períodos para los que el sistema no tenga datos suficientes para determinar el estado.

Los intervalos de indisponibilidad se estimarán a partir de las transiciones confirmadas y de las marcas de tiempo registradas. El sistema deberá reconocer que el momento exacto de una caída puede ser anterior a su detección.

La interfaz deberá identificar el resultado como estimación cuando corresponda.

### RF-11.05. Datos insuficientes

Si el dispositivo no tiene historial suficiente, el sistema mostrará «Datos insuficientes» o una indicación equivalente.

No asignará una disponibilidad del 100 % simplemente porque no existan interrupciones registradas.

### RF-11.06. Dispositivos no monitorizables directamente

No se calculará una disponibilidad directa para dispositivos que no admitan comprobaciones compatibles.

Si se muestran estimaciones basadas en otros dispositivos relacionados, deberán identificarse como indirectas y explicar su fundamento.

### RF-11.07. Trazabilidad

Las estadísticas deberán permitir consultar los eventos y las transiciones que contribuyen al cálculo.

### RF-11.08. Diferenciación de registros

El sistema distinguirá entre eventos, alertas e incidencias. Una misma condición no deberá contabilizarse incorrectamente como varias interrupciones por el hecho de generar diferentes registros.

### Criterios de aceptación de RF-11

- Los resultados corresponden al período seleccionado.
- Las interrupciones se calculan a partir de transiciones confirmadas.
- Los períodos sin datos suficientes se identifican.
- Los dispositivos no monitorizables no reciben porcentajes de disponibilidad inventados.
- Las estadísticas pueden contrastarse con el historial.

---

## RF-12. Detalle e historial de dispositivos

### Objetivo

Proporcionar una vista individual de cada dispositivo y permitir investigar su comportamiento histórico.

### RF-12.01. Información general

La ficha mostrará:

- Identificador único.
- Nombre.
- Tipo.
- Dirección IP, si existe.
- Dirección MAC, si existe.
- Marca y modelo, si se conocen.
- Ubicación, si se conoce.
- Origen del registro.
- Fecha de creación.
- Usuario creador, cuando corresponda.
- Estado de disponibilidad.
- Capacidad de monitoreo.
- Método de comprobación configurado.
- Fecha y resultado de la última comprobación.
- Fecha y hora del último cambio confirmado de estado.

### RF-12.02. Historial

La ficha mostrará los eventos, las transiciones de disponibilidad, las alertas, las incidencias y las observaciones relacionadas con el dispositivo.

### RF-12.03. Filtros

El usuario podrá filtrar el historial por período y tipo de registro.

### RF-12.04. Ordenamiento

El historial se mostrará del más reciente al más antiguo por defecto, con la posibilidad de consultar la secuencia cronológica completa.

### RF-12.05. Relaciones de red

La ficha mostrará las relaciones conocidas del dispositivo con otros equipos.

Las relaciones confirmadas se distinguirán de las inferidas. La aplicación no presentará una relación inferida como una conexión física verificada.

### RF-12.06. Conservación histórica

Si un dispositivo deja de responder, cambia de IP o deja de participar en el monitoreo, el sistema conservará el historial registrado.

### RF-12.07. Integridad

Las consultas históricas no permitirán modificar registros de eventos ni alterar los resultados históricos de las comprobaciones.

### RF-12.08. Baja lógica

Si el dispositivo se da de baja, su historial seguirá disponible para los usuarios autorizados y no se reutilizará su identificador interno.

### Criterios de aceptación de RF-12

- La ficha presenta los datos disponibles sin inventar valores desconocidos.
- Los eventos y alertas pueden rastrearse hasta el dispositivo.
- Los cambios de IP no eliminan el historial.
- La baja lógica conserva los registros históricos.
- Las relaciones inferidas se identifican de forma explícita.

---

# 5. Requerimientos no funcionales

## 1. Criterios de especificación

Los requerimientos no funcionales se definen tomando como referencia las características de calidad de ISO/IEC 25010:2023, las directrices de ingeniería de requisitos de ISO/IEC/IEEE 29148:2018 y, para los aspectos de seguridad, los principios de gestión de riesgos de ISO/IEC 27001:2022.

Los valores cuantitativos establecidos en este documento constituyen objetivos de calidad propios del proyecto y no umbrales impuestos por las normas mencionadas.

## RNF-01. Eficiencia del desempeño

**Requerimiento:** El sistema deberá responder a las consultas habituales del inventario, los estados de los dispositivos, los eventos y las estadísticas en un tiempo máximo de 2 segundos para al menos el 95 % de las solicitudes, bajo una carga de referencia de 30 dispositivos registrados y 10 usuarios concurrentes, en el entorno de pruebas definido.

**Justificación:** Los administradores y operadores necesitan consultar el estado de la red sin demoras que dificulten el diagnóstico de incidencias. La medición permite evaluar objetivamente el rendimiento de la aplicación.

**Base normativa:**
- ISO/IEC 25010:2023, característica de eficiencia del desempeño, relacionada con el comportamiento temporal y la utilización de recursos.
- ISO/IEC/IEEE 29148:2018, como referencia para expresar condiciones y criterios verificables.

**Verificación:** Ejecutar pruebas de carga y medir los tiempos de respuesta de la API, registrando los percentiles de latencia y las condiciones del entorno.

## RNF-02. Actualización de la información

**Requerimiento:** La interfaz del sistema deberá actualizar los datos de estado y los indicadores del panel de monitoreo en intervalos no superiores a 5 segundos, siempre que el servicio de monitoreo y la comunicación con el servidor estén disponibles. La actualización visual no deberá provocar una nueva comprobación de conectividad por cada actualización de la interfaz.

**Justificación:** El operador necesita visualizar cambios recientes sin recargar manualmente la página. Separar la actualización visual de las comprobaciones de red evita generar tráfico de monitoreo innecesario.

**Base normativa:**
- ISO/IEC 25010:2023, eficiencia del desempeño.
- ISO/IEC/IEEE 29148:2018, especificación de condiciones temporales verificables.

**Verificación:** Medir el intervalo entre actualizaciones de la interfaz y comprobar que estas no generan comprobaciones adicionales de conectividad.

## RNF-03. Continuidad del servicio de monitoreo

**Requerimiento:** El servicio de monitoreo deberá continuar ejecutando las comprobaciones programadas, registrando resultados y gestionando los eventos aunque no existan usuarios conectados a la interfaz web, mientras el servidor y los servicios de los que depende permanezcan operativos.

**Justificación:** El propósito principal del sistema es vigilar la red de manera continua. Si el monitoreo dependiera de que un usuario mantenga abierta la página, se perderían eventos durante los períodos sin actividad de los operadores.

**Base normativa:**
- ISO/IEC 25010:2023, fiabilidad.
- ISO/IEC/IEEE 29148:2018, especificación de condiciones operativas.

**Verificación:** Cerrar todas las sesiones web durante un período de prueba y comprobar que las verificaciones programadas y el registro de eventos continúan ejecutándose.

## RNF-04. Recuperación ante fallos

**Requerimiento:** Cuando se reinicie el servicio de monitoreo después de una interrupción, este deberá recuperar su funcionamiento sin duplicar los registros históricos existentes y deberá reanudar las comprobaciones programadas. El sistema deberá registrar la interrupción y el reinicio cuando sea técnicamente posible.

**Justificación:** Un fallo del proceso de monitoreo no debe provocar la pérdida del inventario ni la duplicación de eventos. Además, el operador necesita conocer los períodos en los que el servicio no estuvo funcionando para interpretar correctamente el historial.

**Base normativa:**
- ISO/IEC 25010:2023, fiabilidad, incluida la capacidad de recuperación.
- ISO/IEC 27001:2022, como referencia complementaria para gestionar riesgos que afectan a la disponibilidad e integridad de la información.

**Verificación:** Interrumpir y reiniciar el servicio de monitoreo durante una prueba controlada; comprobar la reanudación de las comprobaciones y la integridad de los registros.

## RNF-05. Seguridad de autenticación y contraseñas

**Requerimiento:** El sistema deberá autenticar a los usuarios antes de permitir el acceso a las funciones protegidas. Las contraseñas deberán almacenarse mediante un algoritmo de hash adaptativo diseñado para contraseñas, con parámetros de seguridad adecuados y sal individual. Las contraseñas no deberán almacenarse ni registrarse en texto plano.

**Justificación:** La aplicación administra información de la infraestructura y permite ejecutar operaciones que pueden afectar a la configuración y al monitoreo. La protección de credenciales reduce el riesgo de accesos no autorizados.

**Base normativa:**
- ISO/IEC 25010:2023, característica de seguridad.
- ISO/IEC 27001:2022, enfoque de gestión de riesgos de seguridad de la información.

**Verificación:** Inspeccionar el almacenamiento de credenciales y realizar pruebas de autenticación, incluyendo contraseñas incorrectas y acceso a recursos protegidos sin iniciar sesión.

## RNF-06. Control de acceso y protección de operaciones

**Requerimiento:** El servidor deberá verificar los permisos del usuario en cada operación protegida, aplicando el control de acceso correspondiente a los roles de administrador y operador. No deberá ser posible ejecutar una operación restringida mediante una solicitud directa a la API, aunque la interfaz no muestre la opción correspondiente.

**Justificación:** Ocultar botones no constituye una medida de seguridad suficiente. El control debe aplicarse en el servidor para impedir que un usuario realice acciones fuera de sus permisos.

**Base normativa:**
- ISO/IEC 25010:2023, seguridad, incluyendo la protección frente a accesos no autorizados.
- ISO/IEC 27001:2022, como referencia para la gestión de accesos y riesgos.

**Verificación:** Ejecutar pruebas con cuentas de ambos roles e intentar acceder directamente a operaciones que cada rol no tiene autorizadas.

## RNF-07. Protección de las comunicaciones

**Requerimiento:** Las comunicaciones que transporten credenciales, sesiones o información protegida entre el navegador y el servidor deberán utilizar HTTPS con una configuración TLS segura en los entornos de despliegue remoto. El acceso remoto no deberá depender de exponer directamente servicios internos de la base de datos a Internet.

**Justificación:** La información intercambiada podría ser interceptada o manipulada si circula sin protección. La base de datos y los servicios internos deben permanecer aislados de accesos externos innecesarios.

**Base normativa:**
- ISO/IEC 25010:2023, seguridad.
- ISO/IEC 27001:2022, gestión de riesgos relacionados con las comunicaciones y el acceso a la información.

**Verificación:** Inspeccionar la configuración de HTTPS/TLS, comprobar que las conexiones protegidas funcionan y verificar que los puertos internos no están expuestos de forma innecesaria.

## RNF-08. Integridad y trazabilidad de la información

**Requerimiento:** El sistema deberá conservar la consistencia entre el inventario, los estados, los eventos y las alertas. Las operaciones administrativas relevantes deberán registrar, como mínimo, el usuario responsable, la fecha y hora, el tipo de operación y el resultado cuando corresponda. Los eventos históricos no deberán modificarse mediante las operaciones ordinarias de consulta.

**Justificación:** El historial permite reconstruir lo ocurrido en la red y distinguir entre una incidencia real, una modificación administrativa y un fallo del propio servicio de monitoreo.

**Base normativa:**
- ISO/IEC 25010:2023, seguridad, particularmente la integridad y la responsabilidad de las acciones.
- ISO/IEC 27001:2022, gestión de riesgos relacionados con la integridad y la trazabilidad de la información.

**Verificación:** Ejecutar operaciones administrativas y comprobar sus registros de auditoría. Intentar alterar eventos históricos mediante las funciones ordinarias y comprobar que la operación no está permitida.

## RNF-09. Respaldo y recuperación de datos

**Requerimiento:** El sistema deberá contar con un procedimiento documentado de respaldo de la base de datos y de recuperación del inventario, la configuración, los eventos y las alertas. Para las pruebas iniciales, se propone realizar respaldos automáticos al menos una vez cada 24 horas y comprobar mediante una restauración de prueba que la información respaldada puede recuperarse.

**Justificación:** Un fallo de almacenamiento, un error administrativo o una incidencia del servidor podría ocasionar la pérdida de información necesaria para analizar interrupciones y disponibilidad de la red.

**Base normativa:**
- ISO/IEC 25010:2023, fiabilidad y capacidad de recuperación.
- ISO/IEC 27001:2022, gestión de riesgos que afectan a la disponibilidad e integridad de la información.

**Verificación:** Revisar la ejecución de los respaldos, restaurar una copia en un entorno de prueba y comparar los datos recuperados con los originales.

## RNF-10. Compatibilidad del navegador

**Requerimiento:** La interfaz web deberá funcionar en las versiones estables de Google Chrome y Mozilla Firefox disponibles al momento de la validación, en equipos de escritorio con resolución de 1366 × 768 píxeles o superior, sin pérdida de las funciones principales de administración y monitoreo.

**Justificación:** Los usuarios pueden acceder desde diferentes equipos del laboratorio. La compatibilidad reduce los problemas derivados de diferencias entre navegadores y resoluciones.

**Base normativa:**
- ISO/IEC 25010:2023, compatibilidad e interacción con el usuario.
- ISO/IEC/IEEE 29148:2018, especificación del entorno operativo.

**Verificación:** Ejecutar pruebas funcionales en ambos navegadores y revisar las funciones principales, la navegación y la visualización de la interfaz.

## RNF-11. Facilidad de interacción y comprensión

**Requerimiento:** La interfaz deberá identificar claramente los estados de los dispositivos mediante texto y señales visuales distinguibles, permitir el acceso a las funciones según el rol y mostrar mensajes comprensibles ante errores de autenticación, validación o comunicación. El color no deberá ser el único medio para diferenciar estados.

**Justificación:** El operador debe identificar rápidamente los problemas y comprender qué acciones puede ejecutar. La información no debe depender exclusivamente de la percepción de colores ni de conocimientos sobre la implementación interna.

**Base normativa:**
- ISO/IEC 25010:2023, capacidad de interacción, que contempla aspectos como la accesibilidad, la facilidad de aprendizaje y la asistencia al usuario.
- ISO/IEC/IEEE 29148:2018, para definir condiciones verificables de interacción.

**Verificación:** Realizar pruebas de tareas con usuarios representativos, comprobar la comprensión de los estados y verificar que los mensajes permitan identificar el problema sin exponer información sensible.

## RNF-12. Mantenibilidad y modularidad

**Requerimiento:** El código deberá organizarse en módulos con responsabilidades definidas, separando como mínimo la interfaz web, la API, la lógica de monitoreo y el acceso a la base de datos. La modificación de un método de comprobación de conectividad no deberá requerir cambios innecesarios en los componentes de presentación.

**Justificación:** Los mecanismos de monitoreo pueden ampliarse con nuevos métodos o tipos de dispositivos. Una separación clara de responsabilidades facilita corregir errores, realizar pruebas y agregar funcionalidades sin afectar componentes no relacionados.

**Base normativa:**
- ISO/IEC 25010:2023, mantenibilidad, incluida la modularidad, la analizabilidad, la modificabilidad y la capacidad de prueba.
- ISO/IEC/IEEE 29148:2018, como referencia para mantener requisitos trazables durante la evolución del sistema.

**Verificación:** Revisar la estructura del código y realizar una prueba de modificación de un componente de monitoreo, comprobando que las funciones no relacionadas continúan operativas.

## RNF-13. Capacidad de crecimiento

**Requerimiento:** La arquitectura deberá permitir ampliar el inventario de referencia de 30 a 100 dispositivos sin rediseñar por completo la aplicación. En las pruebas con 100 dispositivos, el sistema deberá conservar los intervalos de comprobación configurados y cumplir los objetivos de rendimiento establecidos para el entorno de pruebas.

**Justificación:** Aunque el alcance inicial corresponde a un laboratorio de aproximadamente 30 equipos, la aplicación podría utilizarse posteriormente en redes de mayor tamaño. La capacidad de crecimiento evita que la arquitectura inicial impida una ampliación razonable.

**Base normativa:**
- ISO/IEC 25010:2023, flexibilidad, incluida la escalabilidad.
- ISO/IEC/IEEE 29148:2018, para especificar condiciones de operación y capacidad verificables.

**Verificación:** Ejecutar pruebas con 30 y 100 dispositivos simulados o de prueba, medir el uso de recursos y verificar el cumplimiento de los intervalos y tiempos de respuesta.

## RNF-14. Configuración y despliegue reproducibles

**Requerimiento:** El sistema deberá disponer de instrucciones documentadas para instalar, configurar, iniciar, detener y actualizar sus componentes en el entorno de despliegue definido. Las credenciales y parámetros sensibles de cada entorno deberán gestionarse fuera del código fuente.

**Justificación:** La aplicación debe poder desplegarse en el entorno local del laboratorio y en un entorno de acceso remoto autorizado sin depender de configuraciones manuales desconocidas o de credenciales incluidas en el código.

**Base normativa:**
- ISO/IEC 25010:2023, flexibilidad y mantenibilidad.
- ISO/IEC/IEEE 29148:2018, como referencia para documentar restricciones y condiciones operativas.

**Verificación:** Desplegar el sistema siguiendo exclusivamente la documentación del proyecto en un entorno limpio y comprobar que sus componentes pueden iniciarse y conectarse correctamente.

## RNF-15. Uso eficiente de recursos

**Requerimiento:** El servicio de monitoreo deberá ejecutar las comprobaciones de forma programada y controlar la concurrencia de las solicitudes, evitando la creación ilimitada de tareas simultáneas. Durante las pruebas con 100 dispositivos, no deberá presentar un crecimiento sostenido de memoria atribuible a la ejecución normal del monitoreo.

**Justificación:** Una aplicación que consulta continuamente los dispositivos puede saturar el servidor o generar tráfico innecesario si no controla sus tareas. El uso eficiente de recursos es especialmente importante en un servidor de laboratorio.

**Base normativa:**
- ISO/IEC 25010:2023, eficiencia del desempeño y utilización de recursos.
- ISO/IEC/IEEE 29148:2018, para definir condiciones y resultados medibles.

**Verificación:** Medir CPU, memoria, número de comprobaciones concurrentes y tráfico generado durante una prueba prolongada, documentando el entorno y la carga aplicada.

# 6. Reglas de negocio transversales

Las siguientes reglas serán obligatorias en todos los módulos:

**RN-01. Identidad del dispositivo.** La dirección IP no será el identificador permanente del dispositivo, ya que puede cambiar.

**RN-02. Conservación del inventario.** La ausencia en un escaneo o la falta de respuesta no provocarán la eliminación automática del dispositivo.

**RN-03. Evidencia de disponibilidad.** Los cambios de estado se basarán en resultados de comprobación y umbrales configurados.

**RN-04. Métodos compatibles.** Un dispositivo solo podrá evaluarse mediante métodos compatibles y habilitados.

**RN-05. Servicio independiente.** El monitoreo no dependerá de que un usuario tenga abierta la aplicación web.

**RN-06. Separación de registros.** Un evento, una alerta y una incidencia no serán entidades equivalentes.

**RN-07. No duplicación de alertas.** Una condición continua no deberá producir una nueva alerta en cada comprobación.

**RN-08. Recuperación.** La recuperación técnica cerrará la alerta de disponibilidad correspondiente, pero no necesariamente la incidencia asociada.

**RN-09. Topología.** Las relaciones inferidas deberán diferenciarse de las confirmadas.

**RN-10. Configuración persistente.** Los cambios de parámetros se conservarán después de reiniciar el servicio.

**RN-11. Valores predeterminados.** El restablecimiento recuperará los valores definidos por el proyecto sin eliminar información histórica.

**RN-12. Permisos.** Toda operación restringida deberá validarse en el servidor.

**RN-13. Auditoría.** Las modificaciones administrativas relevantes deberán quedar registradas.

**RN-14. Datos insuficientes.** La ausencia de datos no se interpretará como evidencia de disponibilidad perfecta.

**RN-15. Alcance de los escaneos.** Ningún proceso de descubrimiento podrá examinar rangos que no estén autorizados.

---

# 7. Condiciones generales de aceptación del sistema

La primera versión se considerará funcionalmente aceptable cuando se compruebe que:

1. Los usuarios pueden autenticarse de forma segura y reciben los permisos de su rol.
2. El administrador puede registrar dispositivos, incluidos aquellos que no tienen IP propia de administración.
3. El descubrimiento se ejecuta de manera programada y no duplica registros conocidos.
4. El servicio de monitoreo opera sin depender del navegador.
5. Se aplican correctamente los umbrales predeterminados de tres fallos y dos respuestas satisfactorias consecutivas.
6. Los errores individuales no detienen el monitoreo general.
7. Las alertas se generan, reconocen y cierran conforme a las reglas establecidas.
8. Las incidencias conservan su historial de seguimiento.
9. El panel muestra los estados y los datos de manera coherente y advierte cuando están desactualizados.
10. Los filtros y las búsquedas funcionan de forma combinada.
11. El administrador puede modificar la configuración y restablecer los valores predeterminados.
12. Los cambios de configuración persisten y quedan auditados.
13. Las estadísticas distinguen datos disponibles, estimaciones y períodos insuficientemente documentados.
14. El historial de los dispositivos se conserva aunque dejen de responder.
15. Las conexiones inferidas no se presentan como hechos confirmados.
16. El acceso remoto, cuando esté habilitado, respeta las medidas de autenticación y autorización.

---

# 8. Aspectos que deben cerrarse antes de aprobar la especificación definitiva

Aunque esta versión detalla el comportamiento principal de la aplicación, todavía hay decisiones que deben aprobarse expresamente para que el desarrollador no tenga que inventar reglas operativas.

## 8.1. Correlación de fallos compartidos

> **Estado:** Resuelto y Aprobado (Versión 2.1)

**Planteamiento inicial pendiente:**
> Se debe definir cómo establecer relaciones entre dispositivos, qué evidencia permite considerar que están relacionados y qué cantidad de fallos simultáneos justifica una posible alerta compartida.

**Solución técnica y regla operativa adoptada:**
Para evitar tormentas de alertas (*alert storms*) cuando falla un elemento de infraestructura central o de distribución, se implementa una arquitectura híbrida de dos niveles:

1. **Nivel 1 - Dependencia Jerárquica Directa (Parent-Child para equipos con IP propia):**
   - Cada dispositivo en el inventario podrá tener asignado un dispositivo padre o de enlace ascendente (`parentDeviceId`).
   - El daemon de monitoreo comprueba primero la salud de los nodos de infraestructura (routers, switches administrables, APs).
   - Si un nodo padre es confirmado como «No disponible» (tras alcanzar el umbral de 3 fallos consecutivos), sus dispositivos dependientes que no respondan pasarán automáticamente al estado **«Inaccesible» (Unreachable)** en lugar de «No disponible».
   - **Regla de supresión de alertas:** Solo se generará una alerta de severidad crítica para el dispositivo padre. Se suprimen las alertas individuales de los dispositivos dependientes en estado inaccesible, anexándose al arreglo `affectedDevices` de la alerta del padre para indicar el impacto total.

2. **Nivel 2 - Detección por Quórum Colectivo (Para Switches No Administrables sin IP):**
   - Los dispositivos conectados a un switch no administrable se asociarán lógicamente a este mediante su identificador interno (`parentDeviceId`).
   - Si en un ciclo de monitoreo se comprueba que **más del 70%** de los dispositivos asociados a un mismo switch no administrable fallan simultáneamente, el sistema inferirá una falla en dicho elemento de infraestructura o en su enlace físico común.
   - **Regla de alerta de infraestructura:** El sistema generará una única **Alerta de Infraestructura Compartida** (*"Posible falla en Switch No Administrable [Nombre] - N dispositivos sin respuesta"*), evitando generar alertas individuales dispersas y consolidando la incidencia operativa.

3. **Criterio de Recuperación Coordinada:**
   - Al confirmarse la recuperación del dispositivo padre o de los enlaces del switch (cumpliendo el umbral de 2 respuestas consecutivas), los dispositivos dependientes retornarán a evaluación ordinaria y la alerta compartida se cerrará automáticamente.

## 8.2. Severidad y agrupación de alertas

> **Estado:** Resuelto y Aprobado (Versión 2.2)

**Planteamiento inicial pendiente:**
> Se debe establecer qué niveles de severidad existirán y bajo qué condiciones una alerta se agrupará con otras o se abrirá una nueva.

**Solución técnica y regla operativa adoptada:**
Para estructurar la gestión operativa, priorizar la atención de incidencias y evitar saturación en el panel de monitoreo, se adoptan los siguientes estándares:

### 8.2.1. Niveles de Severidad

| Nivel | Identificador | Criterio de aplicación | Ejemplos de activación |
|---|---|---|---|
| **Informativa** | `info` | Acontecimientos operacionales relevantes que no representan una falla ni degradación de conectividad. | • Descubrimiento de un nuevo dispositivo en la red.<br/>• Cambio detectado de dirección IP en un host registrado.<br/>• Inicio o reinicio ordenado del servicio de monitoreo.<br/>• Respaldo de base de datos completado exitosamente. |
| **Advertencia** | `warning` | Pérdida de disponibilidad en equipos terminales/clientes individuales o degradación de parámetros operativos. | • Caída confirmada de una PC del laboratorio, laptop, smartphone o impresora.<br/>• Tiempo de respuesta (RTT) anormalmente alto (> 500 ms) en varias comprobaciones consecutivas.<br/>• Falla en comprobaciones secundarias (ej. puerto TCP cerrado en host que sí responde ICMP). |
| **Crítica** | `critical` | Pérdida de conectividad en nodos de infraestructura central o fallas colectivas que afectan el servicio general. | • Caída confirmada del Router / Gateway predeterminado.<br/>• Caída confirmada de un Switch administrable o Access Point principal.<br/>• Alerta de infraestructura por Quórum (> 70% de caídas en Switch no administrable).<br/>• Pérdida de conexión con el Servidor Debian o falla crítica en la base de datos. |

### 8.2.2. Reglas de Agrupación (Deduplicación)

1. **Persistencia de la misma condición:** Mientras una alerta de disponibilidad permanezca en estado `Abierta` o `Reconocida` para un dispositivo, los fallos sucesivos en cada ciclo de comprobación (cada 30 segundos) no crearán nuevas alertas. En su lugar, se acumularán como eventos asociados dentro del historial de la alerta abierta y actualizarán el contador de fallos continuos y la marca de tiempo de última observación.
2. **Absorción por Infraestructura:** Si un dispositivo terminal cuenta con una alerta individual de `Advertencia` abierta y posteriormente se activa una alerta `Crítica` de infraestructura (por caída del Router o por quórum en Switch según regla 8.1), la alerta individual se suspende o anexa automáticamente a la alerta del elemento padre (`affectedDevices`) para evitar duplicidad de registros y simplificar la pantalla del operador.

### 8.2.3. Condiciones para Abrir una Nueva Alerta

1. **Fallo en dispositivo independiente:** Un equipo terminal sin alertas activas alcanza el umbral de 3 fallos consecutivos y su nodo padre está operativo.
2. **Reincidencia tras recuperación (*Flapping*):** Si una alerta se cerró automáticamente al registrarse 2 respuestas consecutivas exitosas, y posteriormente (en minutos u horas posteriores) el mismo dispositivo vuelve a presentar 3 fallos consecutivos, el sistema creará una **nueva alerta independiente**, conservando un enlace al historial previo para permitir el análisis de inestabilidad o intermitencia (*flapping*).
3. **Falla simultánea de infraestructura:** Cuando se detecta la indisponibilidad de un nodo padre o se alcanza el quórum del 70%, se abre inmediatamente una alerta crítica de infraestructura independiente.

## 8.3. Seguridad de las sesiones

> **Estado:** Resuelto y Aprobado (Versión 2.3)

**Planteamiento inicial pendiente:**
> Se debe definir la duración de sesión, la política de expiración, el comportamiento después de cambiar una contraseña y los requisitos exactos de la contraseña definitiva.

**Solución técnica y regla operativa adoptada:**
Para garantizar la confidencialidad, la integridad del acceso y una operación segura sin interrupciones innecesarias para los operadores, la autenticación se gestionará mediante tokens criptográficos con rotación dual (*Access Token* y *Refresh Token*).

### 8.3.1. Glosario de Conceptos de Seguridad y Autenticación
Para que cualquier lector, integrante del equipo o evaluador comprenda con precisión los términos empleados:

- **JWT (JSON Web Token):** Estándar abierto (RFC 7519) que permite transmitir información compacta y autónoma entre el navegador y el servidor en formato JSON. Esta información viaja firmada digitalmente con una clave secreta privada en el servidor, lo que garantiza que los datos de usuario y rol no han sido alterados en el trayecto.
- **Access Token (Token de Acceso):** Credencial digital de corta vida que acredita la identidad y los permisos del usuario ante la API. El navegador la adjunta en cada petición HTTP para que el servidor valide de inmediato si el usuario tiene acceso, sin necesidad de consultar contraseñas ni realizar lecturas pesadas a la base de datos en cada clic.
- **Refresh Token (Token de Renovación / Refresco):** Credencial digital de mayor duración que se utiliza exclusivamente para solicitar un nuevo *Access Token* cuando el anterior caduca. Permite que el sistema renueve la sesión del usuario de forma transparente en segundo plano, evitando que el usuario deba escribir su correo y contraseña repetidamente.
- **Esquema Bearer (del inglés *bearer*, «el portador»):** Estándar de autorización HTTP (RFC 6750). Cuando el navegador envía una solicitud protegida, incluye una cabecera con el formato:  
  `Authorization: Bearer <token_jwt>`  
  El término *Bearer* indica literalmente que el servidor otorgará acceso a quienquiera que «porte o presente» una ficha de acceso válida y firmada, de forma análoga a presentar una entrada física en un evento.
- **Cookie `HttpOnly` y `SameSite`:** Mecanismo seguro de almacenamiento en el navegador web. La bandera `HttpOnly` impide de manera estricta que scripts de código JavaScript (por ejemplo, ante una vulnerabilidad de *Cross-Site Scripting* o XSS) puedan leer o extraer el token. La directiva `SameSite=Strict` o `Lax` protege contra solicitudes no deseadas originadas desde otros sitios web (*Cross-Site Request Forgery* o CSRF).

### 8.3.2. Duración de Sesiones y Política de Expiración

| Componente | Duración asignada | Almacenamiento seguro | Comportamiento operativo |
|---|---|---|---|
| **Access Token** | **15 minutos** | Memoria volátil del frontend (o cabecera HTTP) | Valida cada petición al backend. Si expira, el frontend solicita automáticamente su renovación. |
| **Refresh Token** | **8 horas** (jornada laboral estándar) | Cookie `HttpOnly` + Registro en base de datos | Permite renovar tokens de acceso en segundo plano. Tras 8 horas continuas de inactividad, expira y exige nuevo inicio de sesión. |

- **Flujo de renovación transparente:** Cuando el frontend realiza una petición y recibe un código `401 Unauthorized` por vencimiento del *Access Token*, dispara de manera silenciosa una petición interna al endpoint de refresco (`/api/auth/refresh`). Si el *Refresh Token* almacenado en la cookie es válido, recibe un nuevo *Access Token* y reintenta la solicitud original sin que el usuario perciba desconexión.

### 8.3.3. Invalidación y Revocación de Sesiones

1. **Cambio o restablecimiento de contraseña:** Al modificarse la contraseña (mediante el formulario de cambio o mediante el enlace de recuperación), el servidor invalidará inmediatamente todos los *Refresh Tokens* activos asociados a la cuenta. Esto forzará el cierre de sesión en todos los navegadores y dispositivos donde estuviera abierta la cuenta.
2. **Desactivación de cuenta:** Si un Administrador desactiva una cuenta de usuario, el servidor anulará sus sesiones activas en la base de datos, impidiendo que cualquier token posterior sea admitido.
3. **Cierre de sesión explícito (*Logout*):** Al pulsar "Cerrar sesión", el servidor destruirá la cookie `HttpOnly` del navegador y eliminará el registro de sesión de la base de datos.

### 8.3.4. Requisitos de la Contraseña Definitiva

Para cumplir con las recomendaciones de seguridad de ISO/IEC 27001, la contraseña definitiva elegida por el usuario deberá cumplir obligatoriamente:

- **Longitud mínima:** Al menos **8 caracteres**.
- **Complejidad:** Debe combinar al menos:
  - Una letra mayúscula (`A-Z`).
  - Una letra minúscula (`a-z`).
  - Un dígito numérico (`0-9`).
  - Un carácter especial o símbolo (`!@#$%^&*()_+-=[]{}|;:,.<>?`).
- **Restricciones de prevención:**
  - No puede coincidir con la contraseña temporal de un solo uso recibida por correo.
  - No puede contener partes evidentes del nombre o correo electrónico del usuario.

## 8.4. Retención histórica y gestión del crecimiento de datos

> **Estado:** Resuelto y Aprobado (Versión 2.4)

**Planteamiento inicial pendiente:**
> Se debe definir cuánto tiempo se conservarán los resultados de comprobaciones, eventos, auditorías, alertas e incidencias, y cómo se gestionará el crecimiento de la base de datos.

**Solución técnica y regla operativa adoptada:**
En un sistema de monitoreo continuo, comprobar 30 dispositivos cada 30 segundos genera aproximadamente **86,400 registros diarios** solo en comprobaciones de conectividad (ping). Para evitar saturar el almacenamiento de la unidad SSD del servidor Debian y mantener la base de datos ágil sin perder la capacidad de análisis histórico, se adopta una política de depuración automática y consolidación analítica de datos.

### 8.4.1. Conceptos Técnicos de Almacenamiento
- **Índice TTL (Time-To-Live) de MongoDB:** Funcionalidad nativa de MongoDB que permite asociar un tiempo de vida a los documentos. El propio motor de base de datos ejecuta un proceso en segundo plano que elimina de forma automática y transparente los registros cuya antigüedad supere el límite establecido, sin requerir scripts externos ni tareas manuales del administrador.
- **Agregación y Downsampling (Consolidación para Big Data):** Estrategia analítica que consiste en resumir miles de comprobaciones individuales (datos brutos de alta frecuencia) en un registro diario consolidado por dispositivo (porcentaje de disponibilidad, tiempo acumulado fuera de línea, número de interrupciones y latencia promedio). Esto permite consultar estadísticas históricas de meses anteriores en milisegundos ocupando menos de 1 MB al año.

### 8.4.2. Matriz de Retención por Colección

| Entidad / Colección | Período de retención | Mecanismo técnico | Justificación operativa |
|---|---|---|---|
| **Comprobaciones individuales (`checks`)** | **30 días** | Índice TTL automático (`expireAfterSeconds: 2592000`) | Son datos de alta frecuencia. 30 días de datos brutos son suficientes para diagnóstico inmediato. Pasado este tiempo, se depuran automáticamente. |
| **Métricas diarias consolidadas (`daily_metrics`)** | **1 año** (o permanente) | Documentos agregados (1 registro por host al día) | Almacena los resúmenes diarios generados por el módulo de analítica. Permite cumplir con RF-11 (estadísticas históricas) sin sobrecargar el disco. |
| **Eventos del sistema (`events`)** | **90 días** (semestre académico completo) | Índice TTL automático (`expireAfterSeconds: 7776000`) | Garantiza la trazabilidad histórica de cambios de IP, descubrimientos y transiciones durante todo el ciclo lectivo. |
| **Auditoría de acciones (`audit_logs`)** | **180 días** | Depuración programada por administrador | Mantiene el registro de responsabilidad de cambios administrativos según la norma ISO/IEC 27001. |
| **Alertas e Incidencias (`alerts` e `incidents`)** | **Indefinida** (mínimo 180 días) | Persistencia estándar con estados de cierre | Representan un volumen bajo (decenas o cientos de registros por semestre) pero poseen un valor documental crítico. |
| **Sesiones y Tokens (`sessions`)** | **8 horas** (máx. 24 h tras expiración) | Índice TTL automático (`expireAfterSeconds: 86400`) | Limpia periódicamente las sesiones cerradas o vencidas para evitar acumulación de registros innecesarios. |

### 8.4.3. Prevención y Control de Capacidad en el Servidor
1. **Supervisión de disco:** El servicio de monitoreo consultará periódicamente el espacio disponible en la partición donde reside MongoDB. Si el uso de disco supera el **85%**, generará automáticamente una alerta de `Advertencia` en el panel web.
2. **Procedimiento de respaldo periódico (RNF-09):** Se configurará una tarea automatizada (`cron` en Debian) que ejecutará `mongodump` una vez cada 24 horas, comprimiendo la copia de seguridad y conservando únicamente los últimos 7 respaldos diarios.

## 8.5. Topología de red y relaciones entre dispositivos

> **Estado:** Resuelto y Aprobado (Versión 2.5)

**Planteamiento inicial pendiente:**
> Se debe definir cómo se registrarán las conexiones físicas, quién podrá modificarlas y qué evidencia se considerará suficiente para marcar una relación como confirmada.

**Solución técnica y regla operativa adoptada:**
Para articular la representación gráfica de la infraestructura (relacionada con *Conmutación y Enrutamiento* y *Diseño y Tecnología Multimedia*), se establecen criterios claros para el registro de enlaces, niveles de evidencia y permisos de administración.

### 8.5.1. Glosario Técnico de Conmutación y Representación de Red
- **Topología de red:** Representación estructurada de los elementos de hardware (nodos) y de los medios de transmisión físicos o inalámbricos (enlaces) que interconectan la infraestructura del laboratorio.
- **Tabla CAM / Tabla de direcciones MAC (Content Addressable Memory):** Base de datos interna de los switches de capa 2 que asocia cada dirección MAC aprendida en la red con el puerto físico concreto donde se encuentra conectado el dispositivo.
- **SNMP (Simple Network Management Protocol):** Protocolo estándar de gestión de red que permite consultar a dispositivos administrables (como switches o routers) información sobre el estado de sus interfaces y los dispositivos conectados a cada puerto.
- **Grafo interactivo de nodos:** Estructura visual interactiva en la interfaz web (compuesta por vértices o dispositivos, y aristas o conexiones de red) que permite al operador explorar visualmente la red mediante zoom, desplazamiento y selección.

### 8.5.2. Criterios de Evidencia para Enlaces de Topología

Para cumplir estrictamente con el principio de no falsear la realidad física de la red:

1. **Relación Confirmada (Línea sólida continua en el mapa visual):**
   - **Criterio manual:** El Administrador ingresa o valida el mapeo físico con base en la documentación de cableado estructurado del laboratorio (ejemplo: *"Estación PC-03 conectada al puerto 8 del Switch SW-01"*).
   - **Criterio automático verificado:** Obtenida mediante consulta SNMP a la tabla CAM de un switch administrable donde se constata de forma inequívoca el puerto físico de conexión.
2. **Relación Inferida (Línea discontinua / punteada en el mapa visual):**
   - **Criterio de pertenencia a subred:** Dispositivos que comparten el mismo Gateway predeterminado o segmento IP local (ej. `192.168.50.0/24`), pero de los cuales se desconoce a qué puerto o equipo de capa 2 están conectados físicamente.
   - **Criterio inalámbrico:** Dispositivos clientes conectados a un mismo SSID o Access Point Wi-Fi sin puerto cableado asignado.
   - **Identificación visual obligatoria:** En la interfaz web, todo enlace inferido mostrará una etiqueta explícita de *"Relación inferida (sin confirmación de puerto físico)"* para evitar confusiones diagnósticas.

### 8.5.3. Permisos y Gestión de la Topología

| Rol | Capacidades en el módulo de Topología |
|---|---|
| **Administrador** | • Crear, modificar y desvincular enlaces físicos entre nodos.<br/>• Asignar o cambiar el dispositivo padre (`parentDeviceId`).<br/>• Promover una relación de *Inferida* a *Confirmada* al verificar el parcheo físico.<br/>• Reorganizar y fijar la distribución espacial de los nodos en el lienzo visual. |
| **Operador** | • Navegación y consulta interactiva (zoom, filtros por tipo de host, inspección rápida de IP/MAC/estado al hacer clic).<br/>• No puede alterar enlaces, dependencias ni conexiones físicas. |

### 8.5.4. Estándar de Representación Visual (Diseño Multimedia y Accesibilidad)
- La interfaz implementará un lienzo interactivo basado en librerías estándar en React (como *React Flow*).
- Los nodos representarán el estado del equipo combinando códigos de color estándar con texto legible (conforme al requerimiento RNF-11 de accesibilidad e ISO/IEC 25010):
  - **Verde:** `Disponible` (Up).
  - **Rojo:** `No disponible` (Down).
  - **Naranja:** `Inaccesible` (Unreachable, debido a falla en nodo padre).
  - **Gris:** `Pendiente de verificación` (Pending).
  - **Iconografía diferenciada:** Símbolos específicos para Routers, Switches, Servidores, PCs, Laptops, Celulares e Impresoras.

## 8.6. Canales de notificación y comunicación de alertas

> **Estado:** Resuelto y Aprobado (Versión 2.6)

**Planteamiento inicial pendiente:**
> Se debe decidir si las alertas se comunicarán únicamente dentro de la aplicación o también mediante correo electrónico u otros canales.

**Solución técnica y regla operativa adoptada:**
Para mantener informados a los operadores sin generar saturación innecesaria ni desatención por exceso de avisos (*fatiga de alertas* o *alert fatigue*), se implementa una estrategia de comunicación multicanal diferenciada por severidad.

### 8.6.1. Glosario Técnico de Notificaciones
- **Notificaciones In-App (En la aplicación):** Avisos integrados directamente en la interfaz gráfica del usuario mediante componentes visuales web, sin depender de servicios externos.
- **Toast / Snackbar:** Mensaje emergente y flotante que aparece de forma no intrusiva en una esquina de la pantalla durante unos segundos para alertar al operador sobre un evento reciente y luego desaparece automáticamente sin interrumpir su navegación.
- **Badge / Indicador de estado:** Pequeño círculo o etiqueta numérica que resalta sobre íconos clave (como la campana del menú superior) indicando la cantidad de alertas no revisadas.
- **SMTP (Simple Mail Transfer Protocol):** Protocolo estándar de red que permite al backend de Node.js conectarse a un servidor de correo electrónico para despachar mensajes a las casillas de los administradores.

### 8.6.2. Canal Primario: Notificaciones en Aplicación (Obligatorio)

Todo usuario conectado a la aplicación web recibirá información operativa en tiempo real a través de los siguientes elementos:

1. **Centro de Notificaciones (Bandeja desplegable):**
   - Accesible desde el ícono de campana en la barra superior de la aplicación.
   - Muestra las alertas recientes ordenadas cronológicamente, con insignias de color correspondientes a su severidad (`info` en azul, `warning` en amarillo/naranja, `critical` en rojo).
   - Permite al usuario marcar alertas como leídas o navegar directamente al detalle del dispositivo afectado.
2. **Alertas Emergentes Flotantes (Toasts):**
   - Se disparan de manera inmediata en la interfaz ante cualquier cambio de estado (aparición de nuevo host, caída confirmada o recuperación).
3. **Señal Acústica Opcional (Alerta sonora):**
   - Se emitirá un tono audible breve y discreto **únicamente ante alertas de severidad crítica** (`critical`), para llamar la atención del personal presente en el laboratorio si tienen la pantalla en segundo plano.
   - Cada operador podrá silenciar o activar este sonido de forma independiente en sus preferencias de usuario.

### 8.6.3. Canal Secundario: Correo Electrónico SMTP (Opcional y Restringido)

Para no saturar las bandejas personales de los integrantes del equipo con cientos de correos por caídas cotidianas de computadoras cliente:

1. **Filtro exclusivo por criticidad:** El envío de correos electrónicos estará reservado **única y exclusivamente para alertas críticas de infraestructura (`critical`)**:
   - Caída confirmada del Router / Gateway predeterminado.
   - Caída confirmada de Switches principales o Servidores de red.
   - Alertas de infraestructura compartida generadas por Quórum (> 70% de caídas simultáneas en un segmento).
2. **Configuración administrativa centralizada:**
   - En el módulo de configuración (RF-10), el Administrador podrá habilitar o inhabilitar las notificaciones por correo.
   - Podrá ingresar las credenciales del servidor SMTP (host, puerto, usuario, contraseña segura y correo remitente institucional) y definir las direcciones de destino de los administradores de guardia.

## 8.7. Límites de configuración y personalización segura

> **Estado:** Resuelto y Aprobado (Versión 2.7)

**Planteamiento inicial pendiente:**
> Los valores predeterminados están definidos, pero deberán aprobarse los límites mínimos y máximos permitidos para los intervalos, los tiempos de espera y los umbrales de comprobación.

**Solución técnica y regla operativa adoptada:**
Para brindar máxima flexibilidad al Administrador sin poner en riesgo la estabilidad del servidor Debian ni degradar la red del laboratorio por sobrecarga involuntaria (o saturación tipo DoS), el sistema incorpora un modelo de **personalización libre con barreras de contención inviolables (*guardrails* de seguridad)** y perfiles preconfigurados.

### 8.7.1. Glosario Técnico de Configuración y Control
- **Barreras de contención (*Guardrails* de software):** Restricciones numéricas infranqueables programadas en el código fuente (tanto en el frontend de React como en el backend de Node.js) que impiden a un usuario guardar parámetros absurdos o peligrosos (como hacer ping a 100 máquinas cada medio segundo).
- **Defensa en profundidad en validación:** Principio de seguridad donde la interfaz orienta al usuario y bloquea errores tipográficos, pero la API del servidor vuelve a verificar estrictamente los datos antes de persistirlos en MongoDB, impidiendo que solicitudes manipuladas por herramientas externas eludan los límites.
- **Perfil preconfigurado (*Preset*):** Conjunto coordinado de ajustes óptimos que el usuario puede activar con un solo clic según el escenario operativo del momento.

### 8.7.2. Matriz de Parámetros, Valores por Defecto y Rangos de Seguridad

El Administrador podrá escribir libremente cualquier valor numérico en el panel de configuración, siempre que se ubique dentro de los siguientes límites seguros:

| Parámetro | Valor Predeterminado | Límite Mínimo Seguro | Límite Máximo Seguro | Justificación Técnica del Límite |
|---|---|---|---|---|
| **Intervalo de descubrimiento** | **10 minutos** (600 s) | **2 minutos** (120 s) | **60 minutos** (3600 s) | Un escaneo general con `nmap` o `arp-scan` en menos de 2 minutos genera tormentas de paquetes broadcast que ralentizan la LAN y saturan la CPU del servidor. |
| **Intervalo de ping / disponibilidad** | **30 segundos** | **10 segundos** | **300 segundos** (5 min) | Monitorear en menos de 10 s puede solapar comprobaciones pendientes y agotar los descriptores de sockets del sistema operativo. |
| **Tiempo de espera (Timeout de ping)** | **3 segundos** (3000 ms) | **1 segundo** (1000 ms) | **10 segundos** (10000 ms) | Un timeout menor a 1 s produce falsos positivos en dispositivos Wi-Fi con fluctuación de latencia (*jitter*); más de 10 s demora la cola de monitoreo. |
| **Umbral de fallos para caída** | **3 fallos** consecutivos | **2 fallos** consecutivos | **10 fallos** consecutivos | Un solo fallo es insuficiente (frecuentes pérdidas esporádicas de paquetes ICMP); más de 10 retrasa excesivamente la detección de fallas reales. |
| **Umbral de éxitos para recuperación** | **2 éxitos** consecutivos | **1 éxito** | **5 éxitos** consecutivos | Requiere constatar estabilidad antes de cerrar alertas operativas. |
| **Límite de concurrencia de comprobaciones** | **15 tareas** simultáneas | **5 tareas** | **50 tareas** simultáneas | Cumple con el requerimiento RNF-15 para evitar consumo desmedido de memoria RAM y sockets en el servidor Debian. |

### 8.7.3. Asistencia en la Interfaz y Perfiles Preconfigurados (*Presets*)

Para facilitar la administración, el panel de configuración de React incluirá:

1. **Campos numéricos asistidos:**
   - Cada campo indicará visiblemente su rango seguro admitido y un texto de ayuda (*tooltip*) con la justificación técnica.
   - Si el Administrador escribe un valor menor al mínimo o mayor al máximo, el campo se resaltará en rojo, mostrará un mensaje explicativo (ej. *"El intervalo de ping no puede ser inferior a 10 segundos para proteger la estabilidad de la red"*) y deshabilitará el botón de guardar cambios.
2. **Perfiles de 1 Clic (*Presets* Rápidos):**
   - **Modo Equilibrado (Predeterminado):** Ping cada 30 s, descubrimiento cada 10 min, timeout 3 s. Ideal para la operación cotidiana del laboratorio.
   - **Modo Demostración / Intensivo:** Ping cada 10 s, descubrimiento cada 3 min, timeout 2 s. Diseñado específicamente para presentaciones o evaluaciones universitarias en vivo donde se desconectan y reconectan cables para demostrar detección inmediata ante los docentes.
   - **Modo Ahorro / Baja Carga:** Ping cada 60 s, descubrimiento cada 30 min, timeout 5 s. Para redes lentas o períodos sin clases.
3. **Botón "Restablecer valores predeterminados" (RF-10.05):**
   - Permite revertir cualquier personalización a los valores de fábrica aprobados por la instalación, solicitando confirmación modal y sin borrar el inventario ni los historiales.

### 8.7.4. Validación en Servidor y Auditoría Inmutable
- Si una petición directa a la API (`PUT /api/config`) contiene un valor fuera de los umbrales seguros, el backend rechazará la operación con un error HTTP `400 Bad Request` indicando el parámetro infractor.
- Toda modificación exitosa de parámetros se registrará de forma obligatoria en la colección de auditoría (`audit_logs`), documentando el usuario responsable, la fecha/hora exacta y los valores anteriores y nuevos.

## 8.8. Arquitectura de despliegue y acceso remoto

> **Estado:** Resuelto y Aprobado (Versión 3.0 - Especificación Definitiva Cerrada)

**Planteamiento inicial pendiente:**
> Antes de implementar el acceso remoto se deberá especificar dónde se ejecutará el servicio de monitoreo, cómo accederá a los segmentos de red y qué mecanismo de acceso remoto se utilizará.

**Solución técnica y regla operativa adoptada:**
Para articular la solución con la asignatura de *Infraestructura TI* y asegurar el cumplimiento de la norma de seguridad ISO/IEC 27001 (sin exponer puertos internos ni bases de datos a accesos públicos no autorizados), se define la siguiente arquitectura física y lógica:

### 8.8.1. Glosario Técnico de Infraestructura y Despliegue
- **Servicio del sistema / Daemon de Linux (`systemd`):** Proceso de fondo administrado nativamente por Debian que arranca de forma automática al encender el equipo, se ejecuta desatendido sin depender de una sesión de usuario o terminal abierta, y se reinicia de manera autónoma ante cualquier fallo imprevisto.
- **Proxy Inverso (Nginx):** Servidor web de alto rendimiento que recibe las conexiones entrantes en los puertos HTTP estándar (80 / 443), gestiona la entrega de los archivos estáticos de React y reenvía las solicitudes de API (`/api/*`) y tiempo real hacia el proceso interno de Node.js.
- **VPN (Virtual Private Network) de Acceso Remoto:** Túnel de comunicación cifrado (basado en protocolos modernos como *WireGuard* u *OpenVPN*) que permite a un usuario remoto autenticado conectarse a la red del laboratorio desde su hogar como si estuviera conectado físicamente al switch del aula.
- **Túnel Cifrado Saliente (Cloudflare Tunnel / SSH Reverse Tunnel):** Mecanismo de conexión que inicia una sesión saliente segura desde el servidor Debian hacia una red de entrega autorizada, permitiendo acceder a la interfaz web sin tener que abrir puertos de entrada en el firewall institucional ni requerir una dirección IP pública fija en la universidad.

### 8.8.2. Ubicación y Topología del Servicio de Monitoreo
1. **Ejecución local en Servidor Debian:**
   - El daemon de monitoreo (`monitorDaemon.js`), la API REST de Node.js y la base de datos MongoDB se ejecutarán **de forma local en el servidor físico del laboratorio**.
   - El servidor se conectará por cable Ethernet a un puerto LAN del router de pruebas, con una dirección IPv4 estática fija (ej. `192.168.50.10/24`).
2. **Justificación de acceso en Capa 2 (Conmutación y Enrutamiento):**
   - El descubrimiento de red basado en solicitudes ARP (`arp-scan`) es un protocolo de enlace de datos (capa 2) que no atraviesa routers hacia otras redes externas. Al residir el servidor en la misma LAN física que los clientes de prueba, puede emitir y escuchar paquetes broadcast/ARP y ecos ICMP de forma directa, rápida y sin interferencias de cortafuegos perimetrales.

### 8.8.3. Despliegue de la Aplicación Web
- **Frontend React:** Se compilará en archivos estáticos optimizados (`vite build`) y será servido directamente por **Nginx**.
- **Backend Node.js:** Se ejecutará internamente en un puerto local (ej. `127.0.0.1:5000`) administrado por `systemd` (o `pm2`).
- **Aislamiento de la Base de Datos:** MongoDB (`mongod`) escuchará estrictamente en `127.0.0.1:27017`. Ningún puerto de base de datos se expondrá a la red LAN ni a Internet (RNF-07).

### 8.8.4. Mecanismo de Acceso Remoto Seguro (Fase 2)
Para permitir el acceso seguro de docentes o estudiantes desde fuera de la universidad:
1. **Opción Primaria (VPN con WireGuard en Debian):**
   - El servidor Debian alojará el servicio de VPN WireGuard.
   - El usuario remoto instala el cliente WireGuard con una clave criptográfica autorizada por el Administrador. Al activar la conexión, recibe una IP virtual del laboratorio (ej. `10.8.0.2`) y accede al panel en `http://192.168.50.10`.
2. **Opción de Contingencia Institucional (Túnel Cifrado Seguro):**
   - En caso de que las políticas de seguridad de la red de la ESPOCH restrinjan la apertura de puertos de entrada en el router o exista doble NAT, se desplegará un túnel cifrado saliente (*Cloudflare Zero Trust Tunnel* o *SSH Reverse Tunnel*). Este túnel no requiere abrir puertos en el firewall universitario y autentica al usuario mediante correo institucional antes de otorgarle acceso a la web.

> **Cierre Formal de la Sección 8:** Con la resolución y aprobación de los puntos 8.1 al 8.8, se declara formalmente **Cerrada y Aprobada la Especificación de Requerimientos (Versión 3.0)**, quedando el proyecto plenamente definido para dar inicio a la etapa de desarrollo e implementación del código fuente.

---

# 9. Control de cambios de la especificación

Cualquier cambio posterior deberá documentar:

- El requerimiento afectado.
- La regla anterior.
- La regla nueva.
- El motivo del cambio.
- Los módulos afectados.
- Los criterios de aceptación que deban actualizarse.

Los valores predeterminados de configuración deberán mantenerse diferenciados de los valores actualmente elegidos por el administrador.

La implementación deberá respetar esta especificación aprobada y no introducir cambios de comportamiento silenciosos.

### Historial de cambios

| Versión | Fecha | Sección / Requerimiento afectado | Regla anterior | Regla nueva / Decisión adoptada | Motivo del cambio |
|---|---|---|---|---|---|
| **2.1** | 2026-10-28 | • Secc. 2.4 (Estados de disponibilidad)<br/>• Secc. 8.1 (Correlación de fallos) | Existían solo 3 estados (Pendiente, Disponible, No disponible) y no se especificaba cómo evitar tormentas de alertas ante caídas de switches/routers. | Se añade el estado `Inaccesible` (Unreachable) y se establece el modelo híbrido (Parent-Child para equipos administrables + Quórum de 70% para switches no administrables sin IP). | Evitar tormentas de alertas (alert storms) cuando falla un nodo central, consolidando 1 sola alerta de infraestructura con lista de afectados. |
| **2.2** | 2026-10-28 | • Secc. RF-07.02 (Datos de alerta)<br/>• Secc. 8.2 (Severidad y agrupación) | No estaban definidos los niveles de severidad ni las condiciones de agrupación y apertura de alertas. | Se establecen 3 niveles (`info`, `warning`, `critical`), reglas de deduplicación de fallos continuos, absorción por infraestructura y creación por reincidencia (*flapping*). | Proporcionar una jerarquía clara de prioridades operativas y evitar dispersión o duplicación de alertas en el panel. |
| **2.3** | 2026-10-28 | • Secc. RF-01 (Autenticación)<br/>• Secc. 8.3 (Seguridad de sesiones) | No estaban definidos los tiempos de expiración, el esquema de tokens, la política de invalidación ni los requisitos de contraseña definitiva. | Se define arquitectura dual JWT (Access Token 15m vía Bearer + Refresh Token 8h en cookie HttpOnly), invalidación global ante cambio de clave y política de contraseñas complejas de 8 caracteres. | Garantizar la protección de sesiones contra secuestro y accesos no autorizados, con conceptos pedagógicamente documentados. |
| **2.4** | 2026-10-28 | • Secc. RF-11 (Estadísticas)<br/>• Secc. 8.4 (Retención histórica) | No se definían plazos de retención ni mecanismos de depuración para evitar la saturación del almacenamiento del servidor. | Se establece matriz de retención con TTL indexes en MongoDB (checks 30d, events 90d, sessions 8h), métricas consolidadas por agregación y respaldos automáticos diarios. | Prevenir el desbordamiento de disco en el servidor Debian y articular el análisis de Big Data mediante datos resumidos eficientes. |
| **2.5** | 2026-10-28 | • Secc. RF-08.07 (Topología)<br/>• Secc. 8.5 (Topología de red) | No estaban definidos los criterios de evidencia para confirmar enlaces ni las restricciones de permisos para editar el grafo. | Se definen criterios para relaciones Confirmadas (parcheo/SNMP, línea sólida) e Inferidas (subred/SSID, línea punteada), permisos exclusivos para Administrador y diseño visual accesible (React Flow). | Articular Conmutación y Enrutamiento con Diseño Multimedia, garantizando veracidad topológica y usabilidad. |
| **2.6** | 2026-10-28 | • Secc. RF-07 (Alertas e incidencias)<br/>• Secc. 8.6 (Notificaciones) | No se definían los canales de comunicación de alertas ni los criterios para evitar saturar al operador. | Se establece canal primario In-App (campana con badges, toasts y sonido opcional para críticas) y canal secundario SMTP exclusivo para alertas críticas de infraestructura configurables por admin. | Prevenir la fatiga de alertas (*alert fatigue*) y asegurar comunicación inmediata ante contingencias mayores. |
| **2.7** | 2026-10-28 | • Secc. RF-10 (Configuración)<br/>• Secc. 8.7 (Límites de configuración) | No existían límites mínimos ni máximos de validación, permitiendo teóricamente configuraciones peligrosas o saturantes. | Se establece modelo de personalización libre con *guardrails* seguros duros (backend y frontend), presets de 1 clic (Equilibrado, Demostración, Ahorro) y auditoría inmutable de cambios. | Permitir al administrador ajustar parámetros libremente mientras se protege la red y el servidor contra sobrecargas involuntarias. |
| **3.0** | 2026-10-28 | • Secc. 8.8 (Despliegue y acceso remoto)<br/>• Cierre definitivo de Sección 8 | No estaba definida la ubicación del servicio, el proxy inverso ni los mecanismos de acceso remoto seguro. | Se define ejecución local en Debian con systemd + Nginx, aislamiento de MongoDB en localhost, y acceso remoto seguro mediante VPN WireGuard (primaria) o túnel inverso (contingencia). Cierre formal de requerimientos. | Garantizar la viabilidad técnica en Capa 2 (ARP local), cumplimiento de ISO/IEC 27001 y aprobación total de la especificación para inicio de desarrollo. |
