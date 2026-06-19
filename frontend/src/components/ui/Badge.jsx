// src/components/ui/Badge.jsx
const variants = {
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-destructive",
  info: "bg-blue-100 text-primary",
  default: "bg-muted text-primary-dark",
};

export function Badge({ variant = "default", children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
