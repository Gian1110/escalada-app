import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

let cached, pending, fetchedAt = 0
export function invalidateCatalog() { cached = undefined; fetchedAt = 0 }
async function readTable(table) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select('*').order('id').range(from, from + 999)
    if (error) throw error
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}
export async function getCatalog() {
  if (cached && Date.now() - fetchedAt < 60000) return cached
  if (!pending) pending = Promise.all(['provincias', 'lugares', 'grupos', 'vias'].map(readTable))
    .then(([provincias, lugares, grupos, vias]) => {
      const places = new Map(lugares.map(p => [p.id, p]))
      const sectors = new Map(grupos.map(p => [p.id, p]))
      const provinces = new Map(provincias.map(p => [p.id, p]))
      cached = { provincias, lugares, grupos, vias: vias.map(v => {
        const grupo = sectors.get(v.grupo_id)
        const lugar = places.get(v.lugar_id || grupo?.lugar_id)
        return { ...v, grupo, lugar, provincia: provinces.get(lugar?.provincia_id) }
      }) }
      fetchedAt = Date.now()
      return cached
    }).finally(() => { pending = null })
  return pending
}
export function useCatalog() {
  const [state, setState] = useState({ data: cached, error: null, loading: !cached })
  const [attempt, retry] = useState(0)
  useEffect(() => {
    let active = true
    setState(s => ({ ...s, error: null, loading: !s.data }))
    getCatalog().then(data => active && setState({ data, loading: false, error: null }))
      .catch(error => active && setState(s => ({ ...s, error, loading: false })))
    return () => { active = false }
  }, [attempt])
  return { ...state, retry: () => retry(n => n + 1) }
}
