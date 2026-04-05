import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "antd/dist/reset.css";
import "@/styles/main.scss";
import App from './App.tsx'

// Global handlers for uncaught errors and unhandled promise rejections.
// In production, replace console.error with your error reporting service (e.g. Sentry).
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error ?? event.message);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
