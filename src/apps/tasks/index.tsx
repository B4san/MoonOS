import { useState, useEffect } from 'react'
import { persistence } from '@/core/persistence'

interface Task {
  id: string
  text: string
  status: 'todo' | 'in-progress' | 'done'
  createdAt: number
}

export function TasksApp({ windowId: _ }: { windowId: string }) {
  const [tasks, setTasks] = useState<Task[]>(() => persistence.get('tasks', []))
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all')

  useEffect(() => { persistence.set('tasks', tasks) }, [tasks])

  const addTask = () => {
    if (!input.trim()) return
    setTasks(prev => [{ id: `task-${Date.now()}`, text: input.trim(), status: 'todo', createdAt: Date.now() }, ...prev])
    setInput('')
  }

  const cycleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const next = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' } as const
      return { ...t, status: next[t.status] }
    }))
  }

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id))

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const statusIcon = { 'todo': '○', 'in-progress': '◐', 'done': '●' }
  const statusColor = { 'todo': 'var(--moon-text-muted)', 'in-progress': 'var(--moon-warning)', 'done': 'var(--moon-success)' }

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 text-xs rounded-lg bg-[var(--moon-bg-elevated)] text-[var(--moon-text-primary)] placeholder:text-[var(--moon-text-muted)] outline-none border border-[var(--moon-border)] focus:border-[var(--moon-accent)]"
        />
        <button onClick={addTask} className="px-3 py-2 text-xs rounded-lg bg-[var(--moon-accent)] text-white hover:opacity-90">Add</button>
      </div>
      <div className="flex gap-2">
        {(['all', 'todo', 'in-progress', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 text-[11px] rounded capitalize ${filter === f ? 'bg-[var(--moon-accent-muted)] text-[var(--moon-accent)]' : 'text-[var(--moon-text-secondary)] hover:bg-[var(--moon-bg-elevated)]'}`}>{f}</button>
        ))}
      </div>
      <div className="flex-1 overflow-auto space-y-1">
        {filtered.length === 0 && <p className="text-xs text-[var(--moon-text-muted)] text-center py-4">No tasks</p>}
        {filtered.map(task => (
          <div key={task.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--moon-bg-elevated)] group">
            <button onClick={() => cycleStatus(task.id)} className="text-sm shrink-0" style={{ color: statusColor[task.status] }}>{statusIcon[task.status]}</button>
            <span className={`flex-1 text-xs ${task.status === 'done' ? 'line-through text-[var(--moon-text-muted)]' : 'text-[var(--moon-text-primary)]'}`}>{task.text}</span>
            <button onClick={() => deleteTask(task.id)} className="text-xs text-[var(--moon-text-muted)] hover:text-[var(--moon-danger)] opacity-0 group-hover:opacity-100">×</button>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-[var(--moon-text-muted)] text-center pt-2 border-t border-[var(--moon-border)]">
        {tasks.filter(t => t.status === 'done').length}/{tasks.length} completed
      </div>
    </div>
  )
}
