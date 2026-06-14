import { useState } from 'react'

export function CalculatorApp({ windowId }: { windowId: string }) {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [waiting, setWaiting] = useState(false)

  const input = (d: string) => {
    if (waiting) { setDisplay(d); setWaiting(false) }
    else setDisplay(display === '0' ? d : display + d)
  }

  const decimal = () => {
    if (waiting) { setDisplay('0.'); setWaiting(false) }
    else if (!display.includes('.')) setDisplay(display + '.')
  }

  const operate = (next: string) => {
    const cur = parseFloat(display)
    if (prev !== null && op && !waiting) {
      const r = calc(prev, cur, op)
      setDisplay(String(r))
      setPrev(r)
    } else { setPrev(cur) }
    setOp(next)
    setWaiting(true)
  }

  const equals = () => {
    if (prev === null || !op) return
    const r = calc(prev, parseFloat(display), op)
    setDisplay(String(r))
    setPrev(null)
    setOp(null)
    setWaiting(true)
  }

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setWaiting(false) }
  const toggleSign = () => setDisplay(String(-parseFloat(display)))
  const percent = () => setDisplay(String(parseFloat(display) / 100))

  const calc = (a: number, b: number, o: string) => {
    if (o === '+') return a + b
    if (o === '-') return a - b
    if (o === '*') return a * b
    if (o === '/') return b !== 0 ? a / b : 0
    return b
  }

  const btn = (label: string, action: () => void, cls = '') => (
    <button onClick={action} className={`rounded-lg text-lg font-medium h-12 active:opacity-70 ${cls}`}
      style={{ background: 'var(--moon-surface-alt, rgba(255,255,255,0.1))', color: 'var(--moon-text, #fff)' }}>
      {label}
    </button>
  )

  return (
    <div className="flex flex-col h-full p-3 gap-2" style={{ background: 'var(--moon-surface, #1a1a2e)' }}>
      <div className="text-right text-3xl font-light px-2 py-3 text-white truncate">{display}</div>
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {btn('C', clear)}{btn('+/−', toggleSign)}{btn('%', percent)}{btn('÷', () => operate('/'))}
        {btn('7', () => input('7'))}{btn('8', () => input('8'))}{btn('9', () => input('9'))}{btn('×', () => operate('*'))}
        {btn('4', () => input('4'))}{btn('5', () => input('5'))}{btn('6', () => input('6'))}{btn('−', () => operate('-'))}
        {btn('1', () => input('1'))}{btn('2', () => input('2'))}{btn('3', () => input('3'))}{btn('+', () => operate('+'))}
        <button onClick={() => input('0')} className="col-span-2 rounded-lg text-lg font-medium h-12 active:opacity-70"
          style={{ background: 'var(--moon-surface-alt, rgba(255,255,255,0.1))', color: 'var(--moon-text, #fff)' }}>0</button>
        {btn('.', decimal)}{btn('=', equals)}
      </div>
    </div>
  )
}
