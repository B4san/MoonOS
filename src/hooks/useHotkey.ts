import { useEffect } from 'react'
import { registerHotkey } from '@/core/hotkeys'

export function useHotkey(
  key: string,
  handler: () => void,
  opts?: { ctrl?: boolean; meta?: boolean; shift?: boolean }
) {
  useEffect(() => {
    return registerHotkey({ key, handler, ...opts })
  }, [key, handler, opts?.ctrl, opts?.meta, opts?.shift])
}
