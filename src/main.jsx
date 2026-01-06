// Import React StrictMode for additional development checks
import { StrictMode } from 'react'

// Import createRoot for React 18+ root API
import { createRoot } from 'react-dom/client'

// Import global styles
import './index.css'

// Import the main application component
import App from './App.jsx'

// Find the root element in index.html and render the App component
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Render the main application component */}
    <App />
  </StrictMode>,
)
