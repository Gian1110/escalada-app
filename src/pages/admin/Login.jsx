import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { Card, CardTitle, Field, Input, Button } from '../../components/ui.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/admin/nueva')
    } catch (err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.06em' }}>
          <span style={{ color: 'var(--accent)' }}>Escalada</span>NOA
        </div>
        <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginTop: '4px' }}>Panel de administración</div>
      </div>

      <Card>
        <CardTitle>Iniciar sesión</CardTitle>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Field label="Email" required>
              <Input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
              />
            </Field>
            <Field label="Contraseña" required>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error && (
              <div style={{ fontSize: '12px', color: '#e06060', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--r)', padding: '0.5rem 0.75rem' }}>
                {error}
              </div>
            )}
            <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </Card>

      <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(200,154,42,0.22)', borderRadius: 'var(--r)', padding: '0.7rem 0.9rem', fontSize: '11px', color: 'var(--chalk-muted)', lineHeight: 1.6, marginTop: '1rem' }}>
        <strong style={{ color: 'var(--gold)' }}>Para crear tu usuario admin:</strong><br />
        1. Ir a supabase.com → tu proyecto → Authentication → Users<br />
        2. Click en "Add user" → ingresá email y contraseña<br />
        3. Usá esas credenciales acá
      </div>
    </div>
  )
}
