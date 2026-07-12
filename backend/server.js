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

// ── Almacén en memoria ─────────────────────────────────────────────
let pedidos = [];
let pedidosPendientes = [];

// ── Endpoints de Base de Datos (PostgreSQL) ─────────────────────────

// Obtener todos los productos de una pyme
app.get("/api/productos", async (req, res) => {
  const pymeId = req.query.pyme_id || 1; // Por defecto PYME 1 en el MVP
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE pyme_id = $1 ORDER BY fecha_creacion DESC",
      [pymeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Crear un producto
app.post("/api/productos", async (req, res) => {
  const { nombre, descripcion, precio, stock_actual, stock_minimo, foto_url, pyme_id = 1 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO productos (pyme_id, nombre, descripcion, precio, stock_actual, stock_minimo, foto_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [pyme_id, nombre, descripcion, precio || 0, stock_actual || 0, stock_minimo || 5, foto_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Actualizar un producto
app.put("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock_actual, foto_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos 
       SET nombre = $1, descripcion = $2, precio = $3, stock_actual = $4, foto_url = $5 
       WHERE producto_id = $6 RETURNING *`,
      [nombre, descripcion, precio, stock_actual, foto_url || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Eliminar un producto
app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM productos WHERE producto_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado", deleted: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ── Equipo Médico ───────────────────────────────────────────────────
app.get("/api/equipo", async (req, res) => {
  const pymeId = req.query.pyme_id || 1;
  try {
    const result = await pool.query("SELECT * FROM equipo_medico WHERE pyme_id = $1 ORDER BY miembro_id ASC", [pymeId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.post("/api/equipo", async (req, res) => {
  const { nombre, especialidad, pyme_id = 1 } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO equipo_medico (pyme_id, nombre, especialidad) VALUES ($1, $2, $3) RETURNING *",
      [pyme_id, nombre, especialidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.delete("/api/equipo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM equipo_medico WHERE miembro_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Miembro no encontrado" });
    res.json({ message: "Eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ── Horarios ────────────────────────────────────────────────────────
app.get("/api/horarios", async (req, res) => {
  const pymeId = req.query.pyme_id || 1;
  try {
    const result = await pool.query("SELECT * FROM horarios WHERE pyme_id = $1", [pymeId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.put("/api/horarios", async (req, res) => {
  const { pyme_id = 1, horarios } = req.body;
  // horarios es un objeto { lunes: { activo, apertura, cierre, dobleJornada... }, martes: ... }
  try {
    // Usamos una transacción para actualizar toda la semana de forma segura
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [dia, data] of Object.entries(horarios)) {
        await client.query(`
          INSERT INTO horarios (pyme_id, dia_semana, activo, apertura, cierre, apertura2, cierre2)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT ON CONSTRAINT horarios_pyme_id_dia_semana_key 
          DO UPDATE SET 
            activo = EXCLUDED.activo, apertura = EXCLUDED.apertura, cierre = EXCLUDED.cierre, 
            apertura2 = EXCLUDED.apertura2, cierre2 = EXCLUDED.cierre2
        `, [
          pyme_id, dia, data.activo, 
          data.apertura || "08:00", data.cierre || "18:00", 
          data.dobleJornada ? (data.apertura2 || "14:00") : null, 
          data.dobleJornada ? (data.cierre2 || "18:00") : null
        ]);
      }
      await client.query("COMMIT");
      res.json({ message: "Horarios actualizados correctamente" });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error guardando horarios:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ── Agenda (Citas) ──────────────────────────────────────────────────
app.get("/api/agenda", async (req, res) => {
  const pymeId = req.query.pyme_id || 1;
  try {
    // Unimos citas con clientes
    const result = await pool.query(`
      SELECT c.*, cl.nombre as cliente_nombre, cl.telefono as cliente_telefono
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.cliente_id
      WHERE c.pyme_id = $1
      ORDER BY c.fecha ASC, c.hora ASC
    `, [pymeId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.post("/api/agenda", async (req, res) => {
  const { cliente_nombre, cliente_telefono, servicio, miembro_equipo_id, fecha, hora, pyme_id = 1 } = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      // 1. Crear o buscar cliente (por nombre para MVP, idealmente por teléfono)
      let clienteId = null;
      if (cliente_nombre) {
        const clienteRes = await client.query(
          "INSERT INTO clientes (pyme_id, nombre, telefono) VALUES ($1, $2, $3) RETURNING cliente_id",
          [pyme_id, cliente_nombre, cliente_telefono || ""]
        );
        clienteId = clienteRes.rows[0].cliente_id;
      }

      // 2. Crear cita
      // Nota: servicio_id es bigint, para MVP permitimos null si no hay un servicio referenciado, 
      // o guardamos el nombre del servicio en una columna de texto si fuera necesario. 
      // Por simplicidad, dejaremos servicio_id en null para el MVP ya que el campo de tabla es opcional (bigint, sin foreign key estricta o podemos dejarlo null).
      const citaRes = await client.query(`
        INSERT INTO citas (pyme_id, cliente_id, miembro_equipo_id, fecha, hora, estado)
        VALUES ($1, $2, $3, $4, $5, 'agendada') RETURNING *
      `, [pyme_id, clienteId, miembro_equipo_id || null, fecha, hora]);

      await client.query("COMMIT");
      
      // Retornar la cita con el nombre del cliente pegado (para el frontend)
      const cita = citaRes.rows[0];
      cita.cliente_nombre = cliente_nombre;
      cita.cliente_telefono = cliente_telefono;
      cita.servicio = servicio; // Mocked para el frontend
      
      res.status(201).json(cita);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creando cita:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.put("/api/agenda/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'confirmada', 'cancelada', 'completada'
  try {
    const result = await pool.query(
      "UPDATE citas SET estado = $1 WHERE cita_id = $2 RETURNING *",
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ── Notificaciones (Alertas) ────────────────────────────────────────
app.get("/api/notificaciones", async (req, res) => {
  const pymeId = req.query.pyme_id || 1;
  try {
    const result = await pool.query("SELECT * FROM alertas WHERE pyme_id = $1 ORDER BY fecha_creacion DESC LIMIT 50", [pymeId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.put("/api/notificaciones/marcar-leidas", async (req, res) => {
  const pymeId = req.body.pyme_id || 1;
  try {
    await pool.query("UPDATE alertas SET leida = true WHERE pyme_id = $1 AND leida = false", [pymeId]);
    res.json({ message: "Notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ── Endpoint de chat ───────────────────────────────────────────────
app.post("/api/chat", chatLimiter, async (req, res) => {
  const { mensaje, configuracion, inventario, equipo, agenda, horario, fueraDeHorario, historial } =
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

CONTEXTO DEL NEGOCIO:
- Tipo de negocio: ${tipo} (Puede ser: productos, servicios, restaurante, salud, academia, o mixto).
- Estado actual del tiempo: ${fueraDeHorario ? "FUERA DEL HORARIO LABORAL" : "DENTRO DEL HORARIO LABORAL"}.
${contextoSector}
DATOS OPERATIVOS:
- Horario de atención del negocio:
- ${horarioTexto}
- Inventario/Menú/Catálogo actual: ${JSON.stringify(inventario)}
- Agenda de citas ocupadas: ${JSON.stringify(agenda)}

REGLAS ESTRICTAS DE COMPORTAMIENTO:

1. REGLA DE HORARIO (CRÍTICA):
   - Si el estado es 'FUERA DEL HORARIO LABORAL' y el cliente intenta hacer un pedido o reservar POR PRIMERA VEZ en la conversación, responde advirtiendo que está fuera de horario y que su solicitud será atendida en orden de llegada al día siguiente, asigna un número de turno aleatorio, y pregunta "¿Deseas continuar con tu solicitud?".
   - IMPORTANTE: Si el cliente YA FUE advertido sobre el horario y responde afirmativamente, NO repitas la advertencia. Procede normalmente.

${vendeProductosFisicos ? `2. REGLA DE PEDIDOS GRANDES (CRÍTICA):
   Si el tipo de negocio incluye 'comida' o 'restaurante' y el cliente pide más de 20 platos/unidades en TOTAL:
   a) NO confirmes el pedido directamente.
   b) Responde amablemente explicando que los pedidos de más de 20 unidades requieren validación manual.
   c) Al FINAL de tu respuesta, agrega un bloque con el siguiente formato EXACTO:
      [PEDIDO_PENDIENTE]{"items":[{"nombre":"Nombre","cantidad":25,"precioUnitario":10.00}],"total":250.00,"motivo":"Pedido grande: más de 20 unidades"}[/PEDIDO_PENDIENTE]
   d) NO uses el bloque [PEDIDO_CONFIRMADO] para estos pedidos.` : ""}

${vendeServicios ? `3. REGLA DE SERVICIOS Y HORARIOS: 
   - Revisa el "Horario de atención del negocio". NO puedes agendar citas fuera de este horario ni en días en los que el negocio está cerrado (no activos).
   - Pide al cliente la fecha y hora que desea, revisa la "Agenda de citas ocupadas" y comprueba que la hora solicitada esté DENTRO del horario de atención para ese día.
   - Si la hora choca con otra cita, o está fuera del horario de atención, explícale el horario de apertura al cliente y ofrécele una hora distinta.
   - Al confirmar una cita/servicio, usa SIEMPRE el bloque [CITA_CONFIRMADA] y NUNCA [PEDIDO_CONFIRMADO].
   Formato: [CITA_CONFIRMADA]{"cliente":"Nombre","fecha":"YYYY-MM-DD","hora":"HH:MM","servicio":"Nombre Servicio"}[/CITA_CONFIRMADA]` : ""}

4. REGLA DE INVENTARIO: Solo puedes vender/ofrecer lo que haya en tu catálogo (productos o servicios). Si piden algo que no hay, ofrece alternativas. Si el cliente pide una foto de un producto, revisa si el catálogo incluye una 'foto_url' y entrégala; si no, indícale amablemente que no cuentas con fotos de momento.

${vendeProductosFisicos ? `5. REGLA DE CONFIRMACIÓN DE PRODUCTOS/COMIDA (MUY IMPORTANTE):
   Cuando el cliente confirme la compra de PRODUCTOS FÍSICOS o COMIDA y el total sea de 20 unidades o menos, debes:
   a) Responder con un mensaje amigable confirmando el pedido con el detalle.
   b) Al FINAL de tu respuesta, agregar en una línea aparte un bloque con el siguiente formato EXACTO (sin espacios extra):
      [PEDIDO_CONFIRMADO]{"items":[{"nombre":"Nombre del producto","cantidad":1,"precioUnitario":10.00}],"total":10.00}[/PEDIDO_CONFIRMADO]
   c) El bloque debe contener TODOS los productos confirmados con su cantidad y precio.
   d) El "total" debe ser la suma correcta de (cantidad * precioUnitario) de todos los items.
   e) Los precios deben tomarse del inventario proporcionado.
   f) Este bloque es OBLIGATORIO cada vez que se confirme un pedido físico.` : ""}
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
