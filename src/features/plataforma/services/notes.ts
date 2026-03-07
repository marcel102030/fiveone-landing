import { supabase } from '../../../shared/lib/supabaseClient';

export interface LessonNote {
  id: string;
  userId: string;
  lessonId: string;
  text: string;
  videoTs: number;   // segundos
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: Record<string, unknown>): LessonNote {
  return {
    id:        row.id        as string,
    userId:    row.user_id   as string,
    lessonId:  row.lesson_id as string,
    text:      row.text      as string,
    videoTs:   Number(row.video_ts ?? 0),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const STORAGE_KEY = (userId: string, lessonId: string) =>
  `fiveone_notes::${userId}::${lessonId}`;

// ── Fetch ──────────────────────────────────────────────────────────────────
export async function fetchNotes(
  userId: string,
  lessonId: string,
): Promise<LessonNote[]> {
  const { data, error } = await supabase
    .from('platform_lesson_note')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('video_ts', { ascending: true });

  if (error) throw error;
  const notes = (data ?? []).map(mapRow);
  try {
    localStorage.setItem(STORAGE_KEY(userId, lessonId), JSON.stringify(notes));
  } catch {}
  return notes;
}

export function fetchNotesFromCache(
  userId: string,
  lessonId: string,
): LessonNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId, lessonId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LessonNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── Add ────────────────────────────────────────────────────────────────────
export async function addNote(
  userId: string,
  lessonId: string,
  text: string,
  videoTs: number,
): Promise<LessonNote> {
  const { data, error } = await supabase
    .from('platform_lesson_note')
    .insert({ user_id: userId, lesson_id: lessonId, text: text.trim(), video_ts: videoTs })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

// ── Update ─────────────────────────────────────────────────────────────────
export async function updateNote(
  noteId: string,
  text: string,
): Promise<void> {
  const { error } = await supabase
    .from('platform_lesson_note')
    .update({ text: text.trim() })
    .eq('id', noteId);

  if (error) throw error;
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_lesson_note')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}
