import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/500.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/hind-siliguri/400.css'
import '@fontsource/hind-siliguri/600.css'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/auth'
import { LangProvider } from './lib/i18n'
import { ConfirmProvider, ToastProvider } from './components/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider><App /></AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </LangProvider>
  </StrictMode>,
)
