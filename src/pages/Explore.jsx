import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog.js'
import { filterRoutes, normalize } from '../lib/search.js'
import { useFavorites } from '../lib/favorites.js'
import { GRADOS } from '../lib/supabase.js'

export default function Explore({ savedOnly = false }) {
  const { data, error, loading, retry } = useCatalog()
  const [params, setParams] = useSearchParams()
  const { ids, toggle, signedIn, loading: favoritesLoading, error: favoritesError, retry: retryFavorites, pending } = useFavorites()
  const [limit, setLimit] = useState(40)
  const province = params.get('province') || String(data?.provincias.find(p => normalize(p.nombre) === normalize(params.get('provinceName')))?.id || '')
  const filters = { q: params.get('q') || '', province, type: params.get('type') || '', grade: params.get('grade') || '', saved: savedOnly ? ids : null }
  const routes = filterRoutes(data?.vias || [], filters)
  function update(key, value) {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    if (key === 'province') next.delete('provinceName')
    setParams(next, { replace: true }); setLimit(40)
  }
  return <div className="explore-page">
    <span className="eyebrow">TU PRÓXIMA SALIDA</span><h1>{savedOnly ? 'Tus vías guardadas.' : 'Encontrá tu próxima vía.'}</h1><p className="page-intro">{savedOnly ? (signedIn ? 'Tus favoritas se guardan en tu cuenta.' : 'Tu lista queda guardada en este navegador. Iniciá sesión para usar tus favoritas desde otros dispositivos.') : 'Buscá por nombre, sector o destino. La roca te espera.'}</p>
    {savedOnly && !signedIn && <p><Link to="/cuenta">Ingresar a mi cuenta →</Link></p>}
    {favoritesLoading && <p role="status">Cargando favoritas…</p>}
    {favoritesError && <p role="alert">{favoritesError} <button onClick={retryFavorites}>Reintentar</button></p>}
    <div className="filter-panel" role="search" aria-label="Filtrar vías"><label className="search-filter">Buscar<input type="search" placeholder="Nombre, sector, zona…" value={filters.q} onChange={e => update('q', e.target.value)}/></label><label>Provincia<select value={province} onChange={e => update('province', e.target.value)}><option value="">Todas las provincias</option>{data?.provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label><label>Modalidad<select value={filters.type} onChange={e => update('type', e.target.value)}><option value="">Todas</option>{[...new Set(data?.vias.map(v => v.tipo).filter(Boolean))].sort().map(t => <option key={t}>{t}</option>)}</select></label><label>Grado<select value={filters.grade} onChange={e => update('grade', e.target.value)}><option value="">Todos</option>{GRADOS.filter(g => data?.vias.some(v => v.grado === g.g)).map(g => <option key={g.g}>{g.g}</option>)}</select></label></div>
    <div className="results-heading"><p role="status">{loading ? 'Cargando vías…' : `${routes.length} ${routes.length === 1 ? 'vía encontrada' : 'vías encontradas'}`}</p>{params.size > 0 && <button onClick={() => { setParams({}); setLimit(40) }}>Limpiar filtros ×</button>}</div>
    {error && <div role="alert" className="empty-state">No pudimos cargar las vías. <button className="action-button" onClick={retry}>Reintentar</button></div>}
    {!loading && !error && routes.length === 0 && <div className="empty-state"><h2>{savedOnly && !ids.length ? 'Tu próxima aventura empieza acá.' : 'No encontramos coincidencias.'}</h2><p>{savedOnly && !ids.length ? 'Tocá el corazón de una vía para sumarla a tu lista.' : 'Probá otro nombre o quitá algún filtro.'}</p><Link className="action-button" to="/rutas">Explorar todas las vías ↗</Link></div>}
    <div className="route-list">{routes.slice(0, limit).map(v => <article className="route-row" key={v.id}><Link className="route-main" to={`/via/${v.id}`}><span className="route-grade">{v.grado || '?'}</span><span><strong>{v.nombre}</strong><small>{[v.provincia?.nombre, v.lugar?.nombre, v.grupo?.nombre].filter(Boolean).join(' / ')}</small></span><span className="route-type">{v.tipo}</span><span aria-hidden="true">↗</span></Link><button className="favorite-button" disabled={favoritesLoading || !!favoritesError || pending.includes(String(v.id))} onClick={() => toggle(v.id)} aria-pressed={ids.includes(String(v.id))} aria-label={`${ids.includes(String(v.id)) ? 'Quitar de' : 'Agregar a'} guardadas: ${v.nombre}`}>{ids.includes(String(v.id)) ? '♥' : '♡'}</button></article>)}</div>
    {routes.length > limit && <button className="action-button load-more" onClick={() => setLimit(n => n + 40)}>Mostrar más vías ({routes.length - limit} restantes)</button>}
  </div>
}
