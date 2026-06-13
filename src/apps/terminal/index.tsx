import { useState, useRef, useEffect } from 'react'
import { persistence } from '@/core/persistence'

interface FSNode {
  [key: string]: FSNode | string // string = file content, object = directory
}

const defaultFS: FSNode = {
  home: {
    documents: { 'readme.md': '# Welcome to MoonOS\nYour files live here.', 'notes.txt': 'Hello world!' },
    downloads: {},
    desktop: {},
  },
  etc: { 'moonos.conf': 'theme=dark\ntier=auto' },
  tmp: {},
}

function resolvePath(fs: FSNode, path: string[]): FSNode | string | null {
  let node: FSNode | string = fs
  for (const segment of path) {
    if (typeof node === 'string') return null
    if (!(segment in node)) return null
    node = node[segment]
  }
  return node
}

export function TerminalApp({ windowId: _wid }: { windowId: string }) {
  const [lines, setLines] = useState<string[]>(['MoonOS Terminal v0.2.0', 'Type "help" for available commands.', ''])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState<string[]>(['home'])
  const [fs, setFs] = useState<FSNode>(() => persistence.get('terminal-fs', defaultFS))
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView() }, [lines])
  useEffect(() => { persistence.set('terminal-fs', fs) }, [fs])

  const prompt = `/${cwd.join('/')}$ `

  const exec = (cmd: string) => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case '': return []
      case 'help': return [
        'Available commands:',
        '  ls          - list directory',
        '  cd <dir>    - change directory',
        '  pwd         - print working directory',
        '  cat <file>  - show file content',
        '  touch <f>   - create empty file',
        '  mkdir <dir> - create directory',
        '  rm <name>   - remove file/dir',
        '  echo <text> - print text',
        '  clear       - clear terminal',
        '  date        - current date',
        '  whoami      - current user',
        '  neofetch    - system info',
      ]
      case 'ls': {
        const node = resolvePath(fs, cwd)
        if (!node || typeof node === 'string') return ['Not a directory']
        const entries = Object.keys(node).map(k => typeof node[k] === 'string' ? k : `${k}/`)
        return entries.length ? [entries.join('  ')] : ['(empty)']
      }
      case 'cd': {
        if (!args[0] || args[0] === '~') { setCwd(['home']); return [] }
        if (args[0] === '..') { if (cwd.length > 1) setCwd(cwd.slice(0, -1)); return [] }
        const target = [...cwd, args[0]]
        const node = resolvePath(fs, target)
        if (!node || typeof node === 'string') return [`cd: ${args[0]}: No such directory`]
        setCwd(target)
        return []
      }
      case 'pwd': return [`/${cwd.join('/')}`]
      case 'cat': {
        if (!args[0]) return ['cat: missing file name']
        const node = resolvePath(fs, [...cwd, args[0]])
        if (node === null) return [`cat: ${args[0]}: No such file`]
        if (typeof node !== 'string') return [`cat: ${args[0]}: Is a directory`]
        return node.split('\n')
      }
      case 'touch': {
        if (!args[0]) return ['touch: missing file name']
        setFs(prev => {
          const next = JSON.parse(JSON.stringify(prev))
          const dir = resolvePath(next, cwd) as FSNode
          if (dir && typeof dir !== 'string') dir[args[0]] = ''
          return next
        })
        return []
      }
      case 'mkdir': {
        if (!args[0]) return ['mkdir: missing directory name']
        setFs(prev => {
          const next = JSON.parse(JSON.stringify(prev))
          const dir = resolvePath(next, cwd) as FSNode
          if (dir && typeof dir !== 'string') dir[args[0]] = {}
          return next
        })
        return []
      }
      case 'rm': {
        if (!args[0]) return ['rm: missing name']
        setFs(prev => {
          const next = JSON.parse(JSON.stringify(prev))
          const dir = resolvePath(next, cwd) as FSNode
          if (dir && typeof dir !== 'string') delete dir[args[0]]
          return next
        })
        return []
      }
      case 'echo': return [args.join(' ')]
      case 'clear': { setLines([]); return [] }
      case 'date': return [new Date().toString()]
      case 'whoami': return ['moonos-user']
      case 'neofetch': return [
        '  🌙 MoonOS v0.2.0',
        `  CPU: ${navigator.hardwareConcurrency} cores`,
        `  RAM: ${(navigator as unknown as { deviceMemory?: number }).deviceMemory ?? '?'}GB`,
        `  Platform: ${navigator.platform}`,
        `  Language: ${navigator.language}`,
        `  Resolution: ${window.innerWidth}×${window.innerHeight}`,
      ]
      default: return [`${command}: command not found`]
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const output = exec(input)
      if (input !== 'clear') {
        setLines(prev => [...prev, prompt + input, ...output, ''])
      }
      if (input.trim()) setHistory(prev => [input, ...prev])
      setInput('')
      setHistIdx(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (histIdx < history.length - 1) {
        const next = histIdx + 1
        setHistIdx(next)
        setInput(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx > 0) {
        const next = histIdx - 1
        setHistIdx(next)
        setInput(history[next])
      } else {
        setHistIdx(-1)
        setInput('')
      }
    }
  }

  return (
    <div
      className="h-full p-3 font-mono text-xs overflow-auto cursor-text"
      style={{ background: '#0a0e1a', color: '#c8d8f0' }}
      onClick={() => (document.querySelector('.term-input') as HTMLInputElement)?.focus()}
    >
      {lines.map((line, i) => <div key={i} className="whitespace-pre-wrap leading-5">{line}</div>)}
      <div className="flex leading-5">
        <span className="text-[var(--moon-accent)] shrink-0">{prompt}</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent outline-none caret-[var(--moon-accent)] term-input"
          autoFocus
          spellCheck={false}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
