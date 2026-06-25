import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import AuthGate from './auth/AuthGate.jsx';
import UnderConstruction from './UnderConstruction.jsx';
import './index.css';

// Steuerung über .env:
//   VITE_UNDER_CONSTRUCTION=true  → Under-Construction-Seite aktiv
//   VITE_UNDER_CONSTRUCTION=false → normaler Betrieb
const UC_ACTIVE = import.meta.env.VITE_UNDER_CONSTRUCTION === 'true';

function Root() {
  const [unlocked, setUnlocked] = useState(false);

  if (UC_ACTIVE && !unlocked) {
    return <UnderConstruction onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
