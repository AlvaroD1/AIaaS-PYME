import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNegocio } from "../../hooks/useNegocio";

const DIAS_LABEL = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export function SalesChart() {
  const { state } = useNegocio();
  const pedidos = state.pedidos || [];

  // Agrupar ventas de los últimos 7 días
  const ahora = new Date();
  const dataPorDia = [];

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() - i);
    fecha.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const ventasDia = pedidos
      .filter(p => {
        const fp = new Date(p.fecha);
        return fp >= fecha && fp <= finDia;
      })
      .reduce((sum, p) => sum + (p.total || 0), 0);

    dataPorDia.push({
      dia: DIAS_LABEL[fecha.getDay()],
      ventas: Math.round(ventasDia * 100) / 100,
    });
  }

  const tieneData = dataPorDia.some(d => d.ventas > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h3 className="font-heading font-semibold text-primary-dark mb-4">Ventas ultimos 7 dias</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dataPorDia} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DBEAFE" />
          <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "4px", border: "1px solid #E2E8F0", fontSize: "13px" }}
            formatter={(v) => [`$${v}`, "Ventas"]}
          />
          <Bar dataKey="ventas" fill="#0F766E" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
