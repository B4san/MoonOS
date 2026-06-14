import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarApp({ windowId: _ }: { windowId: string }) {
  const [date, setDate] = useState(new Date())
  const today = new Date()

  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prev = () => setDate(new Date(year, month - 1, 1))
  const next = () => setDate(new Date(year, month + 1, 1))
  const goToday = () => setDate(new Date())

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="px-2 py-1 text-xs rounded hover:bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)]">←</button>
        <h2 className="text-sm font-semibold text-[var(--moon-text-primary)]">{MONTHS[month]} {year}</h2>
        <button onClick={next} className="px-2 py-1 text-xs rounded hover:bg-[var(--moon-bg-elevated)] text-[var(--moon-text-secondary)]">→</button>
      </div>
      <button onClick={goToday} className="text-xs text-[var(--moon-accent)] mb-3 hover:underline self-center">Today</button>
      <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
        {DAYS.map(d => <div key={d} className="text-center text-[11px] text-[var(--moon-text-secondary)] font-medium py-1.5">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          return (
            <div
              key={day}
              className={`text-center text-xs py-2 rounded-lg cursor-default transition-colors ${
                isToday(day) ? 'bg-[var(--moon-accent)] text-white font-semibold' : 'text-[var(--moon-text-primary)] hover:bg-[var(--moon-bg-elevated)]'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
