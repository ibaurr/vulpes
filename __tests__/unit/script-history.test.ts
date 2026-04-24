import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveScript, getSavedScripts, deleteScript, clearAllScripts } from '@/lib/script-history'

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })
Object.defineProperty(globalThis, 'window', { value: globalThis })

describe('script-history', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getSavedScripts', () => {
    it('returns empty array when no scripts are saved', () => {
      expect(getSavedScripts()).toEqual([])
    })

    it('returns saved scripts from localStorage', () => {
      const scripts = [{ id: '1', topic: 'Test', script: 'Hello', tone: 'Neutral', length: '3', version: 1, createdAt: Date.now() }]
      localStorageMock.setItem('vulpes-script-history', JSON.stringify(scripts))
      expect(getSavedScripts()).toEqual(scripts)
    })

    it('returns empty array if localStorage contains invalid JSON', () => {
      localStorageMock.setItem('vulpes-script-history', 'not-json{{{')
      expect(getSavedScripts()).toEqual([])
    })
  })

  describe('saveScript', () => {
    it('saves a script and returns it with generated id and createdAt', () => {
      const result = saveScript({
        topic: 'Space Exploration',
        script: '# Space\n\nA script about space.',
        tone: 'Dramatic',
        length: '5',
        version: 1,
      })

      expect(result).toMatchObject({
        topic: 'Space Exploration',
        script: '# Space\n\nA script about space.',
        tone: 'Dramatic',
        length: '5',
        version: 1,
      })
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeTypeOf('number')
    })

    it('prepends new scripts (most recent first)', () => {
      saveScript({ topic: 'First', script: 'A', tone: 'Neutral', length: '3', version: 1 })
      saveScript({ topic: 'Second', script: 'B', tone: 'Neutral', length: '3', version: 1 })

      const scripts = getSavedScripts()
      expect(scripts[0].topic).toBe('Second')
      expect(scripts[1].topic).toBe('First')
    })

    it('caps history at 20 entries', () => {
      // Save 25 scripts
      for (let i = 0; i < 25; i++) {
        saveScript({ topic: `Topic ${i}`, script: `Script ${i}`, tone: 'Neutral', length: '3', version: 1 })
      }

      const scripts = getSavedScripts()
      expect(scripts.length).toBe(20)
      // Most recent should be Topic 24
      expect(scripts[0].topic).toBe('Topic 24')
    })
  })

  describe('deleteScript', () => {
    it('removes a specific script by id', () => {
      const saved = saveScript({ topic: 'Delete Me', script: 'X', tone: 'Neutral', length: '3', version: 1 })
      saveScript({ topic: 'Keep Me', script: 'Y', tone: 'Neutral', length: '3', version: 1 })

      deleteScript(saved.id)

      const scripts = getSavedScripts()
      expect(scripts.length).toBe(1)
      expect(scripts[0].topic).toBe('Keep Me')
    })

    it('does nothing when deleting a non-existent id', () => {
      saveScript({ topic: 'Existing', script: 'Z', tone: 'Neutral', length: '3', version: 1 })
      deleteScript('non-existent-id')
      expect(getSavedScripts().length).toBe(1)
    })
  })

  describe('clearAllScripts', () => {
    it('removes all scripts', () => {
      saveScript({ topic: 'A', script: '1', tone: 'Neutral', length: '3', version: 1 })
      saveScript({ topic: 'B', script: '2', tone: 'Neutral', length: '3', version: 1 })

      clearAllScripts()

      expect(getSavedScripts()).toEqual([])
    })
  })
})
