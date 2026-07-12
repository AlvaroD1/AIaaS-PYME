import { useState } from "react";
import { ClipboardCheck, Check, X, Clock, Package, AlertTriangle, Send } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Button } from "../ui/Button";

export function ValidacionPedidos() {
  const { state, validarPedidoPendiente, agregarNotificacion } = useNegocio();
  const pedidosPendientes = state.pedidosPendientes || [];
  const [motivoRechazo, setMotivoRechazo] = useState({});
  const [expandido, setExpandido] = useState(null);

  const pendientes = pedidosPendientes.filter(p => p.estado === "pendiente");
  const resueltos = pedidosPendientes.filter(p => p.estado !== "pendiente");

  async function handleValidar(pedido, aprobado) {
    const motivo = motivoRechazo[pedido.id] || "";

    if (!aprobado && !motivo.trim()) {
      alert("Por favor, escribe el motivo del rechazo para informar al cliente.");
      return;
    }

    // Actualizar en backend
    try {
      await fetch(`http://localhost:3000/api/pedidos-pendientes/${pedido.id}/validar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aprobado, motivoRechazo: motivo }),
      });
    } catch (err) {
      console.error("Error validando pedido:", err);
    }

    // Actualizar en contexto
    validarPedidoPendiente({ id: pedido.id, aprobado, motivoRechazo: motivo });

    // Generar notificación con el mensaje que se le enviaría al cliente
    if (aprobado) {
      agregarNotificacion({
        tipo: "pedido_aprobado",
        titulo: "✅ Pedido grande aprobado",
        mensaje: `El pedido por $${pedido.total?.toFixed(2)} fue APROBADO. Mensaje al cliente: "¡Tu pedido ha sido aprobado! Estamos preparando tu orden de ${pedido.items?.reduce((s, i) => s + i.cantidad, 0)} unidades. ¡Gracias por tu preferencia!"`,
      });
    } else {
      agregarNotificacion({
        tipo: "pedido_rechazado",
        titulo: "❌ Pedido grande rechazado",
        mensaje: `El pedido por $${pedido.total?.toFixed(2)} fue RECHAZADO. Mensaje al cliente: "${motivo}"`,
      });
    }

    // Limpiar motivo
    setMotivoRechazo(prev => ({ ...prev, [pedido.id]: "" }));
    setExpandido(null);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary-dark flex items-center gap-3">
          <ClipboardCheck size={28} className="text-primary" />
          Validación de Pedidos
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Revisa y aprueba o rechaza los pedidos grandes (+20 unidades) que requieren validación manual
        </p>
      </div>

      {/* Pedidos pendientes */}
      <div className="mb-8">
        <h2 className="font-heading text-lg font-semibold text-primary-dark mb-4 flex items-center gap-2">
          <Clock size={20} className="text-amber-500" />
          Pendientes de validación
          {pendientes.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendientes.length}
            </span>
          )}
        </h2>

        {pendientes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No hay pedidos pendientes de validación</p>
            <p className="text-gray-300 text-xs mt-1">
              Los pedidos de más de 20 unidades aparecerán aquí para tu aprobación
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-md border-l-4 border-amber-400 overflow-hidden">
                {/* Cabecera del pedido */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Requiere validación
                        </span>
                        {pedido.fueraDeHorario && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Fuera de horario
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary-dark">
                        {pedido.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(", ")}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(pedido.fecha).toLocaleString("es-ES", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                        <span className="text-xs text-gray-400">
                          Total de unidades: {pedido.items?.reduce((s, i) => s + i.cantidad, 0)}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary-dark">
                      ${pedido.total?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Panel expandido con acciones */}
                {expandido === pedido.id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Motivo de la revisión:</p>
                    <p className="text-sm text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-200">
                      {pedido.motivo || "Pedido grande: más de 20 unidades"}
                    </p>

                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Si rechazas, escribe el motivo que se le enviará al cliente:
                    </p>
                    <textarea
                      value={motivoRechazo[pedido.id] || ""}
                      onChange={e => setMotivoRechazo(prev => ({ ...prev, [pedido.id]: e.target.value }))}
                      placeholder="Ej: No contamos con suficiente capacidad para preparar esa cantidad en este momento. Te sugerimos reducir a 15 unidades."
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      rows={3}
                    />

                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={() => handleValidar(pedido, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        Aprobar pedido
                      </Button>
                      <Button
                        onClick={() => handleValidar(pedido, false)}
                        variant="secondary"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Rechazar
                      </Button>
                    </div>

                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <Send size={12} />
                      Al validar, se generará una notificación con el mensaje que se enviaría al cliente
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de pedidos resueltos */}
      {resueltos.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-gray-500 mb-4">
            Historial de validaciones
          </h2>
          <div className="space-y-3">
            {resueltos.map(pedido => (
              <div
                key={pedido.id}
                className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                  pedido.estado === "aprobado" ? "border-green-400" : "border-red-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {pedido.estado === "aprobado" ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={12} /> Aprobado
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <X size={12} /> Rechazado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      {pedido.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(", ")}
                    </p>
                    {pedido.estado === "rechazado" && pedido.motivoRechazo && (
                      <p className="text-xs text-red-500 mt-1 italic">
                        Motivo: {pedido.motivoRechazo}
                      </p>
                    )}
                    <span className="text-xs text-gray-400 mt-1 block">
                      Validado: {new Date(pedido.fechaValidacion).toLocaleString("es-ES", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    ${pedido.total?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
