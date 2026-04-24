/**
 * Compute word count and estimated narration read time for a script.
 * Uses ~150 wpm, a standard narration pace for video scripts.
 */
export function computeWordStats(text: string) {
  if (!text) return { words: 0, readTime: "0 min" }
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / 150) // ~150 wpm for narrated video scripts
  return {
    words,
    readTime: minutes <= 1 ? "~1 min" : `~${minutes} min`,
  }
}
