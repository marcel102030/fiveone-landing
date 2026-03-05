import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './streamerMestre.css';
import '../../components/Streamer/streamerShared.css';
import ReactionBar from '../../components/Streamer/ReactionBar';
import CommentSection from '../../components/Streamer/CommentSection';
import Header from './Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUserId } from '../../utils/user';
import { upsertProgress, deleteProgressForUserVideo } from '../../services/progress';
import { upsertCompletion, deleteCompletion, fetchCompletionsForUser } from '../../services/completions';
import {
  COMPLETED_EVENT,
  listCompletedLessonIds,
  mergeCompletedLessons,
  removeLessonCompleted,
  setLessonCompleted,
} from '../../utils/completedLessons';
import { LessonRef, listLessons, subscribePlatformContent } from '../../services/platformContent';
import SubjectDropdown, { SubjectOption } from '../../components/SubjectDropdown/SubjectDropdown';
import { openStoredFile } from '../../utils/storedFile';


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
  // Alguns conteúdos do banco podem vir com entidades duplicadas (ex: &amp;amp;).
  for (let i = 0; i < 4; i += 1) {
    const prev = out;
    out = prev
      // Ampersand
      .replace(/&amp;/gi, '&')
      .replace(/&#0*38;/gi, '&')
      .replace(/&#x0*26;/gi, '&')
      // Quotes
      .replace(/&quot;/gi, '"')
      .replace(/&#0*34;/gi, '"')
      .replace(/&#x0*22;/gi, '"')
      // Apostrophe
      .replace(/&apos;/gi, "'")
      .replace(/&#0*39;/gi, "'")
      .replace(/&#x0*27;/gi, "'")
      // Angle brackets (às vezes o iframe inteiro vem como &lt;iframe ...&gt;)
      .replace(/&lt;/gi, '<')
      .replace(/&#0*60;/gi, '<')
      .replace(/&#x0*3c;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#0*62;/gi, '>')
      .replace(/&#x0*3e;/gi, '>');
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
    try {
      const decoded = decodeURIComponent(out);
      out = decoded;
    } catch {
      break;
    }
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
  const decoded = decodeHtmlEntities(trimmed);
  const decodedMaybeUrl = decodeHtmlUrl(decoded);
  if (/^https?:\/\//i.test(decodedMaybeUrl)) return decodedMaybeUrl;
  const doubleMatch = decoded.match(/src\s*=\s*"([^"]+)"/i);
  if (doubleMatch?.[1]) return decodeHtmlUrl(doubleMatch[1]);
  const singleMatch = decoded.match(/src\s*=\s*'([^']+)'/i);
  if (singleMatch?.[1]) return decodeHtmlUrl(singleMatch[1]);
  const unquotedMatch = decoded.match(/src\s*=\s*([^\s>]+)/i);
  if (unquotedMatch?.[1]) return decodeHtmlUrl(unquotedMatch[1].replace(/^['"]|['"]$/g, ''));
  try {
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(decoded, 'text/html');
      const src = doc.querySelector('iframe')?.getAttribute('src');
      if (src) return decodeHtmlUrl(src);
    }
  } catch {}
  return null;
};

const normaliseVimeoUrl = (url: string): string => {
  if (!url) return url;
  const cleanUrl = decodeHtmlUrl(url).trim();
  if (!cleanUrl) return url;
  // Caso comum: salvar apenas o ID numérico do Vimeo.
  if (/^\d+$/.test(cleanUrl)) {
    return `https://player.vimeo.com/video/${cleanUrl}`;
  }

  const parsed = (() => {
    try {
      return new URL(cleanUrl);
    } catch {
      return null;
    }
  })();
  if (!parsed) return url;

  const normaliseParamKey = (key: string): string => {
    let out = key.trim();
    if (!out) return '';
    // Corrige URLs vindas de HTML (ex: "...&amp;h=..." vira "amp;h" como chave).
    for (let i = 0; i < 4; i += 1) {
      const lower = out.toLowerCase();
      if (lower.startsWith('amp;')) {
        out = out.slice(4);
        continue;
      }
      break;
    }
    out = out.trim();
    // Se a chave contém '=' geralmente é sinal de query corrompida (ex: "amp;=auto").
    if (!out || out.includes('=')) return '';
    return out;
  };

  const findVideoId = (): string | null => {
    // player.vimeo.com/video/<id>
    const direct = parsed.pathname.match(/\/video\/(\d+)/i);
    if (direct?.[1]) return direct[1];
    // Links do Vimeo vêm em vários formatos (channels, groups, etc). Pega o último segmento numérico.
    const segments = parsed.pathname.split('/').filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      if (/^\d+$/.test(segments[i])) return segments[i];
    }
    const clip = parsed.searchParams.get('clip_id');
    if (clip && /^\d+$/.test(clip)) return clip;
    return null;
  };

  const videoId = findVideoId();
  if (!videoId) return url;

  let hParam = parsed.searchParams.get('h');
  if (!hParam) {
    for (const [key, value] of parsed.searchParams.entries()) {
      const normalized = normaliseParamKey(key);
      if (normalized.toLowerCase() === 'h' && value) {
        hParam = value;
        break;
      }
    }
  }
  if (!hParam) {
    const segments = parsed.pathname.split('/').filter(Boolean);
    const idx = segments.lastIndexOf(videoId);
    const maybeHash = idx >= 0 ? segments[idx + 1] : null;
    if (maybeHash && /^[0-9a-z]+$/i.test(maybeHash)) hParam = maybeHash;
  }

  const out = new URL(`https://player.vimeo.com/video/${videoId}`);

  // Mantém apenas parâmetros relevantes (evita query corrompida derrubar embeds, ex: perder o `h=`).
  const allowed = new Set([
    'h',
    'app_id',
    'autoplay',
    'player_id',
    'muted',
    'loop',
    'controls',
    'title',
    'byline',
    'portrait',
    'badge',
    'autopause',
    'dnt',
    'pip',
    'playsinline',
  ]);
  parsed.searchParams.forEach((value, key) => {
    const normalizedKey = normaliseParamKey(key);
    if (!normalizedKey) return;
    if (!allowed.has(normalizedKey)) return;
    out.searchParams.set(normalizedKey, value);
  });
  if (hParam) out.searchParams.set('h', hParam);
  out.searchParams.delete('background');
  if (out.searchParams.get('controls') === '0') out.searchParams.set('controls', '1');
  // Autoplay sem muted costuma ser bloqueado e parece "tela preta" (principalmente em embeds sem controles).
  if (out.searchParams.get('autoplay') === '1' && !out.searchParams.has('muted')) out.searchParams.set('muted', '1');

  return out.toString();
};

const isYouTubeUrl = (url: string): boolean => /(?:youtube\.com|youtu\.be)/i.test(url);

function parseYouTubeStart(raw: string | null): number | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  let seconds = 0;
  const h = value.match(/(\d+)\s*h/i);
  const m = value.match(/(\d+)\s*m/i);
  const s = value.match(/(\d+)\s*s/i);
  if (!h && !m && !s) return null;
  if (h) seconds += Number(h[1]) * 3600;
  if (m) seconds += Number(m[1]) * 60;
  if (s) seconds += Number(s[1]);
  return seconds > 0 ? seconds : null;
}

const normaliseYouTubeUrl = (url: string): string => {
  if (!url) return url;
  const cleanUrl = url.trim();
  if (!cleanUrl) return url;

  const asUrl = (() => {
    try {
      return new URL(cleanUrl);
    } catch {
      return null;
    }
  })();
  if (!asUrl) return url;

  const host = asUrl.hostname.replace(/^www\./, "").toLowerCase();
  const isShort = host === "youtu.be";
  const isYouTube = host.endsWith("youtube.com") || isShort;
  if (!isYouTube) return url;

  const start =
    parseYouTubeStart(asUrl.searchParams.get("start")) ?? parseYouTubeStart(asUrl.searchParams.get("t"));

  const embed = (() => {
    // Se já for embed, mantém o path.
    const embedMatch = asUrl.pathname.match(/\/embed\/([^/]+)/i);
    if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`;

    // youtu.be/<id>
    if (isShort) {
      const id = asUrl.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // /watch?v=<id>
    const watchId = asUrl.searchParams.get("v");
    if (watchId) return `https://www.youtube.com/embed/${watchId}`;

    // /shorts/<id>
    const shortsMatch = asUrl.pathname.match(/\/shorts\/([^/]+)/i);
    if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    return asUrl.toString();
  })();

  const out = (() => {
    try {
      return new URL(embed);
    } catch {
      return null;
    }
  })();
  if (!out) return embed;

  out.searchParams.set("enablejsapi", "1");
  out.searchParams.set("playsinline", "1");
  out.searchParams.set("rel", "0");
  if (typeof window !== "undefined") {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      out.searchParams.set("origin", window.location.origin);
    }
  }
  if (typeof start === "number" && Number.isFinite(start) && start > 0) {
    out.searchParams.set("start", String(Math.floor(start)));
  }
  return out.toString();
};

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function ensureYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires window"));
  }
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      youtubeApiPromise = null;
      reject(new Error("Timeout ao carregar YouTube IFrame API"));
    }, 15_000);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        if (typeof prev === "function") prev();
      } catch {}
      window.clearTimeout(timeout);
      resolve();
    };

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      youtubeApiPromise = null;
      reject(new Error("Falha ao carregar YouTube IFrame API"));
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
};

const DeferredIframe = ({ src, title, allow, onReady, onError }: DeferredIframeProps) => {
  if (!src || src === 'about:blank') return null;

  return (
    <iframe
      id="fiveone-streamer-player"
      src={src}
      title={title}
      frameBorder="0"
      allow={allow}
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
              if (normalized.toLowerCase().startsWith('amp;')) {
                normalized = normalized.slice(4);
                continue;
              }
              break;
            }
            if (normalized.toLowerCase() === 'h' && value) {
              h = value;
              break;
            }
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
        if (candidate) {
          keyUsed = candidateKey;
          return candidate;
        }
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
      // Migra dados legados para a chave canônica (melhor esforço).
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

const StreamerMestre = () => {
  useEffect(() => {
    // Reload automático por URL: cada URL de aula recarrega uma vez.
    // Resolve o problema de cache SPA onde o player não inicializa sem F5.
    const key = 's_loaded::' + window.location.pathname + window.location.search;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      window.location.reload();
    }
  }, []);

  const [videoList, setVideoList] = useState<LessonRef[]>(() => listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));
  const playerInstanceRef = useRef<VimeoPlayer | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const lastProgressFlushRef = useRef<number>(0);
  const [playerReloadKey, setPlayerReloadKey] = useState(0);
  const cleanupVimeoPlayer = useCallback(() => {
    const player = playerInstanceRef.current;
    if (!player) return;

    // IMPORTANTE: não use `destroy()` aqui.
    // `player.destroy()` remove o iframe do DOM — e como este iframe é renderizado pelo React,
    // isso pode causar "tela preta" em navegação SPA (o React não recria o elemento automaticamente).
    try {
      player.off('loaded');
      player.off('durationchange');
      player.off('timeupdate');
      player.off('seeked');
      player.off('ended');
      player.off('error');
    } catch {}
    try {
      player.unload().catch(() => {});
    } catch {}

    playerInstanceRef.current = null;
  }, []);

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
    try {
      youtubePlayerRef.current?.destroy?.();
    } catch {}
    youtubePlayerRef.current = null;
    setPlayerReloadKey((prev) => prev + 1);
  }, [clearPlayerTimers, cleanupVimeoPlayer]);

  const [theaterMode, setTheaterMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('fiveone_theater_mode') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('fiveone_theater_mode', theaterMode ? '1' : '0');
    } catch {}
  }, [theaterMode]);

  const [uiProgress, setUiProgress] = useState<{ watchedSeconds: number; durationSeconds: number }>({
    watchedSeconds: 0,
    durationSeconds: 0,
  });

  const [searchParams] = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const searchKey = searchParams.toString();
  useEffect(() => {
    setVideoList(listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));
    const unsubscribe = subscribePlatformContent(() => {
      setVideoList(listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));
    });
    return () => unsubscribe();
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
      // compat: se alguém salvar/compartilhar um `vid` antigo (URL/embed), tenta resolver também
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
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(listCompletedLessonIds()));
  // Página de player não mostra mais a grade de módulos
  const isModuloAberto = true;
  const videoRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // searchParams já usado acima
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toastState, setToastState] = useState<ToastState | null>(null);

  const syncCompletedIds = useCallback(() => {
    setCompletedIds(new Set(listCompletedLessonIds()));
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
  const externalVideoUrl = useMemo(() => resolveExternalVideoUrl(currentVideo, embedSrc), [currentVideo?.videoId, currentVideo?.videoUrl, embedSrc]);

  useEffect(() => {
    const stored = getStoredProgress(currentVideo);
    if (stored) {
      setUiProgress({ watchedSeconds: stored.watchedSeconds, durationSeconds: stored.durationSeconds });
    } else {
      setUiProgress({ watchedSeconds: 0, durationSeconds: 0 });
    }
  }, [currentVideo?.videoId]);

  // Importante: resetar estado do player em `useLayoutEffect` evita corrida onde o iframe carrega do cache
  // e dispara `onLoad` antes do `useEffect` (o que fazia a tela ficar "preta" até hard reload).
  useLayoutEffect(() => {
    clearPlayerTimers();
    setPlayerMessage(null);
    setShowPlayerFallback(false);
    cleanupVimeoPlayer();
    try {
      youtubePlayerRef.current?.destroy?.();
    } catch {}
    youtubePlayerRef.current = null;

    if (!currentVideo) return;

    if (!embedSrc || embedSrc === 'about:blank' || !/^https?:\/\//i.test(embedSrc)) {
      markPlayerError('Vídeo indisponível no momento.');
      return;
    }

    setPlayerStatus('loading');
  }, [currentVideo?.videoId, embedSrc, clearPlayerTimers, markPlayerError, cleanupVimeoPlayer]);

  useEffect(() => {
    if (!currentVideo) return;
    if (!embedSrc || embedSrc === 'about:blank' || !/^https?:\/\//i.test(embedSrc)) return;
    if (playerStatus !== 'loading') return;

    fallbackTimerRef.current = window.setTimeout(() => {
      setShowPlayerFallback(true);
    }, 8000);

    const slowMessage = (() => {
      const base = 'O player está demorando para carregar. Tente recarregar ou abrir em outra aba.';
      if (/vimeo\.com/i.test(embedSrc)) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        if (host === 'localhost' || host === '127.0.0.1') {
          return `${base} Em localhost isso pode acontecer se o Vimeo estiver com restrição de embed por domínio (whitelist).`;
        }
      }
      return base;
    })();

    errorTimerRef.current = window.setTimeout(() => {
      setPlayerStatus((prev) => (prev === 'loading' ? 'error' : prev));
      setPlayerMessage((prev) => prev || slowMessage);
      setShowPlayerFallback(true);
    }, 25000);

    return () => {
      clearPlayerTimers();
    };
  }, [currentVideo?.videoId, embedSrc, playerReloadKey, playerStatus, clearPlayerTimers]);
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
      const now = Date.now();
      const key = `fiveone_progress::${keyBase}`;
      const payload: StoredProgress = {
        watchedSeconds,
        durationSeconds,
        lastAt: now,
      };
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {}
      setUiProgress({ watchedSeconds, durationSeconds });

      const bannerContinue = lesson.bannerContinue;
      const bannerPlayer = lesson.bannerPlayer;
      const bannerMobile = lesson.bannerMobile;
      const resolvedBannerContinue = bannerContinue?.url || bannerContinue?.dataUrl || null;
      const resolvedBannerPlayer = bannerPlayer?.url || bannerPlayer?.dataUrl || null;
      const resolvedBannerMobile = bannerMobile?.url || bannerMobile?.dataUrl || null;

      const previewImage =
        (isMobile ? resolvedBannerMobile || resolvedBannerContinue : resolvedBannerContinue || resolvedBannerPlayer) ||
        resolvedBannerMobile ||
        lesson.thumbnailUrl ||
        '/assets/images/miniatura_fundamentos_mestre.png';

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
                const key = video.id || video.videoId || video.url;
                if (!key) return true;
                return key !== lesson.videoId && key !== lesson.videoUrl;
              });
              localStorage.setItem('videos_assistidos', JSON.stringify(filtered));
            }
          }
        } else {
          const existingWatchedRaw = localStorage.getItem('videos_assistidos');
          const existingWatched = existingWatchedRaw ? JSON.parse(existingWatchedRaw) : [];
          const filteredWatched = Array.isArray(existingWatched)
            ? existingWatched.filter((video: any) => {
                const key = video?.id || video?.videoId || video?.video_id || video?.url;
                if (!key) return true;
                if (key === lesson.videoId) return false;
                if (lesson.videoUrl && key === lesson.videoUrl) return false;
                return true;
              })
            : [];
          const updatedWatched = [currentVideoData, ...filteredWatched];
          const limitedWatched = updatedWatched.slice(0, 12);
          localStorage.setItem('videos_assistidos', JSON.stringify(limitedWatched));
        }
      } catch {}

      const userId = getCurrentUserId();
      if (userId) {
        const syncKey = `fiveone_progress_sync_${lesson.videoId}`;
        const lastSync = Number(sessionStorage.getItem(syncKey) || 0);
        if (now - lastSync > 15000) {
          sessionStorage.setItem(syncKey, String(now));
          upsertProgress({
            user_id: userId,
            video_id: lesson.videoId,
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
          setLessonCompleted(lesson.videoId, {
            previousWatched: watchedSeconds,
            previousDuration: completionDuration,
          });
          try {
            const existingRaw = localStorage.getItem('videos_assistidos');
            if (existingRaw) {
              const arr = JSON.parse(existingRaw);
              if (Array.isArray(arr)) {
                const filtered = arr.filter((video: any) => {
                  const key = video.id || video.videoId || video.url;
                  if (!key) return true;
                  return key !== lesson.videoId && key !== lesson.videoUrl;
                });
                localStorage.setItem('videos_assistidos', JSON.stringify(filtered));
              }
            }
          } catch {}
          const uid = getCurrentUserId();
          if (uid) {
            upsertCompletion(uid, lesson.videoId).catch(() => {});
          }

          syncCompletedIds();
        }
      }
    },
    [videoList, currentIndex, isMobile, completedIds, setCompletedIds, syncCompletedIds],
  );

  const alignSidebar = useCallback(() => {
    const el = videoRef.current;
    const side = sidebarRef.current;
    if (!el || !side) return;
    const mq = window.matchMedia('(max-width: 1024px)');
    if (mq.matches) {
      side.style.removeProperty('--sidebar-height');
      side.style.height = 'auto';
      side.style.marginTop = '0px';
      return;
    }
    const iframe = el.querySelector('iframe');
    const rect = (iframe || el).getBoundingClientRect();
    const content = el.closest('.video-content') as HTMLElement | null;
    const contentRect = content ? content.getBoundingClientRect() : rect;
    const height = Math.max(320, Math.round(rect.height));
    side.style.setProperty('--sidebar-height', `${height}px`);
    side.style.height = `${height}px`;
    const offset = Math.max(0, Math.round(rect.top - contentRect.top));
    side.style.marginTop = `${offset}px`;
  }, []);


  // Mantém a altura da sidebar alinhada com a altura do vídeo (iframe)
  useLayoutEffect(() => {
    const el = videoRef.current;
    const side = sidebarRef.current;
    if (!el || !side) return;

    let destroyed = false;
    const update = () => {
      if (destroyed) return;
      alignSidebar();
    };

    const observers: ResizeObserver[] = [];
    const cleanups: Array<() => void> = [];

    const ro = new ResizeObserver(update);
    ro.observe(el);
    observers.push(ro);

    const iframe = el.querySelector('iframe');
    if (iframe) {
      const roIframe = new ResizeObserver(update);
      roIframe.observe(iframe);
      observers.push(roIframe);
      iframe.addEventListener('load', update, { once: true });
    }

    const content = el.closest('.video-content') as HTMLElement | null;
    if (content) {
      const roContent = new ResizeObserver(update);
      roContent.observe(content);
      observers.push(roContent);

      const imgs = Array.from(content.querySelectorAll('img')) as HTMLImageElement[];
      imgs.forEach((img) => {
        if (img.complete) return;
        const handleLoad = () => update();
        img.addEventListener('load', handleLoad);
        cleanups.push(() => img.removeEventListener('load', handleLoad));
      });
    }

    window.addEventListener('resize', update);

    update();
    const t1 = setTimeout(update, 60);
    const t2 = setTimeout(update, 220);
    const t3 = setTimeout(update, 640);

    return () => {
      destroyed = true;
      observers.forEach((observer) => observer.disconnect());
      cleanups.forEach((fn) => fn());
      if (iframe) iframe.removeEventListener('load', update);
      window.removeEventListener('resize', update);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [currentVideo?.videoId, playerReloadKey, alignSidebar]);

  useEffect(() => {
    const lesson = currentVideo;
    const vimeoSrc = embedSrc;
    if (!lesson || lesson.sourceType !== 'VIMEO' || !vimeoSrc || !/vimeo\.com/i.test(vimeoSrc)) {
      cleanupVimeoPlayer();
      return;
    }

    let cancelled = false;
    lastProgressFlushRef.current = 0;
    (async () => {
      try {
        // Aguarda o iframe estar no DOM antes de importar o SDK
        let iframe: HTMLIFrameElement | null = null;
        for (let attempt = 0; attempt < 20; attempt++) {
          iframe = document.getElementById('fiveone-streamer-player') as HTMLIFrameElement | null;
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
        alignSidebar();
        setTimeout(() => alignSidebar(), 120);

        // Em alguns cenários (cache/SPA/StrictMode) o evento `loaded` pode demorar.
        // `ready()` nos dá um sinal mais confiável para liberar o iframe na UI.
        player
          .ready()
          .then(() => {
            if (cancelled) return;
            markPlayerReady();
          })
          .catch(() => {});

        const stored = getStoredProgress(lesson);
        let pendingResume = stored?.watchedSeconds || 0;

        const tryResume = async (durationHint?: number) => {
          if (!pendingResume || pendingResume <= 5) return;
          const duration = Number.isFinite(durationHint) && durationHint ? durationHint : stored?.durationSeconds || 0;
          const maxSeek = duration > 6 ? Math.max(0, duration - 2) : undefined;
          const target = maxSeek !== undefined ? Math.min(pendingResume, maxSeek) : pendingResume;
          if (target > 5) {
            try {
              await player.setCurrentTime(target);
            } catch {}
          }
          pendingResume = 0;
        };

        player.on('loaded', (data: any) => {
          lastProgressFlushRef.current = 0;
          markPlayerReady();
          tryResume(Number(data?.duration)).catch(() => {});
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          if (duration > 0) {
            persistProgress(stored?.watchedSeconds || 0, duration);
          }
          alignSidebar();
          setTimeout(() => alignSidebar(), 100);
        });

        player.on('durationchange', (data: any) => {
          tryResume(Number(data?.duration)).catch(() => {});
          alignSidebar();
        });

        player.on('timeupdate', (data: any) => {
          const now = Date.now();
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          if (now - lastProgressFlushRef.current >= 5000) {
            lastProgressFlushRef.current = now;
            persistProgress(Number(data?.seconds || 0), duration);
          }
        });

        player.on('seeked', (data: any) => {
          lastProgressFlushRef.current = Date.now();
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          persistProgress(Number(data?.seconds || 0), duration);
        });

        player.on('ended', async () => {
          lastProgressFlushRef.current = Date.now();
          let duration = stored?.durationSeconds || 0;
          try {
            duration = await player.getDuration();
          } catch {}
          persistProgress(duration || stored?.durationSeconds || 0, duration || stored?.durationSeconds || 0);
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

    return () => {
      cancelled = true;
      cleanupVimeoPlayer();
    };
  }, [currentVideo?.videoId, currentVideo?.sourceType, embedSrc, playerReloadKey, persistProgress, alignSidebar, markPlayerReady, markPlayerError, cleanupVimeoPlayer]);

  useEffect(() => {
    const lesson = currentVideo;
    const youtubeSrc = embedSrc;
    if (!lesson || lesson.sourceType !== 'YOUTUBE' || !youtubeSrc || !isYouTubeUrl(youtubeSrc)) {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy?.();
        } catch {}
        youtubePlayerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    lastProgressFlushRef.current = 0;

    (async () => {
      try {
        await ensureYouTubeApi();
        if (cancelled) return;

        // Aguarda o iframe estar no DOM (o React pode ainda não ter pintado após o await assíncrono)
        let iframe: HTMLIFrameElement | null = null;
        for (let attempt = 0; attempt < 20; attempt++) {
          iframe = document.getElementById('fiveone-streamer-player') as HTMLIFrameElement | null;
          if (iframe) break;
          await new Promise(resolve => window.setTimeout(resolve, 100));
          if (cancelled) return;
        }
        if (!iframe) {
          markPlayerError('Player não encontrado. Tente recarregar a página.');
          return;
        }

        try {
          youtubePlayerRef.current?.destroy?.();
        } catch {}
        youtubePlayerRef.current = null;

        const stored = getStoredProgress(lesson);
        let pendingResume = stored?.watchedSeconds || 0;

        // Passa o elemento diretamente — forma oficial e robusta da YouTube IFrame API
        const player = new window.YT.Player(iframe, {
          events: {
            onReady: (event: any) => {
              if (cancelled) return;
              markPlayerReady();
              const duration = Number(event?.target?.getDuration?.() || stored?.durationSeconds || 0);

              if (duration > 0) {
                persistProgress(stored?.watchedSeconds || 0, duration);
              } else if (stored) {
                setUiProgress({ watchedSeconds: stored.watchedSeconds, durationSeconds: stored.durationSeconds });
              }

              if (pendingResume && pendingResume > 5) {
                const maxSeek = duration > 6 ? Math.max(0, duration - 2) : null;
                const target = maxSeek !== null ? Math.min(pendingResume, maxSeek) : pendingResume;
                if (target > 5) {
                  try {
                    event.target.seekTo(target, true);
                  } catch {}
                }
              }
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
                  setUiProgress((prev) => ({
                    watchedSeconds: currentTime,
                    durationSeconds: duration > 0 ? duration : prev.durationSeconds,
                  }));

                  if (forcePersist) {
                    lastProgressFlushRef.current = Date.now();
                    persistProgress(currentTime, duration);
                    return;
                  }
                  const now = Date.now();
                  if (now - lastProgressFlushRef.current >= 5000) {
                    lastProgressFlushRef.current = now;
                    persistProgress(currentTime, duration);
                  }
                } catch {}
              };

              // Mantém um polling leve apenas quando está tocando (corrige o bug do "timer andando sozinho").
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

              if (playing || buffering) {
                startPolling();
              } else if (paused) {
                stopPolling(true);
              } else if (ended) {
                stopPolling(false);
                try {
                  const currentTime = Number(youtubePlayerRef.current.getCurrentTime?.() || 0);
                  const duration = Number(youtubePlayerRef.current.getDuration?.() || stored?.durationSeconds || 0);
                  const finalTime = duration > 0 ? duration : currentTime;
                  if (finalTime > 0) persistProgress(finalTime, duration || undefined);
                } catch {}
              } else {
                stopPolling(false);
              }
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

    return () => {
      cancelled = true;
      try {
        const id = (youtubePlayerRef.current as any)?.__fiveonePoll as number | undefined;
        if (id) window.clearInterval(id);
      } catch {}
      try {
        youtubePlayerRef.current?.destroy?.();
      } catch {}
      youtubePlayerRef.current = null;
    };
  }, [currentVideo?.videoId, currentVideo?.sourceType, embedSrc, playerReloadKey, persistProgress, markPlayerReady, markPlayerError]);

  const resolveLessonAssets = useCallback((lesson: LessonRef) => {
    const bannerContinue = lesson.bannerContinue;
    const bannerPlayer = lesson.bannerPlayer;
    const bannerMobile = lesson.bannerMobile;
    const resolvedBannerContinue = bannerContinue?.url || bannerContinue?.dataUrl || null;
    const resolvedBannerPlayer = bannerPlayer?.url || bannerPlayer?.dataUrl || null;
    const resolvedBannerMobile = bannerMobile?.url || bannerMobile?.dataUrl || null;
    const previewImage =
      resolvedBannerContinue ||
      resolvedBannerPlayer ||
      resolvedBannerMobile ||
      lesson.thumbnailUrl ||
      '/assets/images/miniatura_fundamentos_mestre.png';
    return { previewImage, resolvedBannerContinue, resolvedBannerMobile };
  }, []);

  const resetLessonProgress = useCallback((lesson: LessonRef, index: number, durationSeconds?: number) => {
    const base = lesson.videoId;
    if (!base) return;
    const now = Date.now();
    const duration = typeof durationSeconds === 'number' && durationSeconds > 0 ? durationSeconds : 0;
    const payload: StoredProgress = {
      watchedSeconds: 0,
      durationSeconds: duration,
      lastAt: now,
    };
    try {
      localStorage.setItem(`fiveone_progress::${base}`, JSON.stringify(payload));
    } catch {}

    try {
      const { previewImage, resolvedBannerContinue, resolvedBannerMobile } = resolveLessonAssets(lesson);
      const entry = {
        title: lesson.title,
        thumbnail: previewImage,
        url: lesson.videoId,
        index,
        id: lesson.videoId,
        sourceUrl: lesson.videoUrl || null,
        subjectName: lesson.subjectName,
        subjectId: lesson.subjectId,
        bannerContinue: resolvedBannerContinue,
        bannerMobile: resolvedBannerMobile,
        watchedSeconds: 0,
        durationSeconds: duration,
        lastAt: now,
      };
      const existingRaw = localStorage.getItem('videos_assistidos');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = Array.isArray(existing)
        ? existing.filter((video: any) => {
            const key = video?.id || video?.videoId || video?.video_id || video?.url;
            if (!key) return true;
            if (key === lesson.videoId) return false;
            if (lesson.videoUrl && key === lesson.videoUrl) return false;
            return true;
          })
        : [];
      filtered.unshift(entry);
      localStorage.setItem('videos_assistidos', JSON.stringify(filtered.slice(0, 12)));
    } catch {}
  }, [resolveLessonAssets]);

  const showToast = useCallback((message: string, tone: 'success' | 'error' | 'info' = 'info') => {
    setToastState({ message, tone });
  }, []);

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
          const uid = getCurrentUserId();
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
            try {
              await playerInstanceRef.current.setCurrentTime(0);
              await playerInstanceRef.current.pause();
            } catch {}
          } else if (youtubePlayerRef.current) {
            try {
              youtubePlayerRef.current.seekTo?.(0, true);
              youtubePlayerRef.current.pauseVideo?.();
            } catch {}
          } else if (embedSrc) {
            const iframe = videoRef.current?.querySelector('iframe');
            if (iframe) iframe.setAttribute('src', embedSrc);
          }
          if (uid) {
            try {
              await deleteCompletion(uid, lessonSnapshot.videoId);
            } catch {}
            deleteProgressForUserVideo(uid, lessonSnapshot.videoId).catch(() => {});
          }

          syncCompletedIds();
          showToast('Aula marcada como não concluída.', 'info');
        },
      });
      return;
    }

    const uid = getCurrentUserId();
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

    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });
    setLessonCompleted(lessonId, {
      previousWatched: watchedBefore,
      previousDuration: storedProgress?.durationSeconds ?? duration ?? null,
    });

    if (total > 0) {
      persistProgress(total, duration ?? undefined);
    }

    if (uid) {
      try {
        await upsertCompletion(uid, lessonId);
      } catch {}
    }

    syncCompletedIds();
    showToast('Aula marcada como concluída.', 'success');
  };
  // Load completions for user once
  useEffect(() => {
    const uid = getCurrentUserId();
    if (!uid) return;
    (async () => {
      try {
        const list = await fetchCompletionsForUser(uid);
        const merged = mergeCompletedLessons(list);
        setCompletedIds(new Set(merged.keys()));
      } catch {}
    })();
  }, []);
  const navigate = useNavigate();
  // Mantém o link sempre canônico (vid=...) ao trocar de aula, para permitir refresh/compartilhamento.
  useEffect(() => {
    const lesson = videoList[currentIndex];
    if (!lesson?.videoId) return;
    const params = new URLSearchParams(searchKey);
    const currentVid = params.get("vid");
    const hasLegacy = params.has("i") || params.has("v");
    if (!hasLegacy && currentVid === lesson.videoId) return;
    navigate(`/streamer-mestre?vid=${encodeURIComponent(lesson.videoId)}`, { replace: true });
  }, [videoList, currentIndex, searchKey, navigate]);
  // Filtro por matéria na sidebar
  const subjects: SubjectOption[] = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    videoList.forEach((v) => {
      const id = (v.subjectId && v.subjectId.trim()) || slugify(v.subjectName || '');
      if (!id) return;
      const name = v.subjectName || v.subjectId || id;
      const entry = counts.get(id);
      if (entry) {
        entry.count += 1;
        if (name && entry.name !== name) entry.name = name;
      } else {
        counts.set(id, { name, count: 1 });
      }
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
    type SidebarGroup = {
      moduleTitle: string;
      moduleOrder: number;
      items: { video: LessonRef; globalIndex: number }[];
    };

    const groups: SidebarGroup[] = [];
    const groupMap = new Map<string, SidebarGroup>();

    filteredList.forEach((video) => {
      let globalIndex = videoList.findIndex((v) => v.videoId === video.videoId);
      if (globalIndex === -1) {
        const fallbackKey = video.videoUrl || video.id || null;
        if (fallbackKey) {
          globalIndex = videoList.findIndex((v) => v.videoUrl === fallbackKey || v.id === fallbackKey);
        }
      }
      if (globalIndex === -1) return;

      const key = video.moduleId || video.moduleTitle || 'default';
      if (!groupMap.has(key)) {
        const group: SidebarGroup = {
          moduleTitle: video.moduleTitle || 'Módulo',
          moduleOrder: video.moduleOrder ?? 0,
          items: [],
        };
        groupMap.set(key, group);
        groups.push(group);
      }
      groupMap.get(key)!.items.push({ video, globalIndex });
    });

    groups.sort((a, b) => a.moduleOrder - b.moduleOrder);
    return groups;
  }, [filteredList, videoList]);
  useEffect(()=>{ sidebarRef.current?.scrollTo({ top: 0 }); }, [filterSubject]);
  const currentLessonKey = useMemo(() => {
    if (!currentVideo) return '';
    return currentVideo.videoId || '';
  }, [currentVideo?.videoId]);
  const handleNext = () => {
    if (currentIndex < videoList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // já abrimos direto com os estados iniciais

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // jumpToLastWatchedIfAny removido ao separar a página de módulos


  return (
    <>
      <Header />
      <div className="wrapper-central">
        <main className="streamer-video-area">
          {!videoList.length && (
            <div className="video-and-sidebar">
              <div className="video-content">
                <div className="back-row">
                  <button className="back-to-modules" onClick={() => navigate('/modulos-mestre')}>← Voltar aos Módulos</button>
                </div>
                <h2 className="streamer-titulo">Conteúdo em preparação</h2>
                <p style={{ color: '#94a3b8', marginTop: 12 }}>
                  Nenhuma aula publicada para esta formação ainda. Assim que novas aulas forem disponibilizadas, elas aparecerão aqui automaticamente.
                </p>
              </div>
            </div>
          )}
          {isModuloAberto && currentVideo && (
            <div className={`video-and-sidebar ${theaterMode ? 'is-theater' : ''}`}>
              <div className="video-content">
                <div className="back-row">
                  <button className="back-to-modules" onClick={() => navigate('/modulos-mestre')}>← Voltar aos Módulos</button>
                </div>
                {(() => {
                  const heroBanner = currentVideo.bannerPlayer?.url || currentVideo.bannerPlayer?.dataUrl;
                  return heroBanner ? (
                  <div className="video-banner">
                    <img src={heroBanner} alt={`Banner da aula ${currentVideo.title}`} />
                  </div>
                  ) : null;
                })()}
                <h2 className="streamer-titulo">{currentVideo.title}</h2>
                <div className="subject-info">
                  {currentVideo.subjectName && currentVideo.instructor && (
                    <span className="subject-pill" title={`${currentVideo.subjectName} • ${currentVideo.instructor}`}>
                      {currentVideo.subjectName} • {currentVideo.instructor}
                    </span>
                  )}
                  {currentVideo.subjectName && !currentVideo.instructor && (
                    <span className="subject-pill">{currentVideo.subjectName}</span>
                  )}
                </div>
                <div
                  className={`video-container ${playerStatus !== 'ready' ? 'is-loading' : ''} ${playerStatus === 'error' ? 'is-error' : ''}`}
                  ref={videoRef}
                >
                  <DeferredIframe
                    key={currentVideo?.videoId ?? currentIndex}
                    src={embedSrc || 'about:blank'}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onReady={markPlayerReady}
                    onError={markPlayerError}
                  />
                  {playerStatus !== 'ready' && (
                    <div className="player-overlay" role="status" aria-live="polite">
                      <div className="player-overlay-card">
                        {playerStatus === 'loading' && <div className="player-spinner" aria-hidden />}
                        <div className="player-overlay-title">
                          {playerStatus === 'error' ? 'Não foi possível carregar o vídeo' : 'Carregando vídeo…'}
                        </div>
                        {playerMessage && <div className="player-overlay-message">{playerMessage}</div>}
                        {import.meta.env.DEV && !!embedSrc && (
                          <div className="player-overlay-debug" data-testid="player-overlay-debug">
                            <div>embedSrc: {embedSrc}</div>
                            <div>sourceType: {currentVideo.sourceType}</div>
                            <div>videoId: {currentVideo.videoId}</div>
                            {currentVideo.videoUrl && <div>videoUrl: {decodeHtmlUrl(currentVideo.videoUrl)}</div>}
                            {currentVideo.embedCode && (
                              <div>
                                embedCode: {currentVideo.embedCode.slice(0, 180)}
                                {currentVideo.embedCode.length > 180 ? '…' : ''}
                              </div>
                            )}
                          </div>
                        )}
                        {(showPlayerFallback || playerStatus === 'error') && (
                          <div className="player-overlay-actions">
                            <button type="button" className="player-overlay-btn" onClick={handleReloadPlayer}>
                              Recarregar player
                            </button>
                            {externalVideoUrl && (
                              <button
                                type="button"
                                className="player-overlay-btn secondary"
                                onClick={() => window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')}
                              >
                                Abrir em nova aba
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {uiProgress.durationSeconds > 0 && (
                  <div className="video-progress-track" aria-hidden>
                    <div
                      className="video-progress-fill"
                      style={{
                        width: `${Math.min(100, Math.round((uiProgress.watchedSeconds / uiProgress.durationSeconds) * 100))}%`
                      }}
                    />
                  </div>
                )}
                {showPlayerFallback && playerStatus === 'ready' && (
                  <div className="player-fallback-inline" role="note">
                    <span className="player-fallback-text">Problemas com o player?</span>
                    {import.meta.env.DEV && !!embedSrc && (
                      <span className="player-fallback-debug">embedSrc: {embedSrc}</span>
                    )}
                    <button type="button" className="player-fallback-btn" onClick={handleReloadPlayer}>
                      Recarregar
                    </button>
                    {externalVideoUrl && (
                      <button
                        type="button"
                        className="player-fallback-btn secondary"
                        onClick={() => window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Abrir em nova aba
                      </button>
                    )}
                  </div>
                )}
                <div className="action-bar" role="toolbar" aria-label="Controles da aula">
                  <div className="action-left">
                    <ReactionBar videoId={currentVideo.videoId} />
                  </div>
                  <div className="action-center">
                    {currentIndex > 0 && (
                      <button className="action-btn prev" onClick={handlePrevious}>Anterior</button>
                    )}
                    <div className="action-progress" aria-label="Progresso da aula">
                      Progresso{' '}
                      {uiProgress.durationSeconds > 0
                        ? `${formatClock(uiProgress.watchedSeconds)} / ${formatClock(uiProgress.durationSeconds)}`
                        : formatClock(uiProgress.watchedSeconds)}
                    </div>
                    {currentIndex < videoList.length - 1 && (
                      <button className="action-btn next" onClick={handleNext}>Próxima</button>
                    )}
                  </div>
                  <div className="action-right">
                    <button
                      type="button"
                      className={`action-btn theater ${theaterMode ? 'is-on' : ''}`}
                      onClick={() => setTheaterMode((prev) => !prev)}
                      aria-pressed={theaterMode}
                      title={theaterMode ? 'Sair do modo cinema' : 'Ativar modo cinema'}
                    >
                      {theaterMode ? 'Tela normal' : 'Modo cinema'}
                    </button>
                    <button
                      className={`action-btn complete ${currentLessonKey && completedIds.has(currentLessonKey) ? 'is-done' : ''}`}
                      onClick={handleMarkAsCompleted}
                      type="button"
                    >
                      {currentLessonKey && completedIds.has(currentLessonKey) ? 'Concluída' : 'Concluir'}
                    </button>
                  </div>
                </div>

                {currentVideo.materialFile && (
                  <div className="material-card">
                    <div className="material-info">
                      <div className="material-icon" aria-hidden />
                      <div className="material-text">
                        <div className="material-title">Material complementar <span className="badge-pdf">PDF</span></div>
                        <div className="material-sub">{currentVideo.materialFile.name}</div>
                      </div>
                    </div>
                    <button className="material-btn" onClick={() => openStoredFile(currentVideo.materialFile)}>Ver/baixar PDF</button>
                  </div>
                )}
                <div className="engagement-panel">
                  <CommentSection videoId={currentVideo.videoId} />
                </div>
              </div>
              <div className="video-sidebar" ref={sidebarRef} data-filtered={filterSubject !== 'all'}>
                {videoList.length > 0 && (
                  <div className="sidebar-progress-summary">
                    <span className="sidebar-progress-count">
                      {completedIds.size} de {videoList.length} aulas concluídas
                    </span>
                    <div className="sidebar-progress-bar">
                      <div
                        className="sidebar-progress-bar-fill"
                        style={{ width: `${Math.round((completedIds.size / videoList.length) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                <h3 className="sidebar-title">Próximas Aulas</h3>
                <SubjectDropdown
                  label="Matéria"
                  value={filterSubject}
                  onChange={setFilterSubject}
                  options={subjects}
                />
                <ul className="sidebar-list">
                  {groupedList.map((group) => (
                    <li key={`${group.moduleOrder}-${group.moduleTitle}`} className="sidebar-group">
                      <div className="sidebar-module-header">{group.moduleTitle}</div>
                      <ul className="sidebar-group-list">
                        {group.items.map(({ video, globalIndex }) => {
                          const itemKey = video.videoId;
                          if (!itemKey) return null;
                          const isCompleted = completedIds.has(itemKey);
                          const stored = getStoredProgress(video);
                          const durationSeconds =
                            (stored?.durationSeconds && stored.durationSeconds > 0 ? stored.durationSeconds : 0) ||
                            (typeof video.durationMinutes === 'number' && video.durationMinutes > 0 ? video.durationMinutes * 60 : 0);
                          const watchedSeconds = stored?.watchedSeconds || 0;
                          const rawProgress = durationSeconds > 0 ? Math.min(1, watchedSeconds / durationSeconds) : 0;
                          const progress = isCompleted ? 1 : rawProgress;
                          return (
                            <li
                              key={itemKey}
                              className={`sidebar-item ${globalIndex === currentIndex ? 'active' : ''} ${isCompleted ? 'is-complete' : ''}`}
                              title={video.title}
                              onClick={() => setCurrentIndex(globalIndex)}
                            >
                              <img
                                src={
                                  isMobile
                                    ? video.bannerMobile?.url || video.bannerMobile?.dataUrl || video.bannerContinue?.url || video.bannerContinue?.dataUrl || video.thumbnailUrl || '/assets/images/miniatura_fundamentos_apostololicos.png'
                                    : video.bannerContinue?.url || video.bannerContinue?.dataUrl || video.bannerPlayer?.url || video.bannerPlayer?.dataUrl || video.bannerMobile?.url || video.bannerMobile?.dataUrl || video.thumbnailUrl || '/assets/images/miniatura_fundamentos_apostololicos.png'
                                }
                                alt={`Miniatura ${video.title}`}
                                className="sidebar-thumbnail"
                              />
                              <div className="sidebar-video-info">
                                <div className="sidebar-video-title">{video.title}</div>
                                <div className="sidebar-video-subject">{video.subjectName}</div>
                                <div className="sidebar-video-meta">
                                  {durationSeconds > 0 && <span className="sidebar-duration">{formatClock(durationSeconds)}</span>}
                                  {durationSeconds > 0 && (
                                    <div className="sidebar-progress" aria-label={`Progresso ${Math.round(progress * 100)}%`}>
                                      <div className="sidebar-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
                                    </div>
                                  )}
                                </div>
                                <div className="status-indicator">
                                  {isCompleted && (
                                    <span className="completed-badge" aria-label="Aula concluída">Concluída</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
                <button className="sidebar-cta" onClick={handleNext} disabled={currentIndex >= videoList.length - 1}>
                  Próxima aula
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      {confirmState && (
        <div className="custom-modal-overlay" role="dialog" aria-modal="true" onClick={() => setConfirmState(null)}>
          <div className="custom-modal" onClick={(event) => event.stopPropagation()}>
            {confirmState.title && <h3>{confirmState.title}</h3>}
            <p>{confirmState.message}</p>
            <div className="custom-modal-actions">
              <button type="button" className="custom-modal-button secondary" onClick={() => setConfirmState(null)}>
                {confirmState.cancelLabel || 'Cancelar'}
              </button>
              <button
                type="button"
                className="custom-modal-button primary"
                onClick={() => {
                  try {
                    const outcome = confirmState.onConfirm();
                    if (outcome instanceof Promise) {
                      outcome.catch((error) => {
                        console.error(error);
                        showToast('Não foi possível atualizar o status da aula.', 'error');
                      });
                    }
                  } catch (error) {
                    console.error(error);
                    showToast('Não foi possível atualizar o status da aula.', 'error');
                  }
                }}
              >
                {confirmState.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toastState && (
        <div className={`streamer-toast ${toastState.tone || 'info'}`} role="status" aria-live="polite">
          {toastState.message}
        </div>
      )}
    </>
  );
};

export default StreamerMestre;
