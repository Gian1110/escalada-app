import { useSyncExternalStore } from 'react'
const key = 'mqe-favorites'
let memory
function snapshot() {
  try { return memory ?? localStorage.getItem(key) ?? '[]' } catch { return memory || '[]' }
}
function subscribe(callback) {
  const onStorage = () => { memory = undefined; callback() }
  window.addEventListener('storage', onStorage)
  window.addEventListener('mqe-favorites', callback)
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('mqe-favorites', callback) }
}
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot)
  let ids
  try { ids = JSON.parse(raw); if (!Array.isArray(ids)) ids = [] } catch { ids = [] }
  function toggle(id) {
    id = String(id)
    const next = JSON.stringify(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
    memory = next
    try { localStorage.setItem(key, next) } catch { /* Session fallback when storage is unavailable. */ }
    window.dispatchEvent(new Event('mqe-favorites'))
  }
  return { ids, toggle }
}
