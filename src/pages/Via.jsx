import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVia, gradeColor, gradoLabel } from '../lib/supabase.js'
import { Page, Badge, GradeBadge, MediaBox, VideoFrame, ImageFrame, WarnBox, Spinner } from '../components/ui.jsx'

export default function ViaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [via, setVia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try { setVia(await getVia(id)) }
      catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Spinner />
  if (!via) return <Page><p style={{ color: 'var(--chalk-muted)' }}>Vía no encontrada.</p></Page>

  const grupo = via.grupos
  const lugar = grupo?.lugares
  const color = gradeColor(via.grado_n || 0)
  const barW = Math.min(100, ((via.grado_n || 0) / 92) * 100)
  const autoUrl = grupo?.auto_url || lugar?.maps_url
  const acampeUrl = grupo?.acampe_url

  return (
    <Page>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '0.5rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/rutas')}>Rutas</span>
        {lugar && <><span>›</span><span style={{ cursor: 'pointer' }} onClick={() => navigate(`/lugar/${lugar.id}`)}>{lugar.nombre}</span></>}
        {grupo && <><span>›</span><span style={{ cursor: 'pointer' }} onClick={() => navigate(`/grupo/${grupo.id}`)}>{grupo.nombre}</span></>}
        <span>›</span>
        <span style={{ color: 'var(--chalk-dim)' }}>{via.nombre}</span>
      </div>

      <h2 style={{ fontSize: '2.2rem', marginBottom: '1.25rem' }}>{via.nombre}</h2>

      {/* Grade display */}
      <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rlg)', padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4.5rem', lineHeight: 1, color }}>{via.grado || '?'}</div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '11px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dificultad</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '5px' }}>
            <GradeBadge n={via.grado_n || 0} />
            <Badge variant={via.tipo === 'Top Rope' ? 'sky' : 'rock'}>{via.tipo || 'Deportiva'}</Badge>
            {via.chapas && <Badge variant="rock">{via.chapas} chapas</Badge>}
          </div>
          <div style={{ marginTop: '8px', height: '5px', background: 'var(--rock-surf)', borderRadius: '3px', overflow: 'hidden', width: '180px', maxWidth: '100%' }}>
            <div style={{ height: '100%', borderRadius: '3px', background: color, width: `${barW}%` }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', flex: 1, minWidth: '200px' }}>
          {via.equipador && <MetaMini label="Equipador">{via.equipador}</MetaMini>}
          {via.tiempo && <MetaMini label="Tiempo">{via.tiempo}</MetaMini>}
          {via.largo && <MetaMini label="Largo">{via.largo}</MetaMini>}
          {via.temporada && <MetaMini label="Temporada">{via.temporada}</MetaMini>}
          {(via.express_min || via.express_rec) && <MetaMini label="Express mín/rec">{via.express_min || '—'}/{via.express_rec || '—'}</MetaMini>}
          {autoUrl && <MetaMini label="Último punto auto"><a href={autoUrl} target="_blank" rel="noopener" style={{ color: 'var(--sky-l)' }}>📍 Maps</a></MetaMini>}
          {acampeUrl && <MetaMini label="Acampe"><a href={acampeUrl} target="_blank" rel="noopener" style={{ color: 'var(--sky-l)' }}>⛺ Maps</a></MetaMini>}
        </div>
      </div>

      {/* Media grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <MediaBox title="Imagen – puntos de enganche">
          <ImageFrame src={via.imagen} alt={via.nombre} />
        </MediaBox>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MediaBox title="Video – recorrido de la vía">
            <VideoFrame src={via.video_via} />
          </MediaBox>
          <MediaBox title="Video – aproximación desde acampe">
            <VideoFrame src={via.video_aprox} />
          </MediaBox>
        </div>
      </div>

      {via.notas && (
        <WarnBox>
          <strong style={{ color: 'var(--gold)' }}>Protecciones/notas: </strong>
          {via.notas}
        </WarnBox>
      )}
    </Page>
  )
}

function MetaMini({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--chalk)', marginTop: '1px' }}>{children}</div>
    </div>
  )
}
