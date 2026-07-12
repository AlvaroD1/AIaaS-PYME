import { useState } from "react";
import { Users, UserPlus, Stethoscope, Trash2 } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Button } from "../ui/Button";

export function Equipo() {
  const { state, agregarMiembroEquipo, eliminarMiembroEquipo } = useNegocio();
  const { equipo } = state;
  const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: "", especialidad: "" });

  function agregarMiembro(e) {
    e.preventDefault();
    if (!nuevoMiembro.nombre || !nuevoMiembro.especialidad) return;

    agregarMiembroEquipo(nuevoMiembro);
    setNuevoMiembro({ nombre: "", especialidad: "" });
  }

  function eliminarMiembro(id) {
    if (confirm("¿Estás seguro de eliminar a este miembro del equipo?")) {
      eliminarMiembroEquipo(id);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary-dark flex items-center gap-3">
          <Users size={28} className="text-primary" /> Equipo Médico
        </h1>
        <p className="text-gray-500 text-sm mt-1">Registra a los profesionales que atienden en tu consultorio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-md p-6 h-fit">
          <h2 className="font-heading font-semibold text-lg text-primary-dark mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-primary" /> Agregar profesional
          </h2>
          <form onSubmit={agregarMiembro} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre y título</label>
              <input
                required
                value={nuevoMiembro.nombre}
                onChange={e => setNuevoMiembro(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej. Dr. Juan Pérez"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Especialidad</label>
              <input
                required
                value={nuevoMiembro.especialidad}
                onChange={e => setNuevoMiembro(p => ({ ...p, especialidad: e.target.value }))}
                placeholder="Ej. Pediatría, Odontología"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
              />
            </div>
            <Button type="submit" className="w-full">
              Agregar al equipo
            </Button>
          </form>
        </div>

        {/* Lista */}
        <div className="md:col-span-2 space-y-4">
          {(!equipo || equipo.length === 0) ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-dashed border-gray-200">
              <Stethoscope size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Aún no hay profesionales registrados</h3>
              <p className="text-sm text-gray-500 mt-1">Agrega a tus médicos para que el agente pueda ofrecer sus servicios.</p>
            </div>
          ) : (
            equipo.map(miembro => (
              <div key={miembro.id} className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-dark text-lg">{miembro.nombre}</h3>
                  <p className="text-sm text-gray-500">{miembro.especialidad || "Medicina General"}</p>
                </div>
                <button
                  onClick={() => eliminarMiembro(miembro.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar profesional"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
