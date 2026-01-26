import { supabase } from "../lib/supabaseClient";

export type RedeMember = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  member_type: string | null;
  status: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeMemberInsert = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  member_type?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type RedeMemberRef = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

export type RedeMemberInvite = {
  id: string;
  token: string;
  status: string;
  member_type: string | null;
  house_id: string | null;
  presbitero_id: string | null;
  expires_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeMemberApplication = {
  id: string;
  invite_token: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  member_type: string | null;
  house_id: string | null;
  gifts: string[] | null;
  wants_preach_house: boolean;
  wants_preach_network: boolean;
  wants_bible_study: boolean;
  wants_open_house: boolean;
  wants_be_presbitero: boolean;
  wants_be_ministry_leader: boolean;
  wants_discipleship: boolean;
  wants_serve_worship: boolean;
  wants_serve_intercession: boolean;
  wants_serve_children: boolean;
  wants_serve_media: boolean;
  available_for_training: boolean;
  available_for_missions: boolean;
  notes: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  reviewed_at?: string | null;
  approved_member_id?: string | null;
};

export type RedeMemberApplicationInsert = Omit<
  RedeMemberApplication,
  "id" | "status" | "created_at" | "updated_at" | "reviewed_at" | "approved_member_id"
>;

export type RedePresbitero = {
  id: string;
  member_id: string;
  since_date: string | null;
  status: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  member?: RedeMemberRef | null;
};

export type RedePresbiteroInsert = {
  member_id: string;
  since_date?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type RedeMinistryLeader = {
  id: string;
  member_id: string;
  ministry: string;
  region: string | null;
  status: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  member?: RedeMemberRef | null;
};

export type RedeMinistryLeaderInsert = {
  member_id: string;
  ministry: string;
  region?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type RedeHouseChurch = {
  id: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  capacity: number | null;
  status: string | null;
  presbitero_id: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeHouseChurchInsert = {
  name: string;
  city?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  meeting_day?: string | null;
  meeting_time?: string | null;
  capacity?: number | null;
  status?: string | null;
  presbitero_id?: string | null;
  notes?: string | null;
};

export type RedeHouseMember = {
  id: string;
  house_id: string;
  member_id: string;
  role: string | null;
  is_primary: boolean | null;
  joined_at: string | null;
  created_at?: string;
};

export type RedeMemberGift = {
  member_id: string;
  gift: string;
  source: string | null;
  created_at?: string;
};

export type RedeMemberQuestionnaire = {
  member_id: string;
  wants_preach_house: boolean;
  wants_preach_network: boolean;
  wants_bible_study: boolean;
  wants_open_house: boolean;
  wants_be_presbitero: boolean;
  wants_be_ministry_leader: boolean;
  wants_discipleship: boolean;
  wants_serve_worship: boolean;
  wants_serve_intercession: boolean;
  wants_serve_children: boolean;
  wants_serve_media: boolean;
  available_for_training: boolean;
  available_for_missions: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

const safeList = <T>(data: T[] | null) => (data || []) as T[];

const normalizeMemberRef = (value: any): RedeMemberRef | null => {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as RedeMemberRef) || null;
  return value as RedeMemberRef;
};

const normalizePresbitero = (row: any): RedePresbitero => ({
  ...(row || {}),
  member: normalizeMemberRef(row?.member),
});

const normalizeLeader = (row: any): RedeMinistryLeader => ({
  ...(row || {}),
  member: normalizeMemberRef(row?.member),
});

export async function listRedeMembers(): Promise<RedeMember[]> {
  const { data, error } = await supabase
    .from("rede_member")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return safeList<RedeMember>(data);
}

export async function createRedeMember(payload: RedeMemberInsert): Promise<RedeMember> {
  const { data, error } = await supabase
    .from("rede_member")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeMember;
}

export async function updateRedeMember(id: string, payload: Partial<RedeMemberInsert>): Promise<void> {
  const { error } = await supabase
    .from("rede_member")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRedeMember(id: string): Promise<void> {
  const { error } = await supabase
    .from("rede_member")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listRedePresbiteros(): Promise<RedePresbitero[]> {
  const { data, error } = await supabase
    .from("rede_presbitero")
    .select("id, member_id, since_date, status, notes, created_at, updated_at, member:rede_member ( id, full_name, phone )")
    .order("since_date", { ascending: false });
  if (error) throw error;
  return safeList<any>(data).map(normalizePresbitero);
}

export async function createRedePresbitero(payload: RedePresbiteroInsert): Promise<RedePresbitero> {
  const { data, error } = await supabase
    .from("rede_presbitero")
    .insert(payload)
    .select("id, member_id, since_date, status, notes, created_at, updated_at, member:rede_member ( id, full_name, phone )")
    .single();
  if (error) throw error;
  return normalizePresbitero(data as any);
}

export async function updateRedePresbitero(id: string, payload: Partial<RedePresbiteroInsert>): Promise<void> {
  const { error } = await supabase
    .from("rede_presbitero")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRedePresbitero(id: string): Promise<void> {
  const { error } = await supabase
    .from("rede_presbitero")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listRedeMinistryLeaders(): Promise<RedeMinistryLeader[]> {
  const { data, error } = await supabase
    .from("rede_ministry_leader")
    .select("id, member_id, ministry, region, status, notes, created_at, updated_at, member:rede_member ( id, full_name, phone )")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return safeList<any>(data).map(normalizeLeader);
}

export async function createRedeMinistryLeader(payload: RedeMinistryLeaderInsert): Promise<RedeMinistryLeader> {
  const { data, error } = await supabase
    .from("rede_ministry_leader")
    .insert(payload)
    .select("id, member_id, ministry, region, status, notes, created_at, updated_at, member:rede_member ( id, full_name, phone )")
    .single();
  if (error) throw error;
  return normalizeLeader(data as any);
}

export async function updateRedeMinistryLeader(id: string, payload: Partial<RedeMinistryLeaderInsert>): Promise<void> {
  const { error } = await supabase
    .from("rede_ministry_leader")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRedeMinistryLeader(id: string): Promise<void> {
  const { error } = await supabase
    .from("rede_ministry_leader")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listRedeHouseChurches(): Promise<RedeHouseChurch[]> {
  const { data, error } = await supabase
    .from("rede_house_church")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return safeList<RedeHouseChurch>(data);
}

export async function createRedeHouseChurch(payload: RedeHouseChurchInsert): Promise<RedeHouseChurch> {
  const { data, error } = await supabase
    .from("rede_house_church")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeHouseChurch;
}

export async function updateRedeHouseChurch(id: string, payload: Partial<RedeHouseChurchInsert>): Promise<void> {
  const { error } = await supabase
    .from("rede_house_church")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRedeHouseChurch(id: string): Promise<void> {
  const { error } = await supabase
    .from("rede_house_church")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listRedeMemberInvites(): Promise<RedeMemberInvite[]> {
  const { data, error } = await supabase
    .from("rede_member_invite")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return safeList<RedeMemberInvite>(data);
}

export async function createRedeMemberInvite(
  payload: Omit<RedeMemberInvite, "id" | "created_at" | "updated_at">
): Promise<RedeMemberInvite> {
  const { data, error } = await supabase
    .from("rede_member_invite")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeMemberInvite;
}

export async function getRedeMemberInviteByToken(token: string): Promise<RedeMemberInvite | null> {
  const { data, error } = await supabase
    .from("rede_member_invite")
    .select("*")
    .eq("token", token)
    .single();
  if (error) return null;
  return data as RedeMemberInvite;
}

export async function listRedeMemberApplications(): Promise<RedeMemberApplication[]> {
  const { data, error } = await supabase
    .from("rede_member_application")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return safeList<RedeMemberApplication>(data);
}

export async function createRedeMemberApplication(payload: RedeMemberApplicationInsert): Promise<RedeMemberApplication> {
  const { data, error } = await supabase
    .from("rede_member_application")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeMemberApplication;
}

export async function updateRedeMemberApplication(
  id: string,
  payload: Partial<RedeMemberApplication>
): Promise<void> {
  const { error } = await supabase
    .from("rede_member_application")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function listRedeHouseMembers(): Promise<RedeHouseMember[]> {
  const { data, error } = await supabase
    .from("rede_house_member")
    .select("*");
  if (error) throw error;
  return safeList<RedeHouseMember>(data);
}

export async function listRedeMemberGifts(): Promise<RedeMemberGift[]> {
  const { data, error } = await supabase
    .from("rede_member_gift")
    .select("*");
  if (error) throw error;
  return safeList<RedeMemberGift>(data);
}

export async function listRedeMemberQuestionnaires(): Promise<RedeMemberQuestionnaire[]> {
  const { data, error } = await supabase
    .from("rede_member_questionnaire")
    .select("*");
  if (error) throw error;
  return safeList<RedeMemberQuestionnaire>(data);
}

export async function upsertRedeMemberQuestionnaire(payload: RedeMemberQuestionnaire): Promise<void> {
  const { error } = await supabase
    .from("rede_member_questionnaire")
    .upsert(payload, { onConflict: "member_id" });
  if (error) throw error;
}

export async function replaceRedeMemberGifts(memberId: string, gifts: string[]): Promise<void> {
  const { error: delError } = await supabase
    .from("rede_member_gift")
    .delete()
    .eq("member_id", memberId);
  if (delError) throw delError;
  if (!gifts.length) return;
  const payload = gifts.map((gift) => ({ member_id: memberId, gift, source: "self" }));
  const { error } = await supabase
    .from("rede_member_gift")
    .insert(payload);
  if (error) throw error;
}

export async function replaceRedeMemberHouse(
  memberId: string,
  houseId: string | null,
  joinedAt: string | null
): Promise<void> {
  const { error: delError } = await supabase
    .from("rede_house_member")
    .delete()
    .eq("member_id", memberId);
  if (delError) throw delError;
  if (!houseId) return;
  const { error } = await supabase
    .from("rede_house_member")
    .insert({
      house_id: houseId,
      member_id: memberId,
      role: "membro",
      is_primary: true,
      joined_at: joinedAt,
    });
  if (error) throw error;
}

export async function replaceRedeHouseMembers(houseId: string, memberIds: string[]): Promise<void> {
  const { error: delError } = await supabase
    .from("rede_house_member")
    .delete()
    .eq("house_id", houseId);
  if (delError) throw delError;
  if (!memberIds.length) return;
  const payload = memberIds.map((memberId, index) => ({
    house_id: houseId,
    member_id: memberId,
    role: "membro",
    is_primary: index === 0,
    joined_at: null,
  }));
  const { error } = await supabase
    .from("rede_house_member")
    .insert(payload);
  if (error) throw error;
}

export async function assignPresbiteroToHouse(
  presbiteroId: string,
  houseId: string | null
): Promise<void> {
  const { error: clearError } = await supabase
    .from("rede_house_church")
    .update({ presbitero_id: null })
    .eq("presbitero_id", presbiteroId);
  if (clearError) throw clearError;
  if (!houseId) return;
  const { error } = await supabase
    .from("rede_house_church")
    .update({ presbitero_id: presbiteroId })
    .eq("id", houseId);
  if (error) throw error;
}
