import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        if (!data.session) {
          setInfo(
            'Fast geschafft – bitte bestaetige die E-Mail in deinem Postfach und logge dich dann ein.'
          );
          setMode('login');
          setPassword('');
        }
      }
    } catch (err) {
      setError(translateError(err?.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="oh-auth-page">
      <div className="oh-auth-shell">
        <aside className="oh-auth-left">
          <div className="oh-auth-brand">
            <span className="oh-auth-sigma">&Sigma;</span>
            <span className="oh-auth-word">options<span style={{ color: '#06b6d4' }}>hub</span></span>
          </div>
          <div className="oh-auth-headline">Optionen rechnen,<br />Strategien bauen, screenen.</div>
          <p className="oh-auth-lead">
            Das Werkzeug-Set fuer Stillhalter und Optionshaendler – an einem Ort.
          </p>
          <ul className="oh-auth-features">
            <li><Ico path="M9 7h6M9 11h6M9 15h3M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />Black-Scholes-Rechner mit Greeks</li>
            <li><Ico path="M4 19l5-6 4 3 6-8M4 4v16h16" />Multi-Leg-Strategiebau & Payoff</li>
            <li><Ico path="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />LEAP-Rechner</li>
            <li><Ico path="M3 5h18l-7 8v5l-4 2v-7L3 5z" />Taegliche Screenings</li>
          </ul>
          <svg className="oh-auth-motif" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,95 150,95 400,12" fill="none" stroke="#22d3ee" strokeWidth="2" />
            <line x1="0" y1="95" x2="400" y2="95" stroke="#334155" strokeWidth="1" strokeDasharray="4 5" />
          </svg>
        </aside>

        <section className="oh-auth-right">
          <div className="oh-auth-formbox">
            <h1 className="oh-auth-title">{isLogin ? 'Anmelden' : 'Registrieren'}</h1>
            <p className="oh-auth-sub">
              {isLogin ? 'Zugang fuer registrierte Nutzer.' : 'Lege ein Konto an, um Zugriff zu erhalten.'}
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <label className="oh-auth-label">E-Mail</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="du@beispiel.de"
                className="oh-auth-input"
              />

              <label className="oh-auth-label" style={{ marginTop: 14 }}>Passwort</label>
              <div className="oh-auth-pwwrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort"
                  className="oh-auth-input"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="oh-auth-eye"
                  aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPw ? (
                    <Ico path="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 9 7a12 12 0 0 1-2.2 3.1M6.1 6.1A12 12 0 0 0 3 12c0 2.5 4 7 9 7 1.2 0 2.3-.2 3.3-.6" size={17} />
                  ) : (
                    <Ico path="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={17} />
                  )}
                </button>
              </div>

              {error && <div className="oh-auth-msg oh-auth-err">{error}</div>}
              {info && <div className="oh-auth-msg oh-auth-info">{info}</div>}

              <button type="submit" disabled={busy} className="oh-auth-submit" style={{ opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Bitte warten …' : isLogin ? 'Anmelden' : 'Konto erstellen'}
              </button>
            </form>

            <div className="oh-auth-toggle">
              {isLogin ? 'Noch kein Konto?' : 'Schon registriert?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); setInfo(''); }}
                className="oh-auth-togglebtn"
              >
                {isLogin ? 'Registrieren' : 'Anmelden'}
              </button>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .oh-auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#020617;padding:20px;font-family:'Manrope',system-ui,sans-serif;}
        .oh-auth-shell{width:100%;max-width:880px;display:flex;background:#0f172a;border:0.5px solid #1e293b;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.45);}
        .oh-auth-left{position:relative;flex:1.12;padding:34px 30px;border-right:0.5px solid #0f1b33;overflow:hidden;display:flex;flex-direction:column;}
        .oh-auth-brand{display:flex;align-items:center;gap:8px;margin-bottom:24px;}
        .oh-auth-sigma{width:30px;height:30px;border-radius:8px;background:#06b6d4;color:#021018;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;}
        .oh-auth-word{font-size:18px;font-weight:700;color:#e2e8f0;}
        .oh-auth-headline{font-size:22px;font-weight:600;color:#f1f5f9;line-height:1.3;}
        .oh-auth-lead{font-size:13px;color:#64748b;margin:10px 0 0;line-height:1.55;max-width:300px;}
        .oh-auth-features{list-style:none;padding:0;margin:24px 0 0;display:flex;flex-direction:column;gap:14px;}
        .oh-auth-features li{display:flex;align-items:center;gap:11px;font-size:13.5px;color:#cbd5e1;}
        .oh-auth-features svg{flex:none;color:#22d3ee;}
        .oh-auth-motif{position:absolute;left:0;right:0;bottom:0;width:100%;height:110px;opacity:0.09;}
        .oh-auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:30px 26px;background:#04081a;}
        .oh-auth-formbox{width:100%;max-width:270px;}
        .oh-auth-title{margin:0;font-size:20px;font-weight:600;color:#f1f5f9;}
        .oh-auth-sub{margin:5px 0 0;font-size:12.5px;color:#64748b;line-height:1.5;}
        .oh-auth-label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;margin-bottom:6px;}
        .oh-auth-input{width:100%;box-sizing:border-box;background:#020617;border:0.5px solid #1e293b;border-radius:9px;padding:11px 13px;color:#e2e8f0;font-size:14.5px;font-family:inherit;transition:border-color .15s;}
        .oh-auth-input:focus{outline:none;border-color:#06b6d4;}
        .oh-auth-input::placeholder{color:#475569;}
        .oh-auth-pwwrap{position:relative;}
        .oh-auth-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;color:#64748b;cursor:pointer;padding:6px;display:flex;align-items:center;}
        .oh-auth-eye:hover{color:#94a3b8;}
        .oh-auth-submit{width:100%;margin-top:20px;background:#06b6d4;color:#021018;border:none;border-radius:9px;padding:12px 14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:inherit;}
        .oh-auth-msg{margin-top:14px;border-radius:8px;padding:9px 11px;font-size:13px;line-height:1.45;}
        .oh-auth-err{background:rgba(239,68,68,0.1);border:0.5px solid rgba(239,68,68,0.35);color:#fca5a5;}
        .oh-auth-info{background:rgba(6,182,212,0.1);border:0.5px solid rgba(6,182,212,0.35);color:#67e8f9;}
        .oh-auth-toggle{margin-top:18px;text-align:center;font-size:13px;color:#64748b;}
        .oh-auth-togglebtn{background:none;border:none;color:#22d3ee;font-weight:600;cursor:pointer;font-size:13px;font-family:inherit;padding:0;}
        @media (max-width:760px){
          .oh-auth-left{display:none;}
          .oh-auth-shell{max-width:380px;}
          .oh-auth-right{flex:1;padding:30px 26px;}
        }
      `}</style>
    </div>
  );
}

function Ico({ path, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function translateError(msg) {
  if (!msg) return 'Etwas ist schiefgelaufen. Bitte erneut versuchen.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort ist falsch.';
  if (m.includes('email not confirmed')) return 'E-Mail noch nicht bestaetigt – bitte Postfach pruefen.';
  if (m.includes('user already registered')) return 'Diese E-Mail ist bereits registriert.';
  if (m.includes('password should be at least')) return 'Passwort zu kurz (mindestens 6 Zeichen).';
  return msg;
}
