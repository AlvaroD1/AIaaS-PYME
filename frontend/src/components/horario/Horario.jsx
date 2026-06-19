import { Clock } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";

const DIAS = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];
const DIAS_LABEL = { lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado", domingo:"Domingo" };

export function Horario() {
  const { state, dispatch } = useNegocio();
  const { horario } = state;

  function update(dia, campo, valor) {
    dispatch({ type: "SET_HORARIO", payload: { [dia]: { ...horario[dia], [campo]: valor } } });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary-dark flex items-center gap-3">
          <Clock size={28} className="text-primary" /> Horario de Atención
        </h1>
        <p className="text-gray-500 text-sm mt-1">El agente usará este horario para gestionar consultas fuera de hora.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md divide-y divide-border">
        {DIAS.map(dia => (
          <div key={dia} className="flex items-center gap-4 px-6 py-4">
            <button
              onClick={() => update(dia, "activo", !horario[dia].activo)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${horario[dia].activo ? "bg-primary" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${horario[dia].activo ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>

            <span className={`w-24 text-sm font-medium ${horario[dia].activo ? "text-primary-dark" : "text-gray-400"}`}>
              {DIAS_LABEL[dia]}
            </span>

            {horario[dia].activo ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={horario[dia].apertura}
                  onChange={e => update(dia, "apertura", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-primary-dark outline-none focus:border-primary cursor-pointer"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="time"
                  value={horario[dia].cierre}
                  onChange={e => update(dia, "cierre", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-primary-dark outline-none focus:border-primary cursor-pointer"
                />
              </div>
            ) : (
              <span className="text-gray-400 text-sm italic">Cerrado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
