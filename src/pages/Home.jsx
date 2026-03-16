import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLugares, getViasByLugar, rangoFromVias } from '../lib/supabase.js'
import { Page, Badge, Spinner } from '../components/ui.jsx'

export default function Home() {
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const data = await getLugares()
        // Para cada lugar, traer sus vías para calcular rango
        const conVias = await Promise.all(data.map(async l => {
          const vias = await getViasByLugar(l.id)
          return { ...l, vias, rango: rangoFromVias(vias) }
        }))
        setLugares(conVias)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Page>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a08 0%, #1a1a16 100%)',
        border: '1px solid var(--rock-border)', borderRadius: 'var(--rxl)',
        padding: '2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '280px', height: '100%', background: 'linear-gradient(135deg, transparent 30%, rgba(212,84,26,0.05) 100%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Tucumán · Argentina
        </div>
        <h1 style={{ fontSize: '3rem', color: 'var(--chalk)', marginBottom: '0.75rem' }}>
          Guía de Escalada<br />Tucumán
        </h1>
        <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', lineHeight: 1.8, maxWidth: '600px' }}>
          Bienvenidos a la Guía de Escalada deportiva de la provincia de Tucumán, Argentina. Actualmente esta actividad se encuentra en pleno crecimiento, como en casi todo el norte argentino, gracias a la motivación y compromiso de escaladores, equipadores, escuelas de escalada locales y la Asociación Argentina de Montaña (AAM) quienes mediante diversas iniciativas continúan promoviendo el deporte.
        </p>
        <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', lineHeight: 1.8, maxWidth: '600px', marginTop: '0.75rem' }}>
          En la presente encontrarás no solo información técnica de los sectores y sus vías sino además, aspectos fundamentales sobre cómo desplazarte de manera segura en un ambiente de montaña, donde es preciso conservar y proteger la biodiversidad en pos de lograr el desarrollo de una actividad deportiva en armonía con el ambiente.
        </p>
        <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', lineHeight: 1.8, maxWidth: '600px', marginTop: '0.75rem' }}>
          En Tucumán, la escalada se encuentra concentrada en el Dpto. Tafí del Valle, más precisamente en el valle homónimo, y en la zona del Abra del Infiernillo.
        </p>
      </div>

      {/* Lugares */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.05em', color: 'var(--chalk-dim)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Lugares <span style={{ flex: 1, height: '1px', background: 'var(--rock-border)' }} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {lugares.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--chalk-muted)', border: '1px dashed var(--rock-border)', borderRadius: 'var(--rlg)' }}>
              No hay lugares cargados.{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/admin/nueva')}>
                Agregá el primero →
              </span>
            </div>
          ) : lugares.map(l => (
            <LugarCard key={l.id} lugar={l} onClick={() => navigate(`/lugar/${l.id}`)} />
          ))}
        </div>
      )}
    </Page>
  )
}

function LugarCard({ lugar, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
      borderRadius: 'var(--rlg)', overflow: 'hidden', cursor: 'pointer',
      transition: 'transform 0.14s, border-color 0.14s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--rock-border)' }}
    >
      <div style={{ height: '140px', background: 'var(--rock-surf)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {lugar.imagen
          ? <img src={lugar.imagen} alt={lugar.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <svg width="56" height="56" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.25 }}><path d="M5 50L20 20L30 35L38 25L55 50H5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="44" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
        }
      </div>
      <div style={{ padding: '1.1rem' }}>
        <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>{lugar.zona}</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.35rem', color: 'var(--chalk)', marginBottom: '0.6rem' }}>{lugar.nombre}</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {lugar.altitud && <Badge variant="sky">{lugar.altitud}</Badge>}
          <Badge variant="rock">{lugar.vias.length} vías</Badge>
          {lugar.rango && <Badge variant="amber">{lugar.rango}</Badge>}
        </div>
      </div>
    </div>
  )
}
