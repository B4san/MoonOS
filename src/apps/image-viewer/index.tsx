import { useState, useRef, useEffect } from 'react'
import { useWindowStore } from '@/stores/window-store'
import { filesystem } from '@/core/filesystem'

export function ImageViewerApp({ windowId }: { windowId: string }) {
  const [url, setUrl] = useState('')
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const win = useWindowStore.getState().windows.find(w => w.id === windowId)
    if (win?.meta?.filePath) {
      const path = win.meta.filePath as string
      filesystem.readFile(path).then(data => {
        if (data) {
          const blob = data instanceof Uint8Array ? new Blob([data as BlobPart]) : new Blob([data])
          setUrl(URL.createObjectURL(blob))
        }
      })
    }
  }, [windowId])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (url) URL.revokeObjectURL(url)
    setUrl(URL.createObjectURL(file))
    setScale(1)
    setRotation(0)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--moon-surface, #1a1a2e)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10">
        <button onClick={() => fileRef.current?.click()} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">Open</button>
        <button onClick={() => setScale(s => Math.min(5, s + 0.25))} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">+</button>
        <button onClick={() => setScale(s => Math.max(0.25, s - 0.25))} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">−</button>
        <button onClick={() => setRotation(r => r + 90)} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">↻</button>
        <span className="text-xs text-white/50 ml-auto">{Math.round(scale * 100)}%</span>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center">
        {url ? (
          <img
            src={url}
            alt="Preview"
            className="max-w-full max-h-full object-contain transition-transform"
            style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          />
        ) : (
          <div className="text-white/40 text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm">Open an image</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
