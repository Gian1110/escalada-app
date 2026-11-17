import { thumbnail } from '../lib/images.js'
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCatalog } from '../lib/catalog.js'
import { normalize } from '../lib/search.js'
import { rangoFromVias } from '../lib/supabase.js'
import { useFavorites } from '../lib/favorites.js'
import CroquisViewer from '../components/CroquisViewer.jsx'

export default function Destination({ level }) {
  const { id } = useParams()
  const { data, loading, error, retry } = useCatalog()
  const { ids, toggle } = useFavorites()
  const [query, setQuery] = useState('')
  useEffect(() => { setQuery('') }, [id])
  if (loading) return <div className="explore-page" role="status">Cargando destino…</div>
  if (error) return <div className="explore-page" role="alert">No pudimos cargar este destino. <button className="action-button" onClick={retry}>Reintentar</button></div>
  const table = level === 'provincia' ? 'provincias' : level === 'lugar' ? 'lugares' : 'grupos'
  const item = data?.[table].find(x => String(x.id) === id)
  if (!item) return <div className="explore-page"><h1>Destino no encontrado</h1><Link to="/">Volver al inicio →</Link></div>
  const place = level === 'grupo' ? data.lugares.find(x => x.id === item.lugar_id) : level === 'lugar' ? item : null
  const province = level === 'provincia' ? item : data.provincias.find(x => x.id === place?.provincia_id)
  const routes = data.vias.filter(v => level === 'provincia' ? v.provincia?.id === item.id : level === 'lugar' ? v.lugar?.id === item.id : v.grupo_id === item.id)
  const children = level === 'provincia' ? data.lugares.filter(x => x.provincia_id === item.id) : level === 'lugar' ? data.grupos.filter(x => x.lugar_id === item.id) : []
  const range = rangoFromVias(routes)
  const displayed = routes.filter(v => normalize(`${v.nombre} ${v.grado}`).includes(normalize(query))).sort((a,b) => (a.numero ?? Infinity) - (b.numero ?? Infinity) || a.nombre.localeCompare(b.nombre,'es'))
  return <div className="explore-page destination-page">
    <nav className="breadcrumbs" aria-label="Ubicación"><Link to="/">Inicio</Link>{province && level !== 'provincia' && <><span> / </span><Link to={`/provincia/${province.id}`}>{province.nombre}</Link></>}{place && level === 'grupo' && <><span> / </span><Link to={`/lugar/${place.id}`}>{place.nombre}</Link></>}<span> / {item.nombre}</span></nav>
    <section className="destination-cover"><div><span className="eyebrow">{level === 'provincia' ? 'ARGENTINA' : province?.nombre} · {level === 'grupo' ? 'SECTOR' : 'DESTINO'}</span><h1>{item.nombre}</h1><p className="page-intro">{routes.length} vías{range ? ` · Grados ${range}` : ''}{item.altitud ? ` · ${item.altitud}` : ''}</p>{item.zona && <p>{item.zona}</p>}
      <div className="destination-actions">{item.maps_url && <a className="action-button" href={item.maps_url} target="_blank" rel="noopener noreferrer">Ubicación ↗</a>}{item.auto_url && <a className="action-button" href={item.auto_url} target="_blank" rel="noopener noreferrer">Último punto en auto ↗</a>}{item.acampe_url && <a className="action-button" href={item.acampe_url} target="_blank" rel="noopener noreferrer">Acampe ↗</a>}</div></div>
      {item.imagen && level !== 'grupo' && <img src={thumbnail(item.imagen)} alt={item.nombre} width="600" height="400"/>}
    </section>
    {(item.descripcion || item.acampe_obs) && <details className="access-details" open><summary>Sobre el lugar y cómo llegar</summary>{item.descripcion && <p>{item.descripcion}</p>}{item.acampe_obs && <p><strong>Acampe: </strong>{item.acampe_obs}</p>}</details>}
    {level === 'grupo' && item.imagen && <details className="access-details"><summary>Ver croquis del sector</summary><CroquisViewer src={thumbnail(item.imagen)} alt={item.nombre}/></details>}
    {level !== 'grupo' ? <><div className="section-heading"><h2>{level === 'provincia' ? 'Elegí una zona' : 'Explorá los sectores'}</h2></div><div className="destination-grid">{children.map(c => {
      const count = routes.filter(v => level === 'provincia' ? v.lugar?.id === c.id : v.grupo_id === c.id).length
      return <Link className="destination-card child-card" key={c.id} to={`/${level === 'provincia' ? 'lugar' : 'grupo'}/${c.id}`}>
        {c.imagen && <div className="destination-image"><img src={thumbnail(c.imagen)} alt={c.nombre} loading="lazy" width="600" height="400"/><span className="round-arrow" aria-hidden="true">↗</span></div>}
        <div className="destination-info"><h3>{c.nombre}</h3><p>{count} vías ↗</p></div>
      </Link>
    })}</div>{!children.length && <p>Todavía no hay sectores cargados.</p>}</> : <>
      <div className="section-heading"><h2>Las vías del sector</h2><label className="sector-search">Buscar vía o grado<input type="search" placeholder="Nombre o grado…" value={query} onChange={e => setQuery(e.target.value)}/></label></div>
      <p className="results-heading" role="status">{displayed.length} vías</p><div className="route-list">{displayed.map(v => <article className="route-row" key={v.id}><Link className="route-main" to={`/via/${v.id}`}><span className="route-grade">{v.grado || '?'}</span><span><strong>{v.numero != null ? `${v.numero}. ` : ''}{v.nombre}</strong><small>{[v.tipo, v.equipador].filter(Boolean).join(' · ')}</small></span><span aria-hidden="true">↗</span></Link><button className="favorite-button" aria-pressed={ids.includes(String(v.id))} aria-label={`Guardar ${v.nombre}`} onClick={() => toggle(v.id)}>{ids.includes(String(v.id)) ? '♥' : '♡'}</button></article>)}</div>{!displayed.length && <p>No hay vías que coincidan con la búsqueda.</p>}
    </>}
  </div>
}
