import { describe, it, expect, beforeEach } from 'vitest'
import { persistence } from '@/core/persistence'

describe('persistence', () => {
  beforeEach(() => localStorage.clear())

  it('saves and loads data', () => {
    persistence.set('test', { foo: 'bar' })
    expect(persistence.get('test', null)).toEqual({ foo: 'bar' })
  })

  it('returns fallback when key missing', () => {
    expect(persistence.get('missing', 'default')).toBe('default')
  })

  it('removes data', () => {
    persistence.set('key', 123)
    persistence.remove('key')
    expect(persistence.get('key', null)).toBe(null)
  })

  it('exports and imports', () => {
    persistence.set('a', 1)
    persistence.set('b', 'hello')
    const exported = persistence.exportAll()
    localStorage.clear()
    persistence.importAll(exported)
    expect(persistence.get('a', null)).toBe(1)
    expect(persistence.get('b', null)).toBe('hello')
  })
})
