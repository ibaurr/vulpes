import { describe, it, expect } from 'vitest'
import { computeWordStats } from '@/lib/word-stats'

describe('computeWordStats', () => {
  it('returns zero for empty string', () => {
    const result = computeWordStats('')
    expect(result).toEqual({ words: 0, readTime: '0 min' })
  })

  it('returns zero for null/undefined input', () => {
    // @ts-expect-error testing defensive edge case
    expect(computeWordStats(null)).toEqual({ words: 0, readTime: '0 min' })
    // @ts-expect-error testing defensive edge case
    expect(computeWordStats(undefined)).toEqual({ words: 0, readTime: '0 min' })
  })

  it('counts words correctly for a simple sentence', () => {
    const result = computeWordStats('This is a test sentence')
    expect(result.words).toBe(5)
  })

  it('handles extra whitespace and newlines', () => {
    const result = computeWordStats('  word1   word2\n\n  word3  ')
    expect(result.words).toBe(3)
  })

  it('returns ~1 min for short scripts (under 150 words)', () => {
    // 10 words → well under 150wpm threshold
    const result = computeWordStats('one two three four five six seven eight nine ten')
    expect(result.readTime).toBe('~1 min')
  })

  it('returns ~1 min for exactly 150 words', () => {
    const text = Array(150).fill('word').join(' ')
    const result = computeWordStats(text)
    expect(result.words).toBe(150)
    expect(result.readTime).toBe('~1 min')
  })

  it('returns ~2 min for 151-300 words', () => {
    const text = Array(200).fill('word').join(' ')
    const result = computeWordStats(text)
    expect(result.words).toBe(200)
    expect(result.readTime).toBe('~2 min')
  })

  it('scales correctly for longer scripts', () => {
    const text = Array(750).fill('word').join(' ')
    const result = computeWordStats(text)
    expect(result.words).toBe(750)
    expect(result.readTime).toBe('~5 min')
  })

  it('handles markdown-formatted text (counts raw tokens)', () => {
    const md = '# Title\n\n**Bold text** and *italic* with [links](http://example.com)'
    const result = computeWordStats(md)
    // Counts raw tokens including markdown syntax
    expect(result.words).toBeGreaterThan(0)
  })
})
