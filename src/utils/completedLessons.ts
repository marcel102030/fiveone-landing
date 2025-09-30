const STORAGE_KEY = 'fiveone_completed_lessons_v1';
export const COMPLETED_EVENT = 'fiveone-completed-lessons-changed';

export type CompletedLessonInfo = {
  completedAt: number;
  previousWatched?: number | null;
  previousDuration?: number | null;
};

type CompletedMap = Map<string, CompletedLessonInfo>;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function toSerializable(map: CompletedMap): Record<string, CompletedLessonInfo> {
  const obj: Record<string, CompletedLessonInfo> = {};
  map.forEach((value, key) => {
    obj[key] = {
      completedAt: value.completedAt,
      previousWatched: value.previousWatched ?? null,
      previousDuration: value.previousDuration ?? null,
    };
  });
  return obj;
}

function fromSerializable(value: unknown): CompletedMap {
  if (!value || typeof value !== 'object') return new Map();
  const entries: [string, CompletedLessonInfo][] = [];
  for (const [key, raw] of Object.entries(value as Record<string, any>)) {
    if (!key) continue;
    const info = raw as CompletedLessonInfo;
    if (!info || typeof info.completedAt !== 'number') continue;
    entries.push([
      key,
      {
        completedAt: info.completedAt,
        previousWatched: typeof info.previousWatched === 'number' ? info.previousWatched : null,
        previousDuration: typeof info.previousDuration === 'number' ? info.previousDuration : null,
      },
    ]);
  }
  return new Map(entries);
}

function readMap(): CompletedMap {
  if (!isBrowser()) return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);
    return fromSerializable(parsed);
  } catch {
    return new Map();
  }
}

function writeMap(map: CompletedMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSerializable(map)));
    window.dispatchEvent(new Event(COMPLETED_EVENT));
  } catch {
    /* ignore storage failures */
  }
}

export function listCompletedLessonIds(): string[] {
  return Array.from(readMap().keys());
}

export function readCompletedLessons(): CompletedMap {
  return readMap();
}

export function setLessonCompleted(
  lessonId: string,
  info: Partial<CompletedLessonInfo> = {},
): CompletedMap {
  const map = readMap();
  const existing = map.get(lessonId) || null;
  const payload: CompletedLessonInfo = {
    completedAt: info.completedAt ?? existing?.completedAt ?? Date.now(),
    previousWatched: info.previousWatched ?? existing?.previousWatched ?? null,
    previousDuration: info.previousDuration ?? existing?.previousDuration ?? null,
  };
  map.set(lessonId, payload);
  writeMap(map);
  return map;
}

export function removeLessonCompleted(lessonId: string): {
  map: CompletedMap;
  removed?: CompletedLessonInfo;
} {
  const map = readMap();
  const removed = map.get(lessonId) || undefined;
  if (map.delete(lessonId)) {
    writeMap(map);
  }
  return { map, removed };
}

export function mergeCompletedLessons(ids: Iterable<string>): CompletedMap {
  const map = readMap();
  let changed = false;
  for (const id of ids) {
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, { completedAt: Date.now() });
      changed = true;
    }
  }
  if (changed) writeMap(map);
  return map;
}

export function clearCompletedLessons(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(COMPLETED_EVENT));
  } catch {}
}

export function getCompletedLessonInfo(lessonId: string): CompletedLessonInfo | null {
  const map = readMap();
  return map.get(lessonId) || null;
}
