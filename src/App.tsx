import { useState, useEffect } from 'react'
import { useHardwareTier } from '@/hooks/useHardwareTier'
import { useSettingsStore } from '@/stores/settings-store'
import { useAppRegistry } from '@/stores/app-registry'
import { applyTheme, applyAccent } from '@/core/theme-engine'
import { Desktop } from '@/ui/Desktop'
import { Dock } from '@/ui/Dock'
import { TopPanel } from '@/ui/TopPanel'
import { Launcher } from '@/ui/Launcher'
import { CommandPalette } from '@/ui/CommandPalette'
import { WorkspaceSwitcher } from '@/ui/WorkspaceSwitcher'
import { Onboarding } from '@/ui/Onboarding'
import { NotesApp } from '@/apps/notes'
import { SettingsApp } from '@/apps/settings'
import { TerminalApp } from '@/apps/terminal'

function registerApps() {
  const { apps, register } = useAppRegistry.getState()
  if (apps.length > 0) return
  register({ id: 'notes', name: 'Notes', icon: '📝', keywords: ['write', 'text', 'note'], defaultSize: { width: 500, height: 400 }, component: NotesApp })
  register({ id: 'terminal', name: 'Terminal', icon: '⬛', keywords: ['shell', 'console', 'cmd'], defaultSize: { width: 600, height: 380 }, component: TerminalApp })
  register({ id: 'settings', name: 'Settings', icon: '⚙️', keywords: ['config', 'preferences', 'options'], defaultSize: { width: 480, height: 420 }, component: SettingsApp })
  register({ id: 'browser', name: 'Browser', icon: '🌐', keywords: ['web', 'internet', 'browse'], defaultSize: { width: 800, height: 560 }, component: ({ windowId: _ }) => <div className="h-full flex items-center justify-center text-[var(--moon-text-muted)] text-sm">Browser - Coming Soon</div> })
  register({ id: 'files', name: 'Files', icon: '📁', keywords: ['folder', 'file', 'explorer'], defaultSize: { width: 600, height: 440 }, component: ({ windowId: _ }) => <div className="h-full flex items-center justify-center text-[var(--moon-text-muted)] text-sm">Files - Coming Soon</div> })
}

export function App() {
  const { initialized, theme, accent } = useSettingsStore()
  const [showOnboarding, setShowOnboarding] = useState(!initialized)

  useHardwareTier()

  useEffect(() => {
    registerApps()
    applyTheme(theme)
    applyAccent(accent)
  }, [theme, accent])

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <TopPanel />
      <Desktop />
      <Dock />
      <Launcher />
      <CommandPalette />
      <WorkspaceSwitcher />
    </div>
  )
}
