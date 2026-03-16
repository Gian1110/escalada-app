import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllVias, getLugares, getGruposByLugar, deleteVia, deleteLugar, deleteGrupo, gradeColor } from '../../lib/supabase.js'
import { Page, Card, CardTitle, Badge, Button, Spinner } from '../../components/ui.jsx'
import { toast } from '../../components/ui.jsx'

export default function AdminGestionar() {
  const [vias, setVias] = useState([])
  const [lugares, setLugares] = useState([])
  const [filtroLugar, setFiltroLugar] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('vias')
  const navigate = useNavigate()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [vs, ls] = await Promise.all([getAllVias(), getLugares()])
      setVias(vs)
      setLugares(ls)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function onFiltroLugarChange(id) {
    setFiltroLugar(id)
    setFiltroGrupo('')
    if (id) {
      try { setGrupos(await getGruposByLugar(id)) } catch (e) { console.error(e) }
    } else {
      setGrupos([])
    }
  }

  async function handleDeleteVia(id, nombre) {
    if (!confirm(`¿Eliminar la vía "${nombre}"?`)) return
    try {
      await deleteVia(id)
      setVias(vs => vs.filter(v => v.id !== id))
      toast('Vía eliminada', 'info')
    } catch (e) { toast('Error al eliminar', 'err') }
  }

  async function handleDeleteLugar(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}" y todas sus vías y grupos?`)) return
    try {
      await deleteLugar(id)
      setLugares(ls => ls.filter(l => l.id !== id))
      setVias(vs => vs.filter(v => v.lugar_id !== id))
      toast('Lugar eliminado', 'info')
    } catch (e) { toast('Error al eliminar', 'err') }
  }

  async function handleDeleteGrupo(id, nombre) {
    if (!confirm(`¿Eliminar el grupo "${nombre}" y todas sus vías?`)) return
    try {
      await deleteGrupo(id)
      setGrupos(gs => gs.filter(g => g.id !== id))
      setVias(vs => vs.filter(v => v.grupo_id !== id))
      toast('Grupo eliminado', 'info')
    } catch (e) { toast('Error al eliminar', 'err') }
  }

  const viasFiltradas = vias.filter(v =>
    (!filtroLugar || v.lugar_id === filtroLugar) &&
    (!filtroGrupo || v.grupo_id === filtroGrupo)
  )

  const tabStyle = (active) => ({
    background: 'none', border: 'none', color: active ? 'var(--accent)' : 'var(--chalk-muted)',
    padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    marginBottom: '-1px', transition: 'all 0.12s',
  })

  return (
    <Page>
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--rock-border)', marginBottom: '1.5rem' }}>
        <button style={tabStyle(tab === 'vias')} onClick={() => setTab('vias')}>Vías ({vias.length})</button>
        <button style={tabStyle(tab === 'lugares')} onClick={() => setTab('lugares')}>Lugares ({lugares.length})</button>
        {filtroLugar && grupos.length > 0 && (
          <button style={tabStyle(tab === 'grupos')} onClick={() => setTab('grupos')}>Grupos ({grupos.length})</button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => navigate('/admin/nueva')} style={{ fontSize: '12px', padding: '4px 12px' }}>
            + Nueva vía
          </Button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {tab === 'vias' && (
            <Card>
              <CardTitle>Vías cargadas</CardTitle>
              {/* Filtros */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <select value={filtroLugar} onChange={e => onFiltroLugarChange(e.target.value)}
                  style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.4rem 0.6rem', fontSize: '12px', minWidth: '150px' }}>
                  <option value="">Todos los lugares</option>
                  {lugares.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
                {grupos.length > 0 && (
                  <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}
                    style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.4rem 0.6rem', fontSize: '12px', minWidth: '150px' }}>
                    <option value="">Todos los grupos</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {['#', 'Vía', 'Lugar', 'Grupo', 'Grado', 'Tipo', 'Video', 'Imagen', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', color: 'var(--chalk-muted)', fontWeight: 400, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.45rem 0.7rem', borderBottom: '1px solid var(--rock-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {viasFiltradas.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--chalk-muted)', padding: '2rem' }}>No hay vías</td></tr>
                    ) : viasFiltradas.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.028)' }}>
                        <td style={{ padding: '0.6rem 0.7rem', color: 'var(--chalk-muted)' }}>{v.numero || '—'}</td>
                        <td style={{ padding: '0.6rem 0.7rem', fontWeight: 500, cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/via/${v.id}`)}>{v.nombre}</td>
                        <td style={{ padding: '0.6rem 0.7rem', color: 'var(--chalk-muted)' }}>{v.lugares?.nombre || '?'}</td>
                        <td style={{ padding: '0.6rem 0.7rem', color: 'var(--chalk-muted)' }}>{v.grupos?.nombre || '?'}</td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.05rem', color: gradeColor(v.grado_n || 0) }}>{v.grado || '?'}</span>
                        </td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          <Badge variant={v.tipo === 'Top Rope' ? 'sky' : 'rock'}>{v.tipo || '—'}</Badge>
                        </td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          {v.video_via ? <Badge variant="green">✓</Badge> : <Badge variant="rock">—</Badge>}
                        </td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          {v.imagen ? <Badge variant="green">✓</Badge> : <Badge variant="rock">—</Badge>}
                        </td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          <Button variant="danger" onClick={() => handleDeleteVia(v.id, v.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>
                            Borrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'lugares' && (
            <Card>
              <CardTitle>Lugares ({lugares.length})</CardTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {['Nombre', 'Zona', 'Altitud', 'Auto', 'Acampe', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', color: 'var(--chalk-muted)', fontWeight: 400, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.45rem 0.7rem', borderBottom: '1px solid var(--rock-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lugares.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--chalk-muted)', padding: '2rem' }}>No hay lugares</td></tr>
                    ) : lugares.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.028)' }}>
                        <td style={{ padding: '0.6rem 0.7rem', fontWeight: 500, cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/lugar/${l.id}`)}>{l.nombre}</td>
                        <td style={{ padding: '0.6rem 0.7rem', color: 'var(--chalk-muted)' }}>{l.zona || '—'}</td>
                        <td style={{ padding: '0.6rem 0.7rem', color: 'var(--chalk-muted)' }}>{l.altitud || '—'}</td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>{l.auto_url ? <Badge variant="green">✓</Badge> : <Badge variant="rock">—</Badge>}</td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>{l.acampe_url ? <Badge variant="green">✓</Badge> : <Badge variant="rock">—</Badge>}</td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          <Button variant="danger" onClick={() => handleDeleteLugar(l.id, l.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>
                            Borrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'grupos' && filtroLugar && (
            <Card>
              <CardTitle>Grupos de {lugares.find(l => l.id === filtroLugar)?.nombre}</CardTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {['Nombre', 'Descripción', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', color: 'var(--chalk-muted)', fontWeight: 400, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.45rem 0.7rem', borderBottom: '1px solid var(--rock-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grupos.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.028)' }}>
                        <td style={{ padding: '0.6rem 0.7rem', fontWeight: 500, cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/grupo/${g.id}`)}>{g.nombre}</td>
                        <td style={{ padding: '0.6rem 0.7rem', color: 'var(--chalk-muted)' }}>{g.descripcion || '—'}</td>
                        <td style={{ padding: '0.6rem 0.7rem' }}>
                          <Button variant="danger" onClick={() => handleDeleteGrupo(g.id, g.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>
                            Borrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </Page>
  )
}
