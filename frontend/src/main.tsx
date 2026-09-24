import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Quita la pantalla de carga de index.html cuando la página terminó de cargar
// (recursos y fuentes), con un tope para no dejar al usuario esperando.
const SPLASH_MAX_WAIT_MS = 3000

const pageLoaded = new Promise<void>((resolve) => {
  if (document.readyState === 'complete') resolve()
  else window.addEventListener('load', () => resolve(), { once: true })
})

Promise.race([
  Promise.all([pageLoaded, document.fonts?.ready]),
  new Promise((resolve) => setTimeout(resolve, SPLASH_MAX_WAIT_MS)),
]).then(() => {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('splash-hide')
  splash.addEventListener('transitionend', () => splash.remove(), { once: true })
  setTimeout(() => splash.remove(), 600)
})
