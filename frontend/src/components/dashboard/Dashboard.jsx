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
  const citasHoy = agenda.filter(c => {
    const hoy = new Date().toISOString().split("T")[0];
    return c.fecha === hoy || c.fecha === "Hoy";
  }).length;

  // Calcular columnas del grid según cuántas KPI cards hay
  let kpiCount = 2; // Ventas + Consultas siempre visibles
  if (tieneServicios) kpiCount++;
  if (tieneInventario) kpiCount++;
  const colsClass = kpiCount <= 2 ? "sm:grid-cols-2" : kpiCount === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-border">
        <h1 className="font-heading text-2xl sm:text-4xl font-bold text-primary-dark tracking-tight">
          Bienvenido, {negocio.nombre}
        </h1>
        <p className="text-gray-400 text-sm mt-2">Resumen de tu negocio hoy</p>
      </div>

      <div className={`grid grid-cols-1 ${colsClass} border border-border divide-y sm:divide-y-0 sm:divide-x divide-border mb-6 sm:mb-8`}>
        <KPICard
          titulo="Ventas de la semana"
          valor="$425.50"
          subtitulo="Datos de ejemplo"
          color="border-onboard-green"
          icon={TrendingUp}
        />
        <KPICard
          titulo="Consultas WhatsApp"
          valor="128"
          subtitulo="Esta semana"
          color="border-secondary"
          icon={MessageSquare}
        />
        {tieneServicios && (
          <KPICard
            titulo="Citas hoy"
            valor={citasHoy}
            subtitulo="Agenda del dia"
            tono="neutral"
            icon={CalendarDays}
          />
        )}
        {tieneInventario && (
          <KPICard
            titulo="Alertas de stock"
            valor={stockBajos}
            subtitulo={`Umbral: <= ${state.umbralStock} unidades`}
            color={stockBajos > 0 ? "border-destructive" : "border-green-400"}
            icon={ShoppingCart}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SalesChart />
        {tieneInventario && <AlertasPanel />}
      </div>
    </div>
  );
}
