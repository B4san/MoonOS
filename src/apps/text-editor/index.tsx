import { useState, useRef, useCallback } from 'react'

export function TextEditorApp({ windowId }: { windowId: string }) {
  const [content, setContent] = useState('')
  const [filename, setFilename] = useState('untitled.txt')
  const [saved, setSaved] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  const lines = content.split('\n')

  const handleOpen = useCallback(() => fileRef.current?.click(), [])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    file.text().then(t => { setContent(t); setSaved(true) })
  }, [])

  const handleSave = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
    setSaved(true)
  }, [content, filename])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--moon-surface, #1a1a2e)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10">
        <button onClick={handleOpen} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">Open</button>
        <button onClick={handleSave} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">Save</button>
        <span className="text-xs text-white/50 ml-auto">{filename}{saved ? '' : ' •'}</span>
      </div>
      <div className="flex flex-1 overflow-auto">
        <div className="py-2 px-2 text-right select-none text-xs leading-5 text-white/30 font-mono border-r border-white/10">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          className="flex-1 p-2 bg-transparent text-white/90 font-mono text-sm leading-5 resize-none outline-none"
          value={content}
          onChange={e => { setContent(e.target.value); setSaved(false) }}
          spellCheck={false}
        />
      </div>
      <input ref={fileRef} type="file" accept=".txt,.md,.js,.ts,.json,.css,.html" className="hidden" onChange={handleFile} />
    </div>
  )
}

