import { useState, useCallback } from 'react'

type BtnType = 'num' | 'func' | 'op' | 'eq'

function CalcBtn({ label, onClick, type = 'num', wide, active }: { label: string; onClick: () => void; type?: BtnType; wide?: boolean; active?: boolean }) {
  const bg = type === 'num' ? 'rgba(255,255,255,0.08)'
    : type === 'func' ? 'rgba(255,255,255,0.15)'
    : type === 'op' ? (active ? '#fff' : 'rgba(251,146,60,0.9)')
    : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  const color = type === 'op' ? (active ? '#f97316' : '#fff') : type === 'func' ? '#a8b4c4' : '#fff'

  return (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={onClick}
      className={`flex items-center justify-center text-xl font-semibold h-14 active:scale-95 transition-transform ${wide ? 'col-span-2' : ''}`}
      style={{ borderRadius: '14px', background: bg, color, border: 'none', cursor: 'pointer' }}
    >
      {label}
    </button>
  )
}

export function CalculatorApp({ windowId }: { windowId: string }) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [waiting, setWaiting] = useState(false)

  const opSymbols: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }

  const input = useCallback((d: string) => {
    setDisplay(prev => {
      if (waiting) { setWaiting(false); return d }
      return prev === '0' ? d : prev + d
    })
  }, [waiting])

  const decimal = useCallback(() => {
    if (waiting) { setDisplay('0.'); setWaiting(false) }
    else setDisplay(d => d.includes('.') ? d : d + '.')
  }, [waiting])

  const calc = (a: number, b: number, o: string) => {
    if (o === '+') return a + b
    if (o === '-') return a - b
    if (o === '*') return a * b
    if (o === '/') return b !== 0 ? a / b : 0
    return b
  }

  const operate = useCallback((next: string) => {
    const cur = parseFloat(display)
    if (prev !== null && op && !waiting) {
      const r = calc(prev, cur, op)
      setExpression(`${r} ${opSymbols[next]}`)
      setDisplay(String(r))
      setPrev(r)
    } else {
      setExpression(`${cur} ${opSymbols[next]}`)
      setPrev(cur)
    }
    setOp(next)
    setWaiting(true)
  }, [display, prev, op, waiting])

  const equals = useCallback(() => {
    if (prev === null || !op) return
    const cur = parseFloat(display)
    const r = calc(prev, cur, op)
    setExpression(`${prev} ${opSymbols[op]} ${cur} =`)
    setDisplay(String(r))
    setPrev(null)
    setOp(null)
    setWaiting(true)
  }, [display, prev, op])

  const clear = useCallback(() => { setDisplay('0'); setExpression(''); setPrev(null); setOp(null); setWaiting(false) }, [])
  const toggleSign = useCallback(() => setDisplay(d => String(-parseFloat(d))), [])
  const percent = useCallback(() => setDisplay(d => String(parseFloat(d) / 100)), [])

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
      <div className="flex-none px-5 pt-4 pb-2">
        <div className="text-right h-6 text-sm font-medium tracking-wide" style={{ color: 'rgba(167,139,250,0.8)' }}>
          {expression || '\u00A0'}
        </div>
        <div
          className="text-right font-extralight tracking-tight truncate mt-1"
          style={{
            fontSize: display.length > 9 ? '2rem' : display.length > 6 ? '2.5rem' : '3rem',
            color: '#fff',
            textShadow: '0 0 20px rgba(99,102,241,0.3)',
          }}
        >
          {display}
        </div>
      </div>

      <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />

      <div className="grid grid-cols-4 gap-2.5 p-4 flex-1">
        <CalcBtn label="C" onClick={clear} type="func" />
        <CalcBtn label="+/−" onClick={toggleSign} type="func" />
        <CalcBtn label="%" onClick={percent} type="func" />
        <CalcBtn label="÷" onClick={() => operate('/')} type="op" active={op === '/' && waiting} />

        <CalcBtn label="7" onClick={() => input('7')} />
        <CalcBtn label="8" onClick={() => input('8')} />
        <CalcBtn label="9" onClick={() => input('9')} />
        <CalcBtn label="×" onClick={() => operate('*')} type="op" active={op === '*' && waiting} />

        <CalcBtn label="4" onClick={() => input('4')} />
        <CalcBtn label="5" onClick={() => input('5')} />
        <CalcBtn label="6" onClick={() => input('6')} />
        <CalcBtn label="−" onClick={() => operate('-')} type="op" active={op === '-' && waiting} />

        <CalcBtn label="1" onClick={() => input('1')} />
        <CalcBtn label="2" onClick={() => input('2')} />
        <CalcBtn label="3" onClick={() => input('3')} />
        <CalcBtn label="+" onClick={() => operate('+')} type="op" active={op === '+' && waiting} />

        <CalcBtn label="0" onClick={() => input('0')} wide />
        <CalcBtn label="." onClick={decimal} />
        <CalcBtn label="=" onClick={equals} type="eq" />
      </div>
    </div>
  )
}
