import { createClient } from "@supabase/supabase-js";

// Usa as variaveis definidas no .env.local
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "") as string;
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Loga apenas em dev para ajudar a diagnosticar configuracao.
  if (import.meta.env.DEV) {
    console.error("Supabase env ausente ou invalido.", {
      supabaseUrl,
      supabaseAnonKeyLength: supabaseAnonKey.length,
    });
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
