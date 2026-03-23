import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLugar, getGruposByLugar, getViasByGrupo, rangoFromVias } from '../lib/supabase.js'
import { Page, Badge, InfoChip, Spinner } from '../components/ui.jsx'

export default function LugarPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lugar, setLugar] = useState(null)
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [l, gs] = await Promise.all([getLugar(id), getGruposByLugar(id)])
        const gsConRango = await Promise.all(gs.map(async g => {
          const vias = await getViasByGrupo(g.id)
          return { ...g, vias, rango: rangoFromVias(vias) }
        }))
        setLugar(l)
        setGrupos(gsConRango)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Spinner />
  if (!lugar) return <Page><p style={{ color: 'var(--chalk-muted)' }}>Lugar no encontrado.</p></Page>

  const provincia = lugar.provincias
  const totalVias = grupos.reduce((a, g) => a + g.vias.length, 0)

  return (
    <Page>
      <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '1rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Inicio</span>
        {provincia && <><span>›</span><span style={{ cursor: 'pointer' }} onClick={() => navigate(`/provincia/${provincia.id}`)}>Guía {provincia.nombre}</span></>}
        <span>›</span>
        <span style={{ color: 'var(--chalk-dim)' }}>{lugar.nombre}</span>
      </div>

      <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rlg)', padding: '1.75rem', marginBottom: '1.5rem' }}>
        {lugar.zona && <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{lugar.zona}</div>}
        <h2 style={{ fontSize: '2.5rem', color: 'var(--chalk)', marginBottom: '0.5rem' }}>{lugar.nombre}</h2>

        {lugar.imagen && (
          <img src={lugar.imagen} alt={lugar.nombre} style={{ maxWidth: '480px', width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: 'var(--rlg)', margin: '0.9rem 0 0.75rem', display: 'block' }} />
        )}

        {lugar.descripcion && (
          <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', maxWidth: '650px', lineHeight: 1.8, marginBottom: '1rem' }}>{lugar.descripcion}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {lugar.maps_url && (
            <InfoChip label="Ubicación">
              <a href={lugar.maps_url} target="_blank" rel="noopener" style={{ color: 'var(--sky-l)' }}>📍 Ver en Google Maps</a>
            </InfoChip>
          )}
          <InfoChip label="Grupos">{grupos.length}</InfoChip>
          <InfoChip label="Vías totales">{totalVias}</InfoChip>
        </div>
      </div>

      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.05em', color: 'var(--chalk-dim)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Grupos <span style={{ flex: 1, height: '1px', background: 'var(--rock-border)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.9rem' }}>
        {grupos.length === 0 ? (
          <p style={{ color: 'var(--chalk-muted)', fontSize: '13px' }}>No hay grupos cargados para este lugar.</p>
        ) : grupos.map(g => (
          <div key={g.id} onClick={() => navigate(`/grupo/${g.id}`)} style={{
            background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
            borderRadius: 'var(--rlg)', overflow: 'hidden', cursor: 'pointer',
            transition: 'border-color 0.14s, transform 0.14s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--rock-border)' }}
          >
            {g.imagen && (
              <div style={{ height: '110px', overflow: 'hidden' }}>
                <img src={g.imagen} alt={g.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '1rem' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--chalk)', marginBottom: '0.25rem' }}>{g.nombre}</div>
              {g.descripcion && <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '0.5rem' }}>{g.descripcion}</div>}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <Badge variant="rock">{g.vias.length} vías</Badge>
                {g.rango && <Badge variant="amber">{g.rango}</Badge>}
                {g.altitud && <Badge variant="sky">{g.altitud}</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  )
}
