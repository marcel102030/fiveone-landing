import { useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabaseClient";
/** ID de um curso/ministério — FormationKey ou qualquer string de novo curso */
export type MinistryKey = string;

export type LessonContentType = "VIDEO" | "TEXT" | "ASSESSMENT" | "EXTERNAL";
export type LessonSourceType = "YOUTUBE" | "VIMEO";

export type LessonStatus = "draft" | "published" | "scheduled";
export type ModuleStatus = "draft" | "published" | "scheduled" | "archived";

export interface StoredFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string | null;
  uploadedAt: string;
  width?: number;
  height?: number;
  storageBucket?: string | null;
  storagePath?: string | null;
  url?: string | null;
  file?: File;
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
  bannerMobile?: StoredFile | null;
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
  bannerModule?: StoredFile | null;
}

export interface MinistryMeta {
  id: MinistryKey;
  name: string;
  tagline: string;
  icon: string;
  focusColor: string;
  gradient: string;
  banner?: StoredFile | null;
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
  bannerMobile?: StoredFile | null;
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
const STORAGE_BUCKET = "lesson-assets";

let bucketEnsured = false;

async function ensureStorageBucket(): Promise<void> {
  if (bucketEnsured) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).list('', { limit: 1 });
  if (error) {
    if (error.message?.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `Bucket de storage "${STORAGE_BUCKET}" não encontrado. Confirme no dashboard do Supabase se ele foi criado e está público.`,
      );
    }
    console.error('Falha ao consultar bucket de storage', error);
    throw error;
  }
  bucketEnsured = true;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function uploadStoredFileToBucket(
  kind: "material" | "banner" | "mobile",
  file: File,
  ctx: { ministryId: MinistryKey; moduleId: string; lessonId: string },
  originalName: string,
) {
  await ensureStorageBucket();
  const extension = (() => {
    const fromName = originalName?.split(".").pop();
    if (fromName) return fromName.toLowerCase();
    const mimeExt = file.type?.split("/").pop();
    return mimeExt ? mimeExt.toLowerCase() : "bin";
  })();
  const timestamp = Date.now();
  const safeName = slugify(originalName || `${kind}-${timestamp}`) || `${kind}-${timestamp}`;
  const path = `${ctx.ministryId}/${ctx.moduleId}/${ctx.lessonId}/${safeName}-${timestamp}.${extension}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return {
    storageBucket: STORAGE_BUCKET,
    storagePath: path,
    url: publicUrlData.publicUrl,
  };
}

async function deleteStoredFileFromBucket(file?: StoredFile | null) {
  if (!file?.storageBucket || !file.storagePath) return;
  try {
    await ensureStorageBucket();
    await supabase.storage.from(file.storageBucket).remove([file.storagePath]);
  } catch (error) {
    console.warn("Não foi possível remover arquivo do storage", error);
  }
}

async function prepareStoredFile(
  field: "materialFile" | "bannerContinue" | "bannerPlayer" | "bannerMobile",
  file: StoredFile | null | undefined,
  ctx: { ministryId: MinistryKey; moduleId: string; lessonId: string },
): Promise<StoredFile | null> {
  if (!file) return null;
  if (file.file) {
    const kind = field === "materialFile" ? "material" : field === "bannerMobile" ? "mobile" : "banner";
    const upload = await uploadStoredFileToBucket(kind, file.file, ctx, file.name);
    return {
      ...file,
      ...upload,
      dataUrl: null,
      file: undefined,
      uploadedAt: new Date().toISOString(),
    };
  }
  return file;
}

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
      dataUrl: parsed.dataUrl ?? null,
      uploadedAt: parsed.uploadedAt,
      width: parsed.width,
      height: parsed.height,
      storageBucket: parsed.storageBucket ?? parsed.storage_bucket ?? null,
      storagePath: parsed.storagePath ?? parsed.storage_path ?? null,
      url: parsed.url ?? null,
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
    bannerMobile: mapStoredFile(row.banner_mobile) || mapStoredFile(row.banner_player),
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
    bannerModule: mapStoredFile(row.banner_module),
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
    icon: row.icon || preset?.icon || "/assets/icons/default.svg",
    focusColor: row.focus_color || preset?.focusColor || "#38bdf8",
    gradient: row.gradient || preset?.gradient || "linear-gradient(135deg, #0f172a, #0369a1)",
    banner: mapStoredFile(row.banner),
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
  const baseSelect = `
        id,
        title,
        tagline,
        icon,
        focus_color,
        gradient,
        banner,
        modules:platform_module(
          id,
          order_index,
          title,
          status,
          description,
          highlight,
          banner_module,
          lessons:platform_lesson(
            id,
            video_id,
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
            banner_mobile,
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
      `;

  const fallbackSelect = baseSelect.replace(",\n            banner_mobile", "");
  const fallbackNoVideoIdSelect = baseSelect.replace(",\n            video_id", "");
  const fallbackNoVideoIdNoMobileSelect = fallbackNoVideoIdSelect.replace(",\n            banner_mobile", "");
  // Fallbacks para colunas novas do módulo/ministério (podem não existir em DBs antigos)
  const stripNewCols = (s: string) => s.replace(",\n        banner", "").replace(",\n          banner_module", "");

  const execSelect = async (fields: string) =>
    supabase
      .from("platform_ministry")
      .select(fields)
      .order("id", { ascending: true })
      .order("order_index", { foreignTable: "platform_module", ascending: true })
      .order("order_index", { foreignTable: "platform_module.platform_lesson", ascending: true });

  let { data, error } = await execSelect(baseSelect);

  if (error) {
    const missingMobile = error.message?.includes("banner_mobile");
    const missingVideoId = error.message?.includes("video_id");
    const missingNewCols = error.message?.includes("banner_module") || error.message?.includes('"banner"');
    if (missingMobile || missingVideoId || missingNewCols) {
      if (missingMobile) console.warn("Coluna banner_mobile ausente.", error);
      if (missingVideoId) console.warn("Coluna video_id ausente.", error);
      if (missingNewCols) console.warn("Colunas banner/banner_module ausentes. Execute a migração.", error);
      let fields = missingMobile && missingVideoId
        ? fallbackNoVideoIdNoMobileSelect
        : missingMobile
          ? fallbackSelect
          : missingVideoId
            ? fallbackNoVideoIdSelect
            : baseSelect;
      if (missingNewCols) fields = stripNewCols(fields);
      const fallback = await execSelect(fields);
      data = fallback.data;
      error = fallback.error;
    }
  }

  if (error) {
    console.error("Falha ao carregar conteúdo da plataforma", error);
    throw error;
  }

  const ministries = (data ?? []).map(mapMinistry);
  const orderIndex = new Map<string, number>(ministryPresets.map((preset, index) => [preset.id, index]));
  ministries.sort((a, b) => {
    const aIdx = orderIndex.has(a.id) ? orderIndex.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const bIdx = orderIndex.has(b.id) ? orderIndex.get(b.id)! : Number.MAX_SAFE_INTEGER;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.name.localeCompare(b.name);
  });
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
      // Módulo em rascunho não aparece para alunos
      if (options?.onlyPublished && module.status !== "published") return;
      module.lessons.forEach((lesson) => {
        if (options?.onlyPublished && lesson.status !== "published") return;
        if (options?.onlyPublished && lesson.releaseAt && new Date(lesson.releaseAt) > new Date()) return;
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
    dataUrl: file.storagePath ? null : file.dataUrl,
    uploadedAt: file.uploadedAt,
    width: file.width,
    height: file.height,
    storageBucket: file.storageBucket ?? null,
    storagePath: file.storagePath ?? null,
    url: file.url ?? null,
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

  const materialFile = await prepareStoredFile("materialFile", input.materialFile ?? null, {
    ministryId,
    moduleId,
    lessonId,
  });
  const bannerContinue = await prepareStoredFile("bannerContinue", input.bannerContinue ?? null, {
    ministryId,
    moduleId,
    lessonId,
  });
  const bannerPlayer = await prepareStoredFile("bannerPlayer", input.bannerPlayer ?? null, {
    ministryId,
    moduleId,
    lessonId,
  });
  const bannerMobile = await prepareStoredFile("bannerMobile", input.bannerMobile ?? null, {
    ministryId,
    moduleId,
    lessonId,
  });

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
    material_file: serializeStoredFile(materialFile),
    banner_continue: serializeStoredFile(bannerContinue),
    banner_player: serializeStoredFile(bannerPlayer),
    banner_mobile: serializeStoredFile(bannerMobile),
    subject_id: input.subjectId || null,
    subject_name: input.subjectName || null,
    subject_type: input.subjectType || null,
    instructor: input.instructor || null,
    duration_minutes: input.durationMinutes ?? null,
    thumbnail_url:
      input.thumbnailUrl ||
      bannerContinue?.url ||
      bannerMobile?.url ||
      bannerPlayer?.url ||
      input.bannerContinue?.dataUrl ||
      input.bannerMobile?.dataUrl ||
      input.bannerPlayer?.dataUrl ||
      null,
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
  ministryId: MinistryKey,
  moduleId: string,
  lessonId: string,
  patch: Partial<LessonInput>,
): Promise<Lesson | null> {
  const existing = findLessonById(lessonId);
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
  const context = { ministryId, moduleId: moduleId || existing?.moduleId || "", lessonId };
  if (patch.materialFile !== undefined) {
    if (!patch.materialFile) {
      await deleteStoredFileFromBucket(existing?.materialFile ?? null);
      updates.material_file = null;
    } else {
      const processed = await prepareStoredFile("materialFile", patch.materialFile, context);
      updates.material_file = serializeStoredFile(processed);
    }
  }
  if (patch.bannerContinue !== undefined) {
    if (!patch.bannerContinue) {
      await deleteStoredFileFromBucket(existing?.bannerContinue ?? null);
      updates.banner_continue = null;
    } else {
      const processed = await prepareStoredFile("bannerContinue", patch.bannerContinue, context);
      updates.banner_continue = serializeStoredFile(processed);
      if (!patch.thumbnailUrl && !patch.bannerPlayer && !patch.bannerMobile) {
        updates.thumbnail_url = processed?.url || processed?.dataUrl || updates.thumbnail_url || null;
      }
    }
  }
  if (patch.bannerPlayer !== undefined) {
    if (!patch.bannerPlayer) {
      await deleteStoredFileFromBucket(existing?.bannerPlayer ?? null);
      updates.banner_player = null;
    } else {
      const processed = await prepareStoredFile("bannerPlayer", patch.bannerPlayer, context);
      updates.banner_player = serializeStoredFile(processed);
      if (!patch.thumbnailUrl && !patch.bannerContinue && !patch.bannerMobile) {
        updates.thumbnail_url = processed?.url || processed?.dataUrl || updates.thumbnail_url || null;
      }
    }
  }
  if (patch.bannerMobile !== undefined) {
    if (!patch.bannerMobile) {
      await deleteStoredFileFromBucket(existing?.bannerMobile ?? null);
      updates.banner_mobile = null;
    } else {
      const processed = await prepareStoredFile("bannerMobile", patch.bannerMobile, context);
      updates.banner_mobile = serializeStoredFile(processed);
      if (!patch.thumbnailUrl) {
        updates.thumbnail_url = processed?.url || processed?.dataUrl || updates.thumbnail_url || null;
      }
    }
  }
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
  const existing = findLessonById(lessonId);
  await deleteStoredFileFromBucket(existing?.materialFile ?? null);
  await deleteStoredFileFromBucket(existing?.bannerContinue ?? null);
  await deleteStoredFileFromBucket(existing?.bannerPlayer ?? null);
  await deleteStoredFileFromBucket(existing?.bannerMobile ?? null);
  const { error } = await supabase.from("platform_lesson").delete().eq("id", lessonId);
  if (error) throw error;
  // Limpa registros de progresso associados (silenciosamente — tabelas podem não existir)
  try {
    await supabase.from("platform_user_progress").delete().eq("lesson_id", lessonId);
  } catch { /* não crítico */ }
  try {
    await supabase.from("platform_lesson_completion").delete().eq("lesson_id", lessonId);
  } catch { /* não crítico */ }
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

export async function createMinistry(input: {
  id: string;
  title: string;
  tagline?: string;
  focusColor?: string;
  gradient?: string;
  banner?: StoredFile | null;
}): Promise<void> {
  const safeId = input.id.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  if (!safeId) throw new Error('ID do curso inválido');
  const { error } = await supabase.from('platform_ministry').insert({
    id: safeId,
    title: input.title.trim(),
    tagline: input.tagline?.trim() || '',
    icon: '/assets/icons/default.svg',
    focus_color: input.focusColor || '#38bdf8',
    gradient: input.gradient || 'linear-gradient(135deg, #0f172a, #0369a1)',
    banner: input.banner ? JSON.stringify(input.banner) : null,
  });
  if (error) throw error;
  await refreshContent();
}

export async function setMinistryBanner(ministryId: MinistryKey, banner: StoredFile | null): Promise<void> {
  const { error } = await supabase
    .from('platform_ministry')
    .update({ banner: banner ? JSON.stringify(banner) : null })
    .eq('id', ministryId);
  if (error) throw error;
  await refreshContent();
}

export async function setModuleBanner(ministryId: MinistryKey, moduleId: string, banner: StoredFile | null): Promise<void> {
  void ministryId; // kept for API consistency
  const { error } = await supabase
    .from('platform_module')
    .update({ banner_module: banner ? JSON.stringify(banner) : null })
    .eq('id', moduleId);
  if (error) throw error;
  await refreshContent();
}

export async function updateMinistry(ministryId: MinistryKey, patch: {
  title?: string;
  tagline?: string;
  focusColor?: string;
  gradient?: string;
  icon?: string;
}): Promise<void> {
  const updates: Record<string, any> = {};
  if (patch.title !== undefined) updates.title = patch.title.trim();
  if (patch.tagline !== undefined) updates.tagline = patch.tagline.trim();
  if (patch.focusColor !== undefined) updates.focus_color = patch.focusColor;
  if (patch.gradient !== undefined) updates.gradient = patch.gradient;
  if (patch.icon !== undefined) updates.icon = patch.icon.trim();
  const { error } = await supabase.from('platform_ministry').update(updates).eq('id', ministryId);
  if (error) throw error;
  await refreshContent();
}

export async function setModuleStatus(ministryId: MinistryKey, moduleId: string, status: ModuleStatus): Promise<void> {
  void ministryId;
  const { error } = await supabase
    .from('platform_module')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', moduleId);
  if (error) throw error;
  await refreshContent();
}

export async function moveModule(ministryId: MinistryKey, moduleId: string, direction: -1 | 1): Promise<void> {
  const ministry = getMinistry(ministryId);
  if (!ministry) return;
  const idx = ministry.modules.findIndex((m) => m.id === moduleId);
  if (idx === -1) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= ministry.modules.length) return;
  const current = ministry.modules[idx];
  const target = ministry.modules[swapIdx];
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from('platform_module').update({ order_index: target.order, updated_at: new Date().toISOString() }).eq('id', current.id),
    supabase.from('platform_module').update({ order_index: current.order, updated_at: new Date().toISOString() }).eq('id', target.id),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  await refreshContent();
}

export async function duplicateLesson(ministryId: MinistryKey, moduleId: string, lessonId: string): Promise<void> {
  const lesson = findLessonById(lessonId);
  if (!lesson) throw new Error('Aula não encontrada');
  const module = getModule(ministryId, moduleId);
  if (!module) throw new Error('Módulo não encontrado');
  const { data: orderRows, error: orderError } = await supabase
    .from('platform_lesson')
    .select('order_index')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: false })
    .limit(1);
  if (orderError) throw orderError;
  const nextOrder = ((orderRows?.[0]?.order_index as number | undefined) ?? -1) + 1;
  const newId = generateLessonId(ministryId, module.order);
  const { error } = await supabase.from('platform_lesson').insert({
    id: newId,
    video_id: newId,
    module_id: moduleId,
    order_index: nextOrder,
    title: `${lesson.title} (cópia)`,
    subtitle: lesson.subtitle || null,
    description: lesson.description || null,
    content_type: lesson.contentType,
    source_type: lesson.sourceType,
    video_url: lesson.videoUrl || null,
    external_url: lesson.externalUrl || null,
    embed_code: lesson.embedCode || null,
    subject_id: lesson.subjectId || null,
    subject_name: lesson.subjectName || null,
    subject_type: lesson.subjectType || null,
    instructor: lesson.instructor || null,
    duration_minutes: lesson.durationMinutes ?? null,
    status: 'draft',
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  await refreshContent();
}

// ── Matrículas ──────────────────────────────────────────────────────────────

export interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: string | null;
  userEmail?: string;
  userName?: string;
}

export async function listEnrollments(ministryId: MinistryKey): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('platform_enrollment')
    .select('user_id, course_id, enrolled_at, created_at')
    .eq('course_id', ministryId);
  if (error) throw error;
  const rows = data ?? [];
  // Enriquece com dados de perfil se disponíveis
  const userIds = rows.map((r) => r.user_id);
  const profileMap: Record<string, { email?: string; name?: string }> = {};
  if (userIds.length > 0) {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      (profiles ?? []).forEach((p: any) => {
        profileMap[p.id] = { email: p.email, name: p.full_name };
      });
    } catch { /* profiles table may not exist */ }
  }
  return rows.map((r) => ({
    userId: r.user_id,
    courseId: r.course_id,
    enrolledAt: r.enrolled_at ?? r.created_at ?? null,
    userEmail: profileMap[r.user_id]?.email,
    userName: profileMap[r.user_id]?.name,
  }));
}

export async function enrollUser(ministryId: MinistryKey, userId: string): Promise<void> {
  const trimmedId = userId.trim();
  if (!trimmedId) throw new Error('ID do usuário inválido');
  const { error } = await supabase.from('platform_enrollment').upsert(
    { user_id: trimmedId, course_id: ministryId, enrolled_at: new Date().toISOString() },
    { onConflict: 'user_id,course_id' }
  );
  if (error) throw error;
}

export async function unenrollUser(ministryId: MinistryKey, userId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_enrollment')
    .delete()
    .eq('course_id', ministryId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteModule(ministryId: MinistryKey, moduleId: string): Promise<void> {
  const module = getModule(ministryId, moduleId);
  if (module) {
    // Limpa arquivos de storage de cada aula antes de deletar do banco
    for (const lesson of module.lessons) {
      await deleteStoredFileFromBucket(lesson.materialFile ?? null);
      await deleteStoredFileFromBucket(lesson.bannerContinue ?? null);
      await deleteStoredFileFromBucket(lesson.bannerPlayer ?? null);
      await deleteStoredFileFromBucket(lesson.bannerMobile ?? null);
    }
  }
  const { error: le } = await supabase.from('platform_lesson').delete().eq('module_id', moduleId);
  if (le) throw le;
  const { error: me } = await supabase.from('platform_module').delete().eq('id', moduleId);
  if (me) throw me;
  await refreshContent();
}

export async function deleteMinistry(ministryId: MinistryKey): Promise<void> {
  const ministry = getMinistry(ministryId);
  if (!ministry) throw new Error('Curso não encontrado');
  // Limpa storage e deleta aulas de cada módulo
  for (const mod of ministry.modules) {
    for (const lesson of mod.lessons) {
      await deleteStoredFileFromBucket(lesson.materialFile ?? null);
      await deleteStoredFileFromBucket(lesson.bannerContinue ?? null);
      await deleteStoredFileFromBucket(lesson.bannerPlayer ?? null);
      await deleteStoredFileFromBucket(lesson.bannerMobile ?? null);
    }
    await supabase.from('platform_lesson').delete().eq('module_id', mod.id);
  }
  // Deleta módulos, matrículas e o próprio curso
  await supabase.from('platform_module').delete().eq('ministry_id', ministryId);
  await supabase.from('platform_enrollment').delete().eq('course_id', ministryId);
  const { error } = await supabase.from('platform_ministry').delete().eq('id', ministryId);
  if (error) throw error;
  await refreshContent();
}

export async function createModule(ministryId: MinistryKey, title: string): Promise<void> {
  const ministry = getMinistry(ministryId);
  if (!ministry) throw new Error('Curso não encontrado');
  const nextOrder = ministry.modules.length;
  const { error } = await supabase.from('platform_module').insert({
    ministry_id: ministryId,
    title: title.trim() || 'Módulo',
    order_index: nextOrder,
    status: 'draft',
  });
  if (error) throw error;
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
