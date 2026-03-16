import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGrupo, getViasByGrupo, rangoFromVias } from '../lib/supabase.js'
import { gradeColor, gradoLabel } from '../lib/supabase.js'
import { Page, Badge, GradeBadge, InfoChip, Spinner } from '../components/ui.jsx'

export default function GrupoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [grupo, setGrupo] = useState(null)
  const [vias, setVias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [g, vs] = await Promise.all([getGrupo(id), getViasByGrupo(id)])
        setGrupo(g)
        setVias(vs)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Spinner />
  if (!grupo) return <Page><p style={{ color: 'var(--chalk-muted)' }}>Grupo no encontrado.</p></Page>

  const lugarNombre = grupo.lugares?.nombre || ''
  const lugarId = grupo.lugar_id
  const rango = rangoFromVias(vias)

  return (
    <Page>
      <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '1rem', display: 'flex', gap: '6px' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/rutas')}>Rutas</span>
        <span>›</span>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/lugar/${lugarId}`)}>{lugarNombre}</span>
        <span>›</span>
        <span style={{ color: 'var(--chalk-dim)' }}>{grupo.nombre}</span>
      </div>

      <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rlg)', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{lugarNombre}</div>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--chalk)', marginBottom: '0.5rem' }}>{grupo.nombre}</h2>
        {grupo.descripcion && <p style={{ color: 'var(--chalk-muted)', fontSize: '13px', marginBottom: '1rem' }}>{grupo.descripcion}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <InfoChip label="Vías">{vias.length}</InfoChip>
          {rango && <InfoChip label="Rango">{rango}</InfoChip>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.9rem' }}>
        {vias.map(v => {
          const color = gradeColor(v.grado_n || 0)
          return (
            <div key={v.id} onClick={() => navigate(`/via/${v.id}`)} style={{
              background: 'var(--rock-card)', border: '1px solid var(--rock-border)',
              borderRadius: 'var(--rlg)', padding: '1.1rem', cursor: 'pointer',
              transition: 'border-color 0.14s, transform 0.14s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--rock-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {v.numero && <div style={{ fontSize: '10px', color: 'var(--chalk-muted)' }}>#{v.numero}</div>}
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem', color: 'var(--chalk)' }}>{v.nombre}</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.7rem', color, lineHeight: 1 }}>{v.grado}</div>
              </div>
              {v.equipador && <div style={{ fontSize: '11px', color: 'var(--chalk-muted)', marginTop: '4px' }}>{v.equipador}</div>}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                <GradeBadge n={v.grado_n || 0} />
                <Badge variant={v.tipo === 'Top Rope' ? 'sky' : 'rock'}>{v.tipo || 'Deportiva'}</Badge>
                {v.tiempo && <Badge variant="rock">{v.tiempo}</Badge>}
              </div>
            </div>
          )
        })}
      </div>
    </Page>
  )
}
