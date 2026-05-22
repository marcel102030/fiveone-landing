import { supabase } from "../../../shared/lib/supabaseClient";

export type ActivityDay = { date: string; seconds: number };

export type MinistryProgress = {
  ministry_id: string;
  title: string;
  focus_color: string | null;
  gradient: string | null;
  total_lessons: number;
  started_lessons: number;
  completed_lessons: number;
  watched_seconds: number;
};

export type LastLesson = {
  lesson_id: string;
  title: string | null;
  thumbnail: string | null;
  watched_seconds: number;
  duration_seconds: number | null;
  last_at: string;
};

export type ProgressStats = {
  total_seconds: number;
  completions: number;
  lessons_started: number;
  streak_days: number;
  activity_30d: ActivityDay[];
  ministries: MinistryProgress[];
  last_lesson: LastLesson | null;
};

const EMPTY_STATS: ProgressStats = {
  total_seconds: 0,
  completions: 0,
  lessons_started: 0,
  streak_days: 0,
  activity_30d: [],
  ministries: [],
  last_lesson: null,
};

export async function fetchUserProgressStats(userId: string | null): Promise<ProgressStats> {
  if (!userId) return EMPTY_STATS;
  const { data, error } = await supabase.rpc("fetch_user_progress_stats", {
    p_user_id: userId,
  });
  if (error) throw error;
  if (!data || typeof data !== "object") return EMPTY_STATS;
  return {
    total_seconds: Number((data as any).total_seconds ?? 0),
    completions: Number((data as any).completions ?? 0),
    lessons_started: Number((data as any).lessons_started ?? 0),
    streak_days: Number((data as any).streak_days ?? 0),
    activity_30d: Array.isArray((data as any).activity_30d) ? (data as any).activity_30d : [],
    ministries: Array.isArray((data as any).ministries) ? (data as any).ministries : [],
    last_lesson: (data as any).last_lesson || null,
  };
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h >= 1) return `${h}h ${m.toString().padStart(2, "0")}min`;
  if (m >= 1) return `${m}min`;
  return `${s}s`;
}
