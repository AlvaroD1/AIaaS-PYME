// src/components/simulador/Simulador.jsx
import { useState } from "react";
import { Send, Wifi, WifiOff, Link } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Button } from "../ui/Button";
import { WhatsAppConnectModal } from "./WhatsAppConnectModal";

export function Simulador() {
  const { state } = useNegocio();
  const { agente, negocio, inventario, agenda, horario } = state;
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([
    { remitente: "bot", texto: agente.saludo || "¡Hola! ¿En qué te ayudo hoy?" },
  ]);
  const [cargando, setCargando] = useState(false);
  const [connectModal, setConnectModal] = useState(false);

  const ahora = new Date();
  const diaActual = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"][ahora.getDay()];
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
  const horarioDia = horario[diaActual];
  function timeToMin(t) { const [h,m] = t.split(":").map(Number); return h*60+m; }
  const enHorario = horarioDia?.activo
    ? horaActual >= timeToMin(horarioDia.apertura) && horaActual <= timeToMin(horarioDia.cierre)
    : false;

  async function enviarMensaje(e) {
    e.preventDefault();
    if (!mensaje.trim()) return;
    const nuevoHistorial = [...historial, { remitente: "user", texto: mensaje }];
    setHistorial(nuevoHistorial);
    setMensaje("");
    setCargando(true);

    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje,
          configuracion: { ...negocio, nombreAgente: agente.nombre, tono: agente.tono },
          inventario,
          agenda,
          fueraDeHorario: !enHorario,
        }),
      });
      const data = await res.json();
      setHistorial(prev => [...prev, { remitente: "bot", texto: data.respuesta }]);
    } catch {
      setHistorial(prev => [...prev, { remitente: "bot", texto: "⚠️ Backend no disponible. Asegúrate de que el servidor esté corriendo." }]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enHorario
            ? <><Wifi size={16} className="text-green-600" /><span className="text-xs text-green-600 font-medium">En horario</span></>
            : <><WifiOff size={16} className="text-gray-400" /><span className="text-xs text-gray-400">Fuera de horario</span></>
          }
        </div>
        <Button size="sm" variant="secondary" onClick={() => setConnectModal(true)}>
          <Link size={14} /> Conectar WhatsApp
        </Button>
      </div>

      {/* Chat mock */}
      <div className="w-full max-w-md h-[600px] flex flex-col bg-[#efeae2] rounded-2xl overflow-hidden shadow-xl">
        {/* WA Header */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#075e54] font-bold text-sm">{(agente.nombre || "A")[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-sm">{agente.nombre}</p>
            <p className="text-xs opacity-80">{negocio.nombre}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
          {historial.map((msg, i) => (
            <div key={i} className={`flex ${msg.remitente === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-xl max-w-[80%] text-sm shadow-sm leading-relaxed ${msg.remitente === "user" ? "bg-[#dcf8c6] text-gray-800" : "bg-white text-gray-800"}`}>
                {msg.texto}
              </div>
            </div>
          ))}
          {cargando && (
            <div className="flex justify-start">
              <div className="bg-white px-3 py-2 rounded-xl text-xs text-gray-400 italic shadow-sm">
                Escribiendo...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={enviarMensaje} className="bg-[#f0f0f0] px-3 py-2 flex gap-2 items-center">
          <input
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribe como cliente..."
            className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none bg-white"
          />
          <button type="submit" disabled={cargando} className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center cursor-pointer disabled:opacity-50">
            <Send size={16} className="text-white" />
          </button>
        </form>
      </div>

      <WhatsAppConnectModal isOpen={connectModal} onClose={() => setConnectModal(false)} negocioNombre={negocio.nombre} />
    </div>
  );
}
