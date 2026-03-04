/**
 * Reusable Input Component
 * Supports text, email, password, number inputs with labels and error messages
 */
export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-dark-text-secondary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-dark-800 text-dark-text placeholder-dark-text-secondary border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-dark-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-dark-text-secondary">{helperText}</p>}
    </div>
  )
}

export default Input
