// src/components/onboarding/StepConfigInicial.jsx
import { Button } from "../ui/Button";

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIAS_LABEL = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue",
  viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

export function StepConfigInicial({ tipo, horario, onHorarioChange, primerProducto, onProductoChange, onFinish, onBack }) {
  const tieneServicios  = ["servicios", "mixto"].includes(tipo);
  const tieneInventario = ["productos", "restaurante", "mixto"].includes(tipo);

  return (
    <div className="space-y-6">
      {tieneServicios && (
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-3">Días y horario de atención</p>
          <div className="space-y-2">
            {DIAS.map(dia => (
              <div key={dia} className="flex items-center gap-3">
                <button
                  onClick={() => onHorarioChange(dia, "activo", !horario[dia].activo)}
                  className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${horario[dia].activo ? "bg-onboard-green" : "bg-white/20"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white mx-auto transition-transform ${horario[dia].activo ? "translate-x-2.5" : "-translate-x-2.5"}`} />
                </button>
                <span className="text-slate-300 text-sm w-8">{DIAS_LABEL[dia]}</span>
                {horario[dia].activo && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={horario[dia].apertura}
                      onChange={e => onHorarioChange(dia, "apertura", e.target.value)}
                      className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 cursor-pointer"
                    />
                    <span className="text-slate-500 text-xs">–</span>
                    <input
                      type="time"
                      value={horario[dia].cierre}
                      onChange={e => onHorarioChange(dia, "cierre", e.target.value)}
                      className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tieneInventario && (
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-3">Agrega tu primer producto (opcional)</p>
          <div className="space-y-1">
            <input
              placeholder="Nombre del producto"
              value={primerProducto.nombre}
              onChange={e => onProductoChange("nombre", e.target.value)}
              className="w-full bg-white/10 text-white text-sm px-3 py-2.5 rounded-lg border border-white/20 placeholder-slate-500 outline-none focus:border-onboard-green"
            />
            <div className="flex gap-2">
              <input
                placeholder="Precio $"
                type="number"
                value={primerProducto.precio}
                onChange={e => onProductoChange("precio", e.target.value)}
                className="w-1/2 bg-white/10 text-white text-sm px-3 py-2.5 rounded-lg border border-white/20 placeholder-slate-500 outline-none focus:border-onboard-green"
              />
              <input
                placeholder="Stock"
                type="number"
                value={primerProducto.stock}
                onChange={e => onProductoChange("stock", e.target.value)}
                className="w-1/2 bg-white/10 text-white text-sm px-3 py-2.5 rounded-lg border border-white/20 placeholder-slate-500 outline-none focus:border-onboard-green"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1 !text-slate-300 hover:!bg-white/10">Atrás</Button>
        <Button onClick={onFinish} className="flex-1 !bg-onboard-green hover:!bg-green-600">Comenzar</Button>
      </div>
    </div>
  );
}
