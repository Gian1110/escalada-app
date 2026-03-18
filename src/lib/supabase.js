import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── PROVINCIAS ────────────────────────────────────────
export async function getProvincias() {
  const { data, error } = await supabase
    .from('provincias').select('*').order('nombre')
  if (error) throw error
  return data
}
export async function getProvincia(id) {
  const { data, error } = await supabase
    .from('provincias').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
export async function createProvincia(p) {
  const { data, error } = await supabase.from('provincias').insert(p).select().single()
  if (error) throw error
  return data
}
export async function updateProvincia(id, updates) {
  const { data, error } = await supabase.from('provincias').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteProvincia(id) {
  const { error } = await supabase.from('provincias').delete().eq('id', id)
  if (error) throw error
}

// ── LUGARES ───────────────────────────────────────────
export async function getLugares() {
  const { data, error } = await supabase
    .from('lugares').select('*').order('nombre')
  if (error) throw error
  return data
}
export async function getLugaresByProvincia(provinciaId) {
  const { data, error } = await supabase
    .from('lugares').select('*').eq('provincia_id', provinciaId).order('nombre')
  if (error) throw error
  return data
}
export async function getLugar(id) {
  const { data, error } = await supabase
    .from('lugares').select('*, provincias(id, nombre)').eq('id', id).single()
  if (error) throw error
  return data
}
export async function createLugar(l) {
  const { data, error } = await supabase.from('lugares').insert(l).select().single()
  if (error) throw error
  return data
}
export async function updateLugar(id, updates) {
  const { data, error } = await supabase.from('lugares').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteLugar(id) {
  const { error } = await supabase.from('lugares').delete().eq('id', id)
  if (error) throw error
}

// ── GRUPOS ────────────────────────────────────────────
export async function getGruposByLugar(lugarId) {
  const { data, error } = await supabase
    .from('grupos').select('*').eq('lugar_id', lugarId).order('nombre')
  if (error) throw error
  return data
}
export async function getGrupo(id) {
  const { data, error } = await supabase
    .from('grupos').select('*, lugares(id, nombre, provincia_id, provincias(id, nombre))').eq('id', id).single()
  if (error) throw error
  return data
}
export async function createGrupo(g) {
  const { data, error } = await supabase.from('grupos').insert(g).select().single()
  if (error) throw error
  return data
}
export async function updateGrupo(id, updates) {
  const { data, error } = await supabase.from('grupos').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteGrupo(id) {
  const { error } = await supabase.from('grupos').delete().eq('id', id)
  if (error) throw error
}

// ── VÍAS ──────────────────────────────────────────────
export async function getViasByGrupo(grupoId) {
  const { data, error } = await supabase
    .from('vias').select('*').eq('grupo_id', grupoId).order('numero', { nullsFirst: false })
  if (error) throw error
  return data
}
export async function getViasByLugar(lugarId) {
  const { data, error } = await supabase.from('vias').select('*').eq('lugar_id', lugarId)
  if (error) throw error
  return data
}
export async function getViasByProvincia(provinciaId) {
  const { data, error } = await supabase
    .from('vias').select('*, lugares!inner(provincia_id)')
    .eq('lugares.provincia_id', provinciaId)
  if (error) throw error
  return data
}
export async function getAllVias() {
  const { data, error } = await supabase
    .from('vias').select('*, lugares(nombre), grupos(nombre)').order('creado_en', { ascending: false })
  if (error) throw error
  return data
}
export async function getVia(id) {
  const { data, error } = await supabase
    .from('vias')
    .select('*, grupos(id, nombre, lugar_id, auto_url, acampe_url, acampe_obs, altitud, imagen, lugares(id, nombre, zona, maps_url, imagen, provincias(id, nombre)))')
    .eq('id', id).single()
  if (error) throw error
  return data
}
export async function createVia(v) {
  const { data, error } = await supabase.from('vias').insert(v).select().single()
  if (error) throw error
  return data
}
export async function updateVia(id, updates) {
  const { data, error } = await supabase.from('vias').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteVia(id) {
  const { error } = await supabase.from('vias').delete().eq('id', id)
  if (error) throw error
}

// ── STORAGE ───────────────────────────────────────────
export async function uploadImage(file, bucket = 'imagenes') {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ── HELPERS ───────────────────────────────────────────
export function ytEmbed(url) {
  if (!url) return null
  url = url.trim()
  if (url.includes('youtube.com/embed/')) return url.split('?')[0] + '?rel=0&modestbranding=1'
  let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`
  m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`
  m = url.match(/shorts\/([a-zA-Z0-9_-]{11})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`
  return null
}

export const GRADOS = [
  { g: '3',   n: 15, c: 'easy' }, { g: '3+',  n: 18, c: 'easy' },
  { g: '4',   n: 22, c: 'easy' }, { g: '4+',  n: 26, c: 'easy' },
  { g: '5',   n: 30, c: 'easy' }, { g: '5+',  n: 34, c: 'easy' },
  { g: '6a',  n: 42, c: 'mid'  }, { g: '6a+', n: 46, c: 'mid'  },
  { g: '6b',  n: 50, c: 'mid'  }, { g: '6b+', n: 53, c: 'mid'  },
  { g: '6c',  n: 56, c: 'mid'  }, { g: '6c+', n: 59, c: 'mid'  },
  { g: '7a',  n: 62, c: 'hard' }, { g: '7a+', n: 65, c: 'hard' },
  { g: '7b',  n: 68, c: 'hard' }, { g: '7b+', n: 71, c: 'hard' },
  { g: '7c',  n: 74, c: 'hard' }, { g: '7c+', n: 77, c: 'hard' },
  { g: '8a',  n: 81, c: 'elite'}, { g: '8a+', n: 84, c: 'elite'},
  { g: '8b',  n: 87, c: 'elite'}, { g: '8b+', n: 90, c: 'elite'},
  { g: '8c',  n: 93, c: 'elite'}, { g: '8c+', n: 96, c: 'elite'},
  { g: '9a',  n: 99, c: 'elite'},
]

export function gradeColor(n) {
  if (n < 35) return '#6db860'
  if (n < 50) return '#c8c44a'
  if (n < 62) return '#c89a2a'
  if (n < 72) return '#d4541a'
  if (n < 82) return '#c0392b'
  return '#9b2020'
}
export function gradoLabel(n) {
  if (n < 35) return 'Fácil'
  if (n < 50) return 'Intermedio bajo'
  if (n < 62) return 'Intermedio'
  if (n < 72) return 'Avanzado'
  if (n < 82) return 'Difícil'
  return 'Élite'
}
export function rangoFromVias(vias) {
  const ns = vias.map(v => v.grado_n).filter(Boolean)
  if (!ns.length) return null
  const minN = Math.min(...ns), maxN = Math.max(...ns)
  const min = GRADOS.reduce((a, g) => Math.abs(g.n - minN) < Math.abs(a.n - minN) ? g : a)
  const max = GRADOS.reduce((a, g) => Math.abs(g.n - maxN) < Math.abs(a.n - maxN) ? g : a)
  return min.g === max.g ? min.g : `${min.g} – ${max.g}`
}
