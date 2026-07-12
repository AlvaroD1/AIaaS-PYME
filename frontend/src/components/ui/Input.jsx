// src/components/ui/Input.jsx
export function Input({ label, value, onChange, placeholder, required, error, helperText, type = "text", className = "" }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-primary-dark mb-1.5">
          {label}{required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-3 rounded-sm border text-primary-dark text-sm
          bg-white transition-all duration-200 outline-none
          ${error ? "border-destructive focus:ring-2 focus:ring-red-200" : "border-border focus:border-primary focus:ring-2 focus:ring-teal-100"}
          ${className}
        `}
      />
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-400 text-xs mt-1">{helperText}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, required, className = "" }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-primary-dark mb-1.5">
          {label}{required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-4 py-3 rounded-sm border border-border bg-white
          text-primary-dark text-sm cursor-pointer
          focus:border-primary focus:ring-2 focus:ring-teal-100 outline-none
          transition-all duration-200 ${className}
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
