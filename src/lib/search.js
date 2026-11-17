export const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export function filterRoutes(routes, { q = '', province = '', type = '', grade = '', saved = null } = {}) {
  const words = normalize(q).split(/\s+/).filter(Boolean)
  return routes.filter(v => (!province || String(v.provincia?.id) === province)
    && (!type || v.tipo === type) && (!grade || v.grado === grade)
    && (!saved || saved.includes(String(v.id)))
    && words.every(word => normalize([v.nombre, v.grupo?.nombre, v.lugar?.nombre, v.provincia?.nombre].join(' ')).includes(word)))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
}
