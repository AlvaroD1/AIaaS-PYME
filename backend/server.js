const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
  // Recibimos todo el contexto del negocio desde la interfaz
  const { mensaje, configuracion, inventario, agenda, fueraDeHorario } =
    req.body;

  try {
    const promptSistema = `
            Eres el asistente virtual de "${configuracion.nombre}".
            Tu estilo de respuesta debe ser amigable, claro y al grano, diseñado para ventas por WhatsApp.

            CONTEXTO DEL NEGOCIO:
            - Tipo de negocio: ${configuracion.tipoNegocio} (Puede ser: productos, servicios, comida, o ambos).
            - Estado actual del tiempo: ${fueraDeHorario ? "FUERA DEL HORARIO LABORAL" : "DENTRO DEL HORARIO LABORAL"}.

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
      model: "gemini-3.5-flash",
      systemInstruction: promptSistema,
    });

    const result = await model.generateContent(mensaje);
    const respuestaIA = result.response.text();

    res.json({ respuesta: respuestaIA });
  } catch (error) {
    console.error("Error con Gemini:", error);

    // Si es el error 503 (Servidores llenos)
    if (error.status === 503) {
      res.json({
        respuesta:
          "🤖 Estoy atendiendo a muchos clientes en este momento. ¿Me podrías repetir tu mensaje en unos segundos, por favor?",
      });
    }
    // Si es el error 429 (Límite de cuota gratuita / envíos muy rápidos)
    else if (error.status === 429) {
      res.json({
        respuesta:
          "🤖¡Vamos muy rápido! Por favor, espera unos 20 segundos antes de enviar el siguiente mensaje.",
      });
    }
    // Cualquier otro error genérico
    else {
      res.status(500).json({
        respuesta:
          "El sistema está en mantenimiento. Intenta de nuevo en un momento.",
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend con Gemini corriendo en http://localhost:${PORT}`),
);
