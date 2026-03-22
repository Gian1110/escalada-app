import { gradeColor, gradoLabel, GRADOS } from '../lib/supabase.js'

// ── BADGE ─────────────────────────────────────────────
const badgeColors = {
  green:  { bg: 'rgba(74,140,63,0.18)',  color: '#6db860' },
  amber:  { bg: 'rgba(200,154,42,0.18)', color: '#c89a2a' },
  sky:    { bg: 'rgba(58,127,165,0.18)', color: '#7ab8d8' },
  red:    { bg: 'rgba(176,48,32,0.18)',  color: '#e06060' },
  orange: { bg: 'rgba(212,84,26,0.18)',  color: '#e8622a' },
  rock:   { bg: 'rgba(255,255,255,0.06)',color: '#c4c0b8' },
}

export function Badge({ variant = 'rock', children }) {
  const s = badgeColors[variant] || badgeColors.rock
  return (
    <span style={{
      fontSize: '11px', padding: '2px 9px', borderRadius: '100px',
      fontWeight: 500, whiteSpace: 'nowrap',
      background: s.bg, color: s.color,
    }}>
      {children}
    </span>
  )
}

export function GradeBadge({ n }) {
  if (n < 35) return <Badge variant="green">Fácil</Badge>
  if (n < 50) return <Badge variant="green">Intermedio bajo</Badge>
  if (n < 62) return <Badge variant="amber">Intermedio</Badge>
  if (n < 72) return <Badge variant="amber">Avanzado</Badge>
  if (n < 82) return <Badge variant="red">Difícil</Badge>
  return <Badge variant="red">Élite</Badge>
}

// ── BUTTON ────────────────────────────────────────────
const btnStyles = {
  primary: { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
  ghost:   { background: 'none', color: 'var(--chalk-dim)', border: '1px solid var(--rock-border)' },
  danger:  { background: 'var(--danger-dim)', color: '#e06060', border: '1px solid var(--danger)' },
  sky:     { background: 'var(--sky-dim)', color: 'var(--sky-l)', border: '1px solid var(--sky)' },
}

export function Button({ variant = 'ghost', onClick, type = 'button', disabled, children, style }) {
  const base = btnStyles[variant] || btnStyles.ghost
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
        padding: '0.5rem 1.1rem', borderRadius: 'var(--r)',
        fontSize: '13px', fontWeight: 500, transition: 'all 0.12s',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
        ...base, ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── CARD ─────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
      borderRadius: 'var(--rlg)', padding: '1.4rem', marginBottom: '1.1rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function CardTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.05em',
      color: 'var(--chalk-dim)', marginBottom: '1.1rem',
      display: 'flex', alignItems: 'center', gap: '7px',
    }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--rock-border)' }} />
    </div>
  )
}

// ── FIELD ─────────────────────────────────────────────
export function Field({ label, required, hint, children, span }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: span ? `span ${span}` : undefined }}>
      {label && (
        <label style={{ fontSize: '11px', color: 'var(--chalk-muted)', letterSpacing: '0.04em' }}>
          {label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}
        </label>
      )}
      {children}
      {hint && <span style={{ fontSize: '10px', color: 'var(--chalk-muted)' }}>{hint}</span>}
    </div>
  )
}

// ── INPUT / SELECT / TEXTAREA ──────────────────────────
const inputStyle = {
  background: 'var(--rock-input)', border: '1px solid var(--rock-border)',
  color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.5rem 0.7rem',
  fontFamily: "'DM Sans', sans-serif", fontSize: '13px', width: '100%', outline: 'none',
}

export function Input({ id, type = 'text', value, onChange, placeholder, min }) {
  return (
    <input
      id={id} type={type} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} min={min}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--rock-border)'}
    />
  )
}

export function Textarea({ id, value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      id={id} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} rows={rows}
      style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--rock-border)'}
    />
  )
}

export function Select({ id, value, onChange, children }) {
  return (
    <select
      id={id} value={value ?? ''} onChange={onChange}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--rock-border)'}
    >
      {children}
    </select>
  )
}

// ── GRADE SELECTOR ────────────────────────────────────
export function GradeSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {GRADOS.map(g => {
        const sel = value === g.g
        const colors = {
          easy:  { border: 'rgba(74,140,63,0.4)',  color: '#6db860',  selBg: '#4a8c3f' },
          mid:   { border: 'rgba(200,154,42,0.4)', color: '#c89a2a',  selBg: '#c89a2a' },
          hard:  { border: 'rgba(212,84,26,0.4)',  color: '#d4541a',  selBg: '#d4541a' },
          elite: { border: 'rgba(176,48,32,0.4)',  color: '#e06060',  selBg: '#b03020' },
        }
        const c = colors[g.c]
        return (
          <button
            key={g.g} type="button"
            onClick={() => onChange(g.g, g.n)}
            style={{
              padding: '4px 11px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
              border: `1px solid ${sel ? c.selBg : c.border}`,
              background: sel ? c.selBg : 'var(--rock-input)',
              color: sel ? '#fff' : c.color,
              cursor: 'pointer', transition: 'all 0.12s',
            }}
          >
            {g.g}
          </button>
        )
      })}
    </div>
  )
}

// ── MEDIA BOX ─────────────────────────────────────────
export function MediaBox({ title, children }) {
  return (
    <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rlg)', overflow: 'hidden' }}>
      <div style={{ padding: '0.6rem 0.9rem', borderBottom: '1px solid var(--rock-border)', fontSize: '12px', color: 'var(--chalk-muted)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function VideoFrame({ src }) {
  if (!src) {
    return (
      <div style={{ aspectRatio: '16/9', background: 'var(--rock-surf)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--chalk-muted)', fontSize: '12px' }}>
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3 }}><rect x="4" y="10" width="34" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M38 20l6-6v20l-6-6V20z" stroke="currentColor" strokeWidth="1.5"/></svg>
        Video no cargado
      </div>
    )
  }
  return <iframe src={src} style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
}

export function ImageFrame({ src, alt }) {
  if (!src) {
    return (
      <div style={{ minHeight: '180px', background: 'var(--rock-surf)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--chalk-muted)', fontSize: '12px', textAlign: 'center', padding: '2rem 1rem' }}>
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3 }}><rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 36l10-10 8 8 6-6 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Imagen no cargada
      </div>
    )
  }
  return <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
}

// ── INFO CHIP ──────────────────────────────────────────
export function InfoChip({ label, children }) {
  return (
    <div style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', borderRadius: 'var(--r)', padding: '0.6rem 0.9rem' }}>
      <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--chalk)' }}>{children}</div>
    </div>
  )
}

// ── TOAST ─────────────────────────────────────────────
let _toastFn = null
export function registerToast(fn) { _toastFn = fn }
export function toast(msg, type = 'info') { _toastFn?.(msg, type) }

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    registerToast((msg, type) => {
      const id = Date.now()
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    })
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '1.2rem', right: '1.2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
          borderLeft: `3px solid ${t.type === 'ok' ? 'var(--green)' : t.type === 'err' ? 'var(--danger)' : 'var(--sky)'}`,
          borderRadius: 'var(--r)', padding: '0.65rem 1.1rem', fontSize: '12px', color: 'var(--chalk-dim)',
          minWidth: '200px', animation: 'fadeIn 0.18s ease',
        }}>
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  )
}

// need useState/useEffect imported
import { useState, useEffect } from 'react'

// ── PAGE WRAPPER ──────────────────────────────────────
export function Page({ children }) {
  return <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.75rem 1.5rem' }}>{children}</div>
}

export function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--chalk-dim)',
      letterSpacing: '0.05em', margin: '1.25rem 0 0.75rem',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--rock-border)' }} />
    </div>
  )
}

export function Divider() {
  return <div style={{ height: '1px', background: 'var(--rock-border)', margin: '1.1rem 0' }} />
}

export function WarnBox({ children }) {
  return (
    <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(200,154,42,0.22)', borderRadius: 'var(--r)', padding: '0.7rem 0.9rem', fontSize: '12px', color: 'var(--chalk-muted)', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

export function Spinner() {
  return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--chalk-muted)' }}>Cargando...</div>
}
