import { ShoppingCart, MessageSquare, CalendarDays, TrendingUp, Package, Clock } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { KPICard } from "./KPICard";
import { SalesChart } from "./SalesChart";
import { AlertasPanel } from "./AlertasPanel";

export function Dashboard() {
  const { state } = useNegocio();
  const { negocio, inventario, agenda, pedidos = [] } = state;
  const tipo = negocio.tipoNegocio;
  const subTipo = negocio.subTipoSalud;
  
  const tieneInventario = ["productos", "restaurante", "mixto", "academia"].includes(tipo) || (tipo === "salud" && subTipo === "veterinaria");
  const tieneServicios = ["servicios", "mixto", "salud", "academia"].includes(tipo);

  const stockBajos = inventario.filter(p => p.stock <= state.umbralStock).length;
  const citasHoy   = agenda.filter(c => c.fecha === "Hoy").length;

  // Calcular ventas reales de la semana
  const ahora = new Date();
  const inicioSemana = new Date(ahora);
  inicioSemana.setDate(ahora.getDate() - ahora.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const pedidosSemana = pedidos.filter(p => new Date(p.fecha) >= inicioSemana);
  const ventasSemana = pedidosSemana.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalPedidos = pedidosSemana.length;

  // Últimos 5 pedidos para la lista
  const pedidosRecientes = pedidos.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary-dark">
          Bienvenido, {negocio.nombre}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de tu negocio hoy</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <KPICard
          titulo="Ventas de la semana"
          valor={`$${ventasSemana.toFixed(2)}`}
          subtitulo={`${totalPedidos} pedido${totalPedidos !== 1 ? "s" : ""} esta semana`}
          color="border-onboard-green"
          icon={TrendingUp}
        />
        <KPICard
          titulo="Pedidos totales"
          valor={pedidos.length}
          subtitulo="Histórico total"
          color="border-secondary"
          icon={ShoppingCart}
        />
        {tieneServicios && (
          <KPICard
            titulo="Citas hoy"
            valor={citasHoy}
            subtitulo="Agenda del dia"
            color="border-accent"
            icon={CalendarDays}
          />
        )}
        {tieneInventario && (
          <KPICard
            titulo="Alertas de stock"
            valor={stockBajos}
            subtitulo={`Umbral: <= ${state.umbralStock} unidades`}
            color={stockBajos > 0 ? "border-destructive" : "border-green-400"}
            icon={MessageSquare}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />

        {/* Pedidos Recientes */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-heading font-semibold text-primary-dark mb-4 flex items-center gap-2">
            <Package size={18} className="text-primary" /> Pedidos recientes
          </h3>
          {pedidosRecientes.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aún no hay pedidos confirmados.</p>
              <p className="text-gray-300 text-xs mt-1">Los pedidos del simulador aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosRecientes.map(pedido => (
                <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-dark">
                      {pedido.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(", ") || "Pedido"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(pedido.fecha).toLocaleString("es-ES", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      {pedido.fueraDeHorario && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Fuera de horario
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-onboard-green">
                    ${pedido.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertas de stock debajo si aplica */}
      {tieneInventario && (
        <div className="mt-6">
          <AlertasPanel />
        </div>
      )}
    </div>
  );
}
