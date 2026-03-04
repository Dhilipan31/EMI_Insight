/**
 * Reusable Select Component
 * Dropdown selector with label and error handling
 */
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  error,
  disabled = false,
  required = false,
  className = '',
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-dark-text-secondary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-dark-800 text-dark-text border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-dark-700'
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Select
