import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize configuration validation
import { initializeConfigValidation } from '@/lib/config/runtime-validator'

// Validate configurations on startup
initializeConfigValidation();

createRoot(document.getElementById("root")!).render(<App />);
