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
    default: 'bg-dark-800 border border-dark-700',
    elevated: 'bg-dark-800 shadow-lg shadow-black/50',
    filled: 'bg-dark-700 border border-dark-600',
  }

  return (
    <div className={`rounded-lg transition ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-dark-text">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export default Card
