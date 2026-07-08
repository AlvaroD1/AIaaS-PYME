import { ShoppingCart, MessageSquare, CalendarDays, TrendingUp } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { KPICard } from "./KPICard";
import { SalesChart } from "./SalesChart";
import { AlertasPanel } from "./AlertasPanel";

export function Dashboard() {
  const { state } = useNegocio();
  const { negocio, inventario, agenda } = state;
  const tipo = negocio.tipoNegocio;

  const tieneInventario = ["productos", "restaurante", "mixto"].includes(tipo);
  const tieneServicios  = ["servicios", "mixto"].includes(tipo);
  const stockBajos = inventario.filter(p => p.stock <= state.umbralStock).length;
  const citasHoy   = agenda.filter(c => c.fecha === "Hoy").length;

  const columnas = 2 + (tieneServicios ? 1 : 0) + (tieneInventario ? 1 : 0);
  const colsClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columnas];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="font-heading text-4xl font-bold text-primary-dark tracking-tight">
          Bienvenido, {negocio.nombre}
        </h1>
        <p className="text-gray-400 text-sm mt-2">Resumen de tu negocio hoy</p>
      </div>

      <div className={`grid grid-cols-1 ${colsClass} border border-border divide-y sm:divide-y-0 sm:divide-x divide-border mb-8`}>
        <KPICard
          titulo="Ventas de la semana"
          valor="$425.50"
          subtitulo="Datos de ejemplo"
          tono="neutral"
          icon={TrendingUp}
        />
        <KPICard
          titulo="Consultas WhatsApp"
          valor="128"
          subtitulo="Esta semana"
          tono="neutral"
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
            tono={stockBajos > 0 ? "danger" : "success"}
            icon={ShoppingCart}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={tieneInventario ? "lg:col-span-8" : "lg:col-span-12"}>
          <SalesChart />
        </div>
        {tieneInventario && (
          <div className="lg:col-span-4">
            <AlertasPanel />
          </div>
        )}
      </div>
    </div>
  );
}
