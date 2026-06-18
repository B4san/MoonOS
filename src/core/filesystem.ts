import localforage from 'localforage'

// Configure localforage to use IndexedDB
const fsStore = localforage.createInstance({
  name: 'moonos',
  storeName: 'filesystem',
})

export interface FSEntry {
  path: string
  name: string
  type: 'file' | 'directory'
  content?: Uint8Array | string // files have content
  mimeType?: string
  size: number // bytes
  createdAt: number
  updatedAt: number
}

export interface StorageInfo {
  used: number // bytes used by MoonOS
  quota: number // total available bytes
  usedFormatted: string
  quotaFormatted: string
  percentage: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return '/' + resolved.join('/')
}

function parentPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return '/' + parts.join('/')
}

export const filesystem = {
  /** Get storage quota info via StorageManager API */
  async getStorageInfo(): Promise<StorageInfo> {
    let quota = 500 * 1024 * 1024 // default 500MB fallback
    let used = 0

    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      quota = estimate.quota ?? quota
      used = estimate.usage ?? 0
    }

    return {
      used,
      quota,
      usedFormatted: formatBytes(used),
      quotaFormatted: formatBytes(quota),
      percentage: Math.round((used / quota) * 100),
    }
  },

  /** Initialize default filesystem structure */
  async init(): Promise<void> {
    const root = await fsStore.getItem<FSEntry>('/')
    if (root) return // already initialized

    const now = Date.now()
    const dirs = ['/', '/home', '/home/documents', '/home/downloads', '/home/desktop', '/tmp']
    for (const dir of dirs) {
      await fsStore.setItem<FSEntry>(dir, {
        path: dir,
        name: dir.split('/').pop() || '/',
        type: 'directory',
        size: 0,
        createdAt: now,
        updatedAt: now,
      })
    }

    // Create a welcome file
    const welcomeContent = '# Welcome to MoonOS\n\nYour files are stored locally using IndexedDB.\nNo data leaves your device.\n'
    await this.writeFile('/home/documents/welcome.md', welcomeContent, 'text/markdown')
  },

  /** Read a file's content */
  async readFile(path: string): Promise<string | Uint8Array | null> {
    const entry = await fsStore.getItem<FSEntry>(normalizePath(path))
    if (!entry || entry.type !== 'file') return null
    return entry.content ?? null
  },

  /** Write a file (creates parent directories if needed) */
  async writeFile(path: string, content: string | Uint8Array, mimeType = 'text/plain'): Promise<FSEntry> {
    const normalized = normalizePath(path)
    const name = normalized.split('/').pop()!
    const parent = parentPath(normalized)

    // Ensure parent directory exists
    await this.mkdir(parent)

    const size = typeof content === 'string' ? new Blob([content]).size : content.byteLength
    const now = Date.now()
    const existing = await fsStore.getItem<FSEntry>(normalized)

    const entry: FSEntry = {
      path: normalized,
      name,
      type: 'file',
      content,
      mimeType,
      size,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    await fsStore.setItem(normalized, entry)
    return entry
  },

  /** Create a directory (recursive) */
  async mkdir(path: string): Promise<void> {
    const normalized = normalizePath(path)
    if (normalized === '/') {
      const exists = await fsStore.getItem<FSEntry>('/')
      if (!exists) {
        await fsStore.setItem<FSEntry>('/', { path: '/', name: '/', type: 'directory', size: 0, createdAt: Date.now(), updatedAt: Date.now() })
      }
      return
    }

    const existing = await fsStore.getItem<FSEntry>(normalized)
    if (existing) return

    // Ensure parent exists first
    const parent = parentPath(normalized)
    await this.mkdir(parent)

    const name = normalized.split('/').pop()!
    await fsStore.setItem<FSEntry>(normalized, {
      path: normalized,
      name,
      type: 'directory',
      size: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },

  /** List contents of a directory */
  async readdir(path: string): Promise<FSEntry[]> {
    const normalized = normalizePath(path)
    const entries: FSEntry[] = []

    await fsStore.iterate<FSEntry, void>((entry, key) => {
      if (key === normalized) return // skip self
      const entryParent = parentPath(key)
      if (entryParent === normalized) {
        // Don't include content in listing (perf)
        entries.push({ ...entry, content: undefined })
      }
    })

    return entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  },

  /** Check if a path exists */
  async exists(path: string): Promise<boolean> {
    const entry = await fsStore.getItem<FSEntry>(normalizePath(path))
    return !!entry
  },

  /** Get entry metadata (without content) */
  async stat(path: string): Promise<FSEntry | null> {
    const entry = await fsStore.getItem<FSEntry>(normalizePath(path))
    if (!entry) return null
    return { ...entry, content: undefined }
  },

  /** Remove a file or directory (recursive) */
  async remove(path: string): Promise<void> {
    const normalized = normalizePath(path)
    if (normalized === '/') return // can't remove root

    const entry = await fsStore.getItem<FSEntry>(normalized)
    if (!entry) return

    if (entry.type === 'directory') {
      // Remove all children recursively
      const keys: string[] = []
      await fsStore.iterate<FSEntry, void>((_, key) => {
        if (key.startsWith(normalized + '/') || key === normalized) {
          keys.push(key)
        }
      })
      for (const key of keys) {
        await fsStore.removeItem(key)
      }
    } else {
      await fsStore.removeItem(normalized)
    }
  },

  /** Rename/move a file or directory */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const normalizedOld = normalizePath(oldPath)
    const normalizedNew = normalizePath(newPath)
    const entry = await fsStore.getItem<FSEntry>(normalizedOld)
    if (!entry) return

    if (entry.type === 'file') {
      await fsStore.setItem(normalizedNew, { ...entry, path: normalizedNew, name: normalizedNew.split('/').pop()!, updatedAt: Date.now() })
      await fsStore.removeItem(normalizedOld)
    } else {
      // Move directory and all children
      const keys: string[] = []
      await fsStore.iterate<FSEntry, void>((_, key) => {
        if (key === normalizedOld || key.startsWith(normalizedOld + '/')) {
          keys.push(key)
        }
      })
      for (const key of keys) {
        const child = await fsStore.getItem<FSEntry>(key)
        if (child) {
          const newKey = normalizedNew + key.slice(normalizedOld.length)
          await fsStore.setItem(newKey, { ...child, path: newKey, name: newKey.split('/').pop()! })
          await fsStore.removeItem(key)
        }
      }
    }
  },

  /** Upload a File object from user's device */
  async uploadFile(file: File, destDir: string): Promise<FSEntry> {
    const arrayBuffer = await file.arrayBuffer()
    const content = new Uint8Array(arrayBuffer)
    const path = normalizePath(destDir) + '/' + file.name
    return this.writeFile(path, content, file.type || 'application/octet-stream')
  },

  /** Get total size of all stored files */
  async getTotalSize(): Promise<number> {
    let total = 0
    await fsStore.iterate<FSEntry, void>((entry) => {
      total += entry.size
    })
    return total
  },

  /** Get the most recently modified files */
  async getRecentFiles(limit: number): Promise<FSEntry[]> {
    const files: FSEntry[] = []
    await fsStore.iterate<FSEntry, void>((entry) => {
      if (entry.type === 'file') {
        files.push({ ...entry, content: undefined })
      }
    })
    return files
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
  },
}
