import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { FormationKey } from "./userAccount";

export type MinistryKey = FormationKey;

export type LessonContentType = "VIDEO" | "TEXT" | "ASSESSMENT" | "EXTERNAL";
export type LessonSourceType = "YOUTUBE" | "VIMEO";

export type LessonStatus = "draft" | "published" | "scheduled";
export type ModuleStatus = "draft" | "published" | "scheduled" | "archived";

export interface StoredFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
  width?: number;
  height?: number;
}

export interface Lesson {
  id: string;
  videoId: string;
  order: number;
  title: string;
  subtitle?: string;
  description?: string;
  contentType: LessonContentType;
  sourceType: LessonSourceType;
  videoUrl?: string;
  externalUrl?: string;
  embedCode?: string;
  materialFile?: StoredFile | null;
  bannerContinue?: StoredFile | null;
  bannerPlayer?: StoredFile | null;
  subjectId?: string;
  subjectName?: string;
  subjectType?: string;
  instructor?: string;
  durationMinutes?: number;
  thumbnailUrl?: string;
  tags?: string[];
  status: LessonStatus;
  releaseAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Module {
  id: string;
  order: number;
  title: string;
  status: ModuleStatus;
  description?: string;
  highlight?: string;
  lessons: Lesson[];
  icon?: string;
}

export interface MinistryMeta {
  id: MinistryKey;
  name: string;
  tagline: string;
  icon: string;
  focusColor: string;
  gradient: string;
}

export interface Ministry extends MinistryMeta {
  modules: Module[];
  info?: {
    summary?: string;
    highlights?: string[];
    certificate?: {
      description?: string;
      requirements?: string[];
    };
  };
}

export interface PlatformContent {
  version: number;
  updatedAt: string;
  ministries: Ministry[];
}

export interface LessonInput {
  id?: string;
  videoId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  contentType?: LessonContentType;
  sourceType?: LessonSourceType;
  videoUrl?: string;
  externalUrl?: string;
  embedCode?: string;
  materialFile?: StoredFile | null;
  bannerContinue?: StoredFile | null;
  bannerPlayer?: StoredFile | null;
  subjectId?: string;
  subjectName?: string;
  subjectType?: string;
  instructor?: string;
  durationMinutes?: number;
  thumbnailUrl?: string;
  tags?: string[];
  status?: LessonStatus;
  releaseAt?: string | null;
  isActive?: boolean;
}

export interface LessonRef extends Lesson {
  ministryId: MinistryKey;
  ministryName: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
}

const CURRENT_VERSION = 1;

const ministryPresets: MinistryMeta[] = [
  {
    id: "APOSTOLO",
    name: "Apóstolo",
    tagline: "Governança e envio apostólico.",
    icon: "/assets/icons/apostolo.svg",
    focusColor: "#60a5fa",
    gradient: "linear-gradient(135deg, #0f172a, #1d4ed8)",
  },
  {
    id: "PROFETA",
    name: "Profeta",
    tagline: "Discernimento e voz profética.",
    icon: "/assets/icons/profeta.svg",
    focusColor: "#f472b6",
    gradient: "linear-gradient(135deg, #0f172a, #be185d)",
  },
  {
    id: "EVANGELISTA",
    name: "Evangelista",
    tagline: "Anúncio do evangelho com paixão.",
    icon: "/assets/icons/evangelista.svg",
    focusColor: "#facc15",
    gradient: "linear-gradient(135deg, #0f172a, #ca8a04)",
  },
  {
    id: "PASTOR",
    name: "Pastor",
    tagline: "Cuidado e discipulado pastoral.",
    icon: "/assets/icons/pastor.svg",
    focusColor: "#4ade80",
    gradient: "linear-gradient(135deg, #0f172a, #15803d)",
  },
  {
    id: "MESTRE",
    name: "Mestre",
    tagline: "Fundamentos e ensino bíblico.",
    icon: "/assets/icons/mestre.svg",
    focusColor: "#38bdf8",
    gradient: "linear-gradient(135deg, #0f172a, #0369a1)",
  },
];

function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function mapStoredFile(file: any): StoredFile | null {
  if (!file) return null;
  try {
    const parsed = typeof file === "string" ? JSON.parse(file) : file;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      name: parsed.name,
      size: parsed.size,
      type: parsed.type,
      dataUrl: parsed.dataUrl,
      uploadedAt: parsed.uploadedAt,
      width: parsed.width,
      height: parsed.height,
    };
  } catch {
    return null;
  }
}

function lookupPreset(id: string): MinistryMeta | undefined {
  return ministryPresets.find((preset) => preset.id === id);
}

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    videoId: row.video_id || row.id,
    order: row.order_index ?? 0,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    contentType: (row.content_type || "VIDEO") as LessonContentType,
    sourceType: (row.source_type || "YOUTUBE") as LessonSourceType,
    videoUrl: row.video_url ?? undefined,
    externalUrl: row.external_url ?? undefined,
    embedCode: row.embed_code ?? undefined,
    materialFile: mapStoredFile(row.material_file),
    bannerContinue: mapStoredFile(row.banner_continue),
    bannerPlayer: mapStoredFile(row.banner_player),
    subjectId: row.subject_id ?? undefined,
    subjectName: row.subject_name ?? undefined,
    subjectType: row.subject_type ?? undefined,
    instructor: row.instructor ?? undefined,
    durationMinutes: row.duration_minutes !== null && row.duration_minutes !== undefined ? Number(row.duration_minutes) : undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    tags: undefined,
    status: (row.status || "draft") as LessonStatus,
    releaseAt: row.release_at ? new Date(row.release_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    isActive: row.is_active ?? true,
  };
}

function mapModule(row: any, icon?: string): Module {
  const lessons: Lesson[] = Array.isArray(row.lessons) ? row.lessons.map(mapLesson) : [];
  lessons.sort((a, b) => a.order - b.order);
  return {
    id: row.id,
    order: row.order_index ?? 0,
    title: row.title,
    status: (row.status || "draft") as ModuleStatus,
    description: row.description ?? undefined,
    highlight: row.highlight ?? undefined,
    lessons,
    icon,
  };
}

function mapMinistry(row: any): Ministry {
  const preset = lookupPreset(row.id);
  const modules: Module[] = Array.isArray(row.modules) ? row.modules.map((mod: any) => mapModule(mod, preset?.icon)) : [];
  modules.sort((a, b) => a.order - b.order);
  return {
    id: row.id,
    name: row.title || preset?.name || row.id,
    tagline: row.tagline || preset?.tagline || "",
    icon: row.icon || preset?.icon || "/assets/icons/apostolo.svg",
    focusColor: row.focus_color || preset?.focusColor || "#38bdf8",
    gradient: row.gradient || preset?.gradient || "linear-gradient(135deg, #0f172a, #0369a1)",
    modules,
  };
}

function emptyContent(): PlatformContent {
  return {
    version: CURRENT_VERSION,
    updatedAt: new Date().toISOString(),
    ministries: [],
  };
}

let cache: PlatformContent = emptyContent();
let loadPromise: Promise<void> | null = null;
const listeners = new Set<(content: PlatformContent) => void>();

async function fetchContent(): Promise<void> {
  const { data, error } = await supabase
    .from("platform_ministry")
    .select(
      `
        id,
        title,
        tagline,
        icon,
        focus_color,
        gradient,
        modules:platform_module(
          id,
          order_index,
          title,
          status,
          description,
          highlight,
          lessons:platform_lesson(
            id,
            module_id,
            order_index,
            title,
            subtitle,
            description,
            content_type,
            source_type,
            video_url,
            external_url,
            embed_code,
            material_file,
            banner_continue,
            banner_player,
            subject_id,
            subject_name,
            subject_type,
            instructor,
            duration_minutes,
            thumbnail_url,
            status,
            release_at,
            is_active,
            created_at,
            updated_at
          )
        )
      `
    )
    .order("id", { ascending: true })
    .order("order_index", { foreignTable: "platform_module", ascending: true })
    .order("order_index", { foreignTable: "platform_module.platform_lesson", ascending: true });

  if (error) {
    console.error("Falha ao carregar conteúdo da plataforma", error);
    throw error;
  }

  const ministries = (data ?? []).map(mapMinistry);
  cache = {
    version: CURRENT_VERSION,
    updatedAt: new Date().toISOString(),
    ministries,
  };
}

async function ensureLoaded(): Promise<void> {
  if (cache.ministries.length && !loadPromise) return;
  if (!loadPromise) {
    loadPromise = fetchContent().catch((error) => {
      console.error(error);
      throw error;
    }).finally(() => {
      loadPromise = null;
    });
  }
  return loadPromise;
}

async function refreshContent(): Promise<void> {
  await fetchContent();
  notify();
}

function notify() {
  const snapshot = structuredCloneSafe(cache);
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("Listener error", error);
    }
  });
}

function cloneContent(): PlatformContent {
  return structuredCloneSafe(cache);
}

export function getPlatformContent(): PlatformContent {
  return cloneContent();
}

export function getMinistry(ministryId: MinistryKey): Ministry | null {
  const found = cache.ministries.find((ministry) => ministry.id === ministryId);
  return found ? structuredCloneSafe(found) : null;
}

export function getModule(ministryId: MinistryKey, moduleId: string): Module | null {
  const ministry = cache.ministries.find((m) => m.id === ministryId);
  if (!ministry) return null;
  const module = ministry.modules.find((m) => m.id === moduleId);
  return module ? structuredCloneSafe(module) : null;
}

function findLessonById(lessonId: string): LessonRef | null {
  for (const ministry of cache.ministries) {
    for (const module of ministry.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return {
          ...structuredCloneSafe(lesson),
          ministryId: ministry.id,
          ministryName: ministry.name,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrder: module.order,
        };
      }
    }
  }
  return null;
}

export function listLessons(options?: {
  ministryId?: MinistryKey;
  moduleId?: string;
  moduleOrder?: number;
  onlyPublished?: boolean;
  onlyActive?: boolean;
}): LessonRef[] {
  const result: LessonRef[] = [];
  cache.ministries.forEach((ministry) => {
    if (options?.ministryId && ministry.id !== options.ministryId) return;
    ministry.modules.forEach((module) => {
      if (options?.moduleId && module.id !== options.moduleId) return;
      if (typeof options?.moduleOrder === "number" && module.order !== options.moduleOrder) return;
      module.lessons.forEach((lesson) => {
        if (options?.onlyPublished && lesson.status !== "published") return;
        if (options?.onlyActive && !lesson.isActive) return;
        result.push({
          ...structuredCloneSafe(lesson),
          ministryId: ministry.id,
          ministryName: ministry.name,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrder: module.order,
        });
      });
    });
  });
  result.sort((a, b) => (a.moduleOrder === b.moduleOrder ? a.order - b.order : a.moduleOrder - b.moduleOrder));
  return result;
}

export function subscribePlatformContent(listener: (content: PlatformContent) => void): () => void {
  listeners.add(listener);
  listener(cloneContent());
  ensureLoaded()
    .then(() => listener(cloneContent()))
    .catch((error) => console.error(error));
  return () => listeners.delete(listener);
}

function generateLessonId(ministryId: MinistryKey, moduleOrder: number): string {
  const base = `${ministryId.toLowerCase()}-${String(moduleOrder + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8);
  return `${base}-${random}`;
}

function serializeStoredFile(file?: StoredFile | null) {
  if (!file) return null;
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl: file.dataUrl,
    uploadedAt: file.uploadedAt,
    width: file.width,
    height: file.height,
  };
}

export async function setModuleTitle(_ministryId: MinistryKey, moduleId: string, title: string): Promise<void> {
  const safeTitle = title.trim() || "Módulo";
  const { error } = await supabase
    .from("platform_module")
    .update({ title: safeTitle, updated_at: new Date().toISOString() })
    .eq("id", moduleId);
  if (error) throw error;
  await refreshContent();
}

export async function toggleModuleStatus(ministryId: MinistryKey, moduleId: string): Promise<ModuleStatus> {
  const module = getModule(ministryId, moduleId);
  const nextStatus: ModuleStatus = module?.status === "published" ? "draft" : "published";
  const { error } = await supabase
    .from("platform_module")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", moduleId);
  if (error) throw error;
  await refreshContent();
  return nextStatus;
}

export async function createLesson(
  ministryId: MinistryKey,
  moduleId: string,
  input: LessonInput,
): Promise<Lesson | null> {
  const module = getModule(ministryId, moduleId);
  if (!module) throw new Error("Módulo não encontrado");

  const { data: orderRows, error: orderError } = await supabase
    .from("platform_lesson")
    .select("order_index")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: false })
    .limit(1);

  if (orderError) throw orderError;
  const nextOrder = ((orderRows?.[0]?.order_index as number | undefined) ?? -1) + 1;

  const lessonId = (input.id || generateLessonId(ministryId, module.order)).trim();
  const videoId = (input.videoId || lessonId).trim();

  const payload = {
    id: lessonId,
    module_id: moduleId,
    order_index: nextOrder,
    title: input.title.trim(),
    subtitle: input.subtitle || null,
    description: input.description || null,
    content_type: input.contentType || "VIDEO",
    source_type: input.sourceType || "YOUTUBE",
    video_url: input.videoUrl || null,
    external_url: input.externalUrl || null,
    embed_code: input.embedCode || null,
    material_file: serializeStoredFile(input.materialFile),
    banner_continue: serializeStoredFile(input.bannerContinue),
    banner_player: serializeStoredFile(input.bannerPlayer),
    subject_id: input.subjectId || null,
    subject_name: input.subjectName || null,
    subject_type: input.subjectType || null,
    instructor: input.instructor || null,
    duration_minutes: input.durationMinutes ?? null,
    thumbnail_url: input.thumbnailUrl || (input.bannerContinue?.dataUrl || input.bannerPlayer?.dataUrl) || null,
    status: input.status || "draft",
    release_at: input.releaseAt ? new Date(input.releaseAt).toISOString() : null,
    is_active: input.isActive ?? true,
    video_id: videoId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("platform_lesson").insert(payload);
  if (error) throw error;

  await refreshContent();
  const lesson = findLessonById(lessonId);
  return lesson ? lesson : null;
}

export async function updateLesson(
  _ministryId: MinistryKey,
  _moduleId: string,
  lessonId: string,
  patch: Partial<LessonInput>,
): Promise<Lesson | null> {
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.title !== undefined) updates.title = patch.title.trim();
  if (patch.subtitle !== undefined) updates.subtitle = patch.subtitle || null;
  if (patch.description !== undefined) updates.description = patch.description || null;
  if (patch.contentType !== undefined) updates.content_type = patch.contentType;
  if (patch.sourceType !== undefined) updates.source_type = patch.sourceType;
  if (patch.videoUrl !== undefined) updates.video_url = patch.videoUrl || null;
  if (patch.externalUrl !== undefined) updates.external_url = patch.externalUrl || null;
  if (patch.embedCode !== undefined) updates.embed_code = patch.embedCode || null;
  if (patch.materialFile !== undefined) updates.material_file = serializeStoredFile(patch.materialFile);
  if (patch.bannerContinue !== undefined) updates.banner_continue = serializeStoredFile(patch.bannerContinue);
  if (patch.bannerPlayer !== undefined) updates.banner_player = serializeStoredFile(patch.bannerPlayer);
  if (patch.subjectId !== undefined) updates.subject_id = patch.subjectId || null;
  if (patch.subjectName !== undefined) updates.subject_name = patch.subjectName || null;
  if (patch.subjectType !== undefined) updates.subject_type = patch.subjectType || null;
  if (patch.instructor !== undefined) updates.instructor = patch.instructor || null;
  if (patch.durationMinutes !== undefined) updates.duration_minutes = patch.durationMinutes ?? null;
  if (patch.thumbnailUrl !== undefined) updates.thumbnail_url = patch.thumbnailUrl || null;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.releaseAt !== undefined) updates.release_at = patch.releaseAt ? new Date(patch.releaseAt).toISOString() : null;
  if (patch.isActive !== undefined) updates.is_active = patch.isActive;

  const { error } = await supabase.from("platform_lesson").update(updates).eq("id", lessonId);
  if (error) throw error;
  await refreshContent();
  return findLessonById(lessonId);
}

export async function deleteLesson(_ministryId: MinistryKey, _moduleId: string, lessonId: string): Promise<void> {
  const { error } = await supabase.from("platform_lesson").delete().eq("id", lessonId);
  if (error) throw error;
  await refreshContent();
}

export async function setLessonStatus(
  _ministryId: MinistryKey,
  _moduleId: string,
  lessonId: string,
  status: LessonStatus,
): Promise<void> {
  const { error } = await supabase
    .from("platform_lesson")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", lessonId);
  if (error) throw error;
  await refreshContent();
}

export async function setLessonActive(
  _ministryId: MinistryKey,
  _moduleId: string,
  lessonId: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("platform_lesson")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", lessonId);
  if (error) throw error;
  await refreshContent();
}

export async function moveLesson(
  ministryId: MinistryKey,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1,
): Promise<void> {
  const module = getModule(ministryId, moduleId);
  if (!module) return;
  const index = module.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return;
  const swap = index + direction;
  if (swap < 0 || swap >= module.lessons.length) return;
  const currentLesson = module.lessons[index];
  const targetLesson = module.lessons[swap];

  const updates = [
    supabase
      .from("platform_lesson")
      .update({ order_index: targetLesson.order, updated_at: new Date().toISOString() })
      .eq("id", currentLesson.id),
    supabase
      .from("platform_lesson")
      .update({ order_index: currentLesson.order, updated_at: new Date().toISOString() })
      .eq("id", targetLesson.id),
  ];

  const [{ error: err1 }, { error: err2 }] = await Promise.all(updates);
  if (err1) throw err1;
  if (err2) throw err2;
  await refreshContent();
}

export function usePlatformContent(): PlatformContent {
  const [content, setContent] = useState<PlatformContent>(() => getPlatformContent());

  useEffect(() => {
    const unsubscribe = subscribePlatformContent((latest) => setContent(latest));
    return () => unsubscribe();
  }, []);

  return content;
}
