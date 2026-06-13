import { useState } from 'react'

export function TerminalApp({ windowId: _ }: { windowId: string }) {
  const [history, setHistory] = useState<string[]>(['MoonOS Terminal v0.1.0', '$ '])
  const [input, setInput] = useState('')

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setHistory(h => [...h.slice(0, -1), `$ ${input}`, `command not found: ${input}`, '$ '])
      setInput('')
    }
  }

  return (
    <div className="h-full p-3 font-mono text-xs text-[var(--moon-text-primary)] bg-[#0a0e1a] overflow-auto">
      {history.slice(0, -1).map((line, i) => <div key={i}>{line}</div>)}
      <div className="flex">
        <span>$ </span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent outline-none"
          autoFocus
        />
      </div>
    </div>
  )
}
