import { Clock, Sun, Moon } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";

const DIAS = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];
const DIAS_LABEL = { lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado", domingo:"Domingo" };

// Tipos de negocio que comúnmente manejan doble jornada
const TIPOS_DOBLE_JORNADA = ["salud", "academia", "servicios", "mixto"];

export function Horario() {
  const { state, actualizarHorario } = useNegocio();
  const { horario, negocio } = state;
  const soportaDobleJornada = TIPOS_DOBLE_JORNADA.includes(negocio.tipoNegocio);

  function update(dia, campo, valor) {
    const nuevoHorario = { ...horario, [dia]: { ...horario[dia], [campo]: valor } };
    actualizarHorario(nuevoHorario);
  }

  function toggleDobleJornada(dia) {
    const esDoble = !horario[dia].dobleJornada;
    const nuevoHorario = {
      ...horario,
      [dia]: {
        ...horario[dia],
        dobleJornada: esDoble,
        ...(esDoble && horario[dia].cierre > "13:00" ? { cierre: "12:00" } : {}),
        apertura2: horario[dia].apertura2 || "14:00",
        cierre2: horario[dia].cierre2 || "18:00",
      }
    };
    actualizarHorario(nuevoHorario);
  }

  function activarTodosDoble() {
    const nuevoHorario = { ...horario };
    DIAS.forEach(dia => {
      if (nuevoHorario[dia].activo) {
        nuevoHorario[dia] = {
          ...nuevoHorario[dia],
          dobleJornada: true,
          cierre: "12:00",
          apertura2: "14:00",
          cierre2: "18:00",
        };
      }
    });
    actualizarHorario(nuevoHorario);
  }

  function desactivarTodosDoble() {
    const nuevoHorario = { ...horario };
    DIAS.forEach(dia => {
      nuevoHorario[dia] = { ...nuevoHorario[dia], dobleJornada: false, cierre: "18:00" };
    });
    actualizarHorario(nuevoHorario);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary-dark flex items-center gap-3">
          <Clock size={28} className="text-primary" /> Horario de Atención
        </h1>
        <p className="text-gray-500 text-sm mt-1">El agente usará este horario para gestionar consultas fuera de hora.</p>
      </div>

      {/* Botón rápido de doble jornada */}
      {soportaDobleJornada && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sun size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-dark">Doble jornada</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Divide el día en mañana y tarde con descanso al mediodía. Común en consultorios, academias y servicios.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={activarTodosDoble}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
            >
              Activar todos
            </button>
            <button
              onClick={desactivarTodosDoble}
              className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer font-medium"
            >
              Jornada única
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md divide-y divide-border">
        {DIAS.map(dia => (
          <div key={dia} className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-4">
                {/* Toggle activo */}
                <button
                  onClick={() => update(dia, "activo", !horario[dia].activo)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${horario[dia].activo ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${horario[dia].activo ? "translate-x-5" : "translate-x-0"}`} />
                </button>

                <span className={`w-24 text-sm font-medium ${horario[dia].activo ? "text-primary-dark" : "text-gray-400"}`}>
                  {DIAS_LABEL[dia]}
                </span>
              </div>

              {horario[dia].activo ? (
                <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto">
                  {/* Jornada 1 (o única) */}
                  <div className="flex items-center gap-2 w-full">
                    {horario[dia].dobleJornada && (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1 w-16">
                        <Sun size={12} /> Mañana
                      </span>
                    )}
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

                  {/* Jornada 2 */}
                  {horario[dia].dobleJornada && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs text-indigo-600 font-medium flex items-center gap-1 w-16">
                        <Moon size={12} /> Tarde
                      </span>
                      <input
                        type="time"
                        value={horario[dia].apertura2 || "14:00"}
                        onChange={e => update(dia, "apertura2", e.target.value)}
                        className="px-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-primary-dark outline-none focus:border-primary cursor-pointer"
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <input
                        type="time"
                        value={horario[dia].cierre2 || "18:00"}
                        onChange={e => update(dia, "cierre2", e.target.value)}
                        className="px-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-primary-dark outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">Cerrado</span>
              )}

              {/* Toggle doble jornada por día */}
              {soportaDobleJornada && horario[dia].activo && (
                <button
                  onClick={() => toggleDobleJornada(dia)}
                  title={horario[dia].dobleJornada ? "Cambiar a jornada única" : "Activar doble jornada"}
                  className={`
                    text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex-shrink-0
                    ${horario[dia].dobleJornada
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"}
                  `}
                >
                  {horario[dia].dobleJornada ? "2 turnos" : "1 turno"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
