import { useState } from "react";
import { Plus, CalendarDays, Trash2 } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CitaModal } from "./CitaModal";

export function Agenda() {
  const { state, agregarCita, eliminarCita } = useNegocio();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary-dark">Agenda</h1>
          <p className="text-gray-500 text-sm mt-1">{state.agenda.length} citas registradas</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Nueva Cita</Button>
      </div>

      {state.agenda.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-md">
          <CalendarDays size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-gray-500 mb-2">Sin citas agendadas</h3>
          <p className="text-gray-400 text-sm mb-6">Agrega citas para que el agente pueda gestionar disponibilidad.</p>
          <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Agendar primera cita</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {state.agenda.map(cita => (
            <div key={cita.id} className="bg-white rounded-xl px-5 py-4 shadow-sm border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <CalendarDays size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary-dark text-sm">{cita.cliente}</p>
                  <p className="text-xs text-gray-400">{cita.servicio} · {cita.fecha} {cita.hora}</p>
                </div>
              </div>
              <button onClick={() => setConfirmId(cita.id)} className="p-2 rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                <Trash2 size={15} className="text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      <CitaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={agregarCita} />
      <ConfirmDialog isOpen={!!confirmId} onCancel={() => setConfirmId(null)} onConfirm={() => { eliminarCita(confirmId); setConfirmId(null); }} title="¿Eliminar cita?" message="La cita se eliminará permanentemente." />
    </div>
  );
}
