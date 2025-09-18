import { supabase } from "../lib/supabaseClient";

export type PlatformUser = {
  email: string;
  password: string; // plain for now; recommend Supabase Auth in production
  name?: string | null;
  created_at?: string;
};

export async function createUser(u: PlatformUser): Promise<void> {
  const { error } = await supabase.from('platform_user').insert({
    email: u.email.toLowerCase(),
    password: u.password,
    name: u.name || null,
  });
  if (error) throw error;
}

export async function verifyUser(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('platform_user')
    .select('email')
    .eq('email', email.toLowerCase())
    .eq('password', password)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

