import { useState, useRef, useEffect, useCallback } from 'react'
import { filesystem } from '@/core/filesystem'

export function TerminalApp({ windowId: _wid }: { windowId: string }) {
  const [lines, setLines] = useState<string[]>(['MoonOS Terminal v0.3.0', 'Type "help" for available commands.', ''])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('/home')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'instant' }) }, [lines])
  useEffect(() => { filesystem.init() }, [])

  const prompt = `${cwd}$ `

  const exec = useCallback(async (cmd: string): Promise<string[]> => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case '': return []
      case 'help': return [
        'Commands:',
        '  ls [dir]       - list directory contents',
        '  cd <dir>       - change directory',
        '  pwd            - print working directory',
        '  cat <file>     - display file contents',
        '  touch <file>   - create empty file',
        '  mkdir <dir>    - create directory',
        '  rm <path>      - remove file or directory',
        '  mv <src> <dst> - rename/move',
        '  echo <text>    - print text',
        '  write <f> <t>  - write text to file',
        '  stat <path>    - show file info',
        '  du             - disk usage',
        '  clear          - clear screen',
        '  date           - current date/time',
        '  whoami         - current user',
        '  neofetch       - system info',
      ]
      case 'ls': {
        const target = args[0] ? resolvePath(args[0]) : cwd
        const entries = await filesystem.readdir(target)
        if (entries.length === 0) return ['(empty)']
        return entries.map(e => {
          const icon = e.type === 'directory' ? '📁' : '📄'
          const size = e.type === 'file' ? ` (${formatSize(e.size)})` : ''
          return `  ${icon} ${e.name}${size}`
        })
      }
      case 'cd': {
        if (!args[0] || args[0] === '~') { setCwd('/home'); return [] }
        const target = resolvePath(args[0])
        const exists = await filesystem.exists(target)
        const stat = await filesystem.stat(target)
        if (!exists || stat?.type !== 'directory') return [`cd: ${args[0]}: No such directory`]
        setCwd(target)
        return []
      }
      case 'pwd': return [cwd]
      case 'cat': {
        if (!args[0]) return ['cat: missing file']
        const target = resolvePath(args[0])
        const content = await filesystem.readFile(target)
        if (content === null) return [`cat: ${args[0]}: No such file`]
        if (content instanceof Uint8Array) return [`(binary file, ${content.byteLength} bytes)`]
        return content.split('\n')
      }
      case 'touch': {
        if (!args[0]) return ['touch: missing file name']
        await filesystem.writeFile(resolvePath(args[0]), '', 'text/plain')
        return []
      }
      case 'mkdir': {
        if (!args[0]) return ['mkdir: missing directory name']
        await filesystem.mkdir(resolvePath(args[0]))
        return []
      }
      case 'rm': {
        if (!args[0]) return ['rm: missing path']
        const target = resolvePath(args[0])
        if (!await filesystem.exists(target)) return [`rm: ${args[0]}: not found`]
        await filesystem.remove(target)
        return [`removed: ${args[0]}`]
      }
      case 'mv': {
        if (!args[0] || !args[1]) return ['mv: usage: mv <source> <dest>']
        await filesystem.rename(resolvePath(args[0]), resolvePath(args[1]))
        return []
      }
      case 'write': {
        if (!args[0]) return ['write: usage: write <file> <content>']
        const file = args[0]
        const content = args.slice(1).join(' ')
        await filesystem.writeFile(resolvePath(file), content, 'text/plain')
        return [`wrote ${content.length} chars to ${file}`]
      }
      case 'echo': return [args.join(' ')]
      case 'stat': {
        if (!args[0]) return ['stat: missing path']
        const s = await filesystem.stat(resolvePath(args[0]))
        if (!s) return [`stat: ${args[0]}: not found`]
        return [
          `  Path: ${s.path}`,
          `  Type: ${s.type}`,
          `  Size: ${formatSize(s.size)}`,
          `  Created: ${new Date(s.createdAt).toLocaleString()}`,
          `  Modified: ${new Date(s.updatedAt).toLocaleString()}`,
        ]
      }
      case 'du': {
        const info = await filesystem.getStorageInfo()
        const fsSize = await filesystem.getTotalSize()
        return [
          `  Files: ${formatSize(fsSize)}`,
          `  IndexedDB used: ${info.usedFormatted}`,
          `  Quota: ${info.quotaFormatted}`,
          `  Usage: ${info.percentage}%`,
        ]
      }
      case 'clear': { setLines([]); return [] }
      case 'date': return [new Date().toString()]
      case 'whoami': return ['moonos-user']
      case 'neofetch': {
        const info = await filesystem.getStorageInfo()
        return [
          '  🌙 MoonOS v0.3.0',
          `  CPU: ${navigator.hardwareConcurrency} cores`,
          `  RAM: ${(navigator as unknown as { deviceMemory?: number }).deviceMemory ?? '?'}GB`,
          `  Storage: ${info.usedFormatted} / ${info.quotaFormatted}`,
          `  Platform: ${navigator.platform}`,
          `  Resolution: ${window.innerWidth}×${window.innerHeight}`,
        ]
      }
      default: return [`${command}: command not found. Type "help" for commands.`]
    }
  }, [cwd])

  function resolvePath(p: string): string {
    if (p.startsWith('/')) return p
    if (p === '~') return '/home'
    if (p.startsWith('~/')) return '/home' + p.slice(1)
    // Relative path
    const base = cwd === '/' ? '' : cwd
    const parts = (base + '/' + p).split('/').filter(Boolean)
    const resolved: string[] = []
    for (const part of parts) {
      if (part === '..') resolved.pop()
      else if (part !== '.') resolved.push(part)
    }
    return '/' + resolved.join('/')
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const handleKey = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const output = await exec(input)
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
      } else { setHistIdx(-1); setInput('') }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Basic tab completion
      if (input.trim()) {
        const parts = input.split(/\s+/)
        const last = parts[parts.length - 1]
        const dir = last.includes('/') ? resolvePath(last.substring(0, last.lastIndexOf('/'))) : cwd
        const prefix = last.includes('/') ? last.substring(last.lastIndexOf('/') + 1) : last
        const entries = await filesystem.readdir(dir)
        const matches = entries.filter(e => e.name.startsWith(prefix))
        if (matches.length === 1) {
          parts[parts.length - 1] = (last.includes('/') ? last.substring(0, last.lastIndexOf('/') + 1) : '') + matches[0].name + (matches[0].type === 'directory' ? '/' : '')
          setInput(parts.join(' '))
        }
      }
    }
  }

  return (
    <div
      className="h-full px-4 py-3 font-mono text-xs overflow-auto cursor-text leading-relaxed"
      style={{ background: '#0a0e1a', color: '#c8d8f0' }}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => <div key={i} className="whitespace-pre-wrap leading-5">{line}</div>)}
      <div className="flex leading-5">
        <span className="text-[var(--moon-accent)] shrink-0">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent outline-none caret-[var(--moon-accent)]"
          autoFocus
          spellCheck={false}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
