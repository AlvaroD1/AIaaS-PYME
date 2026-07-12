import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useNegocio } from "../../hooks/useNegocio";

const EMPTY = { cliente: "", servicio: "", fecha: "", hora: "" };

export function CitaModal({ isOpen, onClose, onSave }) {
  const { state } = useNegocio();
  const { tipoNegocio, subTipoSalud } = state.negocio;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  let labelCliente = "Cliente";
  let placeholderCliente = "Ej. Juan Pérez";
  let labelServicio = "Servicio";
  let placeholderServicio = "Ej. Corte + Barba";

  if (tipoNegocio === "salud") {
    labelCliente = subTipoSalud === "veterinaria" ? "Mascota / Dueño" : "Paciente";
    placeholderCliente = subTipoSalud === "veterinaria" ? "Ej. Firulais (Juan)" : "Ej. Juan Pérez";
    placeholderServicio = subTipoSalud === "veterinaria" ? "Ej. Vacuna Rabia" : "Ej. Consulta General";
  } else if (tipoNegocio === "academia") {
    labelCliente = "Estudiante";
    placeholderServicio = "Ej. Clase de Inglés";
  }

  function validate() {
    const e = {};
    if (!form.cliente.trim()) e.cliente = "Nombre del cliente obligatorio";
    if (!form.servicio.trim()) e.servicio = "Servicio obligatorio";
    if (!form.fecha) e.fecha = "Fecha obligatoria";
    if (!form.hora) e.hora = "Hora obligatoria";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    onSave({ 
      cliente_nombre: form.cliente, 
      servicio: form.servicio, 
      fecha: form.fecha, 
      hora: form.hora 
    });
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Cita">
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input label={labelCliente} value={form.cliente} onChange={e => setForm(p => ({...p, cliente: e.target.value}))} required error={errors.cliente} placeholder={placeholderCliente} />
        <Input label={labelServicio} value={form.servicio} onChange={e => setForm(p => ({...p, servicio: e.target.value}))} required error={errors.servicio} placeholder={placeholderServicio} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(p => ({...p, fecha: e.target.value}))} required error={errors.fecha} />
          <Input label="Hora" type="time" value={form.hora} onChange={e => setForm(p => ({...p, hora: e.target.value}))} required error={errors.hora} />
        </div>
        <div className="flex gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" className="flex-1">Agendar Cita</Button>
        </div>
      </form>
    </Modal>
  );
}
