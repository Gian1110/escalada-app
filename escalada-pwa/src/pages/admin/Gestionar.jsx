import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProvincias, getLugaresByProvincia, getGruposByLugar, getAllVias,
  updateProvincia, updateLugar, updateGrupo, updateVia,
  deleteProvincia, deleteLugar, deleteGrupo, deleteVia,
  uploadImage, gradeColor, GRADOS
} from '../../lib/supabase.js'
import { Page, Card, CardTitle, Badge, Button, Field, Input, Textarea, Select, GradeSelector, Divider, Spinner } from '../../components/ui.jsx'
import { toast } from '../../components/ui.jsx'

export default function AdminGestionar() {
  const [tab, setTab] = useState('vias')
  const [provincias, setProvincias] = useState([])
  const [filtProv, setFiltProv] = useState('')
  const [filtLugar, setFiltLugar] = useState('')
  const [filtGrupo, setFiltGrupo] = useState('')
  const [lugares, setLugares] = useState([])
  const [grupos, setGrupos] = useState([])
  const [vias, setVias] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // { type, item }
  const navigate = useNavigate()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [ps, vs] = await Promise.all([getProvincias(), getAllVias()])
      setProvincias(ps); setVias(vs)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function onFiltProv(id) {
    setFiltProv(id); setFiltLugar(''); setFiltGrupo(''); setLugares([]); setGrupos([])
    if (id) try { setLugares(await getLugaresByProvincia(id)) } catch (e) { console.error(e) }
  }
  async function onFiltLugar(id) {
    setFiltLugar(id); setFiltGrupo(''); setGrupos([])
    if (id) try { setGrupos(await getGruposByLugar(id)) } catch (e) { console.error(e) }
  }

  // ── DELETE ──
  async function handleDelete(type, id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"? Se eliminarán todos sus datos.`)) return
    try {
      if (type === 'provincia') { await deleteProvincia(id); setProvincias(ps => ps.filter(p => p.id !== id)); setVias(vs => vs.filter(v => v.lugar_id !== id)) }
      if (type === 'lugar')    { await deleteLugar(id); setLugares(ls => ls.filter(l => l.id !== id)); setVias(vs => vs.filter(v => v.lugar_id !== id)) }
      if (type === 'grupo')    { await deleteGrupo(id); setGrupos(gs => gs.filter(g => g.id !== id)); setVias(vs => vs.filter(v => v.grupo_id !== id)) }
      if (type === 'via')      { await deleteVia(id); setVias(vs => vs.filter(v => v.id !== id)) }
      toast('Eliminado', 'info')
    } catch (e) { toast('Error al eliminar', 'err') }
  }

  // ── EDIT MODAL ──
  function EditModal({ type, item, onClose, onSaved }) {
    const [form, setForm] = useState({ ...item })
    const [imgFile, setImgFile] = useState(null)
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleSave() {
      setSaving(true)
      try {
        let updates = { ...form }
        if (imgFile) updates.imagen = await uploadImage(imgFile, 'imagenes')
        if (type === 'provincia') await updateProvincia(item.id, { nombre: updates.nombre, descripcion: updates.descripcion, imagen: updates.imagen })
        if (type === 'lugar')    await updateLugar(item.id, { nombre: updates.nombre, zona: updates.zona, descripcion: updates.descripcion, maps_url: updates.maps_url, imagen: updates.imagen })
        if (type === 'grupo')    await updateGrupo(item.id, { nombre: updates.nombre, descripcion: updates.descripcion, altitud: updates.altitud, auto_url: updates.auto_url, acampe_url: updates.acampe_url, acampe_obs: updates.acampe_obs, imagen: updates.imagen })
        if (type === 'via')      await updateVia(item.id, { nombre: updates.nombre, numero: parseInt(updates.numero) || null, equipador: updates.equipador, temporada: updates.temporada, grado: updates.grado, grado_n: updates.grado_n, tipo: updates.tipo, express_min: parseInt(updates.express_min) || null, express_rec: parseInt(updates.express_rec) || null, tiempo: updates.tiempo, chapas: updates.chapas, largo: updates.largo, pie_via_url: updates.pie_via_url, video_via: updates.video_via, video_aprox: updates.video_aprox, notas: updates.notas, imagen: updates.imagen })
        toast('Guardado', 'ok'); onSaved(updates)
      } catch (e) { toast('Error al guardar', 'err'); console.error(e) }
      finally { setSaving(false) }
    }

    const titles = { provincia: 'Editar provincia', lugar: 'Editar lugar', grupo: 'Editar grupo', via: 'Editar vía' }

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ background: 'var(--rock-card)', border: '1px solid var(--rock-border)', borderRadius: 'var(--rxl)', padding: '1.5rem', width: '100%', maxWidth: '580px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--chalk)' }}>{titles[type]}</div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--chalk-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(type === 'provincia' || type === 'lugar' || type === 'grupo' || type === 'via') && (
              <Field label="Nombre" required><Input value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} /></Field>
            )}
            {type === 'lugar' && <Field label="Zona"><Input value={form.zona || ''} onChange={e => set('zona', e.target.value)} /></Field>}
            {(type === 'provincia' || type === 'lugar' || type === 'grupo') && (
              <Field label="Descripción"><Textarea value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} rows={3} /></Field>
            )}
            {type === 'lugar' && <Field label="Google Maps – ubicación"><Input type="url" value={form.maps_url || ''} onChange={e => set('maps_url', e.target.value)} placeholder="https://maps.google.com/?q=..." /></Field>}
            {type === 'grupo' && <>
              <Field label="Altitud"><Input value={form.altitud || ''} onChange={e => set('altitud', e.target.value)} /></Field>
              <Field label="Google Maps – auto"><Input type="url" value={form.auto_url || ''} onChange={e => set('auto_url', e.target.value)} placeholder="https://maps.google.com/?q=..." /></Field>
              <Field label="Google Maps – acampe"><Input type="url" value={form.acampe_url || ''} onChange={e => set('acampe_url', e.target.value)} placeholder="https://maps.google.com/?q=..." /></Field>
              <Field label="Observaciones acampe"><Input value={form.acampe_obs || ''} onChange={e => set('acampe_obs', e.target.value)} /></Field>
            </>}
            {type === 'via' && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <Field label="Número"><Input type="number" value={form.numero || ''} onChange={e => set('numero', e.target.value)} /></Field>
                <Field label="Equipador"><Input value={form.equipador || ''} onChange={e => set('equipador', e.target.value)} /></Field>
                <Field label="Temporada"><Input value={form.temporada || ''} onChange={e => set('temporada', e.target.value)} /></Field>
                <Field label="Tipo"><Select value={form.tipo || 'Deportiva'} onChange={e => set('tipo', e.target.value)}><option value="Deportiva">Deportiva</option><option value="Top Rope">Top Rope</option><option value="Clásica / Mixta">Clásica / Mixta</option><option value="Boulder">Boulder</option></Select></Field>
                <Field label="Express mín"><Input type="number" value={form.express_min || ''} onChange={e => set('express_min', e.target.value)} /></Field>
                <Field label="Express rec"><Input type="number" value={form.express_rec || ''} onChange={e => set('express_rec', e.target.value)} /></Field>
                <Field label="Tiempo"><Input value={form.tiempo || ''} onChange={e => set('tiempo', e.target.value)} /></Field>
                <Field label="Chapas"><Input value={form.chapas || ''} onChange={e => set('chapas', e.target.value)} /></Field>
                <Field label="Largo"><Input value={form.largo || ''} onChange={e => set('largo', e.target.value)} /></Field>
              </div>
              <Field label="Grado de dificultad">
                <GradeSelector value={form.grado} onChange={(g, n) => { set('grado', g); set('grado_n', n) }} />
                {form.grado && <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', marginTop: '4px' }}>Seleccionado: {form.grado}</div>}
              </Field>
              <Field label="Video – vía"><Input type="url" value={form.video_via || ''} onChange={e => set('video_via', e.target.value)} placeholder="https://youtu.be/..." /></Field>
              <Field label="Video – aproximación"><Input type="url" value={form.video_aprox || ''} onChange={e => set('video_aprox', e.target.value)} placeholder="https://youtu.be/..." /></Field>
              <Field label="Google Maps – pie de vía"><Input type="url" value={form.pie_via_url || ''} onChange={e => set('pie_via_url', e.target.value)} placeholder="https://maps.google.com/?q=..." /></Field>
              <Field label="Notas"><Textarea value={form.notas || ''} onChange={e => set('notas', e.target.value)} rows={2} /></Field>
            </>}

            {/* Imagen */}
            {(type === 'provincia' || type === 'lugar' || type === 'grupo' || type === 'via') && (
              <Field label="Imagen (subir nueva reemplaza la actual)" hint="JPG, PNG o WEBP">
                {form.imagen && <img src={form.imagen} alt="actual" style={{ maxHeight: '80px', borderRadius: 'var(--r)', marginBottom: '6px', display: 'block' }} />}
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) setImgFile(f) }} style={{ fontSize: '12px', color: 'var(--chalk-muted)' }} />
                {imgFile && <div style={{ fontSize: '11px', color: 'var(--green-l)', marginTop: '4px' }}>Nueva imagen seleccionada: {imgFile.name}</div>}
              </Field>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
            <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          </div>
        </div>
      </div>
    )
  }

  function handleEditSaved(type, id, updates) {
    if (type === 'provincia') setProvincias(ps => ps.map(p => p.id === id ? { ...p, ...updates } : p))
    if (type === 'lugar')    setLugares(ls => ls.map(l => l.id === id ? { ...l, ...updates } : l))
    if (type === 'grupo')    setGrupos(gs => gs.map(g => g.id === id ? { ...g, ...updates } : g))
    if (type === 'via')      setVias(vs => vs.map(v => v.id === id ? { ...v, ...updates } : v))
    setEditing(null)
  }

  const tabStyle = (active) => ({ background: 'none', border: 'none', color: active ? 'var(--accent)' : 'var(--chalk-muted)', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`, marginBottom: '-1px', transition: 'all 0.12s' })
  const thSt = { textAlign: 'left', color: 'var(--chalk-muted)', fontWeight: 400, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.45rem 0.7rem', borderBottom: '1px solid var(--rock-border)' }
  const tdSt = { padding: '0.6rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.028)', verticalAlign: 'middle' }

  const lugarIdsDeProv = filtProv ? lugares.map(l => l.id) : []
  const viasFilt = vias.filter(v =>
    (!filtProv || (filtLugar ? v.lugar_id === filtLugar : lugarIdsDeProv.includes(v.lugar_id))) &&
    (!filtGrupo || v.grupo_id === filtGrupo)
  )

  return (
    <Page>
      {editing && (
        <EditModal
          type={editing.type} item={editing.item}
          onClose={() => setEditing(null)}
          onSaved={updates => handleEditSaved(editing.type, editing.item.id, updates)}
        />
      )}

      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--rock-border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button style={tabStyle(tab === 'vias')} onClick={() => setTab('vias')}>Vías ({vias.length})</button>
        <button style={tabStyle(tab === 'grupos')} onClick={() => setTab('grupos')}>Grupos</button>
        <button style={tabStyle(tab === 'lugares')} onClick={() => setTab('lugares')}>Lugares</button>
        <button style={tabStyle(tab === 'provincias')} onClick={() => setTab('provincias')}>Provincias ({provincias.length})</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => navigate('/admin/nueva')} style={{ fontSize: '12px', padding: '4px 12px' }}>+ Nueva vía</Button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* FILTROS comunes */}
          {(tab === 'vias' || tab === 'grupos') && (
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <select value={filtProv} onChange={e => onFiltProv(e.target.value)} style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.4rem 0.6rem', fontSize: '12px' }}>
                <option value="">Todas las provincias</option>
                {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {lugares.length > 0 && (
                <select value={filtLugar} onChange={e => onFiltLugar(e.target.value)} style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.4rem 0.6rem', fontSize: '12px' }}>
                  <option value="">Todos los lugares</option>
                  {lugares.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              )}
              {tab === 'vias' && grupos.length > 0 && (
                <select value={filtGrupo} onChange={e => setFiltGrupo(e.target.value)} style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.4rem 0.6rem', fontSize: '12px' }}>
                  <option value="">Todos los grupos</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              )}
            </div>
          )}

          {/* VÍAS */}
          {tab === 'vias' && (
            <Card>
              <CardTitle>Vías ({viasFilt.length})</CardTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead><tr>{['#','Vía','Lugar','Grupo','Grado','Tipo',''].map(h => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                  <tbody>
                    {viasFilt.length === 0 ? <tr><td colSpan={7} style={{ ...tdSt, textAlign: 'center', color: 'var(--chalk-muted)' }}>No hay vías</td></tr>
                      : viasFilt.map(v => (
                        <tr key={v.id}>
                          <td style={tdSt}>{v.numero || '—'}</td>
                          <td style={{ ...tdSt, cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }} onClick={() => navigate(`/via/${v.id}`)}>{v.nombre}</td>
                          <td style={{ ...tdSt, color: 'var(--chalk-muted)' }}>{v.lugares?.nombre || '?'}</td>
                          <td style={{ ...tdSt, color: 'var(--chalk-muted)' }}>{v.grupos?.nombre || '?'}</td>
                          <td style={tdSt}><span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.05rem', color: gradeColor(v.grado_n || 0) }}>{v.grado}</span></td>
                          <td style={tdSt}><Badge variant={v.tipo === 'Top Rope' ? 'sky' : 'rock'}>{v.tipo}</Badge></td>
                          <td style={tdSt}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Button variant="sky" onClick={() => setEditing({ type: 'via', item: v })} style={{ padding: '2px 7px', fontSize: '10px' }}>Editar</Button>
                              <Button variant="danger" onClick={() => handleDelete('via', v.id, v.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>Borrar</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* GRUPOS */}
          {tab === 'grupos' && (
            <Card>
              <CardTitle>Grupos {filtLugar ? `de ${lugares.find(l=>l.id===filtLugar)?.nombre}` : ''}</CardTitle>
              {grupos.length === 0 ? <p style={{ color: 'var(--chalk-muted)', fontSize: '13px' }}>Seleccioná un lugar para ver sus grupos.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead><tr>{['Nombre','Descripción','Altitud',''].map(h => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                    <tbody>
                      {grupos.map(g => (
                        <tr key={g.id}>
                          <td style={{ ...tdSt, cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }} onClick={() => navigate(`/grupo/${g.id}`)}>{g.nombre}</td>
                          <td style={{ ...tdSt, color: 'var(--chalk-muted)' }}>{g.descripcion || '—'}</td>
                          <td style={{ ...tdSt, color: 'var(--chalk-muted)' }}>{g.altitud || '—'}</td>
                          <td style={tdSt}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Button variant="sky" onClick={() => setEditing({ type: 'grupo', item: g })} style={{ padding: '2px 7px', fontSize: '10px' }}>Editar</Button>
                              <Button variant="danger" onClick={() => handleDelete('grupo', g.id, g.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>Borrar</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* LUGARES */}
          {tab === 'lugares' && (
            <Card>
              <CardTitle>Lugares</CardTitle>
              <div style={{ marginBottom: '0.85rem' }}>
                <select value={filtProv} onChange={e => onFiltProv(e.target.value)} style={{ background: 'var(--rock-input)', border: '1px solid var(--rock-border)', color: 'var(--chalk)', borderRadius: 'var(--r)', padding: '0.4rem 0.6rem', fontSize: '12px' }}>
                  <option value="">Todas las provincias</option>
                  {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              {lugares.length === 0 ? <p style={{ color: 'var(--chalk-muted)', fontSize: '13px' }}>Seleccioná una provincia para ver sus lugares.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead><tr>{['Nombre','Zona','Maps',''].map(h => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                    <tbody>
                      {lugares.map(l => (
                        <tr key={l.id}>
                          <td style={{ ...tdSt, cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }} onClick={() => navigate(`/lugar/${l.id}`)}>{l.nombre}</td>
                          <td style={{ ...tdSt, color: 'var(--chalk-muted)' }}>{l.zona || '—'}</td>
                          <td style={tdSt}>{l.maps_url ? <Badge variant="green">✓</Badge> : <Badge variant="rock">—</Badge>}</td>
                          <td style={tdSt}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Button variant="sky" onClick={() => setEditing({ type: 'lugar', item: l })} style={{ padding: '2px 7px', fontSize: '10px' }}>Editar</Button>
                              <Button variant="danger" onClick={() => handleDelete('lugar', l.id, l.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>Borrar</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* PROVINCIAS */}
          {tab === 'provincias' && (
            <Card>
              <CardTitle>Provincias ({provincias.length})</CardTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead><tr>{['Nombre','Descripción',''].map(h => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                  <tbody>
                    {provincias.length === 0 ? <tr><td colSpan={3} style={{ ...tdSt, textAlign: 'center', color: 'var(--chalk-muted)' }}>No hay provincias</td></tr>
                      : provincias.map(p => (
                        <tr key={p.id}>
                          <td style={{ ...tdSt, cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }} onClick={() => navigate(`/provincia/${p.id}`)}>{p.nombre}</td>
                          <td style={{ ...tdSt, color: 'var(--chalk-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion || '—'}</td>
                          <td style={tdSt}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Button variant="sky" onClick={() => setEditing({ type: 'provincia', item: p })} style={{ padding: '2px 7px', fontSize: '10px' }}>Editar</Button>
                              <Button variant="danger" onClick={() => handleDelete('provincia', p.id, p.nombre)} style={{ padding: '2px 7px', fontSize: '10px' }}>Borrar</Button>
                            </div>
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
