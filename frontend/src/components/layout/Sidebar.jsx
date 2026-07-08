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
        w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider border-l-2
        transition-colors duration-200 cursor-pointer text-left
        ${active
          ? "border-secondary text-white"
          : "border-transparent text-slate-500 hover:text-white"}
      `}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="bg-destructive text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold normal-case">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ open = false, onClose = () => {} }) {
  const { state, setVista } = useNegocio();
  const { vistaActual, negocio, notificaciones } = state;
  const tipo = negocio.tipoNegocio;
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const tieneInventario = ["productos", "restaurante", "mixto"].includes(tipo);
  const tieneServicios  = ["servicios", "mixto"].includes(tipo);

  const navegar = (vista) => {
    setVista(vista);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          w-64 bg-sidebar flex flex-col h-screen flex-shrink-0
          fixed top-0 left-0 z-50 transition-transform duration-200
          lg:sticky lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-5 border-b border-white/10">
          <h1 className="font-heading text-secondary text-xl font-bold tracking-wide">AIaaS PYME</h1>
          {negocio.nombre && (
            <p className="text-slate-400 text-xs mt-1 truncate">{negocio.nombre}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard"   active={vistaActual === "dashboard"}    onClick={() => navegar("dashboard")} />
          <NavItem icon={Settings}        label="Mi Negocio"  active={vistaActual === "config"}       onClick={() => navegar("config")} />
          {tieneInventario && (
            <NavItem icon={Package}       label="Inventario"  active={vistaActual === "inventario"}   onClick={() => navegar("inventario")} />
          )}
          {tieneServicios && (
            <NavItem icon={CalendarDays}  label="Agenda"      active={vistaActual === "agenda"}       onClick={() => navegar("agenda")} />
          )}
          {tieneServicios && (
            <NavItem icon={Clock}         label="Horario"     active={vistaActual === "horario"}      onClick={() => navegar("horario")} />
          )}
        </nav>

        <div className="p-4 space-y-1 border-t border-white/10">
          <NavItem icon={Bell}       label="Notificaciones" active={vistaActual === "notificaciones"} onClick={() => navegar("notificaciones")} badge={noLeidas} />
          <NavItem icon={CreditCard} label="Suscripcion"    active={vistaActual === "suscripcion"}   onClick={() => navegar("suscripcion")} />
          <button
            onClick={() => navegar("simulador")}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider
              cursor-pointer transition-colors duration-200 mt-2
              ${vistaActual === "simulador" ? "bg-green-700 text-white" : "bg-onboard-green text-white hover:bg-green-600"}
            `}
          >
            <MessageSquare size={18} />
            Probar Agente
          </button>
        </div>
      </aside>
    </>
  );
}
