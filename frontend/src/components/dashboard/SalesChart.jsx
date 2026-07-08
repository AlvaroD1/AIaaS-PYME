import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { dia: "Lun", ventas: 120 },
  { dia: "Mar", ventas: 85 },
  { dia: "Mie", ventas: 200 },
  { dia: "Jue", ventas: 160 },
  { dia: "Vie", ventas: 240 },
  { dia: "Sab", ventas: 310 },
  { dia: "Dom", ventas: 90 },
];

export function SalesChart() {
  return (
    <div className="bg-white rounded-sm p-6 border border-border">
      <h3 className="font-heading font-semibold text-primary-dark mb-4">Ventas ultimos 7 dias</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={mockData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
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
