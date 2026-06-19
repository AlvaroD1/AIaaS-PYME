// src/components/onboarding/StepIdentidad.jsx
import { useState } from "react";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";

const CIUDADES = [
  { value: "quito", label: "Quito" },
  { value: "guayaquil", label: "Guayaquil" },
  { value: "cuenca", label: "Cuenca" },
  { value: "loja", label: "Loja" },
  { value: "ambato", label: "Ambato" },
  { value: "otra", label: "Otra ciudad" },
];

const SECTORES = [
  { value: "tienda", label: "Tienda / Abarrotes" },
  { value: "restaurante", label: "Restaurante / Comida" },
  { value: "barberia", label: "Barbería / Salón" },
  { value: "limpieza", label: "Servicios de Limpieza" },
  { value: "moda", label: "Moda / Ropa" },
  { value: "academia", label: "Academia / Educación" },
  { value: "salud", label: "Salud / Consultorio" },
  { value: "otro", label: "Otro" },
];

export function StepIdentidad({ datos, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!datos.nombre?.trim()) e.nombre = "El nombre del negocio es obligatorio";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onNext();
  }

  return (
    <div className="space-y-2">
      <Input
        label="Nombre del negocio"
        value={datos.nombre}
        onChange={e => onChange("nombre", e.target.value)}
        placeholder="Ej. Tienda Doña Rosa"
        required
        error={errors.nombre}
      />
      <Select
        label="Ciudad"
        value={datos.ciudad}
        onChange={e => onChange("ciudad", e.target.value)}
        options={CIUDADES}
        required
      />
      <Select
        label="Sector / Tipo de industria"
        value={datos.sector}
        onChange={e => onChange("sector", e.target.value)}
        options={SECTORES}
        required
      />
      <Button onClick={handleNext} className="w-full mt-4">Continuar</Button>
    </div>
  );
}
