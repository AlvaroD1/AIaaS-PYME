const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("./config/db");

const app = express();

// Arrays en memoria para pedidos (MVP — no se persisten en DB aún)
let pedidos = [];
let pedidosPendientes = [];

// ── Seguridad Base ───────────────────────────────────────────────
// Oculta headers y previene ataques comunes (XSS, Clickjacking)
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Permite cargar imágenes desde otro puerto en local

// CORS restrictivo (solo permite el frontend)
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Límite del tamaño del body a 1MB para prevenir saturación
app.use(express.json({ limit: "1mb" }));

// Servir la carpeta de imágenes públicamente
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Configuración de Multer (Subida de Imágenes) ────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta destino
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`); // Nombre único
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagen no permitido"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // Límite de 12MB
  fileFilter,
});

// Endpoint de subida
app.post("/api/upload", upload.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen o el formato es incorrecto" });
  }
  // Devolvemos la ruta absoluta de la foto para el MVP local
  res.json({ url: `http://localhost:3000/uploads/${req.file.filename}` });
});

// ── Rate Limiting (Protección contra fuerza bruta/abuso) ────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 peticiones por minuto (por IP)
  message: { error: "Demasiadas peticiones. Por favor, espera un momento." },
  standardHeaders: true,
  legacyHeaders: false,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =====================================================================
// ENDPOINTS CRUD — PRODUCTOS
// =====================================================================

// GET /api/productos — Listar todos los productos de la PYME 1
app.get("/api/productos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE pyme_id = 1 ORDER BY producto_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// POST /api/productos — Crear un producto
app.post("/api/productos", async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock_actual, stock_minimo, foto_url, pyme_id } = req.body;
    const result = await pool.query(
      `INSERT INTO productos (pyme_id, nombre, descripcion, precio, stock_actual, stock_minimo, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [pyme_id || 1, nombre, descripcion || "", precio, stock_actual || 0, stock_minimo || 5, foto_url || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando producto:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT /api/productos/:id — Editar un producto
app.put("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock_actual, foto_url } = req.body;
    const result = await pool.query(
      `UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock_actual = $4, foto_url = $5
       WHERE producto_id = $6 RETURNING *`,
      [nombre, descripcion || "", precio, stock_actual, foto_url || "", id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error editando producto:", err);
    res.status(500).json({ error: "Error al editar producto" });
  }
});

// DELETE /api/productos/:id — Eliminar un producto
app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM productos WHERE producto_id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// =====================================================================
// ENDPOINTS CRUD — EQUIPO MÉDICO
// =====================================================================

// GET /api/equipo — Listar equipo médico de la PYME 1
app.get("/api/equipo", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM equipo_medico WHERE pyme_id = 1 ORDER BY miembro_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo equipo:", err);
    res.status(500).json({ error: "Error al obtener equipo" });
  }
});

// POST /api/equipo — Agregar miembro al equipo
app.post("/api/equipo", async (req, res) => {
  try {
    const { nombre, especialidad } = req.body;
    const result = await pool.query(
      `INSERT INTO equipo_medico (pyme_id, nombre, especialidad)
       VALUES (1, $1, $2) RETURNING *`,
      [nombre, especialidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error agregando miembro:", err);
    res.status(500).json({ error: "Error al agregar miembro" });
  }
});

// DELETE /api/equipo/:id — Eliminar miembro del equipo
app.delete("/api/equipo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM equipo_medico WHERE miembro_id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando miembro:", err);
    res.status(500).json({ error: "Error al eliminar miembro" });
  }
});

// =====================================================================
// ENDPOINTS — HORARIOS
// =====================================================================

// GET /api/horarios — Obtener horarios de la PYME 1
app.get("/api/horarios", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM horarios WHERE pyme_id = 1 ORDER BY horario_id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo horarios:", err);
    res.status(500).json({ error: "Error al obtener horarios" });
  }
});

// PUT /api/horarios — Actualizar horarios (upsert por día)
app.put("/api/horarios", async (req, res) => {
  try {
    const { horarios } = req.body; // Objeto { lunes: { activo, apertura, cierre, ... }, ... }
    const dias = Object.keys(horarios);

    for (const dia of dias) {
      const h = horarios[dia];
      await pool.query(
        `INSERT INTO horarios (pyme_id, dia_semana, activo, apertura, cierre, apertura2, cierre2)
         VALUES (1, $1, $2, $3, $4, $5, $6)
         ON CONFLICT (pyme_id, dia_semana)
         DO UPDATE SET activo = $2, apertura = $3, cierre = $4, apertura2 = $5, cierre2 = $6`,
        [
          dia,
          h.activo,
          h.apertura || null,
          h.cierre || null,
          h.dobleJornada ? (h.apertura2 || null) : null,
          h.dobleJornada ? (h.cierre2 || null) : null,
        ]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error actualizando horarios:", err);
    res.status(500).json({ error: "Error al actualizar horarios" });
  }
});

// =====================================================================
// ENDPOINTS — AGENDA (CITAS)
// =====================================================================

// GET /api/agenda — Listar citas de la PYME 1
app.get("/api/agenda", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.cita_id, c.fecha, c.hora, c.estado, c.miembro_equipo_id,
             cl.nombre AS cliente_nombre, cl.telefono AS cliente_telefono
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.cliente_id
      WHERE c.pyme_id = 1
      ORDER BY c.fecha DESC, c.hora ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo agenda:", err);
    res.status(500).json({ error: "Error al obtener agenda" });
  }
});

// POST /api/agenda — Crear una cita
app.post("/api/agenda", async (req, res) => {
  try {
    const { cliente_nombre, cliente_telefono, servicio, fecha, hora, miembro_equipo_id } = req.body;

    // 1. Buscar o crear cliente
    let clienteId;
    if (cliente_telefono) {
      const existente = await pool.query(
        "SELECT cliente_id FROM clientes WHERE pyme_id = 1 AND telefono = $1",
        [cliente_telefono]
      );
      if (existente.rows.length > 0) {
        clienteId = existente.rows[0].cliente_id;
      } else {
        const nuevo = await pool.query(
          "INSERT INTO clientes (pyme_id, nombre, telefono) VALUES (1, $1, $2) RETURNING cliente_id",
          [cliente_nombre, cliente_telefono]
        );
        clienteId = nuevo.rows[0].cliente_id;
      }
    } else {
      // Sin teléfono, crear cliente genérico
      const nuevo = await pool.query(
        "INSERT INTO clientes (pyme_id, nombre, telefono) VALUES (1, $1, $2) RETURNING cliente_id",
        [cliente_nombre, `temp-${Date.now()}`]
      );
      clienteId = nuevo.rows[0].cliente_id;
    }

    // 2. Buscar producto/servicio si aplica
    let servicioId = null;
    if (servicio) {
      const prod = await pool.query(
        "SELECT producto_id FROM productos WHERE pyme_id = 1 AND LOWER(nombre) = LOWER($1)",
        [servicio]
      );
      if (prod.rows.length > 0) {
        servicioId = prod.rows[0].producto_id;
      }
    }

    // 3. Insertar cita
    const result = await pool.query(
      `INSERT INTO citas (pyme_id, cliente_id, servicio_id, miembro_equipo_id, fecha, hora)
       VALUES (1, $1, $2, $3, $4, $5) RETURNING *`,
      [clienteId, servicioId, miembro_equipo_id || null, fecha, hora]
    );

    // Retornar con datos del cliente
    res.status(201).json({
      ...result.rows[0],
      cliente_nombre,
      cliente_telefono: cliente_telefono || "",
      servicio: servicio || "",
    });
  } catch (err) {
    console.error("Error creando cita:", err);
    res.status(500).json({ error: "Error al crear cita" });
  }
});

// PUT /api/agenda/:id/estado — Cambiar estado de una cita
app.put("/api/agenda/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await pool.query(
      "UPDATE citas SET estado = $1 WHERE cita_id = $2 RETURNING *",
      [estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando cita:", err);
    res.status(500).json({ error: "Error al actualizar cita" });
  }
});

// =====================================================================
// ENDPOINTS — NOTIFICACIONES (ALERTAS)
// =====================================================================

// GET /api/notificaciones — Listar alertas de la PYME 1
app.get("/api/notificaciones", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM alertas WHERE pyme_id = 1 ORDER BY fecha_creacion DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo notificaciones:", err);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

// PUT /api/notificaciones/marcar-leidas — Marcar todas como leídas
app.put("/api/notificaciones/marcar-leidas", async (req, res) => {
  try {
    await pool.query("UPDATE alertas SET leida = TRUE WHERE pyme_id = 1 AND leida = FALSE");
    res.json({ ok: true });
  } catch (err) {
    console.error("Error marcando notificaciones:", err);
    res.status(500).json({ error: "Error al marcar notificaciones" });
  }
});

// =====================================================================
// ENDPOINT — CHAT CON GEMINI
// =====================================================================

app.post("/api/chat", chatLimiter, async (req, res) => {
  // Recibimos todo el contexto del negocio desde la interfaz
  const { mensaje, configuracion, inventario, equipo, agenda, horario, historial, fueraDeHorario } =
    req.body;

  try {
    // Vocabulario según sector
    const tipo = configuracion.tipoNegocio;
    let contextoSector = "";

    if (tipo === "salud") {
      const subTipo = configuracion.subTipoSalud;

      if (subTipo === "veterinaria") {
        contextoSector = `
CONTEXTO DE SECTOR – VETERINARIA:
- Este es un centro veterinario. Atienden mascotas.
- El "inventario" incluye TANTO PRODUCTOS (comida, accesorios, medicinas) COMO SERVICIOS (consultas, peluquería, vacunas).
- Si el usuario pide comprar un producto físico, manéjalo como un pedido y descuenta del "stock".
- Si el usuario quiere una consulta/servicio, manéjalo como una CITA, preguntando el motivo, nombre de la mascota y fecha/hora.
- La "agenda" son las citas ya ocupadas. NO ofrezcas esas horas.
- Para confirmar la venta de productos físicos, usa el bloque [PEDIDO_CONFIRMADO].
- Para confirmar citas médicas/veterinarias, usa el bloque EXACTO:
  [CITA_CONFIRMADA]{"cliente":"Nombre Mascota/Dueño","fecha":"YYYY-MM-DD","hora":"HH:MM","servicio":"Consulta"}[/CITA_CONFIRMADA]
`;
      } else {
        contextoSector = `
CONTEXTO DE SECTOR – CONSULTORIO ${subTipo === "dentista" ? "DENTAL" : "MÉDICO"}:
- Este es un consultorio ${subTipo === "dentista" ? "dental" : "médico"}. Atiendes pacientes.
- El "inventario" representa los SERVICIOS Y PROCEDIMIENTOS disponibles (consultas, chequeos). NO vendes productos físicos ni medicamentos, solo ofreces servicios y emites recetas si aplica.
- ATENCIÓN CON LOS PRECIOS: Los precios listados son referenciales. Muchos médicos atienden a pacientes de bajos recursos, por lo que el precio final puede variar o incluso ser $0.00 (gratuito). Maneja el tema económico con empatía y flexibilidad.
- Cuentas con un "equipo médico": ${equipo && equipo.length > 0 ? JSON.stringify(equipo) : "Doctores generales"}. Ofrece citas con los profesionales registrados según su especialidad.
- La "agenda" son las citas ya ocupadas. NO ofrezcas esas horas.
- Usa vocabulario médico apropiado: "cita", "consulta", "paciente", "doctor/a".
- Siempre pregunta: motivo de consulta, fecha y hora deseada, especialista preferido, y nombre del paciente.
- Si la hora está ocupada, ofrece alternativas disponibles.
- Para confirmar una cita médica, usa el bloque EXACTO al final de tu mensaje:
  [CITA_CONFIRMADA]{"cliente":"Nombre Paciente","fecha":"YYYY-MM-DD","hora":"HH:MM","servicio":"Especialidad/Consulta"}[/CITA_CONFIRMADA]
`;
      }
    } else if (tipo === "academia") {
      contextoSector = `
CONTEXTO DE SECTOR – ACADEMIA / EDUCACIÓN:
- Este es un centro educativo. El "inventario" representa el CATÁLOGO DE CURSOS/TALLERES disponibles. El campo "stock" indica los CUPOS disponibles.
- La "agenda" son los horarios de clases ya ocupados.
- En lugar de "pedidos", se manejan INSCRIPCIONES. Usa vocabulario educativo: "curso", "taller", "inscripción", "estudiante", "cupos".
- Cuando alguien pregunte qué hay disponible, ofrece los cursos con su precio y cupos restantes.
- Si un curso no tiene cupos (stock = 0), informa que está lleno y ofrece alternativas o lista de espera.
- Para confirmar una inscripción a un curso, usa el bloque EXACTO:
  [CITA_CONFIRMADA]{"cliente":"Nombre Estudiante","fecha":"YYYY-MM-DD","hora":"HH:MM","servicio":"Nombre del Curso"}[/CITA_CONFIRMADA]
`;
    }

    let horarioTexto = "No definido";
    if (horario) {
      horarioTexto = Object.entries(horario)
        .filter(([dia, config]) => config.activo)
        .map(([dia, config]) => {
          let horas = `${config.apertura} a ${config.cierre}`;
          if (config.apertura2 && config.cierre2) {
            horas += ` y ${config.apertura2} a ${config.cierre2}`;
          }
          return `${dia.charAt(0).toUpperCase() + dia.slice(1)}: ${horas}`;
        })
        .join("\n- ");
    }

    const vendeProductosFisicos = ["productos", "restaurante", "mixto"].includes(tipo) || (tipo === "salud" && configuracion.subTipoSalud === "veterinaria");
    const vendeServicios = ["servicios", "mixto", "salud", "academia"].includes(tipo);

    const promptSistema = `
Eres el asistente virtual de "${configuracion.nombre}".
Tu estilo de respuesta debe ser amigable, claro y al grano, diseñado para ventas por WhatsApp.

${contextoSector}

            CONTEXTO DEL NEGOCIO:
            - Tipo de negocio: ${configuracion.tipoNegocio} (Puede ser: productos, servicios, comida, o ambos).
            - Estado actual del tiempo: ${fueraDeHorario ? "FUERA DEL HORARIO LABORAL" : "DENTRO DEL HORARIO LABORAL"}.
            - Horario de atención:
            - ${horarioTexto}

            DATOS OPERATIVOS:
            - Inventario/Menú actual: ${JSON.stringify(inventario)}
            - Agenda de citas ocupadas: ${JSON.stringify(agenda)}

            REGLAS ESTRICTAS DE COMPORTAMIENTO:
            1. REGLA DE HORARIO (CRÍTICA): Si el estado es 'FUERA DEL HORARIO LABORAL' y el cliente intenta hacer un pedido o reservar, DEBES detener la conversación y responder EXACTAMENTE con esta frase adaptada: "Estás a punto de realizar un pedido fuera de nuestras horas de trabajo. Tu solicitud será atendida en orden de llegada al día siguiente. Tu número de turno es el #${Math.floor(Math.random() * 100) + 10}. ¿Deseas continuar con tu pedido?".
            2. REGLA DE COMIDA: Si el tipo de negocio incluye 'comida' y el cliente pide más de 20 platos/unidades, advierte amablemente que los pedidos grandes requieren validación manual del local por temas de preparación.
            3. REGLA DE SERVICIOS: Si ofrecen servicios (ej. barbería, salón), pide al cliente la fecha y hora que desea, revisa la "Agenda de citas ocupadas" y si la hora choca, ofrécele una hora distinta.
            4. REGLA DE INVENTARIO: Solo puedes vender lo que haya en stock. Si piden algo que no hay, ofrece alternativas.
        `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: promptSistema,
    });

    // Construir historial para Gemini a partir del historial del frontend
    const geminiHistory = [];
    if (historial && historial.length > 0) {
      for (const msg of historial) {
        geminiHistory.push({
          role: msg.remitente === "user" ? "user" : "model",
          parts: [{ text: msg.texto }],
        });
      }
    }

    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(mensaje);
    const respuestaIA = result.response.text();

    res.json({ respuesta: respuestaIA });
  } catch (error) {
    console.error("Error con Gemini:", error);

    if (error.status === 503) {
      res.json({
        respuesta:
          "🤖 Estoy atendiendo a muchos clientes en este momento. ¿Me podrías repetir tu mensaje en unos segundos, por favor?",
      });
    } else if (error.status === 429) {
      res.json({
        respuesta:
          "🤖¡Vamos muy rápido! Por favor, espera unos 20 segundos antes de enviar el siguiente mensaje.",
      });
    } else {
      res.status(500).json({
        respuesta:
          "El sistema está en mantenimiento. Intenta de nuevo en un momento.",
      });
    }
  }
});

// ── Endpoints de pedidos confirmados ───────────────────────────────
app.get("/api/pedidos", (req, res) => {
  res.json({ pedidos });
});

app.post("/api/pedidos", (req, res) => {
  const pedido = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    ...req.body,
  };
  pedidos.push(pedido);
  console.log("📦 Nuevo pedido registrado:", pedido);
  res.status(201).json({ pedido });
});

// ── Endpoints de pedidos pendientes de validación ──────────────────
app.get("/api/pedidos-pendientes", (req, res) => {
  res.json({ pedidosPendientes });
});

app.post("/api/pedidos-pendientes", (req, res) => {
  const pedido = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    estado: "pendiente",
    ...req.body,
  };
  pedidosPendientes.push(pedido);
  console.log("⏳ Pedido pendiente de validación:", pedido);
  res.status(201).json({ pedido });
});

app.put("/api/pedidos-pendientes/:id/validar", (req, res) => {
  const { id } = req.params;
  const { aprobado, motivoRechazo } = req.body;
  const idx = pedidosPendientes.findIndex(p => p.id === Number(id));

  if (idx === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  pedidosPendientes[idx].estado = aprobado ? "aprobado" : "rechazado";
  pedidosPendientes[idx].motivoRechazo = motivoRechazo || "";
  pedidosPendientes[idx].fechaValidacion = new Date().toISOString();

  // Si fue aprobado, moverlo también a pedidos confirmados
  if (aprobado) {
    pedidos.push({
      ...pedidosPendientes[idx],
    });
  }

  console.log(`${aprobado ? "✅" : "❌"} Pedido ${id} ${aprobado ? "aprobado" : "rechazado"}`);
  res.json({ pedido: pedidosPendientes[idx] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend con Gemini corriendo en http://localhost:${PORT}`),
);
