/**
 * Reusable Card Component
 * Container for content with optional title and actions
 */
export const Card = ({
  title,
  children,
  className = '',
  headerAction,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    filled: 'bg-gray-50 border border-gray-200',
  }

  return (
    <div className={`rounded-lg transition ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export default Card
