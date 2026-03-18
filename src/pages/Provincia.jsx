import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProvincia, getLugaresByProvincia, getViasByLugar, rangoFromVias } from '../lib/supabase.js'
import { Page, Badge, Spinner } from '../components/ui.jsx'

export default function ProvinciaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [provincia, setProvincia] = useState(null)
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [p, ls] = await Promise.all([getProvincia(id), getLugaresByProvincia(id)])
        const lsConVias = await Promise.all(ls.map(async l => {
          const vias = await getViasByLugar(l.id)
          return { ...l, vias, rango: rangoFromVias(vias) }
        }))
        setProvincia(p)
        setLugares(lsConVias)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Spinner />
  if (!provincia) return <Page><p style={{ color: 'var(--chalk-muted)' }}>Provincia no encontrada.</p></Page>

  const totalVias = lugares.reduce((a, l) => a + l.vias.length, 0)

  return (
    <Page>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '1rem', display: 'flex', gap: '6px' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Inicio</span>
        <span>›</span>
        <span style={{ color: 'var(--chalk-dim)' }}>Guía de Escalada {provincia.nombre}</span>
      </div>

      {/* Hero */}
      <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rlg)', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Argentina</div>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--chalk)', marginBottom: '0.5rem' }}>
          Guía de Escalada {provincia.nombre}
        </h2>

        {provincia.imagen && (
          <img src={provincia.imagen} alt={provincia.nombre} style={{ maxWidth: '480px', width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: 'var(--rlg)', margin: '0.9rem 0 0.75rem', display: 'block' }} />
        )}

        {provincia.descripcion && (
          <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', maxWidth: '650px', lineHeight: 1.8, marginBottom: '1rem' }}>{provincia.descripcion}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', borderRadius: 'var(--r)', padding: '0.6rem 0.9rem' }}>
            <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Lugares</div>
            <div style={{ fontSize: '1.4rem', fontFamily: "'Bebas Neue', sans-serif", color: 'var(--chalk)' }}>{lugares.length}</div>
          </div>
          <div style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', borderRadius: 'var(--r)', padding: '0.6rem 0.9rem' }}>
            <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Vías totales</div>
            <div style={{ fontSize: '1.4rem', fontFamily: "'Bebas Neue', sans-serif", color: 'var(--chalk)' }}>{totalVias}</div>
          </div>
        </div>
      </div>

      {/* Lugares */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.05em', color: 'var(--chalk-dim)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Lugares <span style={{ flex: 1, height: '1px', background: 'var(--rock-border)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {lugares.length === 0 ? (
          <p style={{ color: 'var(--chalk-muted)', fontSize: '13px' }}>No hay lugares cargados para esta provincia.</p>
        ) : lugares.map(l => (
          <div key={l.id} onClick={() => navigate(`/lugar/${l.id}`)} style={{
            background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
            borderRadius: 'var(--rlg)', overflow: 'hidden', cursor: 'pointer',
            transition: 'transform 0.14s, border-color 0.14s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--rock-border)' }}
          >
            <div style={{ height: '130px', background: 'var(--rock-surf)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {l.imagen
                ? <img src={l.imagen} alt={l.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="44" height="44" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.2 }}><path d="M5 50L20 20L30 35L38 25L55 50H5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
              }
            </div>
            <div style={{ padding: '1rem' }}>
              {l.zona && <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{l.zona}</div>}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem', color: 'var(--chalk)', marginBottom: '0.6rem' }}>{l.nombre}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <Badge variant="rock">{l.vias.length} vías</Badge>
                {l.rango && <Badge variant="amber">{l.rango}</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  )
}
