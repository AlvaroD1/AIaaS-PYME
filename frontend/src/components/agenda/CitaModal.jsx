import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const EMPTY = { cliente: "", servicio: "", fecha: "", hora: "" };

export function CitaModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

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
    onSave({ ...form });
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Cita">
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input label="Cliente" value={form.cliente} onChange={e => setForm(p => ({...p, cliente: e.target.value}))} required error={errors.cliente} placeholder="Ej. Juan Pérez" />
        <Input label="Servicio" value={form.servicio} onChange={e => setForm(p => ({...p, servicio: e.target.value}))} required error={errors.servicio} placeholder="Ej. Corte + Barba" />
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
