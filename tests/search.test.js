import test from 'node:test'
import assert from 'node:assert/strict'
import { filterRoutes } from '../src/lib/search.js'
const routes = [
  { id: '1', nombre: 'Árbol azul', provincia: { id: 't', nombre: 'Tucumán' }, lugar: { nombre: 'El Corral' }, grupo: { nombre: 'Centro' }, grado: '6a', tipo: 'Deportiva' },
  { id: '2', nombre: 'Otra', provincia: { id: 'j', nombre: 'Jujuy' }, grado: '7a', tipo: 'Boulder' },
]
test('search matches accents and words across route and destination', () => {
  assert.equal(filterRoutes(routes, { q: 'arbol TUCUMAN' }).length, 1)
  assert.equal(filterRoutes(routes, { q: 'corral centro' })[0].id, '1')
})
test('all selected filters apply together', () => {
  assert.equal(filterRoutes(routes, { province: 'j', type: 'Deportiva' }).length, 0)
  assert.equal(filterRoutes(routes, { province: 'j', type: 'Boulder', grade: '7a' })[0].id, '2')
})
test('an empty saved list never displays unbookmarked routes', () => {
  assert.equal(filterRoutes(routes, { saved: [] }).length, 0)
  assert.equal(filterRoutes(routes, { saved: ['1'], grade: '6a' }).length, 1)
})
test('records without a linked destination remain searchable', () => {
  assert.equal(filterRoutes([{ id: '3', nombre: 'Sola' }], { q: 'sola' }).length, 1)
})
