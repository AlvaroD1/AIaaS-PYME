// src/components/notificaciones/NotificacionesPanel.jsx
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

function tipoVariant(tipo) {
  return { stock: "danger", cita: "info", agente: "warning" }[tipo] || "default";
}

export function NotificacionesPanel() {
  const { state, marcarLeida, marcarTodasLeidas, dispatch } = useNegocio();
  const { notificaciones } = state;
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary-dark flex items-center gap-3">
            <Bell size={28} className="text-primary" /> Notificaciones
          </h1>
          {noLeidas > 0 && <p className="text-gray-500 text-sm mt-1">{noLeidas} sin leer</p>}
        </div>
        {notificaciones.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => marcarTodasLeidas()}>
            <Check size={14} /> Marcar todas leídas
          </Button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-md">
          <BellOff size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-gray-500 mb-2">Sin notificaciones</h3>
          <p className="text-gray-400 text-sm">Aquí aparecerán alertas de stock, citas y errores del agente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map(n => (
            <div key={n.id} className={`bg-white rounded-xl px-5 py-4 shadow-sm border flex items-start gap-4 transition-all ${n.leida ? "opacity-60 border-border" : "border-secondary"}`}>
              <Badge variant={tipoVariant(n.tipo)} className="mt-0.5 flex-shrink-0">{n.tipo}</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-dark">{n.mensaje}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.fecha).toLocaleString("es-EC")}</p>
              </div>
              {!n.leida && (
                <button onClick={() => marcarLeida(n.id)} className="p-1.5 hover:bg-muted rounded-lg cursor-pointer" title="Marcar como leída">
                  <Check size={14} className="text-primary" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
