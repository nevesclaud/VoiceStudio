import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PainelApp from './PainelApp'
import '../styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PainelApp />
  </StrictMode>,
)
