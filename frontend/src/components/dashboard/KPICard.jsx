export function KPICard({ titulo, valor, subtitulo, color = "border-primary", icon: Icon }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border-t-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{titulo}</p>
          <h2 className="text-3xl font-heading font-bold text-primary-dark mt-2">{valor}</h2>
          {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-muted">
            <Icon size={22} className="text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
