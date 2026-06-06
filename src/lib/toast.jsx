import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Toast System ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'default', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const typeConfig = {
  default: { bg: 'var(--bg-elevated)', border: 'var(--border-strong)', icon: '💬' },
  success: { bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.3)', icon: '✓' },
  error:   { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)', icon: '✕' },
  warning: { bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)', icon: '⚠' },
  info:    { bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.3)', icon: 'ℹ' },
};

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 'var(--z-toast)',
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const cfg = typeConfig[t.type] || typeConfig.default;
        return (
          <div
            key={t.id}
            onClick={() => onRemove(t.id)}
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'auto',
              cursor: 'pointer',
              maxWidth: 360,
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              animation: 'slideInRight 0.2s ease',
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{cfg.icon}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
