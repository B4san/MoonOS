import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
  duration?: number
}

interface NotificationStore {
  notifications: Notification[]
  push: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  dismiss: (id: string) => void
  markRead: (id: string) => void
  clearAll: () => void
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  push: (n) => set(s => ({
    notifications: [{ ...n, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: Date.now(), read: false }, ...s.notifications]
  })),
  dismiss: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  markRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
  clearAll: () => set({ notifications: [] }),
}))
