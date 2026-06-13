type HotkeyHandler = (e: KeyboardEvent) => void

interface RegisteredHotkey {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: HotkeyHandler
}

const hotkeys: RegisteredHotkey[] = []
let listening = false

function handleKeyDown(e: KeyboardEvent) {
  for (const hk of hotkeys) {
    const ctrlOrMeta = e.ctrlKey || e.metaKey
    const needsCtrl = hk.ctrl || hk.meta
    if (
      e.key.toLowerCase() === hk.key.toLowerCase() &&
      (needsCtrl ? ctrlOrMeta : true) &&
      (hk.shift ? e.shiftKey : true)
    ) {
      e.preventDefault()
      e.stopPropagation()
      hk.handler(e)
      return
    }
  }
}

export function registerHotkey(hotkey: RegisteredHotkey) {
  hotkeys.push(hotkey)
  if (!listening) {
    window.addEventListener('keydown', handleKeyDown, true)
    listening = true
  }
  return () => {
    const idx = hotkeys.indexOf(hotkey)
    if (idx >= 0) hotkeys.splice(idx, 1)
  }
}
