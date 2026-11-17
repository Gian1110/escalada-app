import { thumbnail } from '../lib/images.js'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog.js'

export default function Home() {
  const { data, loading, error, retry } = useCatalog()
  const navigate = useNavigate()
  const provinces = (data?.provincias || []).map(p => ({ ...p, count: data.vias.filter(v => v.provincia?.id === p.id).length, places: data.lugares.filter(l => l.provincia_id === p.id).length })).sort((a, b) => b.count - a.count)
  return <div className="discovery">
    <section className="hero">
      <img className="hero-photo" src="/icons/tuzgle.jpg" alt="Paredes de roca del Tuzgle, Jujuy" fetchpriority="high" width="1200" height="1600"/>
      <div className="hero-content"><span className="eyebrow">GUÍA DE ESCALADA · ARGENTINA</span><h1>Tu próxima<br/>historia empieza<br/><em>en la roca.</em></h1><p>Encontrá tu lugar. Elegí tu vía.<br/>Salí a vivir más que escalada.</p>
      <form className="hero-search" role="search" onSubmit={e => { e.preventDefault(); navigate(`/rutas?q=${encodeURIComponent(new FormData(e.currentTarget).get('q').trim())}`) }}><label className="sr-only" htmlFor="home-search">Buscar vía, sector o provincia</label><span aria-hidden="true">⌕</span><input id="home-search" name="q" placeholder="Vía, sector o provincia…"/><button type="submit">Explorar <span aria-hidden="true">↗</span></button></form>
      <div className="hero-links"><Link to="/rutas?provinceName=Tucumán">Tucumán ↗</Link><Link to="/rutas?provinceName=Jujuy">Jujuy ↗</Link><Link to="/rutas?provinceName=Catamarca">Catamarca ↗</Link></div></div>
      <div className="hero-caption"><span>ROCA ARGENTINA · AIRE LIBRE</span><strong>El Tuzgle · Jujuy</strong></div>
    </section>
    <div className="catalog-stats" aria-live="polite"><div><strong>{data ? data.vias.length : '—'}</strong><span>vías para descubrir</span></div><div><strong>{data ? data.lugares.length : '—'}</strong><span>zonas de escalada</span></div><div><strong>{data ? data.provincias.length : '—'}</strong><span>provincias para explorar</span></div><p>Menos pantalla.<br/><strong>Más montaña.</strong></p></div>
    <section className="destination-section"><div className="section-heading"><div><span className="eyebrow">ELEGÍ TU PRÓXIMO DESTINO</span><h2>Hay mucha roca por conocer.</h2></div><Link className="text-link" to="/rutas">Ver todas las vías ↗</Link></div>
      {loading && <p role="status">Buscando destinos…</p>}{error && <div role="alert">No pudimos cargar la guía. <button className="action-button" onClick={retry}>Reintentar</button></div>}
      <div className="destination-grid">{provinces.map((p, i) => <Link className="destination-card" to={`/provincia/${p.id}`} key={p.id}><div className="destination-image">{p.imagen && <img src={thumbnail(p.imagen)} alt={`Escalada en ${p.nombre}`} loading="lazy" width="600" height="480"/>}<span className="destination-index">0{i + 1} / ARGENTINA</span><span className="round-arrow" aria-hidden="true">↗</span></div><div className="destination-info"><h3>{p.nombre}</h3><p>{p.count} vías <span>·</span> {p.places} zonas</p></div></Link>)}</div>
    </section>
    <section className="community"><div><span className="eyebrow">LA ESCALADA SE COMPARTE</span><h2>Mucho más que llegar arriba.</h2><p>Nos encontramos en la roca. Y entre una salida y otra, en Instagram.</p></div><a className="action-button" href="https://www.instagram.com/masqueescalada/" target="_blank" rel="noopener noreferrer">@masqueescalada ↗</a></section>
  </div>
}
