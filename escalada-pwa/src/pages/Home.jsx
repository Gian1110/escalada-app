import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProvincias, getLugaresByProvincia, getViasByLugar } from '../lib/supabase.js'
import { Page, Spinner } from '../components/ui.jsx'
import DownloadGuia from '../components/DownloadGuia.jsx'

export default function Home() {
  const [provincias, setProvincias] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const ps = await getProvincias()
        const conVias = await Promise.all(ps.map(async p => {
          const lugares = await getLugaresByProvincia(p.id)
          let totalVias = 0
          await Promise.all(lugares.map(async l => {
            const vias = await getViasByLugar(l.id)
            totalVias += vias.length
          }))
          return { ...p, totalLugares: lugares.length, totalVias }
        }))
        // Ordenar por más vías a menos
        conVias.sort((a, b) => b.totalVias - a.totalVias)
        setProvincias(conVias)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
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
        <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Argentina</div>
        <h1 style={{ fontSize: '3rem', color: 'var(--chalk)', marginBottom: '0.75rem' }}>
          Bienvenidos a las<br />Guías de Escalada<br />de Argentina
        </h1>
        <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', lineHeight: 1.8, maxWidth: '600px' }}>
          Encontrá información técnica de sectores y vías de escalada deportiva en todo el país. Seleccioná una provincia para explorar sus sectores.
        </p>
      </div>

      {/* Descargar offline */}
      <div style={{ marginBottom: '1.5rem' }}>
        <DownloadGuia />
      </div>

      {/* Provincias */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.05em', color: 'var(--chalk-dim)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Provincias <span style={{ flex: 1, height: '1px', background: 'var(--rock-border)' }} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {provincias.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--chalk-muted)', border: '1px dashed var(--rock-border)', borderRadius: 'var(--rlg)' }}>
              No hay provincias cargadas.{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/admin/nueva')}>
                Agregá la primera →
              </span>
            </div>
          ) : provincias.map(p => (
            <div key={p.id} onClick={() => navigate(`/provincia/${p.id}`)} style={{
              background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
              borderRadius: 'var(--rlg)', overflow: 'hidden', cursor: 'pointer',
              transition: 'transform 0.14s, border-color 0.14s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--rock-border)' }}
            >
              <div style={{ height: '150px', background: 'var(--rock-surf)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <svg width="56" height="56" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.2 }}><path d="M5 50L20 20L30 35L38 25L55 50H5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="44" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                }
              </div>
              <div style={{ padding: '1.1rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'var(--chalk)', marginBottom: '0.35rem' }}>
                  Guía de Escalada {p.nombre}
                </div>
                {p.descripcion && (
                  <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '0.75rem', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{p.descripcion}</div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', color: 'var(--chalk-dim)' }}>
                    {p.totalLugares} {p.totalLugares === 1 ? 'lugar' : 'lugares'}
                  </span>
                  {p.totalVias > 0 && (
                    <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '100px', background: 'rgba(200,154,42,0.18)', color: 'var(--gold)' }}>
                      {p.totalVias} {p.totalVias === 1 ? 'vía' : 'vías'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  )
}
