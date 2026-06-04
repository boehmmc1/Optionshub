import { createClient } from '@supabase/supabase-js';

// ============================================================
//  Supabase-Verbindung (gleiches Projekt wie das andere Tool)
// ------------------------------------------------------------
//  -> Dieselbe auth.users-Tabelle: bereits registrierte Nutzer
//     koennen sich hier direkt mit ihren Zugangsdaten einloggen.
//
//  Der publishable Key ist OEFFENTLICH (gehoert ins Frontend).
//  NIEMALS den service_role / secret Key hier eintragen.
// ============================================================

// >>> HIER deine Project-URL eintragen (Dashboard -> Connect /
//     Settings -> API), Form: https://<projekt-ref>.supabase.co
const SUPABASE_URL = 'https://jiycewpqjcvjbykcxaqi.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GQqhEfgH7QhHdkhoUShESQ_hmJLfvD_';

if (SUPABASE_URL.includes('DEIN-PROJEKT-REF')) {
  // Sichtbarer Hinweis in der Konsole, falls die URL vergessen wurde.
  console.error(
    '[optionshub] SUPABASE_URL ist noch ein Platzhalter — bitte in src/lib/supabase.js eintragen.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
