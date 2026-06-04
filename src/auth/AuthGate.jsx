import { useAuth } from './AuthContext.jsx';
import AuthScreen from './AuthScreen.jsx';

export default function AuthGate({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020617',
          color: '#67e8f9',
          fontFamily: 'Manrope, system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              margin: '0 auto 14px',
              border: '3px solid #1e293b',
              borderTopColor: '#06b6d4',
              borderRadius: '50%',
              animation: 'ohspin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 13, letterSpacing: '0.05em', color: '#64748b' }}>
            Lade …
          </div>
        </div>
        <style>{`@keyframes ohspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return children;
}
