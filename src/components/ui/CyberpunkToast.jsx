import React, { useState, useEffect, createContext, useContext } from "react";
import "./CyberpunkToast.css";

// Context for toast management
const ToastContext = createContext();

/**
 * Toast Provider for managing notifications throughout the app
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      timestamp: new Date().toISOString()
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 4000);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  };

  const error = (message, options = {}) => {
    return addToast({ type: 'error', message, duration: 6000, ...options });
  };

  const warning = (message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  };

  const info = (message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast Container for displaying all active toasts
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <CyberpunkToast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

/**
 * Individual Toast component
 */
const CyberpunkToast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Enter animation
    setTimeout(() => setIsVisible(true), 10);

    return () => {
      setIsExiting(true);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const toastClass = `
    cyberpunk-toast
    toast-${toast.type || 'info'}
    ${isVisible ? 'visible' : ''}
    ${isExiting ? 'exiting' : ''}
  `;

  return (
    <div className={toastClass}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-message">
          {toast.message}
          {toast.description && (
            <div className="toast-description">
              {toast.description}
            </div>
          )}
        </div>
        {toast.duration !== 0 && (
          <button
            className="toast-close"
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>

      {toast.showProgress && (
        <div className="toast-progress">
          <div
            className="toast-progress-bar"
            style={{
              animationDuration: `${toast.duration || 4000}ms`
            }}
          />
        </div>
      )}

      {/* Glitch effect */}
      <div className="toast-glitch"></div>
    </div>
  );
};

export default CyberpunkToast;