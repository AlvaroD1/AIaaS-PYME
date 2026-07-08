// src/components/inventario/Inventario.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ProductoModal } from "./ProductoModal";

export function Inventario() {
  const { state, agregarProducto, editarProducto, eliminarProducto } = useNegocio();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  function handleSave(producto) {
    if (producto.id) editarProducto(producto);
    else agregarProducto(producto);
  }

  function handleEditar(p) {
    setEditando(p);
    setModalOpen(true);
  }

  function handleNuevo() {
    setEditando(null);
    setModalOpen(true);
  }

  function handleEliminar(id) {
    eliminarProducto(id);
    setConfirmId(null);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary-dark">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            {state.inventario.length} productos registrados
          </p>
        </div>
        <Button onClick={handleNuevo}>
          <Plus size={16} /> Agregar Producto
        </Button>
      </div>

      {state.inventario.length === 0 ? (
        <div className="bg-white rounded-sm p-16 text-center border border-border">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-gray-500 mb-2">Sin productos aún</h3>
          <p className="text-gray-400 text-sm mb-6">
            Agrega tu primer producto para que el agente pueda responder sobre precios y disponibilidad.
          </p>
          <Button onClick={handleNuevo}>
            <Plus size={16} /> Agregar primer producto
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                {["Producto", "Precio", "Stock", "Acciones"].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.inventario.map(item => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-primary-dark text-sm">{item.nombre}</p>
                    {item.desc && <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-primary-dark">
                    ${item.precio.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={item.stock <= state.umbralStock ? "danger" : "success"}>
                      {item.stock} unids
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(item)}
                        className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} className="text-primary" />
                      </button>
                      <button
                        onClick={() => setConfirmId(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} className="text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditando(null);
        }}
        onSave={handleSave}
        producto={editando}
      />

      <ConfirmDialog
        isOpen={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => handleEliminar(confirmId)}
        title="¿Eliminar producto?"
        message="Esta acción no se puede deshacer."
      />
    </div>
  );
}
