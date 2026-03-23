import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLugares, getViasByLugar, rangoFromVias } from '../lib/supabase.js'
import { Page, Badge, Spinner } from '../components/ui.jsx'

export default function Rutas() {
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const data = await getLugares()
        const conVias = await Promise.all(data.map(async l => {
          const vias = await getViasByLugar(l.id)
          return { ...l, vias, rango: rangoFromVias(vias) }
        }))
        setLugares(conVias)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <Page>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.04em', color: 'var(--chalk)', marginBottom: '1.25rem' }}>
        Lugares de escalada
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {lugares.map(l => (
            <div key={l.id} onClick={() => navigate(`/lugar/${l.id}`)} style={{
              background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
              borderRadius: 'var(--rlg)', overflow: 'hidden', cursor: 'pointer',
              transition: 'transform 0.14s, border-color 0.14s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--rock-border)' }}
            >
              <div style={{ height: '140px', background: 'var(--rock-surf)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {l.imagen
                  ? <img src={l.imagen} alt={l.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <svg width="56" height="56" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.25 }}><path d="M5 50L20 20L30 35L38 25L55 50H5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                }
              </div>
              <div style={{ padding: '1.1rem' }}>
                <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>{l.zona}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.35rem', color: 'var(--chalk)', marginBottom: '0.6rem' }}>{l.nombre}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {l.altitud && <Badge variant="sky">{l.altitud}</Badge>}
                  <Badge variant="rock">{l.vias.length} vías</Badge>
                  {l.rango && <Badge variant="amber">{l.rango}</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  )
}
