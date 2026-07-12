-- =====================================================================
-- AIaaS PYME — Esquema de Base de Datos (PostgreSQL)
-- Traducido de MySQL y actualizado con los nuevos requerimientos
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PYMES
-- ---------------------------------------------------------------------
CREATE TABLE pymes (
    pyme_id         BIGSERIAL PRIMARY KEY,
    nombre_negocio  VARCHAR(150) NOT NULL,
    ruc             VARCHAR(13)  NOT NULL UNIQUE,
    sector          VARCHAR(50) NOT NULL DEFAULT 'otro' 
                    CHECK (sector IN ('tienda_abarrotes','restaurante','servicios_limpieza','moda_online','consultorio_salud','academia','otro')),
    subtipo_salud   VARCHAR(50) 
                    CHECK (subtipo_salud IN ('medico','dentista','veterinaria', NULL)),
    ciudad          VARCHAR(80),
    telefono        VARCHAR(20),
    email_contacto  VARCHAR(120),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          VARCHAR(20) NOT NULL DEFAULT 'activo' 
                    CHECK (estado IN ('activo','suspendido','baja'))
);

-- ---------------------------------------------------------------------
-- 1.1 HORARIOS (NUEVO - Soporte para doble jornada)
-- ---------------------------------------------------------------------
CREATE TABLE horarios (
    horario_id      BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    dia_semana      VARCHAR(15) NOT NULL CHECK (dia_semana IN ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
    activo          BOOLEAN NOT NULL DEFAULT FALSE,
    apertura        TIME,
    cierre          TIME,
    apertura2       TIME,
    cierre2         TIME,
    UNIQUE(pyme_id, dia_semana)
);

-- ---------------------------------------------------------------------
-- 1.2 EQUIPO MÉDICO (NUEVO)
-- ---------------------------------------------------------------------
CREATE TABLE equipo_medico (
    miembro_id      BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    especialidad    VARCHAR(150) NOT NULL,
    fecha_registro  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. USUARIOS Y ROLES
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    usuario_id      BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    nombre          VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20) NOT NULL DEFAULT 'administrador' CHECK (rol IN ('administrador','vendedor','contador')),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_login    TIMESTAMP,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo'))
);

-- ---------------------------------------------------------------------
-- 3. SUSCRIPCIONES / PLANES
-- ---------------------------------------------------------------------
CREATE TABLE planes (
    plan_id         SERIAL PRIMARY KEY,
    nombre_plan     VARCHAR(50) NOT NULL,
    precio_mensual  DECIMAL(8,2) NOT NULL,
    max_agentes     INT NOT NULL DEFAULT 1,
    descripcion     VARCHAR(255)
);

CREATE TABLE suscripciones (
    suscripcion_id  BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    plan_id         INT NOT NULL REFERENCES planes(plan_id),
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE,
    estado          VARCHAR(20) NOT NULL DEFAULT 'prueba' CHECK (estado IN ('prueba','activa','vencida','cancelada')),
    dias_prueba     INT NOT NULL DEFAULT 14
);

-- ---------------------------------------------------------------------
-- 4. AGENTES DE IA
-- ---------------------------------------------------------------------
CREATE TABLE plantillas_sector (
    plantilla_id    SERIAL PRIMARY KEY,
    sector          VARCHAR(50) NOT NULL,
    nombre_plantilla VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(255)
);

CREATE TABLE agentes (
    agente_id       BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    plantilla_id    INT REFERENCES plantillas_sector(plantilla_id),
    nombre_agente   VARCHAR(80) NOT NULL DEFAULT 'Asistente',
    tono            VARCHAR(20) NOT NULL DEFAULT 'informal' CHECK (tono IN ('formal','informal')),
    mensaje_saludo  VARCHAR(255),
    avatar_url      VARCHAR(255),
    estado          VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','mantenimiento')),
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flujos_conversacion (
    flujo_id        BIGSERIAL PRIMARY KEY,
    agente_id       BIGINT NOT NULL REFERENCES agentes(agente_id) ON DELETE CASCADE,
    nombre_flujo    VARCHAR(120) NOT NULL,
    trigger_texto   VARCHAR(255),
    respuesta       TEXT NOT NULL,
    orden           INT DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 5. CANALES Y CLIENTES
-- ---------------------------------------------------------------------
CREATE TABLE clientes (
    cliente_id      BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    nombre          VARCHAR(120),
    telefono        VARCHAR(20),
    canal_origen    VARCHAR(20) NOT NULL DEFAULT 'whatsapp' CHECK (canal_origen IN ('whatsapp','instagram','facebook','web')),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_interaccion TIMESTAMP,
    UNIQUE (pyme_id, telefono)
);

-- ---------------------------------------------------------------------
-- 6. CONVERSACIONES Y MENSAJES
-- ---------------------------------------------------------------------
CREATE TABLE conversaciones (
    conversacion_id BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    cliente_id      BIGINT NOT NULL REFERENCES clientes(cliente_id),
    agente_id       BIGINT NOT NULL REFERENCES agentes(agente_id),
    canal           VARCHAR(20) NOT NULL CHECK (canal IN ('whatsapp','instagram','facebook','web')),
    estado          VARCHAR(20) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta','escalada','cerrada')),
    sentimiento     VARCHAR(20) CHECK (sentimiento IN ('positivo','neutral','negativo')),
    fecha_inicio    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre    TIMESTAMP
);

CREATE TABLE mensajes (
    mensaje_id      BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT NOT NULL REFERENCES conversaciones(conversacion_id) ON DELETE CASCADE,
    remitente       VARCHAR(20) NOT NULL CHECK (remitente IN ('cliente','agente_ia','humano')),
    contenido       TEXT NOT NULL,
    fecha_envio     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tiempo_respuesta_ms INT
);

-- ---------------------------------------------------------------------
-- 7. PRODUCTOS / INVENTARIO / SERVICIOS
-- ---------------------------------------------------------------------
CREATE TABLE productos (
    producto_id     BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    sku             VARCHAR(50),
    nombre          VARCHAR(150) NOT NULL,
    descripcion     VARCHAR(255),
    precio          DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_actual    INT NOT NULL DEFAULT 0,
    stock_minimo    INT NOT NULL DEFAULT 5,
    foto_url        VARCHAR(255),
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pyme_id, sku)
);

-- ---------------------------------------------------------------------
-- 8. VENTAS / CITAS
-- ---------------------------------------------------------------------
CREATE TABLE ventas (
    venta_id        BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    cliente_id      BIGINT NOT NULL REFERENCES clientes(cliente_id),
    conversacion_id BIGINT REFERENCES conversaciones(conversacion_id),
    fecha_venta     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado          VARCHAR(20) NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada','anulada','pendiente')),
    comprobante_url VARCHAR(255)
);

CREATE TABLE venta_detalle (
    detalle_id      BIGSERIAL PRIMARY KEY,
    venta_id        BIGINT NOT NULL REFERENCES ventas(venta_id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES productos(producto_id),
    cantidad        INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- NUEVA TABLA: CITAS (Para agendamiento médico, academia, servicios)
CREATE TABLE citas (
    cita_id         BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    cliente_id      BIGINT NOT NULL REFERENCES clientes(cliente_id),
    servicio_id     BIGINT REFERENCES productos(producto_id),
    miembro_equipo_id BIGINT REFERENCES equipo_medico(miembro_id),
    fecha           DATE NOT NULL,
    hora            TIME NOT NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'agendada' CHECK (estado IN ('agendada','completada','cancelada')),
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 9. ALERTAS
-- ---------------------------------------------------------------------
CREATE TABLE alertas (
    alerta_id       BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    tipo            VARCHAR(50) NOT NULL CHECK (tipo IN ('stock_minimo','consulta_urgente','venta_confirmada','respaldo_fallido')),
    referencia_id    BIGINT,
    mensaje         VARCHAR(255) NOT NULL,
    leida           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 10. REPORTES
-- ---------------------------------------------------------------------
CREATE TABLE reportes (
    reporte_id      BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    tipo            VARCHAR(50) NOT NULL CHECK (tipo IN ('ventas','inventario','atencion_cliente')),
    periodo_inicio  DATE NOT NULL,
    periodo_fin     DATE NOT NULL,
    archivo_url     VARCHAR(255),
    formato         VARCHAR(20) NOT NULL DEFAULT 'pdf' CHECK (formato IN ('pdf','excel')),
    fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 11. RESPALDOS
-- ---------------------------------------------------------------------
CREATE TABLE respaldos (
    respaldo_id     BIGSERIAL PRIMARY KEY,
    pyme_id         BIGINT NOT NULL REFERENCES pymes(pyme_id) ON DELETE CASCADE,
    fecha_respaldo  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          VARCHAR(20) NOT NULL CHECK (estado IN ('exitoso','fallido')),
    tamano_mb       DECIMAL(10,2)
);

-- =====================================================================
-- ÍNDICES
-- =====================================================================
CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id, fecha_envio);
CREATE INDEX idx_conversaciones_pyme_estado ON conversaciones(pyme_id, estado);
CREATE INDEX idx_productos_stock ON productos(pyme_id, stock_actual);
CREATE INDEX idx_ventas_pyme_fecha ON ventas(pyme_id, fecha_venta);
CREATE INDEX idx_citas_pyme_fecha ON citas(pyme_id, fecha);
CREATE INDEX idx_alertas_pyme_leida ON alertas(pyme_id, leida);

-- =====================================================================
-- DATOS SEMILLA
-- =====================================================================
INSERT INTO planes (nombre_plan, precio_mensual, max_agentes, descripcion) VALUES
('Básico',   29.00, 1, 'Un agente activo, ideal para iniciar'),
('Estándar', 59.00, 3, 'Hasta 3 agentes activos'),
('Premium',  149.00, 6, 'Hasta 6 agentes activos con soporte prioritario');

INSERT INTO plantillas_sector (sector, nombre_plantilla, descripcion) VALUES
('tienda_abarrotes',    'Tienda de Abarrotes',      'Consultas de precio, stock y pedidos'),
('restaurante',         'Restaurante',              'Pedidos, menú y reservas'),
('servicios_limpieza',  'Servicios de Limpieza',    'Coordinación de citas y cotizaciones'),
('moda_online',         'Moda Online',              'Catálogo, tallas y seguimiento de pedido'),
('consultorio_salud',   'Consultorio de Salud',     'Agendamiento de citas y recordatorios'),
('academia',            'Academia/Curso',           'Inscripciones e información de cursos');
