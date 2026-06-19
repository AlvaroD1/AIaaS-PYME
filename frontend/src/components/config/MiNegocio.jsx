import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";

export function MiNegocio() {
  const { state, dispatch } = useNegocio();
  const [negocio, setNegocio] = useState({ ...state.negocio });
  const [agente, setAgente] = useState({ ...state.agente });
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [guardado, setGuardado] = useState(false);

  function handleGuardar() {
    dispatch({ type: "SET_NEGOCIO", payload: negocio });
    dispatch({ type: "SET_AGENTE", payload: agente });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  function agregarFAQ() {
    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) return;
    const faq = [...(agente.faq || []), { pregunta: nuevaPregunta.trim(), respuesta: nuevaRespuesta.trim() }];
    setAgente(a => ({ ...a, faq }));
    setNuevaPregunta("");
    setNuevaRespuesta("");
  }

  function eliminarFAQ(i) {
    setAgente(a => ({ ...a, faq: (a.faq || []).filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary-dark">Mi Negocio</h1>
        <Button onClick={handleGuardar} variant={guardado ? "ghost" : "primary"}>
          <Save size={16} /> {guardado ? "¡Guardado!" : "Guardar cambios"}
        </Button>
      </div>

      {/* Datos del negocio */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="font-heading font-semibold text-primary-dark mb-4">Datos del negocio</h2>
        <Input
          label="Nombre del negocio"
          value={negocio.nombre}
          onChange={e => setNegocio(n => ({ ...n, nombre: e.target.value }))}
          required
        />
        <Input
          label="Ciudad"
          value={negocio.ciudad}
          onChange={e => setNegocio(n => ({ ...n, ciudad: e.target.value }))}
        />
        <Input
          label="Umbral de stock bajo"
          type="number"
          value={state.umbralStock}
          onChange={e => dispatch({ type: "SET_UMBRAL_STOCK", payload: parseInt(e.target.value) || 10 })}
          helperText="Se te alertará cuando un producto baje de este número"
        />
      </div>

      {/* Config del agente */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="font-heading font-semibold text-primary-dark mb-4">Configuración del agente</h2>
        <Input
          label="Nombre del agente"
          value={agente.nombre}
          onChange={e => setAgente(a => ({ ...a, nombre: e.target.value }))}
          placeholder="Ej. Asistente de la Tienda Rosa"
        />
        <Select
          label="Tono de comunicación"
          value={agente.tono}
          onChange={e => setAgente(a => ({ ...a, tono: e.target.value }))}
          options={[
            { value: "informal", label: "Informal (cercano y amigable)" },
            { value: "formal", label: "Formal (profesional)" },
          ]}
        />
        <Input
          label="Mensaje de saludo inicial"
          value={agente.saludo}
          onChange={e => setAgente(a => ({ ...a, saludo: e.target.value }))}
          placeholder="¡Hola! ¿En qué te ayudo hoy?"
        />
      </div>

      {/* FAQ Builder */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="font-heading font-semibold text-primary-dark mb-1">Preguntas frecuentes (FAQ)</h2>
        <p className="text-xs text-gray-400 mb-4">El agente usará estas respuestas para atender a tus clientes.</p>

        {(agente.faq || []).map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary">P: {item.pregunta}</p>
              <p className="text-xs text-gray-500 mt-0.5">R: {item.respuesta}</p>
            </div>
            <button onClick={() => eliminarFAQ(i)} className="p-1 hover:bg-red-50 rounded cursor-pointer">
              <Trash2 size={13} className="text-destructive" />
            </button>
          </div>
        ))}

        <div className="mt-4 space-y-2">
          <input
            value={nuevaPregunta}
            onChange={e => setNuevaPregunta(e.target.value)}
            placeholder="Pregunta del cliente"
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-primary"
          />
          <input
            value={nuevaRespuesta}
            onChange={e => setNuevaRespuesta(e.target.value)}
            placeholder="Respuesta del agente"
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-primary"
          />
          <Button variant="secondary" size="sm" onClick={agregarFAQ}>
            <Plus size={14} /> Agregar pregunta
          </Button>
        </div>
      </div>
    </div>
  );
}
