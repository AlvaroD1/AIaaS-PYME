// src/components/inventario/Inventario.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2, Package, Image as ImageIcon } from "lucide-react";
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

  const { tipoNegocio, subTipoSalud } = state.negocio;
  const esServicioSalud = tipoNegocio === "salud" && subTipoSalud !== "veterinaria";

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary-dark">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            {state.inventario.length} productos registrados
          </p>
        </div>
        <Button onClick={handleNuevo} className="w-full sm:w-auto justify-center">
          <Plus size={16} /> Agregar Producto
        </Button>
      </div>

      {state.inventario.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-md">
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
        <div className="bg-white rounded-2xl shadow-md overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                {["Producto", "Precio", esServicioSalud ? null : "Stock", "Acciones"].filter(Boolean).map(h => (
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-primary-dark text-sm">{item.nombre}</p>
                      {item.fotoUrl && <ImageIcon size={14} className="text-blue-500" title="Contiene foto" />}
                    </div>
                    {item.desc && <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-primary-dark">
                    {item.precio > 0 ? `$${item.precio.toFixed(2)}` : "A convenir"}
                  </td>
                  {!esServicioSalud && (
                    <td className="px-5 py-4">
                      <Badge variant={item.stock <= state.umbralStock ? "danger" : "success"}>
                        {item.stock} unids
                      </Badge>
                    </td>
                  )}
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
