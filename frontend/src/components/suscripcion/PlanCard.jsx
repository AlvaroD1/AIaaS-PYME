import { Check } from "lucide-react";
import { Button } from "../ui/Button";

export function PlanCard({ nombre, precio, features, activo, popular, onSeleccionar }) {
  return (
    <div className={`
      relative bg-white rounded-2xl shadow-md p-6 border-2 transition-all duration-200
      ${activo ? "border-primary shadow-xl scale-[1.02]" : "border-border hover:border-secondary hover:shadow-lg"}
    `}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">Más popular</span>
        </div>
      )}
      {activo && (
        <div className="absolute -top-3 right-4">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Plan activo</span>
        </div>
      )}
      <h3 className="font-heading font-bold text-primary-dark text-xl mb-1">{nombre}</h3>
      <div className="mb-5">
        <span className="text-3xl font-bold text-primary-dark">${precio}</span>
        <span className="text-gray-400 text-sm">/mes</span>
      </div>
      <ul className="space-y-2.5 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <Check size={15} className="text-onboard-green mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onSeleccionar}
        variant={activo ? "ghost" : popular ? "primary" : "secondary"}
        className="w-full"
        disabled={activo}
      >
        {activo ? "Plan actual" : "Seleccionar plan"}
      </Button>
    </div>
  );
}
