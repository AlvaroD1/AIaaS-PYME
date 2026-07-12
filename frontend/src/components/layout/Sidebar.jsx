import { useState } from "react";
import {
  LayoutDashboard, Settings, Package, CalendarDays, Clock,
  Bell, CreditCard, MessageSquare, ClipboardCheck, RotateCcw, Users
} from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { ConfirmDialog } from "../ui/ConfirmDialog";

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

export function Sidebar({ onNavigate }) {
  const { state, setVista, resetApp } = useNegocio();
  const { vistaActual, negocio, notificaciones, pedidosPendientes = [] } = state;
  const tipo = negocio.tipoNegocio;
  const subTipo = negocio.subTipoSalud;
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const pedidosPend = pedidosPendientes.filter(p => p.estado === "pendiente").length;

  const [confirmReset, setConfirmReset] = useState(false);

  // Condiciones actualizadas para incluir salud, academia, etc.
  const tieneInventario = ["productos", "restaurante", "mixto", "academia"].includes(tipo) || (tipo === "salud" && subTipo === "veterinaria");
  const tieneServicios = ["servicios", "mixto", "salud", "academia"].includes(tipo);
  const tieneEquipo = tipo === "salud" && subTipo !== "veterinaria";
  const tieneValidacion = ["productos", "restaurante", "mixto"].includes(tipo) || (tipo === "salud" && subTipo === "veterinaria");

  function navegar(vista) {
    setVista(vista);
    onNavigate?.(); // Cerrar drawer en móvil
  }

  function handleReset() {
    resetApp();
    setConfirmReset(false);
  }

  return (
    <aside className="w-64 bg-sidebar flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="p-5 border-b border-white/10">
        <h1 className="font-heading text-secondary text-xl font-bold tracking-wide">AIaaS PYME</h1>
        {negocio.nombre && (
          <p className="text-slate-400 text-xs mt-1 truncate">{negocio.nombre}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavItem icon={LayoutDashboard} label="Dashboard" active={vistaActual === "dashboard"} onClick={() => navegar("dashboard")} />
        <NavItem icon={Settings} label="Mi Negocio" active={vistaActual === "config"} onClick={() => navegar("config")} />
        {tieneInventario && (
          <NavItem icon={Package} label="Inventario" active={vistaActual === "inventario"} onClick={() => navegar("inventario")} />
        )}
        {tieneServicios && (
          <NavItem icon={CalendarDays} label="Agenda" active={vistaActual === "agenda"} onClick={() => navegar("agenda")} />
        )}
        {tieneEquipo && (
          <NavItem icon={Users} label="Equipo Médico" active={vistaActual === "equipo"} onClick={() => navegar("equipo")} />
        )}
        {tieneServicios && (
          <NavItem icon={Clock} label="Horario" active={vistaActual === "horario"} onClick={() => navegar("horario")} />
        )}
        {tieneValidacion && (
          <NavItem icon={ClipboardCheck} label="Validación" active={vistaActual === "validacion"} onClick={() => navegar("validacion")} badge={pedidosPend} />
        )}
      </nav>

      <div className="p-4 space-y-1 border-t border-white/10">
        <NavItem icon={Bell} label="Notificaciones" active={vistaActual === "notificaciones"} onClick={() => navegar("notificaciones")} badge={noLeidas} />
        <NavItem icon={CreditCard} label="Suscripcion" active={vistaActual === "suscripcion"} onClick={() => navegar("suscripcion")} />
        <button
          onClick={() => navegar("simulador")}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold
            cursor-pointer transition-all duration-200 mt-2
            ${vistaActual === "simulador" ? "bg-green-700 text-white" : "bg-onboard-green text-white hover:bg-green-600"}
          `}
        >
          <MessageSquare size={18} />
          Probar Agente
        </button>

        {/* Botón de reiniciar */}
        <button
          onClick={() => setConfirmReset(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider
            text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer mt-2"
        >
          <RotateCcw size={16} strokeWidth={1.75} />
          <span>Reiniciar App</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="¿Reiniciar la aplicación?"
        message="Se borrarán todos los datos locales y volverás al onboarding. Los datos en la base de datos no se eliminarán."
      />
    </aside>
  );
}
