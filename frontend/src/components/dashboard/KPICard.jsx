const TONOS = {
  neutral: "text-gray-300",
  success: "text-onboard-green",
  warning: "text-accent",
  danger: "text-destructive",
};

export function KPICard({ titulo, valor, subtitulo, tono = "neutral", icon: Icon, boxed = false, className = "" }) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{titulo}</p>
        {Icon && <Icon size={15} className={TONOS[tono]} strokeWidth={1.75} />}
      </div>
      <div>
        <h2 className="text-4xl font-heading font-bold text-primary-dark tabular-nums leading-none">{valor}</h2>
        {subtitulo && <p className="text-xs text-gray-400 mt-2">{subtitulo}</p>}
      </div>
    </>
  );

  if (boxed) {
    return <div className={`bg-white p-6 border border-border ${className}`}>{content}</div>;
  }
  return <div className={`p-6 ${className}`}>{content}</div>;
}
