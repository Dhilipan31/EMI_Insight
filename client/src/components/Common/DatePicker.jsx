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
        <label className="block text-sm font-medium text-gray-700">
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
        className={`w-full px-4 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default DatePicker
