// src/components/inventario/ProductoModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const EMPTY = { nombre: "", desc: "", precio: "", stock: "" };

export function ProductoModal({ isOpen, onClose, onSave, producto }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(
      producto
        ? {
            nombre: producto.nombre,
            desc: producto.desc ?? "",
            precio: String(producto.precio),
            stock: String(producto.stock),
          }
        : EMPTY
    );
    setErrors({});
  }, [producto, isOpen]);

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Nombre obligatorio";
    if (!form.precio || isNaN(form.precio)) e.precio = "Precio válido obligatorio";
    if (form.stock === "" || isNaN(form.stock)) e.stock = "Stock obligatorio";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    onSave({
      ...(producto || {}),
      nombre: form.nombre.trim(),
      desc: form.desc.trim(),
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10),
    });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={producto ? "Editar Producto" : "Nuevo Producto"}>
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input
          label="Nombre"
          value={form.nombre}
          onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
          required
          error={errors.nombre}
          placeholder="Ej. Hamburguesa doble"
        />
        <Input
          label="Descripción"
          value={form.desc}
          onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
          placeholder="Ej. Con queso y tocino"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Precio ($)"
            type="number"
            value={form.precio}
            onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
            required
            error={errors.precio}
            placeholder="0.00"
          />
          <Input
            label="Stock"
            type="number"
            value={form.stock}
            onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
            required
            error={errors.stock}
            placeholder="0"
          />
        </div>
        <div className="flex gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {producto ? "Guardar cambios" : "Agregar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
