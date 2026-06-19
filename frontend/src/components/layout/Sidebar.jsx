import {
  LayoutDashboard, Settings, Package, CalendarDays, Clock,
  Bell, CreditCard, MessageSquare
} from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 cursor-pointer text-left
        ${active
          ? "bg-sidebar-active text-white border border-blue-700"
          : "text-slate-400 hover:text-white hover:bg-white/5"}
      `}
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar() {
  const { state, setVista } = useNegocio();
  const { vistaActual, negocio, notificaciones } = state;
  const tipo = negocio.tipoNegocio;
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const tieneInventario = ["productos", "restaurante", "mixto"].includes(tipo);
  const tieneServicios  = ["servicios", "mixto"].includes(tipo);

  return (
    <aside className="w-64 bg-sidebar flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="p-5 border-b border-white/10">
        <h1 className="font-heading text-secondary text-xl font-bold tracking-wide">AIaaS PYME</h1>
        {negocio.nombre && (
          <p className="text-slate-400 text-xs mt-1 truncate">{negocio.nombre}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavItem icon={LayoutDashboard} label="Dashboard"   active={vistaActual === "dashboard"}    onClick={() => setVista("dashboard")} />
        <NavItem icon={Settings}        label="Mi Negocio"  active={vistaActual === "config"}       onClick={() => setVista("config")} />
        {tieneInventario && (
          <NavItem icon={Package}       label="Inventario"  active={vistaActual === "inventario"}   onClick={() => setVista("inventario")} />
        )}
        {tieneServicios && (
          <NavItem icon={CalendarDays}  label="Agenda"      active={vistaActual === "agenda"}       onClick={() => setVista("agenda")} />
        )}
        {tieneServicios && (
          <NavItem icon={Clock}         label="Horario"     active={vistaActual === "horario"}      onClick={() => setVista("horario")} />
        )}
      </nav>

      <div className="p-4 space-y-1 border-t border-white/10">
        <NavItem icon={Bell}       label="Notificaciones" active={vistaActual === "notificaciones"} onClick={() => setVista("notificaciones")} badge={noLeidas} />
        <NavItem icon={CreditCard} label="Suscripcion"    active={vistaActual === "suscripcion"}   onClick={() => setVista("suscripcion")} />
        <button
          onClick={() => setVista("simulador")}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold
            cursor-pointer transition-all duration-200 mt-2
            ${vistaActual === "simulador" ? "bg-green-700 text-white" : "bg-onboard-green text-white hover:bg-green-600"}
          `}
        >
          <MessageSquare size={18} />
          Probar Agente
        </button>
      </div>
    </aside>
  );
}
