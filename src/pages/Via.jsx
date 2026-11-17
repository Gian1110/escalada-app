import CroquisViewer from '../components/CroquisViewer.jsx'
import { useFavorites } from '../lib/favorites.js'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVia, gradeColor } from '../lib/supabase.js'
import { Page, Badge, GradeBadge, MediaBox, VideoFrame, WarnBox, Spinner } from '../components/ui.jsx'

export default function ViaPage() {
  const { id } = useParams()
  const { ids, toggle, loading: favoritesLoading, error: favoritesError, retry: retryFavorites, pending } = useFavorites()
  const [via, setVia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    async function load() {
      try { const result = await getVia(id); if (active) setVia(result) }
      catch (e) { if (active) setVia(null) }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [id])

  if (loading) return <Spinner />
  if (!via) return <Page><p style={{ color: 'var(--chalk-muted)' }}>Vía no encontrada.</p></Page>

  const grupo = via.grupos
  const lugar = grupo?.lugares
  const color = gradeColor(via.grado_n || 0)
  const barW = Math.min(100, ((via.grado_n || 0) / 92) * 100)
  const autoUrl = grupo?.auto_url || lugar?.maps_url
  const acampeUrl = grupo?.acampe_url
  const pieViaUrl = via.pie_via_url

  return (
    <div className="route-detail"><Page>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--chalk-muted)', marginBottom: '0.5rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Link to="/rutas">Explorar vías</Link>
        {lugar && <><span>›</span><Link to={`/lugar/${lugar.id}`}>{lugar.nombre}</Link></>}
        {grupo && <><span>›</span><Link to={`/grupo/${grupo.id}`}>{grupo.nombre}</Link></>}
        <span>›</span>
        <span style={{ color: 'var(--chalk-dim)' }}>{via.nombre}</span>
      </div>

      {favoritesError && <p role="alert">{favoritesError} <button onClick={retryFavorites}>Reintentar</button></p>}
      <div className="via-title"><h1>{via.nombre}</h1><button className="action-button" disabled={favoritesLoading || !!favoritesError || pending.includes(String(id))} aria-pressed={ids.includes(String(id))} onClick={() => toggle(id)}>{ids.includes(String(id)) ? "♥ Guardada" : "♡ Guardar vía"}</button></div>

      {/* Grade display */}
      <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rlg)', padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4.5rem', lineHeight: 1, color }}>{via.grado || '?'}</div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <div style={{ fontSize: '11px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dificultad</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '5px' }}>
            <span className="technical-chip">{via.grado || "Sin grado"}</span>
            <span className="technical-chip">{via.tipo || "Deportiva"}</span>
            {via.chapas && <span className="technical-chip">{via.chapas} chapas</span>}
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
          {pieViaUrl && <MetaMini label="Pie de vía"><a href={pieViaUrl} target="_blank" rel="noopener" style={{ color: 'var(--accent-h)' }}>🥾 Maps</a></MetaMini>}
        </div>
      </div>

      {/* Media grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <MediaBox title="Imagen – puntos de enganche">
          <CroquisViewer src={via.imagen || grupo?.imagen} alt={via.nombre} />
        </MediaBox>
        {(via.video_via || via.video_aprox) && <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {via.video_via && <MediaBox title="Video – recorrido de la vía">
            <VideoFrame src={via.video_via} />
          </MediaBox>}
          {via.video_aprox && <MediaBox title="Video – aproximación desde acampe">
            <VideoFrame src={via.video_aprox} />
          </MediaBox>}
        </div>}
      </div>

      {via.notas && (
        <WarnBox>
          <strong style={{ color: 'var(--gold)' }}>Protecciones/notas: </strong>
          <span style={{whiteSpace:"pre-line"}}>{via.notas}</span>
        </WarnBox>
      )}
    </Page></div>
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
