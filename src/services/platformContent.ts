import { useEffect, useState } from "react";
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

const STORAGE_KEY = "fiveone::platform-content";
const CURRENT_VERSION = 1;

const ministryPresets: MinistryMeta[] = [
  {
    id: "APOSTOLO",
    name: "Apóstolo",
    tagline: "Governança e envio apostólico.",
    icon: "/assets/images/apostolo.png",
    focusColor: "#60a5fa",
    gradient: "linear-gradient(135deg, #0f172a, #1d4ed8)",
  },
  {
    id: "PROFETA",
    name: "Profeta",
    tagline: "Discernimento e voz profética.",
    icon: "/assets/images/profeta.png",
    focusColor: "#f472b6",
    gradient: "linear-gradient(135deg, #0f172a, #be185d)",
  },
  {
    id: "EVANGELISTA",
    name: "Evangelista",
    tagline: "Anúncio do evangelho com paixão.",
    icon: "/assets/images/evangelista.png",
    focusColor: "#facc15",
    gradient: "linear-gradient(135deg, #0f172a, #ca8a04)",
  },
  {
    id: "PASTOR",
    name: "Pastor",
    tagline: "Cuidado e discipulado pastoral.",
    icon: "/assets/images/pastor.png",
    focusColor: "#4ade80",
    gradient: "linear-gradient(135deg, #0f172a, #15803d)",
  },
  {
    id: "MESTRE",
    name: "Mestre",
    tagline: "Fundamentos e ensino bíblico.",
    icon: "/assets/images/mestre.png",
    focusColor: "#38bdf8",
    gradient: "linear-gradient(135deg, #0f172a, #0369a1)",
  },
];

type RawDefaultLesson = {
  videoId: string;
  title: string;
  url: string;
  thumbnail?: string;
  material?: string;
  subjectId: string;
  subjectName: string;
  subjectTeacher: string;
  subjectType: string;
};

const defaultMestreLessons: RawDefaultLesson[] = [
  {
    videoId: "mestre-01",
    title: "A Palavra de Deus",
    url: "https://player.vimeo.com/video/1100734000",
    thumbnail: "/assets/images/Introducao_historia_igreja.png",
    material: "/assets/pdfs/aula01.pdf",
    subjectId: "biblia",
    subjectName: "Conheça a Sua Bíblia",
    subjectTeacher: "Rodolfo",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-02",
    title: "Mestres no Antigo Testamento",
    url: "https://www.youtube.com/embed/XQEGw923yD0",
    subjectId: "fundamentos",
    subjectName: "Fundamentos do Ministério de Mestre",
    subjectTeacher: "Guh",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-03",
    title: "Somos todos sacerdotes e os 5 Ministérios",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "ministerios",
    subjectName: "Introdução aos 5 Ministérios",
    subjectTeacher: "Marcelo",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-04",
    title: "Introdução à História da Igreja",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "historia",
    subjectName: "História da Igreja I",
    subjectTeacher: "Suenia",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-05",
    title: "A formação da Bíblia",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "biblia",
    subjectName: "Conheça a Sua Bíblia",
    subjectTeacher: "Rodolfo",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-06",
    title: "Jesus, o Mestre dos Mestres",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "fundamentos",
    subjectName: "Fundamentos do Ministério de Mestre",
    subjectTeacher: "Guh",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-07",
    title: "Entendendo os Dons segundo a Bíblia",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "ministerios",
    subjectName: "Introdução aos 5 Ministérios",
    subjectTeacher: "Marcelo",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-08",
    title: "A Igreja nos 3 Primeiros Séculos",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "historia",
    subjectName: "História da Igreja I",
    subjectTeacher: "Suenia",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-09",
    title: "As 4 características da Bíblia",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "biblia",
    subjectName: "Conheça a Sua Bíblia",
    subjectTeacher: "Rodolfo",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-10",
    title: "O Ministério de Ensino nos Evangelhos",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "fundamentos",
    subjectName: "Fundamentos do Ministério de Mestre",
    subjectTeacher: "Guh",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-11",
    title: "Visão Profética sobre os 5 Ministérios",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "ministerios",
    subjectName: "Introdução aos 5 Ministérios",
    subjectTeacher: "Marcelo",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-12",
    title: "A Igreja e as Heresias combatidas",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "historia",
    subjectName: "História da Igreja I",
    subjectTeacher: "Suenia",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-13",
    title: "Estrutura da Bíblia",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "biblia",
    subjectName: "Conheça a Sua Bíblia",
    subjectTeacher: "Rodolfo",
    subjectType: "Formação T",
  },
  {
    videoId: "mestre-14",
    title: "Mestres na Igreja Primitiva",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "fundamentos",
    subjectName: "Fundamentos do Ministério de Mestre",
    subjectTeacher: "Guh",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-15",
    title: "Liderança na Igreja Local",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "ministerios",
    subjectName: "Introdução aos 5 Ministérios",
    subjectTeacher: "Marcelo",
    subjectType: "Formação M",
  },
  {
    videoId: "mestre-16",
    title: "Os Pais da Igreja e a Teologia Patrística",
    url: "https://www.youtube.com/embed/4KatysePW3U?start=2148",
    subjectId: "historia",
    subjectName: "História da Igreja I",
    subjectTeacher: "Suenia",
    subjectType: "Formação T",
  },
];

function detectSource(url: string | undefined): LessonSourceType {
  if (!url) return "YOUTUBE";
  const lower = url.toLowerCase();
  if (lower.includes("vimeo")) return "VIMEO";
  return "YOUTUBE";
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function createDefaultModules(id: MinistryKey): Module[] {
  const modules: Module[] = Array.from({ length: 8 }, (_, index) => ({
    id: `${id}-mod-${index + 1}`,
    order: index,
    title: `Módulo ${String(index + 1).padStart(2, "0")}`,
    status: index === 0 ? "published" : "draft",
      lessons: [],
    }));

  if (id === "MESTRE") {
    const now = new Date().toISOString();
    modules[0].lessons = defaultMestreLessons.map((item, index) => ({
      id: item.videoId,
      videoId: item.videoId,
      order: index,
      title: item.title,
      contentType: "VIDEO",
      sourceType: detectSource(item.url),
      videoUrl: item.url,
      materialFile: item.material
        ? {
            name: item.material.split("/").pop() || "material.pdf",
            size: 0,
            type: "application/pdf",
            dataUrl: item.material,
            uploadedAt: now,
          }
        : null,
      bannerContinue: null,
      bannerPlayer: null,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      subjectType: item.subjectType,
      instructor: item.subjectTeacher,
      thumbnailUrl: item.thumbnail,
      status: "published",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }));
  }

  return modules;
}

function buildDefaultContent(): PlatformContent {
  const now = new Date().toISOString();
  return {
    version: CURRENT_VERSION,
    updatedAt: now,
    ministries: ministryPresets.map((meta) => ({
      ...meta,
      modules: createDefaultModules(meta.id),
    })),
  };
}

function normalize(content: PlatformContent): PlatformContent {
  content.ministries.forEach((ministry) => {
    if (!Array.isArray(ministry.modules)) {
      ministry.modules = [];
    }
    // garante 8 módulos
    for (let i = 0; i < 8; i += 1) {
      const moduleId = `${ministry.id}-mod-${i + 1}`;
      if (!ministry.modules.some((m) => m.id === moduleId)) {
        ministry.modules.push({
          id: moduleId,
          order: i,
          title: `Módulo ${String(i + 1).padStart(2, "0")}`,
          status: i === 0 ? "published" : "draft",
          lessons: [],
        });
      }
    }
    ministry.modules.sort((a, b) => a.order - b.order);
    ministry.modules.forEach((mod, modIndex) => {
      mod.order = modIndex;
      mod.title = mod.title || `Módulo ${String(modIndex + 1).padStart(2, "0")}`;
      mod.status = mod.status || "draft";
      if (!Array.isArray(mod.lessons)) mod.lessons = [];
      mod.lessons.sort((a, b) => a.order - b.order);
      mod.lessons.forEach((lesson, lessonIndex) => {
        lesson.order = lessonIndex;
        lesson.id = lesson.id || `${ministry.id.toLowerCase()}-${modIndex + 1}-${lessonIndex + 1}`;
        lesson.videoId = lesson.videoId || lesson.id;
        lesson.contentType = lesson.contentType || "VIDEO";
        lesson.sourceType = lesson.sourceType || detectSource(lesson.videoUrl);
        lesson.status = lesson.status || (mod.status === "published" ? "published" : "draft");
        lesson.createdAt = lesson.createdAt || new Date().toISOString();
        lesson.updatedAt = lesson.updatedAt || lesson.createdAt;
        lesson.materialFile = lesson.materialFile ?? null;
        lesson.bannerContinue = lesson.bannerContinue ?? null;
        lesson.bannerPlayer = lesson.bannerPlayer ?? null;
        lesson.isActive = lesson.isActive ?? true;
      });
    });
  });
  return content;
}

function applyMigrations(raw: any): PlatformContent {
  if (!raw || typeof raw !== "object") {
    return buildDefaultContent();
  }
  const content: PlatformContent = {
    version: typeof raw.version === "number" ? raw.version : 0,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
    ministries: Array.isArray(raw.ministries) ? raw.ministries : [],
  };
  const migrated = normalize(content);
  migrated.version = CURRENT_VERSION;
  return migrated;
}

let cache: PlatformContent | null = null;
const listeners = new Set<(content: PlatformContent) => void>();

function ensureCache(): void {
  if (!cache) {
    cache = buildDefaultContent();
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          cache = applyMigrations(JSON.parse(stored));
        }
      } catch {
        // ignore corrupted storage
      }
    }
  }
}

function persist(content: PlatformContent): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch {
    // storage might be full or unavailable; ignore for now
  }
}

function notify(): void {
  if (!cache) return;
  const snapshot = deepClone(cache);
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // ignore listener errors
    }
  });
}

function updateContent(mutator: (draft: PlatformContent) => void): void {
  ensureCache();
  if (!cache) return;
  const draft = deepClone(cache);
  mutator(draft);
  draft.updatedAt = new Date().toISOString();
  cache = normalize(draft);
  persist(cache);
  notify();
}

export function getPlatformContent(): PlatformContent {
  ensureCache();
  return cache ? deepClone(cache) : buildDefaultContent();
}

export function getMinistry(ministryId: MinistryKey): Ministry | null {
  ensureCache();
  if (!cache) return null;
  const found = cache.ministries.find((m) => m.id === ministryId);
  return found ? deepClone(found) : null;
}

export function getModule(ministryId: MinistryKey, moduleId: string): Module | null {
  ensureCache();
  if (!cache) return null;
  const ministry = cache.ministries.find((m) => m.id === ministryId);
  if (!ministry) return null;
  const module = ministry.modules.find((m) => m.id === moduleId);
  return module ? deepClone(module) : null;
}

export function listLessons(options?: {
  ministryId?: MinistryKey;
  moduleId?: string;
  moduleOrder?: number;
  onlyPublished?: boolean;
  onlyActive?: boolean;
}): LessonRef[] {
  ensureCache();
  if (!cache) return [];
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
          ...deepClone(lesson),
          ministryId: ministry.id,
          ministryName: ministry.name,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrder: module.order,
        });
      });
    });
  });
  result.sort((a, b) => {
    if (a.moduleOrder === b.moduleOrder) {
      return a.order - b.order;
    }
    return a.moduleOrder - b.moduleOrder;
  });
  return result;
}

export function subscribePlatformContent(listener: (content: PlatformContent) => void): () => void {
  ensureCache();
  if (cache) listener(deepClone(cache));
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setModuleTitle(ministryId: MinistryKey, moduleId: string, title: string): void {
  const safeTitle = title.trim() || "Módulo";
  updateContent((draft) => {
    const ministry = draft.ministries.find((m) => m.id === ministryId);
    if (!ministry) return;
    const module = ministry.modules.find((m) => m.id === moduleId);
    if (!module) return;
    module.title = safeTitle;
  });
}

export function toggleModuleStatus(ministryId: MinistryKey, moduleId: string): ModuleStatus {
  let nextStatus: ModuleStatus = "draft";
  updateContent((draft) => {
    const ministry = draft.ministries.find((m) => m.id === ministryId);
    if (!ministry) return;
    const module = ministry.modules.find((m) => m.id === moduleId);
    if (!module) return;
    module.status = module.status === "published" ? "draft" : "published";
    nextStatus = module.status;
  });
  return nextStatus;
}

function generateLessonId(ministryId: MinistryKey, moduleOrder: number): string {
  const base = `${ministryId.toLowerCase()}-${String(moduleOrder + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8);
  return `${base}-${random}`;
}

export function createLesson(
  ministryId: MinistryKey,
  moduleId: string,
  input: LessonInput,
): Lesson | null {
  let created: Lesson | null = null;
  updateContent((draft) => {
    const ministry = draft.ministries.find((m) => m.id === ministryId);
    if (!ministry) return;
    const module = ministry.modules.find((m) => m.id === moduleId);
    if (!module) return;
    const title = (input.title || "").trim();
    if (!title) return;
    const now = new Date().toISOString();
    const order = module.lessons.length;
    const lessonId = input.id?.trim() || generateLessonId(ministryId, module.order);
    const videoId = (input.videoId || lessonId).trim();

    const derivedThumb = input.bannerContinue?.dataUrl || input.bannerPlayer?.dataUrl || input.thumbnailUrl?.trim() || undefined;

    const lesson: Lesson = {
      id: lessonId,
      videoId,
      order,
      title,
      subtitle: input.subtitle?.trim() || undefined,
      description: input.description?.trim() || undefined,
      contentType: input.contentType || "VIDEO",
      sourceType: input.sourceType || detectSource(input.videoUrl),
      videoUrl: input.videoUrl?.trim() || undefined,
      externalUrl: input.externalUrl?.trim() || undefined,
      embedCode: input.embedCode?.trim() || undefined,
      materialFile: input.materialFile || null,
      bannerContinue: input.bannerContinue || null,
      bannerPlayer: input.bannerPlayer || null,
      subjectId: input.subjectId?.trim() || undefined,
      subjectName: input.subjectName?.trim() || undefined,
      subjectType: input.subjectType?.trim() || undefined,
      instructor: input.instructor?.trim() || undefined,
      durationMinutes: typeof input.durationMinutes === "number" ? input.durationMinutes : undefined,
      thumbnailUrl: derivedThumb,
      tags: input.tags?.length ? [...input.tags] : undefined,
      status: input.status || (module.status === "published" ? "published" : "draft"),
      releaseAt: input.releaseAt || null,
      createdAt: now,
      updatedAt: now,
      isActive: input.isActive ?? true,
    };
    module.lessons.push(lesson);
    created = deepClone(lesson);
  });
  return created;
}

export function updateLesson(
  ministryId: MinistryKey,
  moduleId: string,
  lessonId: string,
  patch: Partial<LessonInput>,
): Lesson | null {
  let updated: Lesson | null = null;
  updateContent((draft) => {
    const ministry = draft.ministries.find((m) => m.id === ministryId);
    if (!ministry) return;
    const module = ministry.modules.find((m) => m.id === moduleId);
    if (!module) return;
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    if (patch.title !== undefined) lesson.title = patch.title.trim() || lesson.title;
    if (patch.subtitle !== undefined) lesson.subtitle = patch.subtitle?.trim() || undefined;
    if (patch.description !== undefined) lesson.description = patch.description?.trim() || undefined;
    if (patch.contentType) lesson.contentType = patch.contentType;
    if (patch.sourceType) lesson.sourceType = patch.sourceType;
    if (patch.videoUrl !== undefined) lesson.videoUrl = patch.videoUrl?.trim() || undefined;
    if (patch.externalUrl !== undefined) lesson.externalUrl = patch.externalUrl?.trim() || undefined;
    if (patch.embedCode !== undefined) lesson.embedCode = patch.embedCode?.trim() || undefined;
    if (patch.materialFile !== undefined) lesson.materialFile = patch.materialFile || null;
    if (patch.bannerContinue !== undefined) lesson.bannerContinue = patch.bannerContinue || null;
    if (patch.bannerPlayer !== undefined) lesson.bannerPlayer = patch.bannerPlayer || null;
    if (patch.subjectId !== undefined) lesson.subjectId = patch.subjectId?.trim() || undefined;
    if (patch.subjectName !== undefined) lesson.subjectName = patch.subjectName?.trim() || undefined;
    if (patch.subjectType !== undefined) lesson.subjectType = patch.subjectType?.trim() || undefined;
    if (patch.instructor !== undefined) lesson.instructor = patch.instructor?.trim() || undefined;
    if (patch.durationMinutes !== undefined) lesson.durationMinutes = typeof patch.durationMinutes === "number" ? patch.durationMinutes : undefined;
    if (patch.thumbnailUrl !== undefined) lesson.thumbnailUrl = patch.thumbnailUrl?.trim() || undefined;
    if (patch.tags !== undefined) lesson.tags = patch.tags?.length ? [...patch.tags] : undefined;
    if (patch.status) lesson.status = patch.status;
    if (patch.releaseAt !== undefined) lesson.releaseAt = patch.releaseAt || null;
    if (patch.isActive !== undefined) lesson.isActive = patch.isActive;
    if (patch.bannerContinue !== undefined || patch.bannerPlayer !== undefined || patch.thumbnailUrl !== undefined) {
      const bannerData = lesson.bannerContinue?.dataUrl || lesson.bannerPlayer?.dataUrl;
      if (bannerData) {
        lesson.thumbnailUrl = bannerData;
      } else if (patch.thumbnailUrl !== undefined) {
        lesson.thumbnailUrl = patch.thumbnailUrl?.trim() || undefined;
      } else {
        lesson.thumbnailUrl = undefined;
      }
    }
    lesson.updatedAt = new Date().toISOString();
    updated = deepClone(lesson);
  });
  return updated;
}

export function deleteLesson(ministryId: MinistryKey, moduleId: string, lessonId: string): void {
  updateContent((draft) => {
    const ministry = draft.ministries.find((m) => m.id === ministryId);
    if (!ministry) return;
    const module = ministry.modules.find((m) => m.id === moduleId);
    if (!module) return;
    module.lessons = module.lessons.filter((lesson) => lesson.id !== lessonId);
    module.lessons.forEach((lesson, index) => {
      lesson.order = index;
    });
  });
}

export function moveLesson(
  ministryId: MinistryKey,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1,
): void {
  updateContent((draft) => {
    const ministry = draft.ministries.find((m) => m.id === ministryId);
    if (!ministry) return;
    const module = ministry.modules.find((m) => m.id === moduleId);
    if (!module) return;
    const index = module.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index === -1) return;
    const swap = index + direction;
    if (swap < 0 || swap >= module.lessons.length) return;
    [module.lessons[index], module.lessons[swap]] = [module.lessons[swap], module.lessons[index]];
    module.lessons.forEach((lesson, idx) => {
      lesson.order = idx;
    });
  });
}

export function setLessonStatus(
  ministryId: MinistryKey,
  moduleId: string,
  lessonId: string,
  status: LessonStatus,
): void {
  updateLesson(ministryId, moduleId, lessonId, { status });
}

export function setLessonActive(
  ministryId: MinistryKey,
  moduleId: string,
  lessonId: string,
  isActive: boolean,
): void {
  updateLesson(ministryId, moduleId, lessonId, { isActive });
}

export function usePlatformContent(): PlatformContent {
  const [content, setContent] = useState<PlatformContent>(() => getPlatformContent());
  useEffect(() => {
    const unsubscribe = subscribePlatformContent(setContent);
    return () => unsubscribe();
  }, []);
  return content;
}
