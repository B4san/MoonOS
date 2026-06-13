import { useState, useEffect } from 'react'
import { useHardwareTier } from '@/hooks/useHardwareTier'
import { useSettingsStore } from '@/stores/settings-store'
import { useAppRegistry } from '@/stores/app-registry'
import { applyTheme, applyAccent } from '@/core/theme-engine'
import { useNotifications } from '@/core/notifications'
import { Desktop } from '@/ui/Desktop'
import { Dock } from '@/ui/Dock'
import { TopPanel } from '@/ui/TopPanel'
import { Launcher } from '@/ui/Launcher'
import { CommandPalette } from '@/ui/CommandPalette'
import { WorkspaceSwitcher } from '@/ui/WorkspaceSwitcher'
import { Onboarding } from '@/ui/Onboarding'
import { NotificationToasts } from '@/ui/NotificationCenter'
import { DesktopWidgets } from '@/ui/DesktopWidgets'
import { NotesApp } from '@/apps/notes'
import { SettingsApp } from '@/apps/settings'
import { TerminalApp } from '@/apps/terminal'
import { TaskManagerApp } from '@/apps/taskmanager'
import { FilesApp } from '@/apps/files'
import { CalendarApp } from '@/apps/calendar'
import { TasksApp } from '@/apps/tasks'

function registerApps() {
  const { apps, register } = useAppRegistry.getState()
  if (apps.length > 0) return
  register({ id: 'terminal', name: 'Terminal', icon: '⬛', keywords: ['shell', 'console', 'cmd', 'bash'], defaultSize: { width: 620, height: 400 }, component: TerminalApp })
  register({ id: 'notes', name: 'Notes', icon: '📝', keywords: ['write', 'text', 'note', 'markdown'], defaultSize: { width: 640, height: 440 }, component: NotesApp })
  register({ id: 'files', name: 'Files', icon: '📁', keywords: ['folder', 'file', 'explorer', 'storage'], defaultSize: { width: 650, height: 460 }, component: FilesApp })
  register({ id: 'tasks', name: 'Tasks', icon: '✅', keywords: ['todo', 'checklist', 'task'], defaultSize: { width: 420, height: 500 }, component: TasksApp })
  register({ id: 'calendar', name: 'Calendar', icon: '📅', keywords: ['date', 'schedule', 'month'], defaultSize: { width: 340, height: 400 }, component: CalendarApp })
  register({ id: 'settings', name: 'Settings', icon: '⚙️', keywords: ['config', 'preferences', 'options', 'theme'], defaultSize: { width: 560, height: 440 }, component: SettingsApp })
  register({ id: 'taskmanager', name: 'Task Manager', icon: '📊', keywords: ['process', 'monitor', 'kill', 'memory'], defaultSize: { width: 420, height: 380 }, component: TaskManagerApp })
  register({ id: 'browser', name: 'Browser', icon: '🌐', keywords: ['web', 'internet', 'browse'], defaultSize: { width: 800, height: 560 }, component: () => <div className="h-full flex items-center justify-center text-[var(--moon-text-muted)] text-sm">Browser — Coming Soon</div> })
}

export function App() {
  const { initialized, theme, accent } = useSettingsStore()
  const [showOnboarding, setShowOnboarding] = useState(!initialized)
  const push = useNotifications(s => s.push)

  useHardwareTier()

  useEffect(() => {
    registerApps()
    applyTheme(theme)
    applyAccent(accent)
  }, [theme, accent])

  useEffect(() => {
    if (initialized && !showOnboarding) {
      push({ title: 'Welcome back', message: 'MoonOS is ready. Ctrl+Space to launch apps.', type: 'info' })
    }
  }, [initialized, showOnboarding, push])

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <TopPanel />
      <Desktop />
      <DesktopWidgets />
      <Dock />
      <Launcher />
      <CommandPalette />
      <WorkspaceSwitcher />
      <NotificationToasts />
    </div>
  )
}
