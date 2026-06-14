import { useState, useEffect, useCallback, useRef } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { filesystem, type FSEntry, type StorageInfo } from '@/core/filesystem'
import { getDefaultApp } from '@/core/file-associations'
import { useWindowStore } from '@/stores/window-store'
import { useAppRegistry } from '@/stores/app-registry'

function getFileIcon(entry: FSEntry): string {
  if (entry.type === 'directory') return '📁'
  const ext = entry.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'md': case 'txt': return '📄'
    case 'js': case 'ts': case 'tsx': return '📜'
    case 'json': return '📋'
    case 'png': case 'jpg': case 'gif': case 'svg': return '🖼️'
    case 'mp3': case 'wav': return '🎵'
    case 'mp4': case 'mov': return '🎬'
    case 'pdf': return '📕'
    case 'zip': case 'tar': return '📦'
    default: return '📄'
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function FilesApp({ windowId: _ }: { windowId: string }) {
  const [cwd, setCwd] = useState('/home')
  const [entries, setEntries] = useState<FSEntry[]>([])
  const [storage, setStorage] = useState<StorageInfo | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null)
  const [newName, setNewName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    const items = await filesystem.readdir(cwd)
    setEntries(items)
    const info = await filesystem.getStorageInfo()
    setStorage(info)
  }, [cwd])

  useEffect(() => {
    filesystem.init().then(refresh)
  }, [refresh])

  const navigate = (path: string) => {
    setCwd(path)
    setSelected(null)
    setRenaming(null)
    setCreating(null)
  }

  const goUp = () => {
    const parts = cwd.split('/').filter(Boolean)
    if (parts.length > 0) {
      parts.pop()
      navigate('/' + parts.join('/') || '/')
    }
  }

  const handleDoubleClick = async (entry: FSEntry) => {
    if (entry.type === 'directory') {
      navigate(entry.path)
    } else {
      const appId = getDefaultApp(entry.name)
      if (appId) {
        const app = useAppRegistry.getState().getApp(appId)
        if (app) {
          useWindowStore.getState().openWindow(appId, entry.name, app.defaultSize, { filePath: entry.path, fileName: entry.name })
        }
      }
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      await filesystem.uploadFile(file, cwd)
    }
    refresh()
    e.target.value = ''
  }

  const handleCreate = async () => {
    if (!newName.trim()) { setCreating(null); return }
    const path = cwd + '/' + newName.trim()
    if (creating === 'folder') {
      await filesystem.mkdir(path)
    } else {
      await filesystem.writeFile(path, '', 'text/plain')
    }
    setCreating(null)
    setNewName('')
    refresh()
  }

  const handleDelete = async () => {
    if (!selected) return
    await filesystem.remove(selected)
    setSelected(null)
    refresh()
  }

  const handleRename = async () => {
    if (!renaming || !renameValue.trim()) { setRenaming(null); return }
    const parts = renaming.split('/')
    parts.pop()
    const newPath = parts.join('/') + '/' + renameValue.trim()
    await filesystem.rename(renaming, newPath)
    setRenaming(null)
    setRenameValue('')
    refresh()
  }

  const breadcrumbs = cwd.split('/').filter(Boolean)

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--moon-border)] shrink-0">
        <button onClick={goUp} className="px-2 py-1 text-xs rounded bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-bg-tertiary)] text-[var(--moon-text-secondary)]" disabled={cwd === '/'}>← Up</button>
        <div className="flex-1 flex items-center gap-1 text-xs text-[var(--moon-text-secondary)] min-w-0 overflow-hidden">
          <button onClick={() => navigate('/')} className="hover:text-[var(--moon-accent)] shrink-0">/</button>
          {breadcrumbs.map((part, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              <span className="shrink-0">/</span>
              <button onClick={() => navigate('/' + breadcrumbs.slice(0, i + 1).join('/'))} className="hover:text-[var(--moon-accent)] truncate">{part}</button>
            </span>
          ))}
        </div>
        <button onClick={() => { setCreating('file'); setNewName('') }} className="px-2 py-1 text-xs rounded bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-bg-tertiary)] text-[var(--moon-text-secondary)]">+ File</button>
        <button onClick={() => { setCreating('folder'); setNewName('') }} className="px-2 py-1 text-xs rounded bg-[var(--moon-bg-elevated)] hover:bg-[var(--moon-bg-tertiary)] text-[var(--moon-text-secondary)]">+ Folder</button>
        <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 text-xs rounded bg-[var(--moon-accent)] text-white hover:opacity-90">Upload</button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      </div>

      {/* Create dialog inline */}
      {creating && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--moon-border)] bg-[var(--moon-bg-elevated)]">
          <span className="text-xs text-[var(--moon-text-secondary)]">New {creating}:</span>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(null) }}
            placeholder={creating === 'folder' ? 'folder-name' : 'filename.txt'}
            className="flex-1 px-2 py-1 text-xs bg-[var(--moon-bg-primary)] text-[var(--moon-text-primary)] rounded border border-[var(--moon-border)] outline-none focus:border-[var(--moon-accent)]"
            autoFocus
          />
          <button onClick={handleCreate} className="text-xs text-[var(--moon-accent)]">Create</button>
          <button onClick={() => setCreating(null)} className="text-xs text-[var(--moon-text-muted)]">Cancel</button>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-auto p-2">
        {entries.length === 0 && !creating && (
          <div className="text-xs text-[var(--moon-text-muted)] text-center py-8">This folder is empty</div>
        )}
        <div className="grid grid-cols-1 gap-0.5">
          {entries.map(entry => (
            <ContextMenu.Root key={entry.path}>
              <ContextMenu.Trigger asChild>
                <div
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-default select-none transition-colors ${selected === entry.path ? 'bg-[var(--moon-accent-muted)]' : 'hover:bg-[var(--moon-bg-elevated)]'}`}
                  onClick={() => setSelected(entry.path)}
                  onDoubleClick={() => handleDoubleClick(entry)}
                >
                  <span className="text-base">{getFileIcon(entry)}</span>
                  {renaming === entry.path ? (
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(null) }}
                      onBlur={handleRename}
                      className="flex-1 min-w-0 px-1 py-0.5 text-xs bg-[var(--moon-bg-primary)] text-[var(--moon-text-primary)] rounded border border-[var(--moon-accent)] outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 min-w-0 text-xs text-[var(--moon-text-primary)] truncate">{entry.name}</span>
                  )}
                  <span className="text-[11px] text-[var(--moon-text-muted)] w-16 text-right shrink-0">{entry.type === 'file' ? formatBytes(entry.size) : ''}</span>
                  <span className="text-[11px] text-[var(--moon-text-muted)] w-20 text-right shrink-0">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                </div>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-[160px] rounded-lg p-1 text-sm z-[9999]" style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(20px)', border: '1px solid var(--moon-border)' }}>
                  {entry.type === 'file' && getDefaultApp(entry.name) && (
                    <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs" onSelect={() => handleDoubleClick(entry)}>
                      Open
                    </ContextMenu.Item>
                  )}
                  {entry.type === 'directory' && (
                    <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs" onSelect={() => navigate(entry.path)}>
                      Open Folder
                    </ContextMenu.Item>
                  )}
                  <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-text-primary)] text-xs" onSelect={() => { setRenaming(entry.path); setRenameValue(entry.name) }}>
                    Rename
                  </ContextMenu.Item>
                  <ContextMenu.Separator className="h-px my-1 bg-[var(--moon-border)]" />
                  <ContextMenu.Item className="px-3 py-1.5 rounded-md cursor-default outline-none hover:bg-[var(--moon-accent-muted)] text-[var(--moon-danger)] text-xs" onSelect={async () => { await filesystem.remove(entry.path); refresh() }}>
                    Delete
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          ))}
        </div>
      </div>

      {/* Bottom bar: actions + storage */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--moon-border)] shrink-0">
        <div className="flex gap-2">
          {selected && (
            <>
              <button onClick={() => { setRenaming(selected); setRenameValue(entries.find(e => e.path === selected)?.name ?? '') }} className="text-xs text-[var(--moon-text-secondary)] hover:text-[var(--moon-accent)]">Rename</button>
              <button onClick={handleDelete} className="text-xs text-[var(--moon-text-secondary)] hover:text-[var(--moon-danger)]">Delete</button>
            </>
          )}
        </div>
        {storage && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-[var(--moon-bg-elevated)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--moon-accent)] transition-all" style={{ width: `${Math.min(100, storage.percentage)}%` }} />
            </div>
            <span className="text-[10px] text-[var(--moon-text-muted)]">{storage.usedFormatted} / {storage.quotaFormatted}</span>
          </div>
        )}
      </div>
    </div>
  )
}
