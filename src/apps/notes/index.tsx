import { useState, useEffect, useMemo } from 'react'
import { persistence } from '@/core/persistence'

function parseMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-[var(--moon-bg-elevated)] text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-[var(--moon-accent)] pl-3 italic text-[var(--moon-text-secondary)]">$1</blockquote>')
    .replace(/\n/g, '<br/>')
}

interface Note {
  id: string
  title: string
  content: string
  updatedAt: number
}

export function NotesApp({ windowId: _ }: { windowId: string }) {
  const [notes, setNotes] = useState<Note[]>(() => persistence.get('notes', []))
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null)
  const [showPreview, setShowPreview] = useState(false)

  const activeNote = notes.find(n => n.id === activeId)

  useEffect(() => { persistence.set('notes', notes) }, [notes])

  const createNote = () => {
    const note: Note = { id: `note-${Date.now()}`, title: 'Untitled', content: '', updatedAt: Date.now() }
    setNotes(prev => [note, ...prev])
    setActiveId(note.id)
  }

  const updateNote = (content: string) => {
    setNotes(prev => prev.map(n =>
      n.id === activeId
        ? { ...n, content, title: content.split('\n')[0]?.replace(/^#+\s*/, '').slice(0, 30) || 'Untitled', updatedAt: Date.now() }
        : n
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id ?? null)
  }

  const html = useMemo(() => activeNote ? parseMarkdown(activeNote.content) : '', [activeNote])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 border-r border-[var(--moon-border)] flex flex-col shrink-0">
        <div className="p-2 border-b border-[var(--moon-border)]">
          <button onClick={createNote} className="w-full px-2 py-1 text-xs rounded bg-[var(--moon-accent)] text-white hover:opacity-90">+ New Note</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map(n => (
            <div
              key={n.id}
              className={`px-3 py-2 cursor-pointer text-xs border-b border-[var(--moon-border)] group ${n.id === activeId ? 'bg-[var(--moon-accent-muted)]' : 'hover:bg-[var(--moon-bg-elevated)]'}`}
              onClick={() => setActiveId(n.id)}
            >
              <div className="flex justify-between items-center min-w-0 gap-2">
                <span className="text-[var(--moon-text-primary)] truncate min-w-0">{n.title}</span>
                <button onClick={e => { e.stopPropagation(); deleteNote(n.id) }} className="text-[var(--moon-text-muted)] hover:text-[var(--moon-danger)] opacity-0 group-hover:opacity-100 shrink-0 text-base leading-none">×</button>
              </div>
              <span className="text-[var(--moon-text-muted)] text-[11px]">{new Date(n.updatedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            <div className="flex items-center px-3 py-1 border-b border-[var(--moon-border)] gap-2">
              <button onClick={() => setShowPreview(false)} className={`text-xs px-2 py-0.5 rounded ${!showPreview ? 'bg-[var(--moon-accent-muted)] text-[var(--moon-accent)]' : 'text-[var(--moon-text-muted)]'}`}>Edit</button>
              <button onClick={() => setShowPreview(true)} className={`text-xs px-2 py-0.5 rounded ${showPreview ? 'bg-[var(--moon-accent-muted)] text-[var(--moon-accent)]' : 'text-[var(--moon-text-muted)]'}`}>Preview</button>
            </div>
            {showPreview ? (
              <div className="flex-1 p-4 overflow-auto text-sm text-[var(--moon-text-primary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <textarea
                value={activeNote.content}
                onChange={e => updateNote(e.target.value)}
                placeholder="Start writing in markdown..."
                className="flex-1 p-4 bg-transparent text-[var(--moon-text-primary)] placeholder:text-[var(--moon-text-muted)] outline-none resize-none text-sm font-mono leading-relaxed"
                spellCheck={false}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[var(--moon-text-muted)]">
            No note selected. Create one to start.
          </div>
        )}
      </div>
    </div>
  )
}
