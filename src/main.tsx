import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import Bugsnag, { bugsnagEnabled } from './bugsnag'

const ErrorBoundary = bugsnagEnabled
  ? Bugsnag.getPlugin('react')!.createErrorBoundary(React)
  : ({ children }: { children: React.ReactNode }) => <>{children}</>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
