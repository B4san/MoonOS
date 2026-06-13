import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import Bugsnag from './bugsnag'

const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
