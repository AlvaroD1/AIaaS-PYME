// src/components/onboarding/StepTipoNegocio.jsx
import { Package, Wrench, UtensilsCrossed, LayoutGrid, Heart, GraduationCap } from "lucide-react";
import { Button } from "../ui/Button";

const TIPOS = [
  { value: "productos",   icon: Package,          label: "Productos",          desc: "Tienda, farmacia, moda" },
  { value: "servicios",   icon: Wrench,           label: "Servicios",          desc: "Barbería, limpieza, taller" },
  { value: "restaurante", icon: UtensilsCrossed,  label: "Restaurante",        desc: "Comida y bebidas" },
  { value: "salud",       icon: Heart,            label: "Salud / Consultorio", desc: "Clínica, dentista, veterinaria" },
  { value: "academia",    icon: GraduationCap,    label: "Academia / Educación", desc: "Cursos, talleres, clases" },
  { value: "mixto",       icon: LayoutGrid,       label: "Mixto",              desc: "Productos y servicios" },
];

export function StepTipoNegocio({ tipoSeleccionado, onChange, onNext, onBack }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {TIPOS.map(({ value, icon: Icon, label, desc }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`
              p-5 rounded-2xl border-2 text-left cursor-pointer
              transition-all duration-200
              ${tipoSeleccionado === value
                ? "border-onboard-green bg-onboard-green/10 text-white"
                : "border-white/20 bg-white/5 text-slate-300 hover:border-white/40"}
            `}
          >
            <Icon size={28} className={tipoSeleccionado === value ? "text-onboard-green mb-3" : "text-slate-400 mb-3"} />
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs opacity-70 mt-1">{desc}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="flex-1 !text-slate-300 hover:!bg-white/10">Atrás</Button>
        <Button onClick={onNext} disabled={!tipoSeleccionado} className="flex-1 !bg-onboard-green hover:!bg-green-600">Continuar</Button>
      </div>
    </div>
  );
}
