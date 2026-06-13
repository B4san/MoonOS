const PREFIX = 'moonos-'

export const persistence = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  },
  remove(key: string) {
    localStorage.removeItem(PREFIX + key)
  },
  exportAll(): string {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX)) {
        data[key.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(key)!)
      }
    }
    return JSON.stringify(data, null, 2)
  },
  importAll(json: string) {
    const data = JSON.parse(json) as Record<string, unknown>
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    }
  },
}
