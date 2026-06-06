import React from 'react';

const VARIANT_MAP = {
  // Status
  open:        { bg: 'var(--red-dim)',    color: 'var(--red-light)',    border: 'rgba(220,38,38,0.25)' },
  'in-progress':{ bg: 'var(--amber-dim)', color: 'var(--amber-light)',  border: 'rgba(217,119,6,0.25)' },
  review:      { bg: 'var(--blue-dim)',   color: 'var(--blue-light)',   border: 'rgba(37,99,235,0.25)' },
  done:        { bg: 'var(--green-dim)',  color: 'var(--green-light)',  border: 'rgba(5,150,105,0.25)' },
  resolved:    { bg: 'var(--green-dim)',  color: 'var(--green-light)',  border: 'rgba(5,150,105,0.25)' },
  planned:     { bg: 'rgba(124,58,237,0.1)', color: 'var(--brand-300)', border: 'rgba(124,58,237,0.25)' },
  integrated:  { bg: 'var(--green-dim)',  color: 'var(--green-light)',  border: 'rgba(5,150,105,0.25)' },
  closed:      { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', border: 'var(--border-subtle)' },
  'needs-info':{ bg: 'var(--cyan-dim)',   color: 'var(--cyan-light)',   border: 'rgba(8,145,178,0.25)' },

  // Priority / Severity
  critical:    { bg: 'rgba(220,38,38,0.12)',  color: '#f87171', border: 'rgba(220,38,38,0.3)' },
  high:        { bg: 'rgba(234,88,12,0.12)',  color: '#fb923c', border: 'rgba(234,88,12,0.3)' },
  medium:      { bg: 'rgba(217,119,6,0.12)',  color: '#fbbf24', border: 'rgba(217,119,6,0.3)' },
  low:         { bg: 'rgba(5,150,105,0.12)',  color: '#34d399', border: 'rgba(5,150,105,0.3)' },

  // Type
  mesh:        { bg: 'var(--cyan-dim)',   color: 'var(--cyan-light)',   border: 'rgba(8,145,178,0.25)' },
  texture:     { bg: 'var(--amber-dim)',  color: 'var(--amber-light)',  border: 'rgba(217,119,6,0.25)' },
  audio:       { bg: 'var(--green-dim)',  color: 'var(--green-light)',  border: 'rgba(5,150,105,0.25)' },
  blueprint:   { bg: 'var(--blue-dim)',   color: 'var(--blue-light)',   border: 'rgba(37,99,235,0.25)' },
  animation:   { bg: 'var(--orange-dim)', color: 'var(--orange-light)', border: 'rgba(234,88,12,0.25)' },
  vfx:         { bg: 'var(--red-dim)',    color: 'var(--red-light)',    border: 'rgba(220,38,38,0.25)' },

  // Departments
  Direction:   { bg: 'rgba(124,58,237,0.12)', color: 'var(--brand-300)', border: 'rgba(124,58,237,0.25)' },
  Engineering: { bg: 'var(--blue-dim)',   color: 'var(--blue-light)',   border: 'rgba(37,99,235,0.25)' },
  Art:         { bg: 'var(--cyan-dim)',   color: 'var(--cyan-light)',   border: 'rgba(8,145,178,0.25)' },
  Audio:       { bg: 'var(--green-dim)',  color: 'var(--green-light)',  border: 'rgba(5,150,105,0.25)' },
  Narrative:   { bg: 'var(--amber-dim)', color: 'var(--amber-light)',  border: 'rgba(217,119,6,0.25)' },
  QA:          { bg: 'var(--red-dim)',    color: 'var(--red-light)',    border: 'rgba(220,38,38,0.25)' },
  default:     { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: 'var(--border-subtle)' },
};

export function Badge({ label, variant = 'default', size = 'sm', dot = false, style: extraStyle }) {
  const cfg = VARIANT_MAP[variant] || VARIANT_MAP.default;
  const isSmall = size === 'xs';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 9999,
      fontSize: isSmall ? 10 : 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      padding: isSmall ? '1px 6px' : '2px 8px',
      whiteSpace: 'nowrap',
      lineHeight: 1.5,
      ...extraStyle,
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5,
          borderRadius: '50%',
          background: cfg.color,
          flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}

// Priority label map
export const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
export const STATUS_LABELS = {
  open: 'Open', 'in-progress': 'In Progress', review: 'In Review',
  done: 'Done', resolved: 'Resolved', closed: 'Closed', planned: 'Planned',
  integrated: 'Integrated', 'needs-info': 'Needs Info',
};
export const TYPE_LABELS = { mesh: '3D Mesh', texture: 'Texture', audio: 'Audio', blueprint: 'Blueprint', animation: 'Animation', vfx: 'VFX' };
