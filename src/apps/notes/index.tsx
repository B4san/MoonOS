import { useState } from 'react'

export function NotesApp({ windowId: _ }: { windowId: string }) {
  const [text, setText] = useState('')
  return (
    <div className="h-full p-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Start writing..."
        className="w-full h-full bg-transparent text-[var(--moon-text-primary)] placeholder:text-[var(--moon-text-muted)] outline-none resize-none text-sm"
      />
    </div>
  )
}
