export interface SavedScript {
  id: string;
  topic: string;
  script: string;
  tone: string;
  length: string;
  version: number;
  createdAt: number;
}

const STORAGE_KEY = "vulpes-script-history"
const MAX_ENTRIES = 20

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getSavedScripts(): SavedScript[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedScript[]
  } catch {
    return []
  }
}

export function saveScript(entry: Omit<SavedScript, "id" | "createdAt">): SavedScript {
  const scripts = getSavedScripts()
  const saved: SavedScript = {
    ...entry,
    id: generateId(),
    createdAt: Date.now(),
  }
  const updated = [saved, ...scripts].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return saved
}

export function deleteScript(id: string): void {
  const scripts = getSavedScripts().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
}

export function clearAllScripts(): void {
  localStorage.removeItem(STORAGE_KEY)
}
