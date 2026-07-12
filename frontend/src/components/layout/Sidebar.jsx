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

export function Sidebar({ isOpen, onClose }) {
  const { state, setVista, resetApp } = useNegocio();
  const { vistaActual, negocio, notificaciones } = state;
  const tipo = negocio.tipoNegocio;
  const subTipo = negocio.subTipoSalud;
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const pendientesValidacion = (state.pedidosPendientes || []).filter(p => p.estado === "pendiente").length;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tieneInventario = ["productos", "restaurante", "mixto", "academia"].includes(tipo) || (tipo === "salud" && subTipo === "veterinaria");
  const tieneServicios  = ["servicios", "mixto", "salud", "academia"].includes(tipo);
  const tieneEquipo = tipo === "salud";

  function handleReset() {
    setShowResetConfirm(false);
    resetApp();
  }

  return (
    <>
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col h-full md:h-screen flex-shrink-0
          transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <div className="overflow-hidden">
            <h1 className="font-heading text-white text-xl font-bold truncate">
              {negocio.nombre || "Mi Negocio"}
            </h1>
            <p className="text-secondary/70 text-[10px] mt-0.5 font-medium tracking-wider uppercase hidden md:block">
              powered by AIaaS PYME
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard"   active={vistaActual === "dashboard"}    onClick={() => { setVista("dashboard"); if(onClose) onClose(); }} />
          <NavItem icon={Settings}        label="Mi Negocio"  active={vistaActual === "config"}       onClick={() => { setVista("config"); if(onClose) onClose(); }} />
          {tieneInventario && (
            <NavItem icon={Package}       label={tipo === "salud" ? "Catálogo y Productos" : "Inventario"}  active={vistaActual === "inventario"}   onClick={() => { setVista("inventario"); if(onClose) onClose(); }} />
          )}
          {(!tieneInventario && tipo === "salud") && (
            <NavItem icon={Package}       label="Servicios"  active={vistaActual === "inventario"}   onClick={() => { setVista("inventario"); if(onClose) onClose(); }} />
          )}
          {tieneEquipo && (
            <NavItem icon={Users}         label="Equipo Médico" active={vistaActual === "equipo"}       onClick={() => { setVista("equipo"); if(onClose) onClose(); }} />
          )}
          {tieneServicios && (
            <NavItem icon={CalendarDays}  label="Agenda"      active={vistaActual === "agenda"}       onClick={() => { setVista("agenda"); if(onClose) onClose(); }} />
          )}
          {tieneServicios && (
            <NavItem icon={Clock}         label="Horario"     active={vistaActual === "horario"}      onClick={() => { setVista("horario"); if(onClose) onClose(); }} />
          )}
          {tieneInventario && (
            <NavItem icon={ClipboardCheck} label="Validar Pedidos" active={vistaActual === "validacion"} onClick={() => { setVista("validacion"); if(onClose) onClose(); }} badge={pendientesValidacion} />
          )}
        </nav>

        <div className="p-4 space-y-1 border-t border-white/10">
          <NavItem icon={Bell}       label="Notificaciones" active={vistaActual === "notificaciones"} onClick={() => { setVista("notificaciones"); if(onClose) onClose(); }} badge={noLeidas} />
          <NavItem icon={CreditCard} label="Suscripcion"    active={vistaActual === "suscripcion"}   onClick={() => { setVista("suscripcion"); if(onClose) onClose(); }} />
          <button
            onClick={() => { setVista("simulador"); if(onClose) onClose(); }}
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

        {/* Reset button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              cursor-pointer transition-all duration-200
              text-red-400/70 hover:text-red-300 hover:bg-red-500/10
            "
          >
            <RotateCcw size={16} />
            Reiniciar todo
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="¿Reiniciar toda la aplicación?"
        message="Se borrarán todos los datos: negocio, inventario, pedidos, agenda y configuración. Volverás al asistente de configuración inicial. Esta acción no se puede deshacer."
        confirmLabel="Sí, reiniciar todo"
      />
    </>
  );
}
