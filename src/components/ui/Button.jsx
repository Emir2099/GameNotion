import React from 'react';
import styles from './Button.module.css';

export function Button({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  disabled,
  loading,
  fullWidth,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        fullWidth ? styles['btn--full'] : '',
        loading ? styles['btn--loading'] : '',
      ].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {Icon && !loading && <Icon size={14} strokeWidth={2} />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={14} strokeWidth={2} />}
    </button>
  );
}
