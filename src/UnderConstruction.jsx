import { useState, useEffect } from 'react';

/**
 * UnderConstruction
 *
 * Wird angezeigt wenn VITE_UNDER_CONSTRUCTION=true (oder kein Wert gesetzt).
 * Shortcut: Shift + Option + V  → gibt den normalen Login frei.
 *
 * Steuerung über Umgebungsvariable in .env:
 *   VITE_UNDER_CONSTRUCTION=true   → Seite aktiv
 *   VITE_UNDER_CONSTRUCTION=false  → normaler Betrieb
 */
export default function UnderConstruction({ onUnlock }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.shiftKey && e.altKey && e.code === 'KeyV') onUnlock();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onUnlock]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse at 50% 35%, rgba(6,182,212,0.07) 0%, transparent 60%)',
        fontFamily: 'Manrope, system-ui, sans-serif',
        color: '#f1f5f9',
        textAlign: 'center',
        padding: '40px 24px',
        userSelect: 'none',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '48px',
        }}
      >
        <span
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#06b6d4',
            lineHeight: 1,
          }}
        >
          Σ
        </span>
        <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          options<span style={{ color: '#06b6d4' }}>hub</span>
        </span>
      </div>

      {/* Pulsing dot */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#06b6d4',
            margin: '0 auto',
            animation: 'oh-uc-pulse 2.4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Text */}
      <h1
        style={{
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          marginBottom: '12px',
          lineHeight: 1.25,
        }}
      >
        Wir bauen gerade.
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'rgba(241,245,249,0.38)',
          maxWidth: '300px',
          lineHeight: 1.65,
        }}
      >
        Optionshub wird überarbeitet und ist in Kürze wieder verfügbar.
      </p>

      <style>{`
        @keyframes oh-uc-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
          60%  { box-shadow: 0 0 0 10px rgba(6,182,212,0); }
          100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
        }
      `}</style>
    </div>
  );
}
