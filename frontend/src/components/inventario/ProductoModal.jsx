// src/components/inventario/ProductoModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useNegocio } from "../../hooks/useNegocio";

const EMPTY = { nombre: "", desc: "", precio: "", stock: "", foto_url: "", foto_file: null };

export function ProductoModal({ isOpen, onClose, onSave, producto }) {
  const { state } = useNegocio();
  const { tipoNegocio, subTipoSalud } = state.negocio;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const esServicioSalud = tipoNegocio === "salud" && subTipoSalud !== "veterinaria";

  let placeholderNombre = "Ej. Hamburguesa doble";
  let placeholderDesc = "Ej. Con queso y tocino";
  let labelStock = "Stock";
  let placeholderStock = "0";

  if (tipoNegocio === "productos") {
    placeholderNombre = "Ej. Paracetamol 500mg";
    placeholderDesc = "Ej. Caja x 20 tabletas";
  } else if (tipoNegocio === "servicios") {
    placeholderNombre = "Ej. Corte de cabello";
    placeholderDesc = "Ej. Incluye lavado y secado";
  } else if (tipoNegocio === "salud") {
    if (subTipoSalud === "veterinaria") {
      placeholderNombre = "Ej. Consulta General / Collar Antipulgas";
      placeholderDesc = "Ej. Evaluación médica / Para perros medianos";
    } else {
      placeholderNombre = "Ej. Consulta Médica / Limpieza Dental";
      placeholderDesc = "Ej. Revisión general";
    }
  } else if (tipoNegocio === "academia") {
    placeholderNombre = "Ej. Curso de Inglés";
    placeholderDesc = "Ej. Nivel Básico - Lunes y Miércoles";
    labelStock = "Cupos";
  }

  useEffect(() => {
    setForm(
      producto
          ? {
              nombre: producto.nombre,
              desc: producto.desc ?? "",
              precio: producto.precio ? String(producto.precio) : "",
              stock: String(producto.stock),
              foto_url: producto.fotoUrl ?? "",
              foto_file: null,
            }
          : EMPTY
    );
    setErrors({});
  }, [producto, isOpen]);

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Nombre obligatorio";
    
    if (!esServicioSalud) {
      if (!form.precio || isNaN(form.precio)) e.precio = "Precio válido obligatorio";
      if (form.stock === "" || isNaN(form.stock)) e.stock = "Stock obligatorio";
    }
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
      precio: parseFloat(form.precio) || 0,
      stock: esServicioSalud ? 9999 : parseInt(form.stock, 10),
      fotoUrl: form.foto_url.trim(),
      fotoFile: form.foto_file,
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
          placeholder={placeholderNombre}
        />
        <Input
          label="Descripción"
          value={form.desc}
          onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
          placeholder={placeholderDesc}
        />
        {!esServicioSalud && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary-dark">Foto del Producto (Opcional)</label>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 12 * 1024 * 1024) {
                    alert("La imagen es demasiado grande. Máximo 12MB.");
                    e.target.value = "";
                    return;
                  }
                  setForm(p => ({ ...p, foto_file: file }));
                }
              }}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
            />
            {form.foto_url && !form.foto_file && (
              <span className="text-xs text-green-600 mt-1">Ya tiene una foto guardada. Sube otra para reemplazarla.</span>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={esServicioSalud ? "Precio referencial ($) opcional" : "Precio ($)"}
            type="number"
            value={form.precio}
            onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
            required={!esServicioSalud}
            error={errors.precio}
            placeholder="0.00"
          />
          {!esServicioSalud && (
            <Input
              label={labelStock}
              type="number"
              value={form.stock}
              onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
              required
              error={errors.stock}
              placeholder={placeholderStock}
            />
          )}
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
