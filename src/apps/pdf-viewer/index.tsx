import { useState, useRef } from 'react'

export function PdfViewerApp({ windowId }: { windowId: string }) {
  const [url, setUrl] = useState('')
  const [zoom, setZoom] = useState(100)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (url) URL.revokeObjectURL(url)
    setUrl(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--moon-surface, #1a1a2e)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10">
        <button onClick={() => fileRef.current?.click()} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">Open PDF</button>
        <button onClick={() => setZoom(z => Math.min(200, z + 20))} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">+</button>
        <span className="text-xs text-white/50">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.max(40, z - 20))} className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 text-white/80">−</button>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center">
        {url ? (
          <iframe src={url} className="border-0" style={{ width: `${zoom}%`, height: '100%' }} title="PDF" />
        ) : (
          <div className="text-white/40 text-center">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm">Open a PDF file</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
    </div>
  )
}
