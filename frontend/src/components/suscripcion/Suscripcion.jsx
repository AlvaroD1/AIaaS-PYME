import { useState } from "react";
import { useNegocio } from "../../hooks/useNegocio";
import { PlanCard } from "./PlanCard";

const PLANES = [
  {
    id: "base",
    nombre: "Base",
    precio: 29,
    features: [
      "Agente IA (cloud · Gemini)",
      "Simulador WhatsApp",
      "Inventario ilimitado",
      "Dashboard básico",
      "14 días de prueba gratis",
    ],
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 59,
    popular: true,
    features: [
      "Todo el plan Base",
      "Reportes PDF y CSV",
      "Constructor de FAQ avanzado",
      "Hasta 5 usuarios",
      "Historial de 90 días",
      "Soporte prioritario",
    ],
  },
  {
    id: "enterprise",
    nombre: "Enterprise",
    precio: 149,
    features: [
      "Todo el plan Pro",
      "IA Local offline (Ollama)",
      "Sin necesidad de internet",
      "Branding personalizado",
      "Backup diario automático",
      "Soporte dedicado",
    ],
  },
];

const PERIODOS = [
  { id: "mensual", label: "Mensual", meses: 1, descuento: 0 },
  { id: "trimestral", label: "Trimestral", meses: 3, descuento: 0.1 },
  { id: "anual", label: "Anual", meses: 12, descuento: 0.2 },
];

export function Suscripcion() {
  const { state, dispatch } = useNegocio();
  const [periodoId, setPeriodoId] = useState("mensual");
  const periodo = PERIODOS.find(p => p.id === periodoId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary-dark mb-2">Planes de Suscripción</h1>
        <p className="text-gray-500 text-sm">Elige el plan que mejor se adapte a tu negocio. Cambia cuando quieras.</p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-muted rounded-sm p-1 gap-1">
          {PERIODOS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodoId(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${
                periodoId === p.id ? "bg-white text-primary-dark shadow-sm" : "text-gray-500 hover:text-primary-dark"
              }`}
            >
              {p.label}
              {p.descuento > 0 && (
                <span className="ml-1.5 text-onboard-green text-xs font-bold">-{p.descuento * 100}%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {PLANES.map(plan => {
          const totalPeriodo = Math.round(plan.precio * periodo.meses * (1 - periodo.descuento));
          return (
            <PlanCard
              key={plan.id}
              nombre={plan.nombre}
              precio={totalPeriodo}
              precioMensual={periodo.meses > 1 ? Math.round(totalPeriodo / periodo.meses) : null}
              periodoLabel={periodo.id}
              features={plan.features}
              popular={plan.popular}
              activo={state.suscripcion === plan.id}
              onSeleccionar={() => dispatch({ type: "SET_SUSCRIPCION", payload: plan.id })}
            />
          );
        })}
      </div>

      {state.suscripcion === "enterprise" && (
        <div className="bg-muted border border-border rounded-sm p-6">
          <h3 className="font-heading font-semibold text-primary-dark mb-2">Configuración de IA Local</h3>
          <p className="text-sm text-gray-500 mb-3">Para activar la IA offline, instala Ollama en tu PC y configura el backend:</p>
          <pre className="bg-white border border-border rounded-lg p-4 text-xs text-primary-dark overflow-x-auto">
{`# En tu .env del backend:
LOCAL_AI=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3.5

# Instalar Ollama: https://ollama.com
# Descargar modelo: ollama pull phi3.5`}
          </pre>
        </div>
      )}
    </div>
  );
}
