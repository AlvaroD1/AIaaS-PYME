// src/components/ui/Button.jsx
const variants = {
  primary: "bg-primary hover:bg-primary-dark text-white",
  secondary: "bg-transparent border-2 border-primary text-primary hover:bg-muted",
  danger: "bg-destructive hover:bg-red-700 text-white",
  ghost: "bg-transparent text-primary-dark hover:bg-muted",
  accent: "bg-accent hover:bg-yellow-700 text-white",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", onClick, disabled, children, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 font-semibold rounded-lg
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  );
}
