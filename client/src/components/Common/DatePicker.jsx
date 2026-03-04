/**
 * DatePicker Component
 * Date input with validation and formatting
 */
export const DatePicker = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
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
      <input
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-4 py-2.5 bg-dark-800 text-dark-text border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-dark-700'
        } ${className}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default DatePicker
