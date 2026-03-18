import { useEffect, useState } from 'react'
import {
  getProvincias, getLugaresByProvincia, getGruposByLugar,
  createProvincia, createLugar, createGrupo, createVia,
  uploadImage, ytEmbed
} from '../../lib/supabase.js'
import { Card, CardTitle, Field, Input, Textarea, Select, Button, GradeSelector, Divider, Page } from '../../components/ui.jsx'
import { toast } from '../../components/ui.jsx'

const StepBadge = ({ n, locked }) => (
  <span style={{
    width: '21px', height: '21px', borderRadius: '50%', flexShrink: 0,
    background: locked ? 'var(--rock-input)' : 'var(--accent)',
    color: locked ? 'var(--chalk-muted)' : '#fff',
    fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 500,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }}>{n}</span>
)

function ImageUploader({ file, preview, onFile, onClear, label = 'Foto', hint }) {
  return (
    <Field label={label} hint={hint}>
      <input type="file" accept="image/*"
        onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }}
        style={{ fontSize: '12px', color: 'var(--chalk-muted)' }}
      />
      {preview && (
        <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
          <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: 'var(--r)', display: 'block' }} />
          <button type="button" onClick={onClear} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
      )}
    </Field>
  )
}

export default function NuevaVia() {
  // Provincia
  const [provincias, setProvincias] = useState([])
  const [provinciaId, setProvinciaId] = useState('')
  const [showNuevaProvincia, setShowNuevaProvincia] = useState(false)
  const [np, setNp] = useState({ nombre: '', descripcion: '' })
  const [npFile, setNpFile] = useState(null); const [npPreview, setNpPreview] = useState('')

  // Lugar
  const [lugares, setLugares] = useState([])
  const [lugarId, setLugarId] = useState('')
  const [showNuevoLugar, setShowNuevoLugar] = useState(false)
  const [nl, setNl] = useState({ nombre: '', zona: '', descripcion: '', mapsUrl: '' })
  const [nlFile, setNlFile] = useState(null); const [nlPreview, setNlPreview] = useState('')

  // Grupo
  const [grupos, setGrupos] = useState([])
  const [grupoId, setGrupoId] = useState('')
  const [showNuevoGrupo, setShowNuevoGrupo] = useState(false)
  const [ng, setNg] = useState({ nombre: '', descripcion: '', autoUrl: '', acampeUrl: '', altitud: '', acampeObs: '' })
  const [ngFile, setNgFile] = useState(null); const [ngPreview, setNgPreview] = useState('')

  // Vía
  const [via, setVia] = useState({ nombre: '', numero: '', equipador: '', temporada: '', grado: '', gradoN: 0, tipo: 'Deportiva', expressMin: '', expressRec: '', tiempo: '', chapas: '', largo: '', videoVia: '', videoAprox: '', notas: '' })
  const [viaFile, setViaFile] = useState(null); const [viaPreview, setViaPreview] = useState('')
  const [saving, setSaving] = useState(false)

  const provinciaSel = provincias.find(p => p.id === provinciaId)
  const lugarSel     = lugares.find(l => l.id === lugarId)
  const grupoSel     = grupos.find(g => g.id === grupoId)

  useEffect(() => { loadProvincias() }, [])

  async function loadProvincias() {
    try { setProvincias(await getProvincias()) } catch (e) { console.error(e) }
  }

  async function onProvinciaChange(id) {
    setProvinciaId(id); setLugarId(''); setGrupoId(''); setLugares([]); setGrupos([])
    if (id) try { setLugares(await getLugaresByProvincia(id)) } catch (e) { console.error(e) }
  }
  async function onLugarChange(id) {
    setLugarId(id); setGrupoId(''); setGrupos([])
    if (id) try { setGrupos(await getGruposByLugar(id)) } catch (e) { console.error(e) }
  }

  async function handleCrearProvincia() {
    if (!np.nombre.trim()) { toast('El nombre es obligatorio', 'err'); return }
    try {
      let img = null; if (npFile) img = await uploadImage(npFile, 'imagenes')
      const nuevo = await createProvincia({ nombre: np.nombre, descripcion: np.descripcion, imagen: img })
      await loadProvincias(); setShowNuevaProvincia(false); onProvinciaChange(nuevo.id)
      setNp({ nombre: '', descripcion: '' }); setNpFile(null); setNpPreview('')
      toast(`Provincia "${nuevo.nombre}" creada`, 'ok')
    } catch (e) { toast('Error al crear provincia', 'err'); console.error(e) }
  }

  async function handleCrearLugar() {
    if (!nl.nombre.trim()) { toast('El nombre es obligatorio', 'err'); return }
    try {
      let img = null; if (nlFile) img = await uploadImage(nlFile, 'imagenes')
      const nuevo = await createLugar({ provincia_id: provinciaId, nombre: nl.nombre, zona: nl.zona, descripcion: nl.descripcion, maps_url: nl.mapsUrl || null, imagen: img })
      setLugares(ls => [...ls, nuevo]); setLugarId(nuevo.id); onLugarChange(nuevo.id)
      setShowNuevoLugar(false); setNl({ nombre: '', zona: '', descripcion: '', mapsUrl: '' }); setNlFile(null); setNlPreview('')
      toast(`Lugar "${nuevo.nombre}" creado`, 'ok')
    } catch (e) { toast('Error al crear lugar', 'err'); console.error(e) }
  }

  async function handleCrearGrupo() {
    if (!ng.nombre.trim()) { toast('El nombre es obligatorio', 'err'); return }
    try {
      let img = null; if (ngFile) img = await uploadImage(ngFile, 'imagenes')
      const nuevo = await createGrupo({ lugar_id: lugarId, nombre: ng.nombre, descripcion: ng.descripcion, auto_url: ng.autoUrl || null, acampe_url: ng.acampeUrl || null, altitud: ng.altitud || null, acampe_obs: ng.acampeObs || null, imagen: img })
      setGrupos(g => [...g, nuevo]); setGrupoId(nuevo.id)
      setShowNuevoGrupo(false); setNg({ nombre: '', descripcion: '', autoUrl: '', acampeUrl: '', altitud: '', acampeObs: '' }); setNgFile(null); setNgPreview('')
      toast(`Grupo "${nuevo.nombre}" creado`, 'ok')
    } catch (e) { toast('Error al crear grupo', 'err'); console.error(e) }
  }

  async function handleGuardarVia() {
    if (!via.nombre.trim()) { toast('El nombre es obligatorio', 'err'); return }
    if (!via.grado) { toast('Seleccioná el grado', 'err'); return }
    if (!lugarId || !grupoId) { toast('Seleccioná lugar y grupo', 'err'); return }
    setSaving(true)
    try {
      let img = null; if (viaFile) img = await uploadImage(viaFile, 'imagenes')
      await createVia({ lugar_id: lugarId, grupo_id: grupoId, nombre: via.nombre, numero: parseInt(via.numero) || null, equipador: via.equipador, temporada: via.temporada, grado: via.grado, grado_n: via.gradoN, tipo: via.tipo, express_min: parseInt(via.expressMin) || null, express_rec: parseInt(via.expressRec) || null, tiempo: via.tiempo, chapas: via.chapas, largo: via.largo, video_via: ytEmbed(via.videoVia), video_aprox: ytEmbed(via.videoAprox), notas: via.notas, imagen: img })
      toast(`Vía "${via.nombre}" guardada`, 'ok')
      setVia({ nombre: '', numero: '', equipador: '', temporada: '', grado: '', gradoN: 0, tipo: 'Deportiva', expressMin: '', expressRec: '', tiempo: '', chapas: '', largo: '', videoVia: '', videoAprox: '', notas: '' })
      setViaFile(null); setViaPreview('')
    } catch (e) { toast('Error al guardar la vía', 'err'); console.error(e) }
    finally { setSaving(false) }
  }

  const setV = (k, v) => setVia(prev => ({ ...prev, [k]: v }))
  const selRow = { display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', background: 'var(--rock-input)', border: '1px solid var(--rock-border)', borderRadius: 'var(--r)', padding: '0.45rem 0.7rem' }
  const selSt = { background: 'none', border: 'none', color: 'var(--chalk)', flex: 1, minWidth: '130px', fontSize: '13px', outline: 'none' }
  const newBtn = { background: 'none', border: '1px dashed var(--rock-border-h)', color: 'var(--chalk-muted)', padding: '3px 9px', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }
  const nfStyle = { border: '1px dashed var(--rock-border-h)', borderRadius: 'var(--r)', padding: '0.9rem', marginTop: '0.7rem', background: 'rgba(255,255,255,0.012)' }
  const nfLabel = { fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.85rem' }
  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }
  const resSel = { background: 'var(--rock-input)', border: '1px solid var(--rock-border)', borderRadius: 'var(--r)', padding: '0.65rem 0.85rem', fontSize: '12px', marginTop: '0.75rem' }

  const step2Lock = !provinciaId
  const step3Lock = !lugarId
  const step4Lock = !grupoId

  return (
    <Page>

      {/* PASO 1: PROVINCIA */}
      <Card>
        <CardTitle><StepBadge n={1} /> Provincia</CardTitle>
        <Field label="Seleccioná una provincia o creá una nueva" required>
          <div style={selRow}>
            <select value={provinciaId} onChange={e => onProvinciaChange(e.target.value)} style={selSt}>
              <option value="">— Seleccionar provincia —</option>
              {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <button onClick={() => setShowNuevaProvincia(v => !v)} style={newBtn}>+ Nueva provincia</button>
          </div>
        </Field>
        {provinciaSel && <div style={resSel}><div style={{ color: 'var(--chalk-dim)', fontWeight: 500 }}>{provinciaSel.nombre}</div></div>}
        {showNuevaProvincia && (
          <div style={nfStyle}>
            <div style={nfLabel}>Nueva provincia</div>
            <div style={g2}>
              <Field label="Nombre" required><Input value={np.nombre} onChange={e => setNp(v => ({ ...v, nombre: e.target.value }))} placeholder="Ej: Tucumán" /></Field>
              <div style={{ gridColumn: 'span 1' }} />
              <Field label="Descripción" span={2}><Textarea value={np.descripcion} onChange={e => setNp(v => ({ ...v, descripcion: e.target.value }))} placeholder="Descripción de la provincia..." /></Field>
              <div style={{ gridColumn: 'span 2' }}>
                <ImageUploader label="Foto" hint="JPG, PNG o WEBP" file={npFile} preview={npPreview}
                  onFile={f => { setNpFile(f); setNpPreview(URL.createObjectURL(f)) }}
                  onClear={() => { setNpFile(null); setNpPreview('') }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              <Button variant="primary" onClick={handleCrearProvincia}>Crear provincia</Button>
              <Button variant="ghost" onClick={() => setShowNuevaProvincia(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Card>

      {/* PASO 2: LUGAR */}
      <div style={{ opacity: step2Lock ? 0.4 : 1, pointerEvents: step2Lock ? 'none' : 'auto' }}>
        <Card>
          <CardTitle><StepBadge n={2} locked={step2Lock} /> Lugar físico</CardTitle>
          <Field label="Seleccioná un lugar o creá uno nuevo" required>
            <div style={selRow}>
              <select value={lugarId} onChange={e => onLugarChange(e.target.value)} style={selSt}>
                <option value="">— Seleccionar lugar —</option>
                {lugares.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
              <button onClick={() => setShowNuevoLugar(v => !v)} style={newBtn}>+ Nuevo lugar</button>
            </div>
          </Field>
          {lugarSel && <div style={resSel}><div style={{ color: 'var(--chalk-dim)', fontWeight: 500 }}>{lugarSel.nombre}</div>{lugarSel.zona && <div style={{ color: 'var(--chalk-muted)' }}>{lugarSel.zona}</div>}</div>}
          {showNuevoLugar && (
            <div style={nfStyle}>
              <div style={nfLabel}>Nuevo lugar físico</div>
              <div style={g2}>
                <Field label="Nombre" required><Input value={nl.nombre} onChange={e => setNl(v => ({ ...v, nombre: e.target.value }))} placeholder="Ej: Chivo Berrinche" /></Field>
                <Field label="Zona"><Input value={nl.zona} onChange={e => setNl(v => ({ ...v, zona: e.target.value }))} placeholder="Ej: Tafí del Valle" /></Field>
                <Field label="Descripción" span={2}><Textarea value={nl.descripcion} onChange={e => setNl(v => ({ ...v, descripcion: e.target.value }))} placeholder="Descripción..." /></Field>
                <div style={{ gridColumn: 'span 2' }}>
                  <ImageUploader label="Foto" hint="JPG, PNG o WEBP" file={nlFile} preview={nlPreview}
                    onFile={f => { setNlFile(f); setNlPreview(URL.createObjectURL(f)) }}
                    onClear={() => { setNlFile(null); setNlPreview('') }} />
                </div>
                <Field label="Google Maps – ubicación" span={2}>
                  <Input type="url" value={nl.mapsUrl} onChange={e => setNl(v => ({ ...v, mapsUrl: e.target.value }))} placeholder="https://maps.google.com/?q=..." />
                </Field>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <Button variant="primary" onClick={handleCrearLugar}>Crear lugar</Button>
                <Button variant="ghost" onClick={() => setShowNuevoLugar(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* PASO 3: GRUPO */}
      <div style={{ opacity: step3Lock ? 0.4 : 1, pointerEvents: step3Lock ? 'none' : 'auto' }}>
        <Card>
          <CardTitle><StepBadge n={3} locked={step3Lock} /> Grupo de vías</CardTitle>
          <Field label="Seleccioná un grupo o creá uno nuevo" required>
            <div style={selRow}>
              <select value={grupoId} onChange={e => setGrupoId(e.target.value)} style={selSt}>
                <option value="">— Seleccionar grupo —</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
              <button onClick={() => setShowNuevoGrupo(v => !v)} style={newBtn}>+ Nuevo grupo</button>
            </div>
          </Field>
          {grupoSel && <div style={resSel}><div style={{ color: 'var(--chalk-dim)', fontWeight: 500 }}>{grupoSel.nombre}</div></div>}
          {showNuevoGrupo && (
            <div style={nfStyle}>
              <div style={nfLabel}>Nuevo grupo de vías</div>
              <div style={g2}>
                <Field label="Nombre" required><Input value={ng.nombre} onChange={e => setNg(v => ({ ...v, nombre: e.target.value }))} placeholder="Ej: El Chivo (Vías)" /></Field>
                <Field label="Altitud máxima"><Input value={ng.altitud} onChange={e => setNg(v => ({ ...v, altitud: e.target.value }))} placeholder="Ej: 3200m" /></Field>
                <Field label="Descripción" span={2}><Textarea value={ng.descripcion} onChange={e => setNg(v => ({ ...v, descripcion: e.target.value }))} placeholder="Descripción del sector..." /></Field>
                <div style={{ gridColumn: 'span 2' }}>
                  <ImageUploader label="Foto del sector" hint="JPG, PNG o WEBP" file={ngFile} preview={ngPreview}
                    onFile={f => { setNgFile(f); setNgPreview(URL.createObjectURL(f)) }}
                    onClear={() => { setNgFile(null); setNgPreview('') }} />
                </div>
                <Field label="Google Maps – último punto en auto"><Input type="url" value={ng.autoUrl} onChange={e => setNg(v => ({ ...v, autoUrl: e.target.value }))} placeholder="https://maps.google.com/?q=..." /></Field>
                <Field label="Google Maps – acampe"><Input type="url" value={ng.acampeUrl} onChange={e => setNg(v => ({ ...v, acampeUrl: e.target.value }))} placeholder="https://maps.google.com/?q=..." /></Field>
                <Field label="Observaciones del acampe" span={2}><Input value={ng.acampeObs} onChange={e => setNg(v => ({ ...v, acampeObs: e.target.value }))} placeholder="Ej: Sin agua en verano." /></Field>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <Button variant="primary" onClick={handleCrearGrupo}>Crear grupo</Button>
                <Button variant="ghost" onClick={() => setShowNuevoGrupo(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* PASO 4: VÍA */}
      <div style={{ opacity: step4Lock ? 0.4 : 1, pointerEvents: step4Lock ? 'none' : 'auto' }}>
        <Card>
          <CardTitle><StepBadge n={4} locked={step4Lock} /> Datos de la vía</CardTitle>
          <div style={g2}>
            <Field label="Nombre de la vía" required><Input value={via.nombre} onChange={e => setV('nombre', e.target.value)} placeholder="Ej: Chivo Berrinche" /></Field>
            <Field label="Número en el sector"><Input type="number" value={via.numero} onChange={e => setV('numero', e.target.value)} placeholder="Ej: 1" min={1} /></Field>
            <Field label="Quién la armó / equipador"><Input value={via.equipador} onChange={e => setV('equipador', e.target.value)} placeholder="Ej: Rohmer · González" /></Field>
            <Field label="Temporada recomendada"><Input value={via.temporada} onChange={e => setV('temporada', e.target.value)} placeholder="Ej: Abr – Oct" /></Field>
          </div>
          <Divider />
          <Field label="Grado de dificultad (escala francesa)" required>
            <GradeSelector value={via.grado} onChange={(g, n) => setVia(v => ({ ...v, grado: g, gradoN: n }))} />
            {via.grado && <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', marginTop: '4px' }}>Seleccionado: {via.grado}</div>}
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
            <Field label="Tipo"><Select value={via.tipo} onChange={e => setV('tipo', e.target.value)}><option value="Deportiva">Deportiva</option><option value="Top Rope">Top Rope</option><option value="Clásica / Mixta">Clásica / Mixta</option><option value="Boulder">Boulder</option></Select></Field>
            <Field label="Express mínimos"><Input type="number" value={via.expressMin} onChange={e => setV('expressMin', e.target.value)} placeholder="Ej: 8" min={0} /></Field>
            <Field label="Express recomendados"><Input type="number" value={via.expressRec} onChange={e => setV('expressRec', e.target.value)} placeholder="Ej: 12" min={0} /></Field>
            <Field label="Tiempo estimado"><Input value={via.tiempo} onChange={e => setV('tiempo', e.target.value)} placeholder="Ej: 2-3h" /></Field>
            <Field label="Chapas"><Input value={via.chapas} onChange={e => setV('chapas', e.target.value)} placeholder="Ej: 6+2" /></Field>
            <Field label="Largo total"><Input value={via.largo} onChange={e => setV('largo', e.target.value)} placeholder="Ej: 25m" /></Field>
          </div>
          <Divider />
          <div style={{ fontSize: '10px', color: 'var(--chalk-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>Multimedia</div>
          <div style={g2}>
            <ImageUploader label="Imagen con puntos de enganche" hint="Se sube a Supabase Storage" file={viaFile} preview={viaPreview}
              onFile={f => { setViaFile(f); setViaPreview(URL.createObjectURL(f)) }}
              onClear={() => { setViaFile(null); setViaPreview('') }} />
            <Field label="Video – recorrido de la vía" hint="Cualquier URL de YouTube">
              <Input type="url" value={via.videoVia} onChange={e => setV('videoVia', e.target.value)} placeholder="https://youtu.be/..." />
              <span style={{ fontSize: '10px', color: 'var(--gold)', marginTop: '3px', display: 'block' }}>Subí como "No listado" para que no aparezca en búsquedas</span>
            </Field>
            <Field label="Video – aproximación desde acampe" hint="Cualquier URL de YouTube">
              <Input type="url" value={via.videoAprox} onChange={e => setV('videoAprox', e.target.value)} placeholder="https://youtu.be/..." />
            </Field>
            <Field label="Notas / protecciones"><Textarea value={via.notas} onChange={e => setV('notas', e.target.value)} placeholder="Ej: Llevar friends #0.5 a #3..." /></Field>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
            <Button variant="primary" onClick={handleGuardarVia} disabled={saving}>{saving ? 'Guardando...' : 'Guardar vía'}</Button>
            <Button variant="ghost" onClick={() => { setVia({ nombre: '', numero: '', equipador: '', temporada: '', grado: '', gradoN: 0, tipo: 'Deportiva', expressMin: '', expressRec: '', tiempo: '', chapas: '', largo: '', videoVia: '', videoAprox: '', notas: '' }); setViaFile(null); setViaPreview('') }}>Limpiar</Button>
          </div>
        </Card>
      </div>
    </Page>
  )
}
