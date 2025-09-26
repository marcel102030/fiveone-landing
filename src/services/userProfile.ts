import { supabase } from "../lib/supabaseClient";

export type UserProfileDetails = {
  user_email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  bio: string | null;
  cpf: string | null;
  phone: string | null;
  gender: string | null;
  birthdate: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const TABLE = "platform_user_profile";

function sanitizePayload(payload: Partial<UserProfileDetails>) {
  const entries = Object.entries(payload).map(([key, value]) => {
    if (value === undefined) return [key, null];
    if (typeof value === "string") {
      const trimmed = value.trim();
      return [key, trimmed.length ? trimmed : null];
    }
    return [key, value];
  });
  return Object.fromEntries(entries);
}

export async function getUserProfileDetails(email: string): Promise<UserProfileDetails | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_email", normalized)
    .maybeSingle();
  if (error) throw error;
  return (data as UserProfileDetails | null) || null;
}

export async function upsertUserProfileDetails(
  email: string,
  payload: Partial<UserProfileDetails>
): Promise<UserProfileDetails> {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const sanitized = sanitizePayload(payload);
  const request = {
    user_email: normalized,
    ...sanitized,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(request, { onConflict: "user_email" })
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProfileDetails;
}
