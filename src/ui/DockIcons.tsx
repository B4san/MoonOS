const s = 24

export const DockIcons: Record<string, React.FC<{ size?: number }>> = {
  terminal: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="18" rx="4" fill="url(#terminal-g)" />
      <path d="M7 8l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 16h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="terminal-g" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a1a2e" />
          <stop offset="1" stopColor="#16213e" />
        </linearGradient>
      </defs>
    </svg>
  ),

  notes: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="2" width="18" height="20" rx="4" fill="url(#notes-g)" />
      <path d="M7 7h10M7 11h7M7 15h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="notes-g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  ),

  files: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 7a3 3 0 013-3h4l2 2h8a3 3 0 013 3v9a3 3 0 01-3 3H5a3 3 0 01-3-3V7z" fill="url(#files-g)" />
      <path d="M2 10h20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <defs>
        <linearGradient id="files-g" x1="2" y1="4" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  ),

  tasks: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#tasks-g)" />
      <path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="tasks-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  ),

  calendar: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="4" fill="url(#cal-g)" />
      <rect x="3" y="4" width="18" height="6" rx="4" fill="rgba(255,255,255,0.15)" />
      <path d="M8 2v3M16 2v3" stroke="var(--moon-text-primary)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1.2" fill="#fff" />
      <circle cx="12" cy="15" r="1.2" fill="#fff" />
      <circle cx="16" cy="15" r="1.2" fill="#fff" />
      <circle cx="8" cy="18" r="1.2" fill="rgba(255,255,255,0.4)" />
      <circle cx="12" cy="18" r="1.2" fill="rgba(255,255,255,0.4)" />
      <defs>
        <linearGradient id="cal-g" x1="3" y1="4" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  ),

  settings: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="url(#set-g)" />
      <circle cx="12" cy="12" r="3.5" stroke="#fff" strokeWidth="1.8" />
      <g stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
        <path d="M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      </g>
      <defs>
        <linearGradient id="set-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  ),

  taskmanager: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#tm-g)" />
      <rect x="6" y="13" width="3" height="5" rx="1" fill="#fff" opacity="0.9" />
      <rect x="10.5" y="9" width="3" height="9" rx="1" fill="#fff" opacity="0.9" />
      <rect x="15" y="6" width="3" height="12" rx="1" fill="#fff" opacity="0.9" />
      <defs>
        <linearGradient id="tm-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'theme-editor': ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#te-g)" />
      <circle cx="9" cy="9" r="2.5" fill="#f472b6" opacity="0.9" />
      <circle cx="15" cy="9" r="2.5" fill="#a78bfa" opacity="0.9" />
      <circle cx="12" cy="14.5" r="2.5" fill="#34d399" opacity="0.9" />
      <defs>
        <linearGradient id="te-g" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1e2e" />
          <stop offset="1" stopColor="#2d2040" />
        </linearGradient>
      </defs>
    </svg>
  ),

  browser: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#br-g)" />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
      <path d="M2.5 9h19M2.5 15h19" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.2" opacity="0.3" />
      <defs>
        <linearGradient id="br-g" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="0.5" stopColor="#10b981" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'text-editor': ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="2" width="18" height="20" rx="3" fill="url(#te2-g)" />
      <path d="M7 7h10M7 10.5h8M7 14h6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14 15l3 3m0 0l-1.5-1.5M17 18l-1-1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <defs>
        <linearGradient id="te2-g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'pdf-viewer': ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="3" fill="url(#pdf-g)" />
      <path d="M8 8h3a1.5 1.5 0 010 3H8V8z" stroke="#fff" strokeWidth="1.2" />
      <path d="M8 14h8M8 17h5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="pdf-g" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dc2626" /><stop offset="1" stopColor="#9f1239" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'image-viewer': ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" fill="url(#img-g)" />
      <circle cx="8.5" cy="9.5" r="2" fill="#fff" opacity="0.8" />
      <path d="M3 16l5-4 3 2.5 4-5 6 6.5v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1z" fill="rgba(255,255,255,0.25)" />
      <defs>
        <linearGradient id="img-g" x1="3" y1="4" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  ),

  calculator: ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="4" fill="url(#calc-g)" />
      <rect x="6.5" y="4.5" width="11" height="4" rx="1.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="8" cy="12.5" r="1.2" fill="#fff" opacity="0.8" /><circle cx="12" cy="12.5" r="1.2" fill="#fff" opacity="0.8" /><circle cx="16" cy="12.5" r="1.2" fill="#fff" opacity="0.8" />
      <circle cx="8" cy="16.5" r="1.2" fill="#fff" opacity="0.8" /><circle cx="12" cy="16.5" r="1.2" fill="#fff" opacity="0.8" /><circle cx="16" cy="16.5" r="1.2" fill="#f59e0b" opacity="0.9" />
      <circle cx="8" cy="19.5" r="1.2" fill="#fff" opacity="0.8" /><circle cx="12" cy="19.5" r="1.2" fill="#fff" opacity="0.8" /><circle cx="16" cy="19.5" r="1.2" fill="#f59e0b" opacity="0.9" />
      <defs>
        <linearGradient id="calc-g" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" /><stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'dock-customizer': ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#dc-g)" />
      <rect x="6" y="14" width="12" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      <circle cx="9" cy="16" r="1.2" fill="#fff" /><circle cx="12" cy="16" r="1.2" fill="#fff" /><circle cx="15" cy="16" r="1.2" fill="#fff" />
      <path d="M6 8h12M6 11h8" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <defs>
        <linearGradient id="dc-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f766e" /><stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'background-customizer': ({ size = s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#bg-g)" />
      <path d="M7 17l3-5 2 2 3-4 4 7H7z" fill="rgba(255,255,255,0.3)" />
      <circle cx="9" cy="9" r="2" fill="#fbbf24" opacity="0.8" />
      <defs>
        <linearGradient id="bg-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
    </svg>
  ),
}
