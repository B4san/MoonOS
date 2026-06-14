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
import { DesktopIcons } from '@/ui/DesktopIcons'
import { NotesApp } from '@/apps/notes'
import { SettingsApp } from '@/apps/settings'
import { TerminalApp } from '@/apps/terminal'
import { TaskManagerApp } from '@/apps/taskmanager'
import { FilesApp } from '@/apps/files'
import { CalendarApp } from '@/apps/calendar'
import { TasksApp } from '@/apps/tasks'
import { ThemeEditorApp } from '@/apps/theme-editor'
import { TextEditorApp } from '@/apps/text-editor'
import { PdfViewerApp } from '@/apps/pdf-viewer'
import { ImageViewerApp } from '@/apps/image-viewer'
import { CalculatorApp } from '@/apps/calculator'
import { DockCustomizerApp } from '@/apps/dock-customizer'
import { BackgroundCustomizerApp } from '@/apps/background-customizer'

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
  register({ id: 'theme-editor', name: 'Theme Editor', icon: '🎨', keywords: ['theme', 'color', 'customize', 'style', 'visual'], defaultSize: { width: 400, height: 520 }, component: ThemeEditorApp })
  register({ id: 'browser', name: 'Browser', icon: '🌐', keywords: ['web', 'internet', 'browse'], defaultSize: { width: 800, height: 560 }, component: () => <div className="h-full flex items-center justify-center text-[var(--moon-text-muted)] text-sm">Browser — Coming Soon</div> })
  register({ id: 'text-editor', name: 'Text Editor', icon: '📄', keywords: ['edit', 'code', 'text', 'write'], defaultSize: { width: 700, height: 500 }, component: TextEditorApp })
  register({ id: 'pdf-viewer', name: 'PDF Viewer', icon: '📕', keywords: ['pdf', 'document', 'read', 'viewer'], defaultSize: { width: 650, height: 550 }, component: PdfViewerApp })
  register({ id: 'image-viewer', name: 'Image Viewer', icon: '🖼️', keywords: ['image', 'photo', 'picture', 'gallery'], defaultSize: { width: 600, height: 500 }, component: ImageViewerApp })
  register({ id: 'calculator', name: 'Calculator', icon: '🧮', keywords: ['calc', 'math', 'number'], defaultSize: { width: 320, height: 440 }, component: CalculatorApp })
  register({ id: 'dock-customizer', name: 'Dock Settings', icon: '🎛️', keywords: ['dock', 'customize', 'appearance', 'bar'], defaultSize: { width: 380, height: 520 }, component: DockCustomizerApp })
  register({ id: 'background-customizer', name: 'Background', icon: '🖌️', keywords: ['background', 'wallpaper', 'desktop', 'customize'], defaultSize: { width: 360, height: 480 }, component: BackgroundCustomizerApp })
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
      <DesktopIcons />
      <DesktopWidgets />
      <Dock />
      <Launcher />
      <CommandPalette />
      <WorkspaceSwitcher />
      <NotificationToasts />
    </div>
  )
}
