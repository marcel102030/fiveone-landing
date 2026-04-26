import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactionBar from '../components/Streamer/ReactionBar';
import CommentSection from '../components/Streamer/CommentSection';
import NotesPanel from '../components/Streamer/NotesPanel';
import Header from './Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUserId } from '../../../shared/utils/user';
import { upsertProgress, deleteProgressForUserVideo, fetchUserProgress } from '../services/progress';
import { upsertCompletion, deleteCompletion, fetchCompletionsForUser } from '../services/completions';
import {
  COMPLETED_EVENT,
  listCompletedLessonIds,
  mergeCompletedLessons,
  removeLessonCompleted,
  setLessonCompleted,
} from '../../../shared/utils/completedLessons';
import { LessonRef, listLessons, MinistryKey, subscribePlatformContent } from '../services/platformContent';
import SubjectDropdown, { SubjectOption } from '../components/SubjectDropdown/SubjectDropdown';
import { openStoredFile } from '../../../shared/utils/storedFile';
import { ConfirmModal } from '../../../shared/components/ui';
import { isFavorite, toggleFavorite } from '../services/favorites';
import { useAuth } from '../../../shared/contexts/AuthContext';

// ── Utility: slugify ────────────────────────────────────────────────────────
const slugify = (value: string): string =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const decodeHtmlEntities = (value: string): string => {
  let out = value;
  for (let i = 0; i < 4; i += 1) {
    const prev = out;
    out = prev
      .replace(/&amp;/gi, '&').replace(/&#0*38;/gi, '&').replace(/&#x0*26;/gi, '&')
      .replace(/&quot;/gi, '"').replace(/&#0*34;/gi, '"').replace(/&#x0*22;/gi, '"')
      .replace(/&apos;/gi, "'").replace(/&#0*39;/gi, "'").replace(/&#x0*27;/gi, "'")
      .replace(/&lt;/gi, '<').replace(/&#0*60;/gi, '<').replace(/&#x0*3c;/gi, '<')
      .replace(/&gt;/gi, '>').replace(/&#0*62;/gi, '>').replace(/&#x0*3e;/gi, '>');
    if (out === prev) break;
  }
  return out;
};

const maybeDecodeURIComponentUrl = (value: string): string => {
  let out = value;
  for (let i = 0; i < 2; i += 1) {
    const looksEncodedUrl =
      /^[a-z][a-z0-9+.-]*%3a%2f%2f/i.test(out) ||
      out.startsWith('%2F%2F') ||
      out.startsWith('%2f%2f');
    if (!looksEncodedUrl) break;
    try { out = decodeURIComponent(out); } catch { break; }
  }
  return out;
};

const stripSurroundingQuotes = (value: string): string => {
  let out = value.trim();
  if ((out.startsWith('"') && out.endsWith('"')) || (out.startsWith("'") && out.endsWith("'"))) {
    out = out.slice(1, -1).trim();
  }
  return out;
};

const decodeHtmlUrl = (value: string): string => {
  let out = decodeHtmlEntities(value);
  out = stripSurroundingQuotes(out);
  out = maybeDecodeURIComponentUrl(out);
  out = decodeHtmlEntities(out);
  out = stripSurroundingQuotes(out);
  if (out.startsWith('//')) out = `https:${out}`;
  return out;
};

const extractEmbedSrc = (raw?: string | null): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('<')) {
    const decoded = decodeHtmlEntities(trimmed);
    const srcMatch = decoded.match(/\bsrc=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      const candidate = decodeHtmlUrl(srcMatch[1]);
      if (/^https?:\/\//i.test(candidate)) return candidate;
    }
    return null;
  }

  const candidate = decodeHtmlUrl(trimmed);
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return null;
};

const normaliseVimeoUrl = (raw: string): string => {
  try {
    const url = new URL(raw);
    if (!url.searchParams.has('badge')) url.searchParams.set('badge', '0');
    if (!url.searchParams.has('autopause')) url.searchParams.set('autopause', '0');
    if (!url.searchParams.has('player_id')) url.searchParams.set('player_id', '0');
    if (!url.searchParams.has('app_id')) url.searchParams.set('app_id', '58479');
    return url.toString();
  } catch {
    return raw;
  }
};

const isYouTubeUrl = (url: string): boolean =>
  /(?:youtube\.com|youtu\.be)/i.test(url);

const extractYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const fromEmbed = u.pathname.match(/\/embed\/([^/?#]+)/i);
    if (fromEmbed?.[1]) return fromEmbed[1];
    const fromV = u.searchParams.get('v');
    if (fromV) return fromV;
    const fromShort = u.hostname === 'youtu.be' ? u.pathname.slice(1).split('/')[0] : null;
    if (fromShort) return fromShort;
  } catch {}
  return null;
};

const parseYouTubeStart = (url: string): number => {
  try {
    const u = new URL(url);
    const start = u.searchParams.get('start') || u.searchParams.get('t');
    if (start) {
      const n = Number(start);
      if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
  } catch {}
  return 0;
};

const normaliseYouTubeUrl = (raw: string): string => {
  try {
    const videoId = extractYouTubeVideoId(raw);
    if (!videoId) return raw;
    const start = parseYouTubeStart(raw);
    const out = new URL(`https://www.youtube.com/embed/${videoId}`);
    out.searchParams.set('enablejsapi', '1');
    out.searchParams.set('origin', window.location.origin);
    out.searchParams.set('rel', '0');
    if (start > 0) out.searchParams.set('start', String(start));
    return out.toString();
  } catch {
    return raw;
  }
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function ensureYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube API requires window'));
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      youtubeApiPromise = null;
      reject(new Error('Timeout ao carregar YouTube IFrame API'));
    }, 15_000);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try { if (typeof prev === 'function') prev(); } catch {}
      window.clearTimeout(timeout);
      resolve();
    };

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      youtubeApiPromise = null;
      reject(new Error('Falha ao carregar YouTube IFrame API'));
    };
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

type VimeoPlayer = import('@vimeo/player').default;

type StoredProgress = {
  watchedSeconds: number;
  durationSeconds: number;
  lastAt: number;
};

type ConfirmState = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
};

type ToastState = {
  message: string;
  tone?: 'success' | 'error' | 'info';
};

type DeferredIframeProps = {
  src: string;
  title: string;
  allow: string;
  onReady: () => void;
  onError: (message: string) => void;
  className?: string;
};

const DeferredIframe = ({ src, title, allow, onReady, onError, className }: DeferredIframeProps) => {
  if (!src || src === 'about:blank') return null;
  return (
    <iframe
      id="fiveone-streamer-player"
      src={src}
      title={title}
      frameBorder="0"
      allow={allow}
      className={className}
      onLoad={(event) => {
        if (!src || src === 'about:blank') return;
        try {
          if (new URL(event.currentTarget.src).href === 'about:blank') return;
        } catch {}
        onReady();
      }}
      onError={() => {
        if (!src || src === 'about:blank') return;
        onError('Não foi possível carregar este vídeo.');
      }}
      allowFullScreen
    />
  );
};

const formatClock = (rawSeconds: number): string => {
  const seconds = Math.max(0, Math.floor(Number(rawSeconds) || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatReleaseDate = (dateStr: string): string => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const resolveExternalVideoUrl = (lesson: LessonRef | null | undefined, embedSrc: string): string | null => {
  const fallback = (lesson?.videoUrl && /^https?:\/\//i.test(lesson.videoUrl) ? lesson.videoUrl : null) || embedSrc;
  if (!fallback) return null;
  try {
    const url = new URL(fallback);
    const href = url.toString();
    if (isYouTubeUrl(href)) {
      const embedMatch = url.pathname.match(/\/embed\/([^/]+)/i);
      const id = embedMatch?.[1];
      if (id) {
        const out = new URL('https://www.youtube.com/watch');
        out.searchParams.set('v', id);
        const start = url.searchParams.get('start');
        if (start) out.searchParams.set('t', start);
        return out.toString();
      }
      return href;
    }
    if (/player\.vimeo\.com/i.test(url.hostname)) {
      const m = url.pathname.match(/\/video\/(\d+)/i);
      if (m?.[1]) {
        const out = new URL(`https://vimeo.com/${m[1]}`);
        let h = url.searchParams.get('h');
        if (!h) {
          for (const [key, value] of url.searchParams.entries()) {
            let normalized = key.trim();
            for (let i = 0; i < 4; i += 1) {
              if (normalized.toLowerCase().startsWith('amp;')) { normalized = normalized.slice(4); continue; }
              break;
            }
            if (normalized.toLowerCase() === 'h' && value) { h = value; break; }
          }
        }
        if (!h) {
          const segments = url.pathname.split('/').filter(Boolean);
          const idx = segments.lastIndexOf(m[1]);
          const maybeHash = idx >= 0 ? segments[idx + 1] : null;
          if (maybeHash && /^[0-9a-z]+$/i.test(maybeHash)) h = maybeHash;
        }
        if (h) out.searchParams.set('h', h);
        return out.toString();
      }
      return href;
    }
    return href;
  } catch {
    return fallback;
  }
};

const getStoredProgress = (video?: LessonRef | null): StoredProgress | null => {
  if (!video) return null;
  const canonicalBase = video.videoId;
  if (!canonicalBase) return null;

  const bases: string[] = [
    canonicalBase,
    ...(video.id && video.id !== canonicalBase ? [video.id] : []),
    ...(video.videoUrl ? [video.videoUrl] : []),
    ...(extractEmbedSrc(video.embedCode) ? [extractEmbedSrc(video.embedCode)!] : []),
  ];

  const canonicalKey = `fiveone_progress::${canonicalBase}`;
  let keyUsed = canonicalKey;

  const raw = (() => {
    try {
      const direct = localStorage.getItem(canonicalKey);
      if (direct) return direct;
      for (const base of bases) {
        if (!base || base === canonicalBase) continue;
        const candidateKey = `fiveone_progress::${base}`;
        const candidate = localStorage.getItem(candidateKey);
        if (candidate) { keyUsed = candidateKey; return candidate; }
      }
    } catch {}
    return null;
  })();

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw || 'null');
    if (!parsed) return null;
    const watchedSeconds = Number(parsed.watchedSeconds || parsed.watched || 0);
    const durationSeconds = Number(parsed.durationSeconds || parsed.duration || 0);
    const lastAt = Number(parsed.lastAt || 0);
    if (Number.isFinite(watchedSeconds)) {
      const result = {
        watchedSeconds: Math.max(0, watchedSeconds),
        durationSeconds: Number.isFinite(durationSeconds) ? Math.max(0, durationSeconds) : 0,
        lastAt: Number.isFinite(lastAt) ? lastAt : 0,
      };
      try {
        if (keyUsed !== canonicalKey) {
          localStorage.setItem(canonicalKey, raw);
          localStorage.removeItem(keyUsed);
        }
      } catch {}
      return result;
    }
    return null;
  } catch {
    return null;
  }
};

// ── File helpers ────────────────────────────────────────────────────────────
function getFileIcon(name: string, type?: string): { emoji: string; bg: string } {
  const ext = (name ?? '').split('.').pop()?.toLowerCase() ?? '';
  const mime = (type ?? '').toLowerCase();
  if (mime.includes('pdf') || ext === 'pdf') return { emoji: '📄', bg: 'bg-red-400/10' };
  if (mime.includes('powerpoint') || mime.includes('presentation') || ext === 'ppt' || ext === 'pptx')
    return { emoji: '📊', bg: 'bg-orange-400/10' };
  if (mime.includes('word') || mime.includes('document') || ext === 'doc' || ext === 'docx')
    return { emoji: '📝', bg: 'bg-blue-400/10' };
  return { emoji: '📁', bg: 'bg-slate/10' };
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ───────────────────────────────────────────────────────────────
const StreamerMestre = ({ ministryId = '' }: { ministryId?: MinistryKey }) => {
  const { email } = useAuth();
  // Ref sempre atualizado — evita closure stale no useEffect de unmount (deps=[])
  const emailRef = useRef<string | null>(null);
  emailRef.current = email;

  const [videoList, setVideoList] = useState<LessonRef[]>(() =>
    listLessons({ ministryId, onlyPublished: true, onlyActive: true })
  );
  const playerInstanceRef = useRef<VimeoPlayer | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const lastProgressFlushRef = useRef<number>(0);
  const [playerReloadKey, setPlayerReloadKey] = useState(0);
  const persistProgressRef = useRef<((rawWatched: number, rawDuration?: number) => void) | null>(null);
  // Guarda o progresso mais recente para flush imediato ao desmontar (sem throttle)
  const unmountFlushRef = useRef<{
    watchedSeconds: number; durationSeconds: number;
    lessonId: string; lessonTitle: string; thumbnail: string;
  }>({ watchedSeconds: 0, durationSeconds: 0, lessonId: '', lessonTitle: '', thumbnail: '' });

  const cleanupVimeoPlayer = useCallback(() => {
    const player = playerInstanceRef.current;
    if (!player) return;
    try {
      player.off('loaded'); player.off('durationchange'); player.off('timeupdate');
      player.off('seeked'); player.off('ended'); player.off('error');
    } catch {}
    try { player.unload().catch(() => {}); } catch {}
    playerInstanceRef.current = null;
  }, []);

  const clearYouTubePoll = useCallback(() => {
    try {
      const id = (youtubePlayerRef.current as any)?.__fiveonePoll as number | undefined;
      if (id) window.clearInterval(id);
      if (youtubePlayerRef.current) delete (youtubePlayerRef.current as any).__fiveonePoll;
    } catch {}
  }, []);

  const cleanupYouTubePlayer = useCallback((hardDestroy = false) => {
    const player = youtubePlayerRef.current;
    clearYouTubePoll();
    if (!player) { youtubePlayerRef.current = null; return; }
    if (hardDestroy) {
      try { player.destroy?.(); } catch {}
    } else {
      try { player.pauseVideo?.(); } catch {}
      try { player.stopVideo?.(); } catch {}
    }
    youtubePlayerRef.current = null;
  }, [clearYouTubePoll]);

  const [playerStatus, setPlayerStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);
  const [showPlayerFallback, setShowPlayerFallback] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  const clearPlayerTimers = useCallback(() => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    fallbackTimerRef.current = null;
    errorTimerRef.current = null;
  }, []);

  const markPlayerReady = useCallback(() => {
    clearPlayerTimers();
    setPlayerStatus('ready');
    setPlayerMessage(null);
    setShowPlayerFallback(false);
    // Se havia um seek pendente (progresso vindo do Supabase), executa agora
    const seekTo = pendingSeekRef.current;
    if (seekTo > 0) {
      pendingSeekRef.current = 0;
      setTimeout(() => {
        try {
          if (youtubePlayerRef.current?.seekTo) {
            youtubePlayerRef.current.seekTo(seekTo, true);
          } else if (playerInstanceRef.current?.setCurrentTime) {
            void playerInstanceRef.current.setCurrentTime(seekTo);
          }
        } catch {}
      }, 300); // pequeno delay para o player estabilizar
    }
  }, [clearPlayerTimers]);

  const markPlayerError = useCallback((message?: string) => {
    clearPlayerTimers();
    setPlayerStatus('error');
    setPlayerMessage(message || 'Não foi possível carregar o vídeo agora.');
    setShowPlayerFallback(true);
  }, [clearPlayerTimers]);

  const handleReloadPlayer = useCallback(() => {
    clearPlayerTimers();
    setPlayerStatus('loading');
    setPlayerMessage(null);
    setShowPlayerFallback(false);
    lastProgressFlushRef.current = 0;
    cleanupVimeoPlayer();
    cleanupYouTubePlayer(true);
    setPlayerReloadKey((prev) => prev + 1);
  }, [clearPlayerTimers, cleanupVimeoPlayer, cleanupYouTubePlayer]);

  const [theaterMode, setTheaterMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('fiveone_theater_mode') === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('fiveone_theater_mode', theaterMode ? '1' : '0'); } catch {}
  }, [theaterMode]);

  const [uiProgress, setUiProgress] = useState<{ watchedSeconds: number; durationSeconds: number }>({
    watchedSeconds: 0, durationSeconds: 0,
  });
  // Quando o progresso é carregado do Supabase depois que o player já iniciou,
  // pendingSeekRef guarda o tempo para fazer seek assim que o player estiver pronto.
  const pendingSeekRef = useRef<number>(0);

  // ── Favorites ─────────────────────────────────────────────────────────────
  const [isFav, setIsFav] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  // ── Auto-play ─────────────────────────────────────────────────────────────
  const [autoPlay, setAutoPlay] = useState(() => {
    try { return localStorage.getItem('fiveone_autoplay') === '1'; } catch { return false; }
  });
  const [autoPlayPending, setAutoPlayPending] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);
  const autoPlayIntervalRef = useRef<number | null>(null);
  const autoPlayRef = useRef(autoPlay);
  const autoPlayTriggeredRef = useRef(false);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
    try { localStorage.setItem('fiveone_autoplay', autoPlay ? '1' : '0'); } catch {}
  }, [autoPlay]);

  const cancelAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) window.clearTimeout(autoPlayTimerRef.current);
    if (autoPlayIntervalRef.current) window.clearInterval(autoPlayIntervalRef.current);
    autoPlayTimerRef.current = null;
    autoPlayIntervalRef.current = null;
    setAutoPlayCountdown(null);
    setAutoPlayPending(false);
  }, []);

  const [searchParams] = useSearchParams();
  const searchKey = searchParams.toString();

  // Inicializa o índice SINCRONAMENTE a partir da URL para evitar flickering
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const hash = window.location.hash; // e.g. "#/streamer-mestre?vid=xxx"
      const qmark = hash.indexOf('?');
      if (qmark < 0) return 0;
      const params = new URLSearchParams(hash.slice(qmark + 1));
      const vid = params.get('vid');
      if (vid) {
        const lessons = listLessons({ ministryId, onlyPublished: true, onlyActive: true });
        const idx = lessons.findIndex(item => item.videoId === vid);
        if (idx >= 0) return idx;
      }
      const idxParam = params.get('i');
      if (idxParam) {
        const i = Number(idxParam);
        if (!Number.isNaN(i) && i >= 0) return i;
      }
    } catch {}
    return 0;
  });

  // Reset auto-play trigger when video changes
  useEffect(() => {
    cancelAutoPlay();
    autoPlayTriggeredRef.current = false;
  }, [currentIndex, cancelAutoPlay]);

  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(listCompletedLessonIds()));

  // Todas as aulas do curso inteiro (todos os módulos) — usado para detectar 100% concluído.
  const allCourseLessonIds = useMemo(
    () => listLessons({ ministryId, onlyPublished: true, onlyActive: true }).map(v => v.videoId).filter(Boolean),
    [ministryId],
  );

  const isModuloAberto = true;
  const videoRef = useRef<HTMLDivElement>(null);
  const sidebarListRef = useRef<HTMLUListElement>(null);

  const getPlayerIframe = useCallback((): HTMLIFrameElement | null => {
    const container = videoRef.current;
    if (container) {
      const byId = container.querySelector('#fiveone-streamer-player');
      if (byId instanceof HTMLIFrameElement) return byId;
      const anyIframe = container.querySelector('iframe');
      if (anyIframe instanceof HTMLIFrameElement) return anyIframe;
    }
    const globalById = document.getElementById('fiveone-streamer-player');
    return globalById instanceof HTMLIFrameElement ? globalById : null;
  }, []);

  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [showCourseComplete, setShowCourseComplete] = useState(false);
  const [certVerifyCode, setCertVerifyCode] = useState<string | null>(null);

  const syncCompletedIds = useCallback(() => {
    setCompletedIds(new Set(listCompletedLessonIds()));
  }, []);

  // ── Auto-emissão de certificado ───────────────────────────────────────────
  // Idempotente no servidor — re-chamadas retornam o mesmo verify_code.
  const triggerCertificate = useCallback((courseId: string, userEmail: string) => {
    fetch('/api/auto-emit-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, ministryId: courseId }),
    })
      .then(r => r.json())
      .then((data: any) => {
        if (data?.ok && data?.verifyCode) setCertVerifyCode(data.verifyCode);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!toastState) return;
    const timer = window.setTimeout(() => setToastState(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastState]);

  useEffect(() => {
    const handler = () => syncCompletedIds();
    syncCompletedIds();
    window.addEventListener(COMPLETED_EVENT, handler);
    const storageHandler = (event: StorageEvent) => {
      if (event.key === 'fiveone_completed_lessons_v1') syncCompletedIds();
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(COMPLETED_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [syncCompletedIds]);

  // ── Subscribe to content updates ──────────────────────────────────────────
  useEffect(() => {
    const modId = new URLSearchParams(searchKey).get('mod') || undefined;
    setVideoList(listLessons({ ministryId, onlyPublished: true, onlyActive: true, moduleId: modId }));
    const unsubscribe = subscribePlatformContent(() => {
      setVideoList(listLessons({ ministryId, onlyPublished: true, onlyActive: true, moduleId: modId }));
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!videoList.length) return;
    const params = new URLSearchParams(searchKey);
    const vid = params.get('vid');
    const idxParam = params.get('i');
    const urlParam = params.get('v');
    let resolved = 0;
    if (vid) {
      let idx = videoList.findIndex(item => item.videoId === vid);
      if (idx < 0) {
        idx = videoList.findIndex((item) => {
          const url = item.videoUrl || '';
          const extracted = extractEmbedSrc(item.embedCode) || '';
          return item.id === vid || vid === url || vid === extracted || (url && (vid.includes(url) || url.includes(vid)));
        });
      }
      if (idx >= 0) resolved = idx;
    } else if (idxParam) {
      const idx = Number(idxParam);
      if (!Number.isNaN(idx) && idx >= 0 && idx < videoList.length) resolved = idx;
    } else if (urlParam) {
      const decoded = decodeURIComponent(urlParam);
      const idx = videoList.findIndex(item => {
        const url = item.videoUrl || '';
        return url === decoded || (url && (decoded.includes(url) || url.includes(decoded)));
      });
      if (idx >= 0) resolved = idx;
    }
    setCurrentIndex(prev => (resolved !== prev ? resolved : prev));
  }, [videoList, searchKey]);

  useEffect(() => {
    if (!videoList.length) return;
    setCurrentIndex(prev => Math.min(prev, videoList.length - 1));
  }, [videoList.length]);

  const currentVideo = videoList[currentIndex];
  const embedSrc = useMemo(() => {
    if (!currentVideo) return '';
    const extracted = extractEmbedSrc(currentVideo.embedCode);
    if (extracted) {
      if (isYouTubeUrl(extracted)) return normaliseYouTubeUrl(extracted);
      return normaliseVimeoUrl(extracted);
    }
    if (currentVideo.videoUrl) {
      const decodedUrl = decodeHtmlUrl(currentVideo.videoUrl);
      if (isYouTubeUrl(decodedUrl)) return normaliseYouTubeUrl(decodedUrl);
      return normaliseVimeoUrl(decodedUrl);
    }
    if (currentVideo.videoId && /^\d+$/.test(currentVideo.videoId)) {
      return normaliseVimeoUrl(`https://player.vimeo.com/video/${currentVideo.videoId}`);
    }
    return '';
  }, [currentVideo?.embedCode, currentVideo?.videoUrl, currentVideo?.videoId]);

  const externalVideoUrl = useMemo(
    () => resolveExternalVideoUrl(currentVideo, embedSrc),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentVideo?.videoId, currentVideo?.videoUrl, embedSrc]
  );

  // Aula agendada com data de liberação ainda no futuro → bloqueia o player
  const isLocked = useMemo(() => {
    if (!currentVideo) return false;
    if (currentVideo.status !== 'scheduled') return false;
    if (!currentVideo.releaseAt) return false;
    return new Date(currentVideo.releaseAt) > new Date();
  }, [currentVideo?.status, currentVideo?.releaseAt]);

  // Load stored progress when video changes.
  // Se não há progresso local (dispositivo nunca assistiu), busca do Supabase
  // e popula localStorage ANTES de inicializar o player — assim o seek funciona.
  // email está nas deps para re-buscar quando o Supabase auth resolve após o mount
  // (cenário: cookie válido mas sessionStorage/localStorage vazio → email chega async).
  useEffect(() => {
    if (!currentVideo?.videoId) return;
    const stored = getStoredProgress(currentVideo);
    if (stored && stored.watchedSeconds > 0) {
      setUiProgress({ watchedSeconds: stored.watchedSeconds, durationSeconds: stored.durationSeconds });
      return;
    }
    // Sem progresso local — tenta buscar do Supabase
    const uid = getCurrentUserId() || email;
    if (!uid) {
      setUiProgress({ watchedSeconds: 0, durationSeconds: 0 });
      return;
    }
    setUiProgress({ watchedSeconds: 0, durationSeconds: 0 });
    const videoId = currentVideo.videoId;
    fetchUserProgress(uid, 50).then(rows => {
      const row = rows.find(r => r.lesson_id === videoId);
      if (row && row.watched_seconds > 0) {
        // Persiste no localStorage
        const localKey = `fiveone_progress::${videoId}`;
        try {
          localStorage.setItem(localKey, JSON.stringify({
            watchedSeconds: row.watched_seconds,
            durationSeconds: row.duration_seconds || 0,
            lastAt: new Date(row.last_at).getTime(),
          }));
        } catch {}
        // Agenda seek para quando o player estiver pronto
        pendingSeekRef.current = row.watched_seconds;
        setUiProgress({
          watchedSeconds: row.watched_seconds,
          durationSeconds: row.duration_seconds || 0,
        });
        // Se o player já estiver disponível, faz o seek imediatamente
        try {
          if (youtubePlayerRef.current?.seekTo) {
            youtubePlayerRef.current.seekTo(row.watched_seconds, true);
          } else if (playerInstanceRef.current?.setCurrentTime) {
            void playerInstanceRef.current.setCurrentTime(row.watched_seconds);
          }
        } catch {}
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.videoId, email]);

  // Load favorite state when video changes
  useEffect(() => {
    if (!email || !currentVideo?.videoId) { setIsFav(false); return; }
    isFavorite(email, currentVideo.videoId).then(setIsFav).catch(() => setIsFav(false));
  }, [email, currentVideo?.videoId]);

  // Keyboard navigation (ArrowLeft/ArrowRight)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target.isContentEditable) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(prev + 1, videoList.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [videoList.length]);

  // Auto-play countdown effect
  useEffect(() => {
    if (!autoPlayPending) return;
    if (currentIndex >= videoList.length - 1) { setAutoPlayPending(false); return; }
    setAutoPlayPending(false);
    let count = 3;
    setAutoPlayCountdown(count);
    autoPlayIntervalRef.current = window.setInterval(() => {
      count -= 1;
      setAutoPlayCountdown(count > 0 ? count : null);
      if (count <= 0 && autoPlayIntervalRef.current) {
        window.clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }, 1000);
    autoPlayTimerRef.current = window.setTimeout(() => {
      setAutoPlayCountdown(null);
      setCurrentIndex(prev => prev + 1);
    }, 3500);
    return () => cancelAutoPlay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayPending]);

  // Player overlay reset on video change
  useLayoutEffect(() => {
    clearPlayerTimers();
    setPlayerMessage(null);
    setShowPlayerFallback(false);
    cleanupVimeoPlayer();
    cleanupYouTubePlayer(false);
    if (!currentVideo) return;
    setPlayerStatus('loading');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.videoId]);

  // Error if embedSrc stays invalid
  useEffect(() => {
    if (!currentVideo?.videoId) return;
    if (embedSrc && /^https?:\/\//i.test(embedSrc)) return;
    const t = window.setTimeout(() => {
      if (!embedSrc || !/^https?:\/\//i.test(embedSrc)) markPlayerError('Vídeo indisponível no momento.');
    }, 4000);
    return () => window.clearTimeout(t);
  }, [currentVideo?.videoId, embedSrc, markPlayerError]);

  // Loading timers
  useEffect(() => {
    if (!currentVideo) return;
    if (!embedSrc || embedSrc === 'about:blank' || !/^https?:\/\//i.test(embedSrc)) return;
    if (playerStatus !== 'loading') return;

    fallbackTimerRef.current = window.setTimeout(() => setShowPlayerFallback(true), 8000);

    const slowMessage = (() => {
      const base = 'O player está demorando para carregar. Tente recarregar ou abrir em outra aba.';
      if (/vimeo\.com/i.test(embedSrc)) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        if (host === 'localhost' || host === '127.0.0.1')
          return `${base} Em localhost isso pode acontecer se o Vimeo estiver com restrição de embed por domínio (whitelist).`;
      }
      return base;
    })();

    errorTimerRef.current = window.setTimeout(() => {
      setPlayerStatus(prev => (prev === 'loading' ? 'error' : prev));
      setPlayerMessage(prev => prev || slowMessage);
      setShowPlayerFallback(true);
    }, 25000);

    return () => clearPlayerTimers();
  }, [currentVideo?.videoId, embedSrc, playerReloadKey, playerStatus, clearPlayerTimers]);

  // ── persistProgress ────────────────────────────────────────────────────────
  const persistProgress = useCallback(
    (rawWatched: number, rawDuration?: number) => {
      const lesson = videoList[currentIndex];
      if (!lesson) return;
      const keyBase = lesson.videoId;
      if (!keyBase) return;

      const stored = getStoredProgress(lesson);
      const safeDurationSource = Number.isFinite(rawDuration) && (rawDuration || 0) > 0 ? rawDuration || 0 : stored?.durationSeconds || 0;
      const safeWatched = Number.isFinite(rawWatched) ? Math.max(0, rawWatched) : 0;
      const effectiveDuration = safeDurationSource > 0 ? safeDurationSource : safeWatched > 0 ? safeWatched : 0;
      const clampedWatched = effectiveDuration > 0 ? Math.min(safeWatched, effectiveDuration) : safeWatched;
      const durationSeconds = effectiveDuration > 0 ? effectiveDuration : clampedWatched;
      const watchedSeconds = clampedWatched;
      const storedWatched = Number(stored?.watchedSeconds || 0);
      const hasRealProgress = watchedSeconds > 0 || storedWatched > 0;
      const now = Date.now();
      const key = `fiveone_progress::${keyBase}`;
      const payload: StoredProgress = {
        watchedSeconds,
        durationSeconds,
        lastAt: hasRealProgress ? now : Number(stored?.lastAt || 0),
      };
      try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}
      setUiProgress({ watchedSeconds, durationSeconds });

      const bannerContinue = lesson.bannerContinue;
      const bannerPlayer = lesson.bannerPlayer;
      const bannerMobile = lesson.bannerMobile;
      const resolvedBannerContinue = bannerContinue?.url || bannerContinue?.dataUrl || null;
      const resolvedBannerPlayer = bannerPlayer?.url || bannerPlayer?.dataUrl || null;
      const resolvedBannerMobile = bannerMobile?.url || bannerMobile?.dataUrl || null;
      const previewImage =
        (isMobile ? resolvedBannerMobile || resolvedBannerContinue : resolvedBannerContinue || resolvedBannerPlayer) ||
        resolvedBannerMobile || lesson.thumbnailUrl || '/assets/images/miniatura_fundamentos_mestre.png';

      // Atualiza ref de flush para garantir save mesmo sem os 15s do throttle
      if (watchedSeconds > 0) {
        unmountFlushRef.current = {
          watchedSeconds, durationSeconds,
          lessonId: keyBase, lessonTitle: lesson.title, thumbnail: previewImage,
        };
      }

      const currentVideoData = {
        title: lesson.title,
        thumbnail: previewImage,
        url: lesson.videoId,
        index: currentIndex,
        id: lesson.videoId,
        sourceUrl: lesson.videoUrl || null,
        subjectName: lesson.subjectName,
        subjectId: lesson.subjectId,
        bannerContinue: resolvedBannerContinue,
        bannerMobile: resolvedBannerMobile,
        watchedSeconds,
        durationSeconds,
        lastAt: now,
      };

      try {
        if (lesson.videoId && completedIds.has(lesson.videoId)) {
          const existingRaw = localStorage.getItem('videos_assistidos');
          if (existingRaw) {
            const arr = JSON.parse(existingRaw);
            if (Array.isArray(arr)) {
              const filtered = arr.filter((video: any) => {
                const k = video.id || video.videoId || video.url;
                if (!k) return true;
                return k !== lesson.videoId && k !== lesson.videoUrl;
              });
              localStorage.setItem('videos_assistidos', JSON.stringify(filtered));
            }
          }
        } else if (hasRealProgress) {
          const existingWatchedRaw = localStorage.getItem('videos_assistidos');
          const existingWatched = existingWatchedRaw ? JSON.parse(existingWatchedRaw) : [];
          const filteredWatched = Array.isArray(existingWatched)
            ? existingWatched.filter((video: any) => {
                const k = video?.id || video?.videoId || video?.video_id || video?.url;
                if (!k) return true;
                if (k === lesson.videoId) return false;
                if (lesson.videoUrl && k === lesson.videoUrl) return false;
                return true;
              })
            : [];
          localStorage.setItem('videos_assistidos', JSON.stringify([currentVideoData, ...filteredWatched].slice(0, 12)));
        }
      } catch {}

      const userId = getCurrentUserId() || emailRef.current;
      if (userId && watchedSeconds > 0) {
        const syncKey = `fiveone_progress_sync_${lesson.videoId}`;
        const lastSync = Number(sessionStorage.getItem(syncKey) || 0);
        if (now - lastSync > 5000) {
          sessionStorage.setItem(syncKey, String(now));
          upsertProgress({
            user_id: userId,
            lesson_id: lesson.videoId,
            last_at: new Date(now).toISOString(),
            watched_seconds: watchedSeconds,
            duration_seconds: durationSeconds || null,
            title: lesson.title,
            thumbnail: previewImage,
          }).catch(() => {});
        }
      }

      const completionDuration = safeDurationSource > 0
        ? safeDurationSource
        : typeof lesson.durationMinutes === 'number' && lesson.durationMinutes > 0
          ? lesson.durationMinutes * 60
          : 0;

      if (lesson.videoId && completionDuration > 0) {
        const threshold = Math.max(completionDuration - 5, completionDuration * 0.97);
        if (watchedSeconds >= threshold && !completedIds.has(lesson.videoId)) {
          const next = new Set(completedIds);
          next.add(lesson.videoId);
          setCompletedIds(next);
          setLessonCompleted(lesson.videoId, { previousWatched: watchedSeconds, previousDuration: completionDuration });
          try {
            const existingRaw = localStorage.getItem('videos_assistidos');
            if (existingRaw) {
              const arr = JSON.parse(existingRaw);
              if (Array.isArray(arr)) {
                const filtered = arr.filter((video: any) => {
                  const k = video.id || video.videoId || video.url;
                  if (!k) return true;
                  return k !== lesson.videoId && k !== lesson.videoUrl;
                });
                localStorage.setItem('videos_assistidos', JSON.stringify(filtered));
              }
            }
          } catch {}
          const uid = getCurrentUserId() || emailRef.current;
          if (uid) upsertCompletion(uid, lesson.videoId).catch(() => {});
          syncCompletedIds();
          // Trigger auto-play for next lesson
          if (autoPlayRef.current && currentIndex < videoList.length - 1 && !autoPlayTriggeredRef.current) {
            autoPlayTriggeredRef.current = true;
            setAutoPlayPending(true);
          }
          // Curso 100% concluído? Compara contra TODAS as aulas do curso (não só do módulo atual).
          if (allCourseLessonIds.length > 0 && allCourseLessonIds.every(id => next.has(id))) {
            setShowCourseComplete(true);
            const uid2 = getCurrentUserId() || emailRef.current;
            if (uid2 && ministryId) triggerCertificate(ministryId, uid2);
          }
        }
      }
    },
    [videoList, currentIndex, isMobile, completedIds, setCompletedIds, syncCompletedIds, ministryId, triggerCertificate, allCourseLessonIds],
  );
  persistProgressRef.current = persistProgress;

  // Flush imediato ao desmontar — salva progresso mesmo se o usuário saiu
  // antes dos 15s do throttle dispararem (ex: assistiu 10s e voltou).
  // Usa emailRef.current (não email) para evitar closure stale — email pode ser null
  // no mount se o Supabase Auth ainda está resolvendo.
  useEffect(() => {
    return () => {
      const { watchedSeconds, durationSeconds, lessonId, lessonTitle, thumbnail } = unmountFlushRef.current;
      if (!lessonId || watchedSeconds <= 0) return;
      const uid = getCurrentUserId() || emailRef.current;
      if (!uid) return;
      upsertProgress({
        user_id: uid,
        lesson_id: lessonId,
        last_at: new Date().toISOString(),
        watched_seconds: watchedSeconds,
        duration_seconds: durationSeconds || null,
        title: lessonTitle,
        thumbnail,
      }).catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva progresso quando o usuário sai da aba / minimiza o app / fecha o browser.
  // Usa emailRef.current para nunca ter closure stale (email pode ser null no mount
  // quando Supabase auth ainda está resolvendo). pagehide cobre iOS Safari que nem
  // sempre dispara visibilitychange no fechamento.
  useEffect(() => {
    const flush = () => {
      const { watchedSeconds, durationSeconds, lessonId, lessonTitle, thumbnail } = unmountFlushRef.current;
      if (!lessonId || watchedSeconds <= 0) return;
      const uid = getCurrentUserId() || emailRef.current;
      if (!uid) return;
      upsertProgress({
        user_id: uid,
        lesson_id: lessonId,
        last_at: new Date().toISOString(),
        watched_seconds: watchedSeconds,
        duration_seconds: durationSeconds || null,
        title: lessonTitle,
        thumbnail,
      }).catch(() => {});
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flush);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Background periodic progress sync (30s) ───────────────────────────────
  // Garante que o progresso chega ao Supabase mesmo se o player parar de emitir
  // eventos (ex: usuário pausou e saiu sem assistir mais). Usa refs para
  // nunca ter closure stale.
  useEffect(() => {
    const id = window.setInterval(() => {
      const { watchedSeconds, durationSeconds, lessonId, lessonTitle, thumbnail } = unmountFlushRef.current;
      if (!lessonId || watchedSeconds <= 0) return;
      const uid = getCurrentUserId() || emailRef.current;
      if (!uid) return;
      upsertProgress({
        user_id: uid,
        lesson_id: lessonId,
        last_at: new Date().toISOString(),
        watched_seconds: watchedSeconds,
        duration_seconds: durationSeconds || null,
        title: lessonTitle,
        thumbnail,
      }).catch(() => {});
    }, 30_000);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((message: string, tone: 'success' | 'error' | 'info' = 'info') => {
    setToastState({ message, tone });
  }, []);

  // ── Rastreia última aula aberta (para "Retomar aula" em plataforma.tsx) ───
  // Salva o videoId da aula atual SEMPRE que ela muda, independente de assistir.
  // Também garante que videos_assistidos tenha essa aula com lastAt recente.
  useEffect(() => {
    const lesson = videoList[currentIndex];
    if (!lesson?.videoId) return;
    const LAST_KEY = 'fiveone_last_lesson';
    try { localStorage.setItem(LAST_KEY, lesson.videoId); } catch {}
    // Atualiza lastAt em videos_assistidos para manter a ordem correta no carousel
    try {
      const now = Date.now();
      const raw = localStorage.getItem('videos_assistidos');
      const arr: any[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      const keyMatch = (v: any) => v?.id === lesson.videoId || v?.videoId === lesson.videoId || v?.video_id === lesson.videoId || v?.url === lesson.videoId;
      const existing = arr.find(keyMatch);
      // Resolve thumbnail inline (sem depender de resolveLessonAssets callback)
      const bc = lesson.bannerContinue;
      const bm = lesson.bannerMobile;
      const bp = lesson.bannerPlayer;
      const resolvedBc = bc?.url || bc?.dataUrl || null;
      const resolvedBm = bm?.url || bm?.dataUrl || null;
      const resolvedBp = bp?.url || bp?.dataUrl || null;
      const thumb = resolvedBc || resolvedBp || resolvedBm || lesson.thumbnailUrl || '/assets/images/miniatura_fundamentos_mestre.png';

      if (!existing) {
        // Ainda não estava na lista → adiciona para que ao abrir em outro
        // dispositivo já apareça no "Continuar Assistindo"
        const entry = {
          id: lesson.videoId, url: lesson.videoId, index: currentIndex,
          title: lesson.title, thumbnail: thumb,
          watchedSeconds: 0, durationSeconds: undefined,
          subjectName: lesson.subjectName, subjectId: lesson.subjectId,
          bannerContinue: resolvedBc, bannerMobile: resolvedBm,
          lastAt: now,
        };
        localStorage.setItem('videos_assistidos', JSON.stringify([entry, ...arr].slice(0, 12)));
      } else {
        const updated = [
          { ...existing, lastAt: now },
          ...arr.filter(v => !keyMatch(v)),
        ];
        localStorage.setItem('videos_assistidos', JSON.stringify(updated.slice(0, 12)));
      }

      // Sincroniza com Supabase ao abrir a aula, mas NUNCA com watched_seconds=0
      // pois isso destruiria o progresso salvo em outro dispositivo.
      // Só enviamos se já temos progresso local real (> 0).
      const uid = getCurrentUserId() || emailRef.current;
      if (uid && lesson.videoId) {
        const stored = getStoredProgress(lesson);
        const localWatched = Number(stored?.watchedSeconds || 0);
        if (localWatched > 0) {
          // Tem progresso local → sync normal
          upsertProgress({
            user_id: uid,
            lesson_id: lesson.videoId,
            last_at: new Date(now).toISOString(),
            watched_seconds: localWatched,
            duration_seconds: stored?.durationSeconds || null,
            title: lesson.title,
            thumbnail: thumb,
          }).catch(() => {});
        } else {
          // Sem progresso local → busca do Supabase e popula localStorage
          // (cenário: celular abrindo aula que foi assistida no PC)
          import('../services/progress').then(({ fetchUserProgress }) => {
            fetchUserProgress(uid, 50).then(rows => {
              const row = rows.find(r => r.lesson_id === lesson.videoId);
              if (row && row.watched_seconds > 0) {
                const key = `fiveone_progress::${lesson.videoId}`;
                try {
                  localStorage.setItem(key, JSON.stringify({
                    watchedSeconds: row.watched_seconds,
                    durationSeconds: row.duration_seconds || 0,
                    lastAt: new Date(row.last_at).getTime(),
                  }));
                } catch {}
                // Agenda seek para quando o player estiver pronto
                pendingSeekRef.current = row.watched_seconds;
                // Atualiza a UI de progresso
                setUiProgress({
                  watchedSeconds: row.watched_seconds,
                  durationSeconds: row.duration_seconds || 0,
                });
                // Se o player já estiver disponível, faz o seek imediatamente
                try {
                  if (youtubePlayerRef.current?.seekTo) {
                    youtubePlayerRef.current.seekTo(row.watched_seconds, true);
                  } else if (playerInstanceRef.current?.setCurrentTime) {
                    void playerInstanceRef.current.setCurrentTime(row.watched_seconds);
                  }
                } catch {}
              }
            }).catch(() => {});
          }).catch(() => {});
        }
      }
    } catch {}
  }, [currentIndex, videoList]);

  // ── Seek (timestamp das notas → posição no vídeo) ─────────────────────────
  const handleSeek = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return;
    try {
      if (currentVideo?.sourceType === 'YOUTUBE' && youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo?.(seconds, true);
      } else if (currentVideo?.sourceType === 'VIMEO' && playerInstanceRef.current) {
        void playerInstanceRef.current.setCurrentTime(seconds);
      }
    } catch { /* ignore */ }
  }, [currentVideo?.sourceType]);

  const handleFavoriteToggle = async () => {
    if (!email || !currentVideo?.videoId || isFavLoading) return;
    const prev = isFav;
    setIsFav(!prev);
    setIsFavLoading(true);
    try {
      await toggleFavorite(email, currentVideo.videoId, prev);
    } catch {
      setIsFav(prev);
    } finally {
      setIsFavLoading(false);
    }
  };

  const resolveLessonAssets = useCallback((lesson: LessonRef) => {
    const bannerContinue = lesson.bannerContinue;
    const bannerPlayer = lesson.bannerPlayer;
    const bannerMobile = lesson.bannerMobile;
    const resolvedBannerContinue = bannerContinue?.url || bannerContinue?.dataUrl || null;
    const resolvedBannerPlayer = bannerPlayer?.url || bannerPlayer?.dataUrl || null;
    const resolvedBannerMobile = bannerMobile?.url || bannerMobile?.dataUrl || null;
    const previewImage =
      resolvedBannerContinue || resolvedBannerPlayer || resolvedBannerMobile ||
      lesson.thumbnailUrl || '/assets/images/miniatura_fundamentos_mestre.png';
    return { previewImage, resolvedBannerContinue, resolvedBannerMobile };
  }, []);

  const resetLessonProgress = useCallback((lesson: LessonRef, index: number, durationSeconds?: number) => {
    const base = lesson.videoId;
    if (!base) return;
    const now = Date.now();
    const duration = typeof durationSeconds === 'number' && durationSeconds > 0 ? durationSeconds : 0;
    const payload: StoredProgress = { watchedSeconds: 0, durationSeconds: duration, lastAt: now };
    try { localStorage.setItem(`fiveone_progress::${base}`, JSON.stringify(payload)); } catch {}
    try {
      const { previewImage, resolvedBannerContinue, resolvedBannerMobile } = resolveLessonAssets(lesson);
      const entry = {
        title: lesson.title, thumbnail: previewImage, url: lesson.videoId, index, id: lesson.videoId,
        sourceUrl: lesson.videoUrl || null, subjectName: lesson.subjectName, subjectId: lesson.subjectId,
        bannerContinue: resolvedBannerContinue, bannerMobile: resolvedBannerMobile,
        watchedSeconds: 0, durationSeconds: duration, lastAt: now,
      };
      const existingRaw = localStorage.getItem('videos_assistidos');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = Array.isArray(existing)
        ? existing.filter((video: any) => {
            const k = video?.id || video?.videoId || video?.video_id || video?.url;
            if (!k) return true;
            if (k === lesson.videoId) return false;
            if (lesson.videoUrl && k === lesson.videoUrl) return false;
            return true;
          })
        : [];
      filtered.unshift(entry);
      localStorage.setItem('videos_assistidos', JSON.stringify(filtered.slice(0, 12)));
    } catch {}
  }, [resolveLessonAssets]);

  const handleMarkAsCompleted = async () => {
    const lesson = videoList[currentIndex];
    if (!lesson || !lesson.videoId) return;
    const lessonId = lesson.videoId;

    if (completedIds.has(lessonId)) {
      const lessonSnapshot = lesson;
      const indexSnapshot = currentIndex;
      setConfirmState({
        title: 'Marcar como não concluída',
        message: 'Essa aula voltará para "Continuar assistindo" com o progresso zerado. Deseja confirmar?',
        cancelLabel: 'Cancelar',
        confirmLabel: 'Marcar como não concluída',
        onConfirm: async () => {
          setConfirmState(null);
          const uid = getCurrentUserId() || email;
          setCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(lessonSnapshot.videoId);
            return next;
          });
          const removal = removeLessonCompleted(lessonSnapshot.videoId);
          const stored = getStoredProgress(lessonSnapshot);
          const durationGuess = removal.removed?.previousDuration
            ?? stored?.durationSeconds
            ?? (typeof lessonSnapshot.durationMinutes === 'number' ? lessonSnapshot.durationMinutes * 60 : 0);
          resetLessonProgress(lessonSnapshot, indexSnapshot, durationGuess);

          if (playerInstanceRef.current) {
            try { await playerInstanceRef.current.setCurrentTime(0); await playerInstanceRef.current.pause(); } catch {}
          } else if (youtubePlayerRef.current) {
            try { youtubePlayerRef.current.seekTo?.(0, true); youtubePlayerRef.current.pauseVideo?.(); } catch {}
          } else if (embedSrc) {
            const iframe = videoRef.current?.querySelector('iframe');
            if (iframe) iframe.setAttribute('src', embedSrc);
          }
          if (uid) {
            try { await deleteCompletion(uid, lessonSnapshot.videoId); } catch {}
            deleteProgressForUserVideo(uid, lessonSnapshot.videoId).catch(() => {});
          }
          syncCompletedIds();
          showToast('Aula marcada como não concluída.', 'info');
        },
      });
      return;
    }

    const uid = getCurrentUserId() || email;
    const storedProgress = getStoredProgress(lesson);
    let duration = storedProgress?.durationSeconds ?? null;
    if ((!duration || duration <= 0) && lesson.sourceType === 'VIMEO' && playerInstanceRef.current) {
      try {
        const fetched = await playerInstanceRef.current.getDuration();
        if (typeof fetched === 'number' && fetched > 0) duration = fetched;
      } catch {}
    }
    if ((!duration || duration <= 0) && typeof lesson.durationMinutes === 'number') {
      duration = lesson.durationMinutes * 60;
    }

    const watchedBefore = storedProgress?.watchedSeconds ?? null;
    const total = duration && duration > 0 ? duration : watchedBefore ?? 0;

    setCompletedIds((prev) => { const next = new Set(prev); next.add(lessonId); return next; });
    setLessonCompleted(lessonId, {
      previousWatched: watchedBefore,
      previousDuration: storedProgress?.durationSeconds ?? duration ?? null,
    });

    if (total > 0) persistProgress(total, duration ?? undefined);
    if (uid) { try { await upsertCompletion(uid, lessonId); } catch {} }
    syncCompletedIds();
    showToast('Aula marcada como concluída.', 'success');
    // Curso 100% concluído? Compara contra TODAS as aulas do curso (não só do módulo atual).
    const nextCompletedCheck = new Set(completedIds);
    nextCompletedCheck.add(lessonId);
    if (allCourseLessonIds.length > 0 && allCourseLessonIds.every(id => nextCompletedCheck.has(id))) {
      setShowCourseComplete(true);
      const uidCheck = uid || getCurrentUserId() || email;
      if (uidCheck && ministryId) triggerCertificate(ministryId, uidCheck);
    }
  };

  // Load completions from server — re-roda quando email resolve (cenário: auth async)
  useEffect(() => {
    const uid = getCurrentUserId() || email;
    if (!uid) return;
    (async () => {
      try {
        const list = await fetchCompletionsForUser(uid);
        const merged = mergeCompletedLessons(list);
        setCompletedIds(new Set(merged.keys()));
      } catch {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const navigate = useNavigate();

  // Keep URL canonical
  useEffect(() => {
    const lesson = videoList[currentIndex];
    if (!lesson?.videoId) return;
    const params = new URLSearchParams(searchKey);
    const currentVid = params.get('vid');
    const hasLegacy = params.has('i') || params.has('v');
    if (!hasLegacy && currentVid === lesson.videoId) return;
    navigate(`/curso/${ministryId}/aula?vid=${encodeURIComponent(lesson.videoId)}`, { replace: true });
  }, [videoList, currentIndex, searchKey, navigate]);

  // Subjects for filter
  const subjects: SubjectOption[] = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    videoList.forEach((v) => {
      const id = (v.subjectId && v.subjectId.trim()) || slugify(v.subjectName || '');
      if (!id) return;
      const name = v.subjectName || v.subjectId || id;
      const entry = counts.get(id);
      if (entry) { entry.count += 1; if (name && entry.name !== name) entry.name = name; }
      else counts.set(id, { name, count: 1 });
    });
    const arr = Array.from(counts.entries()).map(([id, info]) => ({ id, name: info.name, count: info.count }));
    arr.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
    return [{ id: 'all', name: 'Todas', count: videoList.length }, ...arr];
  }, [videoList]);

  const [filterSubject, setFilterSubject] = useState<string>('all');

  const filteredList = useMemo(() => {
    if (filterSubject === 'all') return videoList;
    return videoList.filter((v) => {
      const id = (v.subjectId && v.subjectId.trim()) || slugify(v.subjectName || '');
      return id === filterSubject;
    });
  }, [videoList, filterSubject]);

  const groupedList = useMemo(() => {
    type SidebarGroup = { moduleTitle: string; moduleOrder: number; items: { video: LessonRef; globalIndex: number }[] };
    const groups: SidebarGroup[] = [];
    const groupMap = new Map<string, SidebarGroup>();
    filteredList.forEach((video) => {
      let globalIndex = videoList.findIndex((v) => v.videoId === video.videoId);
      if (globalIndex === -1) {
        const fallbackKey = video.videoUrl || video.id || null;
        if (fallbackKey) globalIndex = videoList.findIndex((v) => v.videoUrl === fallbackKey || v.id === fallbackKey);
      }
      if (globalIndex === -1) return;
      const key = video.moduleId || video.moduleTitle || 'default';
      if (!groupMap.has(key)) {
        const group: SidebarGroup = { moduleTitle: video.moduleTitle || 'Módulo', moduleOrder: video.moduleOrder ?? 0, items: [] };
        groupMap.set(key, group);
        groups.push(group);
      }
      groupMap.get(key)!.items.push({ video, globalIndex });
    });
    groups.sort((a, b) => a.moduleOrder - b.moduleOrder);
    return groups;
  }, [filteredList, videoList]);

  // Scroll sidebar to top when filter changes
  useEffect(() => { sidebarListRef.current?.scrollTo({ top: 0 }); }, [filterSubject]);

  const currentLessonKey = useMemo(() => currentVideo?.videoId || '', [currentVideo?.videoId]);

  const handleNext = () => { if (currentIndex < videoList.length - 1) setCurrentIndex(currentIndex + 1); };
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  // ── Vimeo player effect ───────────────────────────────────────────────────
  useEffect(() => {
    const lesson = currentVideo;
    const vimeoSrc = embedSrc;
    if (!lesson || lesson.sourceType !== 'VIMEO' || !vimeoSrc || !/vimeo\.com/i.test(vimeoSrc)) {
      cleanupVimeoPlayer(); return;
    }
    // Não inicializa player para aulas ainda bloqueadas
    if (lesson.status === 'scheduled' && !!lesson.releaseAt && new Date(lesson.releaseAt) > new Date()) {
      cleanupVimeoPlayer(); return;
    }
    let cancelled = false;
    lastProgressFlushRef.current = 0;
    (async () => {
      try {
        let iframe: HTMLIFrameElement | null = null;
        for (let attempt = 0; attempt < 60; attempt++) {
          iframe = getPlayerIframe();
          if (iframe) break;
          await new Promise(resolve => window.setTimeout(resolve, 100));
          if (cancelled) return;
        }
        if (!iframe) return;
        const { default: Player } = await import('@vimeo/player');
        if (cancelled) return;
        cleanupVimeoPlayer();
        const player = new Player(iframe);
        playerInstanceRef.current = player;

        player.ready().then(async () => {
          if (cancelled) return;
          markPlayerReady();
          try { await player.pause(); } catch {}
        }).catch(() => {});

        const stored = getStoredProgress(lesson);
        let pendingResume = stored?.watchedSeconds || 0;

        const tryResume = async (durationHint?: number) => {
          if (!pendingResume || pendingResume <= 5) return;
          const duration = Number.isFinite(durationHint) && durationHint ? durationHint : stored?.durationSeconds || 0;
          const maxSeek = duration > 6 ? Math.max(0, duration - 2) : undefined;
          const target = maxSeek !== undefined ? Math.min(pendingResume, maxSeek) : pendingResume;
          if (target > 5) { try { await player.setCurrentTime(target); } catch {} }
          pendingResume = 0;
        };

        player.on('loaded', (data: any) => {
          lastProgressFlushRef.current = 0;
          markPlayerReady();
          tryResume(Number(data?.duration)).catch(() => {});
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          if (duration > 0) {
            if ((stored?.watchedSeconds || 0) > 0) {
              persistProgressRef.current?.(stored?.watchedSeconds || 0, duration);
            } else {
              setUiProgress((prev) => ({ watchedSeconds: 0, durationSeconds: duration > 0 ? duration : prev.durationSeconds }));
            }
          }
        });

        player.on('durationchange', (data: any) => { tryResume(Number(data?.duration)).catch(() => {}); });
        player.on('timeupdate', (data: any) => {
          const now = Date.now();
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          if (now - lastProgressFlushRef.current >= 5000) {
            lastProgressFlushRef.current = now;
            persistProgressRef.current?.(Number(data?.seconds || 0), duration);
          }
        });
        player.on('seeked', (data: any) => {
          lastProgressFlushRef.current = Date.now();
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          persistProgressRef.current?.(Number(data?.seconds || 0), duration);
        });
        player.on('ended', async () => {
          lastProgressFlushRef.current = Date.now();
          let duration = stored?.durationSeconds || 0;
          try { duration = await player.getDuration(); } catch {}
          persistProgressRef.current?.(duration || stored?.durationSeconds || 0, duration || stored?.durationSeconds || 0);
        });
        player.on('error', (err: any) => {
          console.warn('Erro no player Vimeo', err);
          markPlayerError('O Vimeo não conseguiu carregar este vídeo.');
        });
      } catch (error) {
        console.warn('Falha ao inicializar player Vimeo', error);
        markPlayerError('Falha ao inicializar o player do Vimeo.');
      }
    })();
    return () => { cancelled = true; cleanupVimeoPlayer(); };
  }, [currentVideo?.videoId, currentVideo?.sourceType, embedSrc, playerReloadKey, markPlayerReady, markPlayerError, cleanupVimeoPlayer, getPlayerIframe]);

  // ── YouTube player effect ─────────────────────────────────────────────────
  useEffect(() => {
    const lesson = currentVideo;
    const youtubeSrc = embedSrc;
    if (!lesson || lesson.sourceType !== 'YOUTUBE' || !youtubeSrc || !isYouTubeUrl(youtubeSrc)) {
      cleanupYouTubePlayer(false); return;
    }
    // Não inicializa player para aulas ainda bloqueadas
    if (lesson.status === 'scheduled' && !!lesson.releaseAt && new Date(lesson.releaseAt) > new Date()) {
      cleanupYouTubePlayer(false); return;
    }
    let cancelled = false;
    lastProgressFlushRef.current = 0;
    (async () => {
      try {
        await ensureYouTubeApi();
        if (cancelled) return;
        let iframe: HTMLIFrameElement | null = null;
        for (let attempt = 0; attempt < 60; attempt++) {
          iframe = getPlayerIframe();
          if (iframe) break;
          await new Promise(resolve => window.setTimeout(resolve, 100));
          if (cancelled) return;
        }
        if (!iframe) return;
        cleanupYouTubePlayer(false);
        const stored = getStoredProgress(lesson);
        let pendingResume = stored?.watchedSeconds || 0;

        const player = new window.YT.Player(iframe, {
          events: {
            onReady: (event: any) => {
              if (cancelled) return;
              markPlayerReady();
              const duration = Number(event?.target?.getDuration?.() || stored?.durationSeconds || 0);
              if (duration > 0) {
                if ((stored?.watchedSeconds || 0) > 0) {
                  persistProgressRef.current?.(stored?.watchedSeconds || 0, duration);
                } else {
                  setUiProgress((prev) => ({ watchedSeconds: 0, durationSeconds: duration > 0 ? duration : prev.durationSeconds }));
                }
              } else if (stored) {
                setUiProgress({ watchedSeconds: stored.watchedSeconds, durationSeconds: stored.durationSeconds });
              }
              if (pendingResume && pendingResume > 5) {
                const maxSeek = duration > 6 ? Math.max(0, duration - 2) : null;
                const target = maxSeek !== null ? Math.min(pendingResume, maxSeek) : pendingResume;
                if (target > 5) {
                  try {
                    const resumeVideoId = extractYouTubeVideoId(youtubeSrc);
                    if (resumeVideoId) event.target.cueVideoById?.({ videoId: resumeVideoId, startSeconds: target });
                    else event.target.seekTo?.(target, true);
                  } catch { try { event.target.seekTo?.(target, true); } catch {} }
                }
              }
              try { event.target.pauseVideo?.(); } catch {}
              pendingResume = 0;
            },
            onStateChange: (event: any) => {
              const state = Number(event?.data);
              const playing = state === window.YT?.PlayerState?.PLAYING;
              const paused = state === window.YT?.PlayerState?.PAUSED;
              const ended = state === window.YT?.PlayerState?.ENDED;
              const buffering = state === window.YT?.PlayerState?.BUFFERING;
              if (!youtubePlayerRef.current) return;

              const tick = (forcePersist: boolean) => {
                try {
                  const currentTime = Number(youtubePlayerRef.current.getCurrentTime?.() || 0);
                  const duration = Number(youtubePlayerRef.current.getDuration?.() || stored?.durationSeconds || 0);
                  if (!Number.isFinite(currentTime) || currentTime < 0) return;
                  setUiProgress((prev) => ({ watchedSeconds: currentTime, durationSeconds: duration > 0 ? duration : prev.durationSeconds }));
                  if (forcePersist) {
                    lastProgressFlushRef.current = Date.now();
                    persistProgressRef.current?.(currentTime, duration);
                    return;
                  }
                  const now = Date.now();
                  if (now - lastProgressFlushRef.current >= 5000) {
                    lastProgressFlushRef.current = now;
                    persistProgressRef.current?.(currentTime, duration);
                  }
                } catch {}
              };

              const startPolling = () => {
                if ((youtubePlayerRef.current as any).__fiveonePoll) return;
                (youtubePlayerRef.current as any).__fiveonePoll = window.setInterval(() => tick(false), 1000);
                tick(false);
              };
              const stopPolling = (flush: boolean) => {
                const id = (youtubePlayerRef.current as any).__fiveonePoll as number | undefined;
                if (id) window.clearInterval(id);
                delete (youtubePlayerRef.current as any).__fiveonePoll;
                if (flush) tick(true);
              };

              if (playing || buffering) startPolling();
              else if (paused) stopPolling(true);
              else if (ended) {
                stopPolling(false);
                try {
                  const currentTime = Number(youtubePlayerRef.current.getCurrentTime?.() || 0);
                  const duration = Number(youtubePlayerRef.current.getDuration?.() || stored?.durationSeconds || 0);
                  const finalTime = duration > 0 ? duration : currentTime;
                  if (finalTime > 0) persistProgressRef.current?.(finalTime, duration || undefined);
                } catch {}
              } else stopPolling(false);
            },
            onError: (event: any) => {
              console.warn('Erro no player YouTube', event);
              markPlayerError('O YouTube não conseguiu carregar este vídeo.');
            },
          },
        });
        youtubePlayerRef.current = player;
      } catch (error) {
        console.warn('Falha ao inicializar player YouTube', error);
        markPlayerError('Falha ao inicializar o player do YouTube.');
      }
    })();
    return () => { cancelled = true; cleanupYouTubePlayer(false); };
  }, [currentVideo?.videoId, currentVideo?.sourceType, embedSrc, playerReloadKey, markPlayerReady, markPlayerError, getPlayerIframe, cleanupYouTubePlayer]);

  // ── JSX ───────────────────────────────────────────────────────────────────
  const heroBanner = currentVideo?.bannerPlayer?.url || currentVideo?.bannerPlayer?.dataUrl;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-navy pb-16">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

          {/* Empty state */}
          {!videoList.length && (
            <div className="max-w-2xl">
              <button
                onClick={() => navigate(`/curso/${ministryId}/modulos`)}
                className="flex items-center gap-1.5 text-sm text-slate hover:text-mint transition-colors"
              >
                ← Voltar aos Módulos
              </button>
              <h2 className="text-xl font-bold text-slate-white mt-4">Conteúdo em preparação</h2>
              <p className="text-slate mt-3 text-sm">
                Nenhuma aula publicada para este curso ainda. Assim que novas aulas forem disponibilizadas, elas aparecerão aqui automaticamente.
              </p>
            </div>
          )}

          {isModuloAberto && currentVideo && (
            <div className={`flex flex-col gap-4 lg:gap-6 ${!theaterMode ? 'lg:flex-row lg:items-start' : ''}`}>

              {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                {/* Back button */}
                <button
                  onClick={() => navigate(`/curso/${ministryId}/modulos`)}
                  className="flex items-center gap-1.5 text-sm text-slate hover:text-mint transition-colors"
                >
                  ← Voltar aos Módulos
                </button>

                {/* Banner */}
                {heroBanner && (
                  <div className="mt-4 rounded-xl overflow-hidden">
                    <img src={heroBanner} alt={`Banner da aula ${currentVideo.title}`} className="w-full object-cover" />
                  </div>
                )}

                {/* Title + subject */}
                <h2 className="text-xl font-bold text-slate-white mt-4 leading-snug">{currentVideo.title}</h2>
                {(currentVideo.subjectName || currentVideo.instructor) && (
                  <p className="text-sm text-slate mt-1">
                    {[currentVideo.subjectName, currentVideo.instructor].filter(Boolean).join(' • ')}
                  </p>
                )}

                {/* Video container */}
                <div
                  ref={videoRef}
                  className={`relative aspect-video rounded-xl overflow-hidden bg-navy-lighter mt-3 ${
                    playerStatus !== 'ready' ? 'ring-1 ring-slate/10' : ''
                  }`}
                >
                  <DeferredIframe
                    key={`${currentIndex}-${playerReloadKey}`}
                    src={embedSrc || 'about:blank'}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onReady={markPlayerReady}
                    onError={markPlayerError}
                    className="absolute inset-0 w-full h-full"
                  />

                  {/* Player loading/error overlay */}
                  {playerStatus !== 'ready' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-lighter/95 z-10 gap-4 p-6" role="status" aria-live="polite">
                      {playerStatus === 'loading' && (
                        <svg className="w-10 h-10 text-mint animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      )}
                      <p className="text-slate-white font-medium text-sm text-center">
                        {playerStatus === 'error' ? 'Não foi possível carregar o vídeo' : 'Carregando vídeo…'}
                      </p>
                      {playerMessage && (
                        <p className="text-slate text-xs text-center max-w-xs leading-relaxed">{playerMessage}</p>
                      )}
                      {import.meta.env.DEV && !!embedSrc && (
                        <pre className="text-xs text-slate/60 max-w-xs break-all text-left border border-slate/10 rounded p-2 bg-navy/50">
                          {embedSrc.slice(0, 120)}{embedSrc.length > 120 ? '…' : ''}
                        </pre>
                      )}
                      {(showPlayerFallback || playerStatus === 'error') && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            type="button"
                            onClick={handleReloadPlayer}
                            className="px-4 py-2 text-sm bg-mint text-navy rounded-lg font-medium hover:bg-mint/90 transition-colors"
                          >
                            Recarregar player
                          </button>
                          {externalVideoUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')}
                              className="px-4 py-2 text-sm bg-navy text-slate-white rounded-lg font-medium border border-slate/20 hover:border-mint/30 transition-colors"
                            >
                              Abrir em nova aba
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auto-play countdown overlay */}
                  {autoPlayCountdown !== null && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/80 z-20 gap-4 backdrop-blur-sm">
                      <p className="text-slate-white font-semibold text-lg">Próxima aula em {autoPlayCountdown}s…</p>
                      <button
                        onClick={cancelAutoPlay}
                        className="px-5 py-2 text-sm font-medium bg-navy-lighter text-slate-white rounded-lg border border-slate/20 hover:border-mint/30 hover:text-mint transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {/* Locked lesson overlay — aula agendada com data ainda no futuro */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-lighter z-30 gap-4 p-6">
                      <span className="text-5xl" role="img" aria-label="bloqueado">🔒</span>
                      <p className="text-slate-white font-bold text-lg text-center">Aula ainda não liberada</p>
                      <p className="text-slate text-sm text-center max-w-xs leading-relaxed">
                        Disponível em {formatReleaseDate(currentVideo.releaseAt!)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {uiProgress.durationSeconds > 0 && (
                  <div className="h-1 bg-navy-lighter rounded-full mt-2" aria-hidden>
                    <div
                      className="h-1 bg-mint rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((uiProgress.watchedSeconds / uiProgress.durationSeconds) * 100))}%` }}
                    />
                  </div>
                )}

                {/* Player fallback (player ready but had issues) */}
                {showPlayerFallback && playerStatus === 'ready' && (
                  <div className="flex items-center gap-3 mt-2 px-3 py-2 bg-navy-lighter/40 rounded-lg border border-slate/10 text-sm" role="note">
                    <span className="text-slate flex-1 text-xs">Problemas com o player?</span>
                    {import.meta.env.DEV && !!embedSrc && (
                      <span className="text-slate/50 text-xs hidden lg:block truncate max-w-xs">{embedSrc.slice(0, 60)}</span>
                    )}
                    <button onClick={handleReloadPlayer} className="text-mint hover:underline text-xs">Recarregar</button>
                    {externalVideoUrl && (
                      <button
                        onClick={() => window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')}
                        className="text-slate hover:text-slate-white text-xs transition-colors"
                      >
                        Abrir em nova aba
                      </button>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-3"
                  role="toolbar"
                  aria-label="Controles da aula"
                >
                  {/* Left: Reactions + Favorite */}
                  <div className="flex items-center gap-2 order-2 sm:order-1">
                    <ReactionBar videoId={currentVideo.videoId} />
                    <button
                      onClick={handleFavoriteToggle}
                      disabled={isFavLoading}
                      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border disabled:opacity-50 ${
                        isFav
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-navy-lighter text-slate hover:text-slate-white border-transparent hover:border-slate/20'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-all ${isFav ? 'fill-red-400 stroke-red-400' : 'fill-none stroke-current'}`}
                        viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Center: Navigation + Progress */}
                  <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-center">
                    {currentIndex > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="px-4 py-2.5 sm:py-1.5 text-sm text-slate hover:text-slate-white bg-navy-lighter rounded-lg border border-transparent hover:border-slate/20 transition-all min-h-[44px] sm:min-h-0"
                      >
                        ← Anterior
                      </button>
                    )}
                    <span className="text-xs sm:text-sm text-slate px-1 tabular-nums" aria-label="Progresso da aula">
                      {uiProgress.durationSeconds > 0
                        ? `${formatClock(uiProgress.watchedSeconds)} / ${formatClock(uiProgress.durationSeconds)}`
                        : formatClock(uiProgress.watchedSeconds)}
                    </span>
                    {currentIndex < videoList.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="px-4 py-2.5 sm:py-1.5 text-sm text-slate hover:text-slate-white bg-navy-lighter rounded-lg border border-transparent hover:border-slate/20 transition-all min-h-[44px] sm:min-h-0"
                      >
                        Próxima →
                      </button>
                    )}
                  </div>

                  {/* Right: Cinema + Complete */}
                  <div className="flex items-center gap-2 order-3">
                    <button
                      onClick={() => setTheaterMode((prev) => !prev)}
                      aria-pressed={theaterMode}
                      title={theaterMode ? 'Sair do modo cinema' : 'Ativar modo cinema'}
                      className={`hidden sm:block px-3 py-1.5 text-sm rounded-lg border transition-all ${
                        theaterMode
                          ? 'bg-mint/10 text-mint border-mint/30'
                          : 'bg-navy-lighter text-slate hover:text-slate-white border-transparent hover:border-slate/20'
                      }`}
                    >
                      {theaterMode ? 'Tela normal' : 'Modo cinema'}
                    </button>
                    <button
                      onClick={handleMarkAsCompleted}
                      className={`px-4 py-2.5 sm:py-1.5 text-sm font-semibold rounded-lg transition-all min-h-[44px] sm:min-h-0 ${
                        currentLessonKey && completedIds.has(currentLessonKey)
                          ? 'bg-mint/10 text-mint border border-mint/30'
                          : 'bg-mint text-navy hover:bg-mint/90'
                      }`}
                    >
                      {currentLessonKey && completedIds.has(currentLessonKey) ? '✓ Concluída' : 'Concluir aula'}
                    </button>
                  </div>
                </div>

                {/* Auto-play toggle */}
                {currentIndex < videoList.length - 1 && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="rounded border-slate/30 bg-navy-lighter accent-mint"
                    />
                    <span className="text-xs sm:text-sm text-slate">Reproduzir próxima aula automaticamente</span>
                  </label>
                )}

                {/* Material */}
                {currentVideo.materialFile && (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-navy-lighter/50 border border-slate/10 rounded-xl mt-6 hover:border-mint/30 transition-colors group">
                    {(() => {
                      const file = currentVideo.materialFile as any;
                      const { emoji, bg } = getFileIcon(file.name ?? '', file.type);
                      return (
                        <div className={`p-3 rounded-lg ${bg} flex-shrink-0`}>
                          <span className="text-2xl" role="img" aria-hidden>{emoji}</span>
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-white truncate">
                        {(currentVideo.materialFile as any).name}
                      </p>
                      {(currentVideo.materialFile as any).size && (
                        <p className="text-xs text-slate mt-0.5">
                          {formatBytes((currentVideo.materialFile as any).size)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => openStoredFile(currentVideo.materialFile)}
                      className="flex-shrink-0 px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg border border-slate/20 text-slate-light hover:border-mint/30 hover:text-mint transition-all min-h-[44px] sm:min-h-0 w-full sm:w-auto text-center"
                    >
                      Ver/baixar
                    </button>
                  </div>
                )}

                {/* Notes Panel */}
                <NotesPanel lessonId={currentVideo.videoId} currentSeconds={uiProgress.watchedSeconds} onSeek={handleSeek} />

                {/* Comments */}
                <div className="mt-6">
                  <CommentSection videoId={currentVideo.videoId} />
                </div>
              </div>

              {/* ── RIGHT COLUMN — sidebar ──────────────────────────────────── */}
              <div className={`w-full flex-shrink-0 ${!theaterMode ? 'lg:w-80 xl:w-96' : ''}`}>
                {/* Mobile: toggle para lista de aulas */}
                <button
                  className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-navy-lighter/60 border border-slate/10 rounded-xl text-sm font-medium text-slate-white"
                  onClick={() => setMobileSidebarOpen(v => !v)}
                >
                  <span>📋 Lista de aulas ({videoList.length})</span>
                  <svg className={`w-4 h-4 text-slate transition-transform ${mobileSidebarOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className={`lg:sticky lg:top-6 flex flex-col rounded-xl border border-slate/10 bg-navy-lighter/40 overflow-hidden lg:max-h-[calc(100vh-5rem)] ${mobileSidebarOpen ? 'max-h-72 mt-2' : 'max-h-0'} lg:max-h-[calc(100vh-5rem)] transition-all duration-300 lg:mt-0`}>

                  {/* Progress summary */}
                  {videoList.length > 0 && (
                    <div className="p-4 border-b border-slate/10 flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-white">
                        {completedIds.size} de {videoList.length} aulas concluídas
                      </p>
                      <div className="h-1.5 bg-navy-lighter rounded-full mt-2">
                        <div
                          className="h-1.5 bg-mint rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((completedIds.size / videoList.length) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Filter */}
                  <div className="px-4 pt-3 pb-2 border-b border-slate/10 flex-shrink-0">
                    <SubjectDropdown
                      label="Matéria"
                      value={filterSubject}
                      onChange={setFilterSubject}
                      options={subjects}
                    />
                  </div>

                  {/* Scrollable lesson list */}
                  <ul ref={sidebarListRef} className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                    {groupedList.map((group) => (
                      <li key={`${group.moduleOrder}-${group.moduleTitle}`}>
                        <div className="text-xs font-semibold text-slate uppercase tracking-wider px-2 py-2">
                          {group.moduleTitle}
                        </div>
                        <ul className="space-y-0.5">
                          {group.items.map(({ video, globalIndex }) => {
                            const itemKey = video.videoId;
                            if (!itemKey) return null;
                            const isActive = globalIndex === currentIndex;
                            const isCompleted = completedIds.has(itemKey);
                            const isItemLocked = video.status === 'scheduled' && !!video.releaseAt && new Date(video.releaseAt) > new Date();
                            const stored = getStoredProgress(video);
                            const durationSeconds =
                              (stored?.durationSeconds && stored.durationSeconds > 0 ? stored.durationSeconds : 0) ||
                              (typeof video.durationMinutes === 'number' && video.durationMinutes > 0 ? video.durationMinutes * 60 : 0);
                            const watchedSeconds = stored?.watchedSeconds || 0;
                            const rawProgress = durationSeconds > 0 ? Math.min(1, watchedSeconds / durationSeconds) : 0;
                            const progress = isCompleted ? 1 : rawProgress;
                            const thumbnail = isMobile
                              ? video.bannerMobile?.url || video.bannerMobile?.dataUrl || video.bannerContinue?.url || video.bannerContinue?.dataUrl || video.thumbnailUrl || '/assets/images/miniatura_fundamentos_apostololicos.png'
                              : video.bannerContinue?.url || video.bannerContinue?.dataUrl || video.bannerPlayer?.url || video.bannerPlayer?.dataUrl || video.bannerMobile?.url || video.bannerMobile?.dataUrl || video.thumbnailUrl || '/assets/images/miniatura_fundamentos_apostololicos.png';

                            return (
                              <li
                                key={itemKey}
                                onClick={() => setCurrentIndex(globalIndex)}
                                title={video.title}
                                className={`flex gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                                  isActive
                                    ? 'bg-navy-lighter border-l-2 border-mint pl-[6px]'
                                    : 'hover:bg-navy-lighter/60 border-l-2 border-transparent'
                                }`}
                              >
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={thumbnail}
                                    alt={`Miniatura ${video.title}`}
                                    className={`w-16 h-10 object-cover rounded ${isItemLocked ? 'opacity-40' : ''}`}
                                  />
                                  {isCompleted && !isItemLocked && (
                                    <div className="absolute inset-0 bg-navy/50 rounded flex items-center justify-center">
                                      <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                    </div>
                                  )}
                                  {isItemLocked && (
                                    <div className="absolute inset-0 bg-navy/60 rounded flex items-center justify-center">
                                      <span className="text-sm" role="img" aria-label="bloqueada">🔒</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium truncate leading-snug ${isActive ? 'text-mint' : 'text-slate-white'}`}>
                                    {video.title}
                                  </p>
                                  {video.subjectName && (
                                    <p className="text-xs text-slate truncate mt-0.5">{video.subjectName}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    {durationSeconds > 0 && (
                                      <span className="text-xs text-slate/70 tabular-nums">{formatClock(durationSeconds)}</span>
                                    )}
                                    {isCompleted && (
                                      <span className="text-xs text-mint font-medium">✓ Concluída</span>
                                    )}
                                  </div>
                                  {!isCompleted && durationSeconds > 0 && progress > 0 && (
                                    <div className="h-1 bg-navy rounded-full mt-1.5">
                                      <div
                                        className="h-1 bg-mint rounded-full"
                                        style={{ width: `${Math.round(progress * 100)}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ul>

                  {/* Next lesson CTA */}
                  <div className="p-3 border-t border-slate/10 flex-shrink-0">
                    <button
                      onClick={handleNext}
                      disabled={currentIndex >= videoList.length - 1}
                      className="w-full py-2 text-sm font-medium text-mint rounded-lg border border-mint/30 hover:bg-mint/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Próxima aula →
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Course completion celebration */}
      {showCourseComplete && (
        <div
          className="fixed inset-0 bg-navy/90 backdrop-blur-md z-[60] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-complete-title"
        >
          <div className="bg-navy-lighter border border-mint/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4" role="img" aria-label="celebração">🎉</div>
            <h2 id="course-complete-title" className="text-2xl font-bold text-slate-white mb-2">
              Parabéns!
            </h2>
            <p className="text-slate mb-1 leading-relaxed">
              Você concluiu todas as aulas deste curso!
            </p>
            <p className="text-slate/70 text-sm mb-6 leading-relaxed">
              Seu certificado foi gerado automaticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {certVerifyCode ? (
                <a
                  href={`/#/certificado/${certVerifyCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-mint text-navy font-bold rounded-xl hover:bg-mint/90 transition-colors text-sm"
                  onClick={() => setShowCourseComplete(false)}
                >
                  🏆 Ver meu certificado
                </a>
              ) : (
                <a
                  href="/#/certificados"
                  className="px-6 py-3 bg-mint text-navy font-bold rounded-xl hover:bg-mint/90 transition-colors text-sm"
                  onClick={() => setShowCourseComplete(false)}
                >
                  🏆 Meus certificados
                </a>
              )}
              <button
                onClick={() => setShowCourseComplete(false)}
                className="px-6 py-3 bg-navy text-slate-white font-medium rounded-xl border border-slate/20 hover:border-mint/30 hover:text-mint transition-colors text-sm"
              >
                Continuar assistindo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => {
          const state = confirmState;
          if (!state) return;
          try {
            const outcome = state.onConfirm();
            if (outcome instanceof Promise) {
              outcome.catch((err) => {
                console.error(err);
                showToast('Não foi possível atualizar o status da aula.', 'error');
              });
            }
          } catch (err) {
            console.error(err);
            showToast('Não foi possível atualizar o status da aula.', 'error');
          }
        }}
        title={confirmState?.title ?? ''}
        description={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        cancelLabel={confirmState?.cancelLabel}
        danger={false}
      />

      {/* Toast */}
      {toastState && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toastState.tone === 'success'
              ? 'bg-mint text-navy'
              : toastState.tone === 'error'
              ? 'bg-red-500/90 text-white'
              : 'bg-navy-lighter text-slate-white border border-slate/20'
          }`}
        >
          {toastState.tone === 'success' && (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {toastState.tone === 'error' && (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
          {toastState.message}
        </div>
      )}
    </>
  );
};

export default StreamerMestre;
