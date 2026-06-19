// src/components/onboarding/OnboardingWizard.jsx
import { useState } from "react";
import { Check } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { StepIdentidad } from "./StepIdentidad";
import { StepTipoNegocio } from "./StepTipoNegocio";
import { StepConfigInicial } from "./StepConfigInicial";

const PASOS = ["Tu negocio", "Tipo", "Configuración"];

export function OnboardingWizard() {
  const { completarOnboarding, dispatch, state } = useNegocio();
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState({ nombre: "", ciudad: "quito", sector: "tienda" });
  const [tipo, setTipo] = useState("productos");
  const [horario, setHorario] = useState(state.horario);
  const [primerProducto, setPrimerProducto] = useState({ nombre: "", precio: "", stock: "" });

  function handleHorarioChange(dia, campo, valor) {
    setHorario(prev => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }));
  }

  function handleFinish() {
    if (primerProducto.nombre && primerProducto.precio) {
      dispatch({
        type: "AGREGAR_PRODUCTO",
        payload: {
          nombre: primerProducto.nombre,
          precio: parseFloat(primerProducto.precio),
          stock: parseInt(primerProducto.stock) || 0,
          desc: "",
        },
      });
    }
    dispatch({ type: "SET_HORARIO", payload: horario });
    completarOnboarding({ ...datos, tipoNegocio: tipo });
  }

  return (
    <div className="min-h-screen bg-onboard-bg flex items-center justify-center p-4 font-onboard">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">AIaaS PYME</h1>
          <p className="text-slate-400 text-sm">Tu agente de IA en menos de 5 minutos</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {PASOS.map((nombre, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${i < paso
                    ? "bg-onboard-green text-white"
                    : i === paso
                    ? "bg-onboard-green text-white ring-4 ring-onboard-green/30"
                    : "bg-white/10 text-slate-500"}
                `}
              >
                {i < paso ? <Check size={14} /> : i + 1}
              </div>
              {i < PASOS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-1 transition-all duration-300 ${i < paso ? "bg-onboard-green" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-white font-bold text-lg mb-1">{PASOS[paso]}</h2>
          <p className="text-slate-400 text-xs mb-5">Paso {paso + 1} de {PASOS.length}</p>

          {paso === 0 && (
            <StepIdentidad
              datos={datos}
              onChange={(campo, valor) => setDatos(p => ({ ...p, [campo]: valor }))}
              onNext={() => setPaso(1)}
            />
          )}
          {paso === 1 && (
            <StepTipoNegocio
              tipoSeleccionado={tipo}
              onChange={setTipo}
              onNext={() => setPaso(2)}
              onBack={() => setPaso(0)}
            />
          )}
          {paso === 2 && (
            <StepConfigInicial
              tipo={tipo}
              horario={horario}
              onHorarioChange={handleHorarioChange}
              primerProducto={primerProducto}
              onProductoChange={(campo, valor) => setPrimerProducto(p => ({ ...p, [campo]: valor }))}
              onFinish={handleFinish}
              onBack={() => setPaso(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
