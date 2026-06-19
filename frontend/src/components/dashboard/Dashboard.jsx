import { ShoppingCart, MessageSquare, CalendarDays, TrendingUp } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { KPICard } from "./KPICard";
import { SalesChart } from "./SalesChart";
import { AlertasPanel } from "./AlertasPanel";

export function Dashboard() {
  const { state } = useNegocio();
  const { negocio, inventario, agenda } = state;
  const tipo = negocio.tipoNegocio;

  const stockBajos = inventario.filter(p => p.stock <= state.umbralStock).length;
  const citasHoy   = agenda.filter(c => c.fecha === "Hoy").length;

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
        {["servicios","mixto"].includes(tipo) && (
          <KPICard
            titulo="Citas hoy"
            valor={citasHoy}
            subtitulo="Agenda del dia"
            color="border-accent"
            icon={CalendarDays}
          />
        )}
        {["productos","restaurante","mixto"].includes(tipo) && (
          <KPICard
            titulo="Alertas de stock"
            valor={stockBajos}
            subtitulo={`Umbral: <= ${state.umbralStock} unidades`}
            color={stockBajos > 0 ? "border-destructive" : "border-green-400"}
            icon={ShoppingCart}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        {["productos","restaurante","mixto"].includes(tipo) && <AlertasPanel />}
      </div>
    </div>
  );
}
