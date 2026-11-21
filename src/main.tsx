import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/geist/latin-400.css'
import '@fontsource/geist/latin-500.css'
import '@fontsource/geist/latin-600.css'
import '@fontsource/geist/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/playfair-display/latin-400-italic.css'
import './index.css'
import App from './App.tsx'

// Build-time tags make the page crawlable without JavaScript. Helmet takes
// ownership at startup, so remove only the static copies to avoid duplicates.
document.head.querySelectorAll('[data-prerender]').forEach(element => element.remove());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
