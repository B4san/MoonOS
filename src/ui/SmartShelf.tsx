import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { filesystem, FSEntry } from '@/core/filesystem'
import { getDefaultApp } from '@/core/file-associations'
import { useWindowStore } from '@/stores/window-store'
import { useAppRegistry } from '@/stores/app-registry'
import { useClipboardStore } from '@/stores/clipboard-store'
import { audioEngine } from '@/core/audio-engine'

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'md': case 'txt': return '📄'
    case 'js': case 'ts': case 'tsx': return '📜'
    case 'json': return '📋'
    case 'png': case 'jpg': case 'gif': case 'svg': return '🖼️'
    case 'pdf': return '📕'
    default: return '📄'
  }
}

export function SmartShelf() {
  const [isOpen, setIsOpen] = useState(false)
  const [recentFiles, setRecentFiles] = useState<FSEntry[]>([])
  const { items: clipboardItems, recentCommands, addItem } = useClipboardStore()
  const { openWindow } = useWindowStore()
  const { getApp } = useAppRegistry()
  const shelfRef = useRef<HTMLDivElement>(null)

  // Fetch recent files when the shelf opens
  useEffect(() => {
    if (isOpen) {
      filesystem.getRecentFiles(5).then(files => {
        setRecentFiles(files)
      }).catch(err => {
        console.error('Failed to get recent files', err)
      })
    }
  }, [isOpen])

  // Mouse move listener to detect right-edge proximity (within 5px) or closing (moving far away)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const screenWidth = window.innerWidth
      const rightDistance = screenWidth - e.clientX

      if (rightDistance <= 5) {
        setIsOpen(true)
      }

      if (isOpen && rightDistance > 300) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isOpen])

  const handleFileClick = (file: FSEntry) => {
    audioEngine.playUIEvent('click')
    const appId = getDefaultApp(file.name)
    if (appId) {
      const app = getApp(appId)
      if (app) {
        openWindow(appId, file.name, app.defaultSize, { filePath: file.path, fileName: file.name })
      }
    }
    setIsOpen(false)
  }

  const handleClipClick = (content: string) => {
    audioEngine.playUIEvent('click')
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(content).then(() => {
        addItem(content)
      }).catch(err => console.error('Failed to copy', err))
    } else {
      addItem(content)
    }
  }

  return (
    <>
      {/* Invisible hover trigger strip on right edge */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-1.5 z-[9998] bg-transparent"
        onMouseEnter={() => setIsOpen(true)}
      />

      {/* Slide-out Smart Shelf */}
      <motion.div
        ref={shelfRef}
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="fixed right-0 top-0 bottom-0 w-64 z-[9999] bg-slate-950/85 border-l border-white/10 backdrop-blur-md shadow-2xl flex flex-col p-4 text-white overflow-y-auto"
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/15">
          <span className="text-sm font-semibold tracking-wider text-[var(--moon-accent,cyan)] uppercase">Smart Shelf</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 ml-auto uppercase font-bold tracking-widest">v0.1</span>
        </div>

        {/* Section: Recent Files */}
        <div className="mb-6">
          <h3 className="text-[10px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Recent Files
          </h3>
          {recentFiles.length === 0 ? (
            <p className="text-[11px] text-white/40 italic pl-1">No modified files</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {recentFiles.map(file => (
                <button
                  key={file.path}
                  onClick={() => handleFileClick(file)}
                  className="w-full text-left p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <span className="text-sm shrink-0">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate font-medium text-white/90 group-hover:text-white transition-colors">{file.name}</p>
                    <p className="text-[9px] truncate text-white/40">{file.path}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section: Clipboard History (Last 3) */}
        <div className="mb-6">
          <h3 className="text-[10px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Recent Clips
          </h3>
          {clipboardItems.length === 0 ? (
            <p className="text-[11px] text-white/40 italic pl-1">Clipboard empty</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {clipboardItems.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleClipClick(item.content)}
                  className="w-full text-left p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2 cursor-pointer group"
                  title="Click to copy back to system clipboard"
                >
                  {item.type === 'color' && (
                    <div 
                      className="w-4 h-4 rounded border border-white/20 shrink-0" 
                      style={{ backgroundColor: item.content }}
                    />
                  )}
                  <span className="text-xs truncate font-sans text-white/80 group-hover:text-white flex-1">
                    {item.content}
                  </span>
                  <span className="text-[9px] text-white/30 capitalize">{item.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section: Recent Terminal Commands (Last 3) */}
        <div>
          <h3 className="text-[10px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Recent Commands
          </h3>
          {recentCommands.length === 0 ? (
            <p className="text-[11px] text-white/40 italic pl-1">No command history</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {recentCommands.slice(0, 3).map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleClipClick(cmd)}
                  className="w-full text-left p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2 cursor-pointer group"
                  title="Click to copy command"
                >
                  <span className="text-xs font-mono text-cyan-200 group-hover:text-cyan-100 truncate flex-1">
                    {cmd}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
