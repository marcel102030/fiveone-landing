import { supabase } from "../lib/supabaseClient";

// Execute esta função UMA VEZ no console do admin para migrar usuários
// Requer que você saiba as senhas dos usuários existentes
// OU use a função "Invite by email" do Supabase Dashboard para cada usuário
export async function migrateUserToAuth(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error(`Erro ao migrar ${email}:`, error.message);
    return;
  }
  console.log(`Migrado: ${email}`);
}
