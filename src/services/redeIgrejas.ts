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
  visit_experience: string[] | null;
  invited_by: string | null;
  care_needs: string[] | null;
  faith_journey: string[] | null;
  doubts_interests: string[] | null;
  contact_preferences: string[] | null;
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
  wants_serve_hospitality: boolean;
  wants_serve_teaching: boolean;
  wants_serve_pastoral_care: boolean;
  wants_serve_practical_support: boolean;
  routine_bible_reading: boolean;
  routine_prayer: boolean;
  routine_fasting: boolean;
  routine_in_development: boolean;
  ministry_discernment: boolean;
  discipleship_current: boolean;
  discipleship_leads: boolean;
  available_for_training: boolean;
  available_for_missions: boolean;
  notes: string | null;
  status: string;
  followup_status: string | null;
  followup_assigned_member_id: string | null;
  followup_closed_reason: string | null;
  followup_notes: string | null;
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

export type RedeHouseMemberDetail = RedeHouseMember & {
  member: RedeMemberRef | null;
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
  wants_serve_hospitality: boolean;
  wants_serve_teaching: boolean;
  wants_serve_pastoral_care: boolean;
  wants_serve_practical_support: boolean;
  routine_bible_reading: boolean;
  routine_prayer: boolean;
  routine_fasting: boolean;
  routine_in_development: boolean;
  ministry_discernment: boolean;
  discipleship_current: boolean;
  discipleship_leads: boolean;
  available_for_training: boolean;
  available_for_missions: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeMemberJourney = {
  member_id: string;
  baptism_done: boolean;
  baptism_date: string | null;
  discipleship_status: string | null;
  serve_area: string | null;
  current_track: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeMemberWeeklyGoal = {
  id: string;
  member_id: string;
  week_start: string;
  word: boolean;
  prayer: boolean;
  fellowship: boolean;
  service: boolean;
  mission: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeMemberPrayerRequest = {
  id: string;
  member_id: string;
  house_id: string | null;
  title: string | null;
  content: string;
  is_private: boolean;
  status: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeMemberJourneyUpsert = Omit<RedeMemberJourney, "created_at" | "updated_at">;
export type RedeMemberWeeklyGoalUpsert = Omit<RedeMemberWeeklyGoal, "id" | "created_at" | "updated_at">;
export type RedeMemberPrayerRequestInsert = Omit<RedeMemberPrayerRequest, "id" | "created_at" | "updated_at">;

export type RedeDiscipleshipPair = {
  id: string;
  discipler_member_id: string;
  disciple_member_id: string;
  status: string | null;
  created_at?: string;
  updated_at?: string;
  discipler?: RedeMemberRef | null;
  disciple?: RedeMemberRef | null;
};

export type RedeDiscipleshipSession = {
  id: string;
  pair_id: string;
  session_date: string;
  topics: string | null;
  tasks: string | null;
  notes: string | null;
  visibility: string | null;
  created_by_member_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeDiscipleshipPairInsert = Omit<RedeDiscipleshipPair, "id" | "created_at" | "updated_at" | "discipler" | "disciple">;
export type RedeDiscipleshipSessionInsert = Omit<RedeDiscipleshipSession, "id" | "created_at" | "updated_at">;

export type RedeTrack = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  created_at?: string;
};

export type RedeTrackModule = {
  id: string;
  track_id: string;
  title: string;
  description: string | null;
  content_link: string | null;
  module_order: number;
  created_at?: string;
};

export type RedeTrackEnrollment = {
  id: string;
  member_id: string;
  track_id: string;
  status: string | null;
  progress: number;
  started_at?: string;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeTrackModuleCompletion = {
  id: string;
  enrollment_id: string;
  module_id: string;
  completed_at?: string;
};

export type RedeNotice = {
  id: string;
  house_id: string | null;
  title: string;
  content: string;
  audience: string | null;
  created_by_member_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeEvent = {
  id: string;
  house_id: string | null;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  audience: string | null;
  created_by_member_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeTrackEnrollmentInsert = Omit<RedeTrackEnrollment, "id" | "created_at" | "updated_at">;
export type RedeNoticeInsert = Omit<RedeNotice, "id" | "created_at" | "updated_at">;
export type RedeEventInsert = Omit<RedeEvent, "id" | "created_at" | "updated_at">;

export type RedeHouseMeeting = {
  id: string;
  house_id: string;
  meeting_date: string;
  meeting_time: string | null;
  host_member_id: string | null;
  liturgy_text: string | null;
  discussion_questions: string | null;
  content_link: string | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeHouseAttendance = {
  id: string;
  meeting_id: string;
  house_id: string;
  member_id: string;
  checked_at: string;
  checked_by_member_id: string | null;
};

export type RedeHouseServiceSchedule = {
  id: string;
  meeting_id: string;
  house_id: string;
  slot: string;
  member_id: string | null;
  status: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RedeHouseMeetingInsert = Omit<RedeHouseMeeting, "id" | "created_at" | "updated_at">;
export type RedeHouseServiceScheduleInsert = Omit<RedeHouseServiceSchedule, "id" | "created_at" | "updated_at">;

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

const normalizeDiscipleshipPair = (row: any): RedeDiscipleshipPair => ({
  ...(row || {}),
  discipler: normalizeMemberRef(row?.discipler),
  disciple: normalizeMemberRef(row?.disciple),
});

export async function listRedeMembers(): Promise<RedeMember[]> {
  const { data, error } = await supabase
    .from("rede_member")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return safeList<RedeMember>(data);
}

export async function getRedeMemberByEmail(email: string): Promise<RedeMember | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const { data, error } = await supabase
    .from("rede_member")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (error) return null;
  return (data as RedeMember) || null;
}

export async function getRedeMemberById(id: string): Promise<RedeMember | null> {
  if (!id) return null;
  const { data, error } = await supabase
    .from("rede_member")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as RedeMember) || null;
}

export async function getRedePrimaryHouseMember(memberId: string): Promise<RedeHouseMember | null> {
  if (!memberId) return null;
  const { data, error } = await supabase
    .from("rede_house_member")
    .select("*")
    .eq("member_id", memberId)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as RedeHouseMember) || null;
}

export async function getRedeHouseById(id: string): Promise<RedeHouseChurch | null> {
  if (!id) return null;
  const { data, error } = await supabase
    .from("rede_house_church")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as RedeHouseChurch) || null;
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

export async function getRedeMemberJourney(memberId: string): Promise<RedeMemberJourney | null> {
  if (!memberId) return null;
  const { data, error } = await supabase
    .from("rede_member_journey")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();
  if (error) return null;
  return (data as RedeMemberJourney) || null;
}

export async function upsertRedeMemberJourney(payload: RedeMemberJourneyUpsert): Promise<void> {
  const { error } = await supabase
    .from("rede_member_journey")
    .upsert(payload, { onConflict: "member_id" });
  if (error) throw error;
}

export async function getWeeklyGoal(memberId: string, weekStart: string): Promise<RedeMemberWeeklyGoal | null> {
  if (!memberId || !weekStart) return null;
  const { data, error } = await supabase
    .from("rede_member_weekly_goal")
    .select("*")
    .eq("member_id", memberId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (error) return null;
  return (data as RedeMemberWeeklyGoal) || null;
}

export async function upsertWeeklyGoal(payload: RedeMemberWeeklyGoalUpsert): Promise<void> {
  const { error } = await supabase
    .from("rede_member_weekly_goal")
    .upsert(payload, { onConflict: "member_id,week_start" });
  if (error) throw error;
}

export async function listPrayerRequestsForMember(viewerMemberId: string): Promise<RedeMemberPrayerRequest[]> {
  if (!viewerMemberId) return [];
  const viewerHouse = await getRedePrimaryHouseMember(viewerMemberId);
  const viewerHouseId = viewerHouse?.house_id || null;
  const viewerIsHouseLeader = viewerHouse?.role === "lider" || viewerHouse?.role === "presbitero";

  let presbiteroHouseIds: string[] = [];
  const { data: presb, error: presbError } = await supabase
    .from("rede_presbitero")
    .select("id")
    .eq("member_id", viewerMemberId)
    .maybeSingle();
  if (!presbError && presb?.id) {
    const { data: houses } = await supabase
      .from("rede_house_church")
      .select("id")
      .eq("presbitero_id", presb.id);
    presbiteroHouseIds = (houses || []).map((h: any) => h.id);
  }

  const orParts: string[] = [`member_id.eq.${viewerMemberId}`];
  if (viewerHouseId) {
    orParts.push(`and(is_private.eq.false,house_id.eq.${viewerHouseId})`);
  }
  if (viewerHouseId && viewerIsHouseLeader) {
    orParts.push(`and(is_private.eq.true,house_id.eq.${viewerHouseId})`);
  }
  if (presbiteroHouseIds.length) {
    const inList = presbiteroHouseIds.join(",");
    orParts.push(`and(is_private.eq.false,house_id.in.(${inList}))`);
    orParts.push(`and(is_private.eq.true,house_id.in.(${inList}))`);
  }

  let query = supabase
    .from("rede_member_prayer_request")
    .select("*")
    .order("created_at", { ascending: false });

  if (orParts.length) {
    query = query.or(orParts.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;
  return safeList<RedeMemberPrayerRequest>(data);
}

export async function createPrayerRequest(payload: RedeMemberPrayerRequestInsert): Promise<RedeMemberPrayerRequest> {
  const { data, error } = await supabase
    .from("rede_member_prayer_request")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeMemberPrayerRequest;
}

export async function updatePrayerRequest(
  id: string,
  payload: Partial<RedeMemberPrayerRequest>
): Promise<void> {
  const { error } = await supabase
    .from("rede_member_prayer_request")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deletePrayerRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from("rede_member_prayer_request")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listDiscipleshipPairsByMember(memberId: string): Promise<RedeDiscipleshipPair[]> {
  const { data, error } = await supabase
    .from("rede_discipleship_pair")
    .select(
      "id, discipler_member_id, disciple_member_id, status, created_at, updated_at, discipler:rede_member!rede_discipleship_pair_discipler_member_id_fkey ( id, full_name, phone ), disciple:rede_member!rede_discipleship_pair_disciple_member_id_fkey ( id, full_name, phone )"
    )
    .or(`discipler_member_id.eq.${memberId},disciple_member_id.eq.${memberId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return safeList<any>(data).map(normalizeDiscipleshipPair);
}

export async function createDiscipleshipPair(payload: RedeDiscipleshipPairInsert): Promise<RedeDiscipleshipPair> {
  const { data, error } = await supabase
    .from("rede_discipleship_pair")
    .insert(payload)
    .select(
      "id, discipler_member_id, disciple_member_id, status, created_at, updated_at, discipler:rede_member!rede_discipleship_pair_discipler_member_id_fkey ( id, full_name, phone ), disciple:rede_member!rede_discipleship_pair_disciple_member_id_fkey ( id, full_name, phone )"
    )
    .single();
  if (error) throw error;
  return normalizeDiscipleshipPair(data as any);
}

export async function listDiscipleshipSessions(pairId: string): Promise<RedeDiscipleshipSession[]> {
  const { data, error } = await supabase
    .from("rede_discipleship_session")
    .select("*")
    .eq("pair_id", pairId)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return safeList<RedeDiscipleshipSession>(data);
}

export async function createDiscipleshipSession(payload: RedeDiscipleshipSessionInsert): Promise<void> {
  const { error } = await supabase
    .from("rede_discipleship_session")
    .insert(payload);
  if (error) throw error;
}

export async function updateDiscipleshipSession(id: string, payload: Partial<RedeDiscipleshipSessionInsert>): Promise<void> {
  const { error } = await supabase
    .from("rede_discipleship_session")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDiscipleshipSession(id: string): Promise<void> {
  const { error } = await supabase
    .from("rede_discipleship_session")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listTracks(): Promise<RedeTrack[]> {
  const { data, error } = await supabase
    .from("rede_track")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return safeList<RedeTrack>(data);
}

export async function createTrack(payload: Omit<RedeTrack, "id" | "created_at">): Promise<RedeTrack> {
  const { data, error } = await supabase
    .from("rede_track")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeTrack;
}

export async function createTrackModule(payload: Omit<RedeTrackModule, "id" | "created_at">): Promise<RedeTrackModule> {
  const { data, error } = await supabase
    .from("rede_track_module")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeTrackModule;
}

export async function listTrackModules(trackId: string): Promise<RedeTrackModule[]> {
  const { data, error } = await supabase
    .from("rede_track_module")
    .select("*")
    .eq("track_id", trackId)
    .order("module_order", { ascending: true });
  if (error) throw error;
  return safeList<RedeTrackModule>(data);
}

export async function listMemberEnrollments(memberId: string): Promise<RedeTrackEnrollment[]> {
  const { data, error } = await supabase
    .from("rede_track_enrollment")
    .select("*")
    .eq("member_id", memberId);
  if (error) throw error;
  return safeList<RedeTrackEnrollment>(data);
}

export async function enrollMemberInTrack(memberId: string, trackId: string): Promise<RedeTrackEnrollment> {
  const { data, error } = await supabase
    .from("rede_track_enrollment")
    .insert({ member_id: memberId, track_id: trackId, status: "ativo", progress: 0 })
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeTrackEnrollment;
}

export async function updateEnrollmentProgress(id: string, payload: Partial<RedeTrackEnrollment>): Promise<void> {
  const { error } = await supabase
    .from("rede_track_enrollment")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function listModuleCompletions(enrollmentId: string): Promise<RedeTrackModuleCompletion[]> {
  const { data, error } = await supabase
    .from("rede_track_module_completion")
    .select("*")
    .eq("enrollment_id", enrollmentId);
  if (error) throw error;
  return safeList<RedeTrackModuleCompletion>(data);
}

export async function setModuleCompletion(enrollmentId: string, moduleId: string, completed: boolean): Promise<void> {
  if (completed) {
    const { error } = await supabase
      .from("rede_track_module_completion")
      .upsert({ enrollment_id: enrollmentId, module_id: moduleId });
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("rede_track_module_completion")
    .delete()
    .eq("enrollment_id", enrollmentId)
    .eq("module_id", moduleId);
  if (error) throw error;
}

export async function listNotices(houseId: string | null): Promise<RedeNotice[]> {
  let query = supabase
    .from("rede_notice")
    .select("*")
    .order("created_at", { ascending: false });
  if (houseId) {
    query = query.or(`house_id.is.null,house_id.eq.${houseId}`);
  } else {
    query = query.is("house_id", null);
  }
  const { data, error } = await query;
  if (error) throw error;
  return safeList<RedeNotice>(data);
}

export async function createNotice(payload: RedeNoticeInsert): Promise<void> {
  const { error } = await supabase
    .from("rede_notice")
    .insert(payload);
  if (error) throw error;
}

export async function listEvents(houseId: string | null): Promise<RedeEvent[]> {
  let query = supabase
    .from("rede_event")
    .select("*")
    .order("start_at", { ascending: true });
  if (houseId) {
    query = query.or(`house_id.is.null,house_id.eq.${houseId}`);
  } else {
    query = query.is("house_id", null);
  }
  const { data, error } = await query;
  if (error) throw error;
  return safeList<RedeEvent>(data);
}

export async function createEvent(payload: RedeEventInsert): Promise<void> {
  const { error } = await supabase
    .from("rede_event")
    .insert(payload);
  if (error) throw error;
}

export async function listHouseMembersByHouse(houseId: string): Promise<RedeHouseMember[]> {
  const { data, error } = await supabase
    .from("rede_house_member")
    .select("*")
    .eq("house_id", houseId);
  if (error) throw error;
  return safeList<RedeHouseMember>(data);
}

export async function listHouseMembersDetailed(houseId: string): Promise<RedeHouseMemberDetail[]> {
  const { data, error } = await supabase
    .from("rede_house_member")
    .select("id, house_id, member_id, role, is_primary, joined_at, created_at, member:rede_member ( id, full_name, phone )")
    .eq("house_id", houseId);
  if (error) throw error;
  return safeList<any>(data).map((row) => ({
    ...(row || {}),
    member: normalizeMemberRef(row?.member),
  }));
}

export async function getNextHouseMeeting(houseId: string, fromDate: string): Promise<RedeHouseMeeting | null> {
  const { data, error } = await supabase
    .from("rede_house_meeting")
    .select("*")
    .eq("house_id", houseId)
    .gte("meeting_date", fromDate)
    .order("meeting_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as RedeHouseMeeting) || null;
}

export async function listHouseMeetings(houseId: string, limit = 6): Promise<RedeHouseMeeting[]> {
  const { data, error } = await supabase
    .from("rede_house_meeting")
    .select("*")
    .eq("house_id", houseId)
    .order("meeting_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return safeList<RedeHouseMeeting>(data);
}

export async function createHouseMeeting(payload: RedeHouseMeetingInsert): Promise<RedeHouseMeeting> {
  const { data, error } = await supabase
    .from("rede_house_meeting")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as RedeHouseMeeting;
}

export async function updateHouseMeeting(id: string, payload: Partial<RedeHouseMeetingInsert>): Promise<void> {
  const { error } = await supabase
    .from("rede_house_meeting")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function listAttendanceForMember(memberId: string, limit = 8): Promise<RedeHouseAttendance[]> {
  const { data, error } = await supabase
    .from("rede_house_attendance")
    .select("*")
    .eq("member_id", memberId)
    .order("checked_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return safeList<RedeHouseAttendance>(data);
}

export async function createAttendance(meetingId: string, houseId: string, memberId: string, checkedById: string | null) {
  const { error } = await supabase
    .from("rede_house_attendance")
    .insert({
      meeting_id: meetingId,
      house_id: houseId,
      member_id: memberId,
      checked_by_member_id: checkedById,
    });
  if (error) throw error;
}

export async function listServiceSchedule(meetingId: string): Promise<RedeHouseServiceSchedule[]> {
  const { data, error } = await supabase
    .from("rede_house_service_schedule")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("slot", { ascending: true });
  if (error) throw error;
  return safeList<RedeHouseServiceSchedule>(data);
}

export async function upsertServiceSchedule(items: RedeHouseServiceScheduleInsert[]): Promise<void> {
  if (!items.length) return;
  const { error } = await supabase
    .from("rede_house_service_schedule")
    .upsert(items);
  if (error) throw error;
}

export async function updateServiceSchedule(id: string, payload: Partial<RedeHouseServiceSchedule>) {
  const { error } = await supabase
    .from("rede_house_service_schedule")
    .update(payload)
    .eq("id", id);
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
