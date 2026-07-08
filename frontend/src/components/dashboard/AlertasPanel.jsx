import { AlertTriangle, Package } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";

export function AlertasPanel() {
  const { state } = useNegocio();
  const alertas = state.inventario.filter(p => p.stock <= state.umbralStock);

  if (alertas.length === 0) {
    return (
      <div className="bg-white rounded-sm p-6 border border-border">
        <h3 className="font-heading font-semibold text-primary-dark mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent" /> Alertas de Stock
        </h3>
        <p className="text-gray-400 text-sm">Todo el inventario tiene stock suficiente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm p-6 border border-red-100">
      <h3 className="font-heading font-semibold text-destructive mb-3 flex items-center gap-2">
        <AlertTriangle size={18} /> Alertas de Stock Bajo
      </h3>
      <div className="space-y-2">
        {alertas.map(item => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-50 last:border-0">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-primary-dark">{item.nombre}</span>
            </div>
            <span className="text-xs font-bold text-destructive bg-red-50 px-2 py-1 rounded-full">
              {item.stock} unidades
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
