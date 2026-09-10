import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

import "./styles/global.css";
import "./styles/theme.css";
import "./styles/LiquidGlass.css";
import "./styles/saas-theme.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
