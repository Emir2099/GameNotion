import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import styles from './Modal.module.css';

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220); // Matches the slideOut CSS animation duration (220ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  const sizeClass = { sm: styles['modal--sm'], md: styles['modal--md'], lg: styles['modal--lg'], xl: styles['modal--xl'] }[size] || styles['modal--md'];

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`${styles.modal} ${sizeClass} ${isClosing ? styles.modalClosing : ''}`} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export function FormGroup({ label, required, hint, error, children }) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span style={{ color: 'var(--red-light)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export function FormRow({ children }) {
  return <div className={styles.formRow}>{children}</div>;
}

export function Select({ value, onChange, children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef(null);

  // Parse option tags
  const options = React.Children.toArray(children)
    .filter(child => child && child.type === 'option')
    .map(child => ({
      value: child.props.value,
      label: child.props.children,
    }));

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 150); // Matches dropdownSlideOut duration (150ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  return (
    <div className={`${styles.selectContainer} ${className || ''}`} ref={containerRef}>
      <button
        type="button"
        className={`${styles.selectTrigger} ${isOpen ? styles.selectTriggerActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>
      {shouldRender && (
        <ul className={`${styles.optionsList} ${isClosing ? styles.optionsListClosing : ''}`}>
          {options.map(opt => (
            <li
              key={opt.value}
              className={`${styles.optionItem} ${opt.value === value ? styles.optionItemActive : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
