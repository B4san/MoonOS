import { create } from 'zustand'
import type { AppDefinition } from '@/types'

interface AppRegistryStore {
  apps: AppDefinition[]
  register: (app: AppDefinition) => void
  getApp: (id: string) => AppDefinition | undefined
}

export const useAppRegistry = create<AppRegistryStore>((set, get) => ({
  apps: [],
  register: (app) => set(s => ({ apps: [...s.apps, app] })),
  getApp: (id) => get().apps.find(a => a.id === id),
}))
