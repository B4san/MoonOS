import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNotifications, type Notification } from '@/core/notifications'
import { useSettingsStore } from '@/stores/settings-store'

export function NotificationToasts() {
  const notifications = useNotifications(s => s.notifications)
  const dismiss = useNotifications(s => s.dismiss)
  const focusMode = useSettingsStore(s => s.focusMode)
  const visible = notifications.filter(n => !n.read).slice(0, 3)

  if (focusMode) return null

  return (
    <div className="fixed top-10 right-4 z-[9995] flex flex-col gap-2 w-72">
      <AnimatePresence>
        {visible.map(n => (
          <Toast key={n.id} notification={n} onDismiss={() => dismiss(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ notification: n, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  useEffect(() => {
    const dur = n.duration ?? 4000
    if (dur > 0) { const t = setTimeout(onDismiss, dur); return () => clearTimeout(t) }
  }, [n.duration, onDismiss])

  const colors = { info: 'var(--moon-accent)', success: 'var(--moon-success)', warning: 'var(--moon-warning)', error: 'var(--moon-danger)' }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl p-3 cursor-pointer"
      style={{ background: 'var(--moon-bg-surface)', backdropFilter: 'blur(var(--moon-blur))', border: '1px solid var(--moon-border)', boxShadow: 'var(--moon-shadow)' }}
      onClick={onDismiss}
    >
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: colors[n.type] }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--moon-text-primary)] truncate">{n.title}</p>
          <p className="text-[11px] text-[var(--moon-text-secondary)] line-clamp-2">{n.message}</p>
        </div>
      </div>
    </motion.div>
  )
}
