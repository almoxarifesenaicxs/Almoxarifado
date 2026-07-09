import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarTema, getTemaSalvo } from './services/theme.ts'

aplicarTema(getTemaSalvo())

if (localStorage.getItem("@senai:theme") === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
