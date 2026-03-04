/**
 * Reusable Modal Component
 * Displays content in a centered modal with backdrop
 */
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className={`bg-dark-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full animate-scaleIn relative`}>
        {/* Close Button (Always visible) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text transition z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <h2 className="text-xl font-semibold text-dark-text">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={title ? "p-6" : "p-6 pt-12"}>{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 bg-dark-700 rounded-b-lg border-t border-dark-600 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
