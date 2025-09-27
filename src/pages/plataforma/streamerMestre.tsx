import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './streamerMestre.css';
import '../../components/Streamer/streamerShared.css';
import ReactionBar from '../../components/Streamer/ReactionBar';
import CommentSection from '../../components/Streamer/CommentSection';
import Header from './Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUserId } from '../../utils/user';
import { upsertProgress } from '../../services/progress';
import { LessonRef, listLessons, subscribePlatformContent } from '../../services/platformContent';
import SubjectDropdown, { SubjectOption } from '../../components/SubjectDropdown/SubjectDropdown';
import { openStoredFile } from '../../utils/storedFile';

const extractEmbedSrc = (raw?: string | null): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const doubleMatch = trimmed.match(/src\s*=\s*"([^"]+)"/i);
  if (doubleMatch?.[1]) return doubleMatch[1];
  const singleMatch = trimmed.match(/src\s*=\s*'([^']+)'/i);
  if (singleMatch?.[1]) return singleMatch[1];
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
};

type VimeoPlayer = import('@vimeo/player').default;

type StoredProgress = {
  watchedSeconds: number;
  durationSeconds: number;
  lastAt: number;
};

const getStoredProgress = (video?: LessonRef | null): StoredProgress | null => {
  if (!video) return null;
  const base = video.videoUrl || video.videoId;
  if (!base) return null;
  const key = `fiveone_progress::${base}`;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    if (!parsed) return null;
    const watchedSeconds = Number(parsed.watchedSeconds || parsed.watched || 0);
    const durationSeconds = Number(parsed.durationSeconds || parsed.duration || 0);
    const lastAt = Number(parsed.lastAt || 0);
    if (Number.isFinite(watchedSeconds)) {
      return {
        watchedSeconds: Math.max(0, watchedSeconds),
        durationSeconds: Number.isFinite(durationSeconds) ? Math.max(0, durationSeconds) : 0,
        lastAt: Number.isFinite(lastAt) ? lastAt : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
};

const StreamerMestre = () => {
  const [videoList, setVideoList] = useState<LessonRef[]>(() => listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));
  const playerInstanceRef = useRef<VimeoPlayer | null>(null);
  const lastProgressFlushRef = useRef<number>(0);

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
      const idx = videoList.findIndex(item => item.videoId === vid);
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
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  // Página de player não mostra mais a grade de módulos
  const isModuloAberto = true;
  const videoRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // searchParams já usado acima
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const currentVideo = videoList[currentIndex];
  const embedSrc = useMemo(() => {
    if (!currentVideo) return '';
    return extractEmbedSrc(currentVideo.embedCode) || currentVideo.videoUrl || '';
  }, [currentVideo?.embedCode, currentVideo?.videoUrl]);
  const persistProgress = useCallback(
    (rawWatched: number, rawDuration?: number) => {
      const lesson = videoList[currentIndex];
      if (!lesson) return;
      const keyBase = lesson.videoUrl || lesson.videoId;
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
        url: lesson.videoUrl || lesson.videoId,
        index: currentIndex,
        id: lesson.videoId,
        subjectName: lesson.subjectName,
        subjectId: lesson.subjectId,
        bannerContinue: resolvedBannerContinue,
        bannerMobile: resolvedBannerMobile,
        watchedSeconds,
        durationSeconds,
        lastAt: now,
      };

      try {
        const existingWatchedRaw = localStorage.getItem('videos_assistidos');
        const existingWatched = existingWatchedRaw ? JSON.parse(existingWatchedRaw) : [];
        const filteredWatched = Array.isArray(existingWatched)
          ? existingWatched.filter((video: any) => video.url !== currentVideoData.url)
          : [];
        const updatedWatched = [currentVideoData, ...filteredWatched];
        const limitedWatched = updatedWatched.slice(0, 12);
        localStorage.setItem('videos_assistidos', JSON.stringify(limitedWatched));
      } catch {}

      const userId = getCurrentUserId();
      if (userId) {
        const syncKey = `fiveone_progress_sync_${lesson.videoId || lesson.videoUrl}`;
        const lastSync = Number(sessionStorage.getItem(syncKey) || 0);
        if (now - lastSync > 15000) {
          sessionStorage.setItem(syncKey, String(now));
          upsertProgress({
            user_id: userId,
            video_id: lesson.videoId || lesson.videoUrl || lesson.title,
            last_at: new Date(now).toISOString(),
            watched_seconds: watchedSeconds,
            duration_seconds: durationSeconds || null,
            title: lesson.title,
            thumbnail: previewImage,
          }).catch(() => {});
        }
      }
    },
    [videoList, currentIndex, isMobile],
  );


  // Mantém a altura da sidebar alinhada com a altura do vídeo (iframe)
  useLayoutEffect(() => {
    const el = videoRef.current;
    const side = sidebarRef.current;
    if (!el || !side) return;

    const mq = window.matchMedia('(max-width: 1024px)');

    const update = () => {
      if (!sidebarRef.current) return;
      const s = sidebarRef.current;
      if (mq.matches) {
        s.style.removeProperty('--sidebar-height');
        s.style.height = 'auto';
        s.style.marginTop = '0px';
        return;
      }
      const iframe = el.querySelector('iframe');
      const rect = (iframe || el).getBoundingClientRect();
      const content = el.closest('.video-content') as HTMLElement | null;
      const contentRect = content ? content.getBoundingClientRect() : { top: rect.top } as any;
      const h = Math.max(320, Math.round(rect.height));
      s.style.setProperty('--sidebar-height', `${h}px`);
      s.style.height = `${h}px`;
      // Alinha exatamente ao topo do vídeo
      const rawOffset = Math.round(rect.top - contentRect.top);
      const offset = Math.max(0, rawOffset);
      s.style.marginTop = `${offset}px`;
    };

    const observers: ResizeObserver[] = [];
    const cleanups: Array<() => void> = [];

    // Observa tamanho/posição do container do vídeo
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    observers.push(ro);

    const iframe = el.querySelector('iframe');
    if (iframe) {
      // Observa mudanças no tamanho do iframe (ex.: player ajustando altura)
      const roIframe = new ResizeObserver(() => update());
      roIframe.observe(iframe);
      observers.push(roIframe);
      iframe.addEventListener('load', update, { once: true });
    }

    const content = el.closest('.video-content') as HTMLElement | null;
    if (content) {
      const roContent = new ResizeObserver(() => update());
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
    // chama múltiplas vezes no primeiro segundo para garantir o acerto após layout
    update();
    const t1 = setTimeout(update, 50);
    const t2 = setTimeout(update, 250);
    const t3 = setTimeout(update, 600);

    return () => {
      observers.forEach((observer) => observer.disconnect());
      cleanups.forEach((fn) => fn());
      window.removeEventListener('resize', update);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [currentIndex]);

  useEffect(() => {
    const lesson = videoList[currentIndex];
    if (!lesson) return;
    if (lesson.sourceType === 'VIMEO') return;

    let destroyed = false;
    let watchedBaseline = getStoredProgress(lesson)?.watchedSeconds || 0;
    const durationBaseline = getStoredProgress(lesson)?.durationSeconds || 0;

    const tick = () => {
      if (destroyed) return;
      watchedBaseline += 5;
      persistProgress(watchedBaseline, durationBaseline);
    };

    const interval = window.setInterval(tick, 5000);
    tick();
    return () => {
      destroyed = true;
      window.clearInterval(interval);
    };
  }, [videoList, currentIndex, persistProgress]);

  useEffect(() => {
    const lesson = currentVideo;
    const vimeoSrc = embedSrc;
    if (!lesson || lesson.sourceType !== 'VIMEO' || !vimeoSrc || !/vimeo\.com/i.test(vimeoSrc)) {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy().catch(() => {});
        playerInstanceRef.current = null;
      }
      return;
    }

    let cancelled = false;
    lastProgressFlushRef.current = 0;
    (async () => {
      try {
        const iframe = videoRef.current?.querySelector('iframe');
        if (!iframe) return;
        const { default: Player } = await import('@vimeo/player');
        if (cancelled) return;
        playerInstanceRef.current?.destroy().catch(() => {});
        const player = new Player(iframe);
        playerInstanceRef.current = player;

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
          tryResume(Number(data?.duration)).catch(() => {});
          const duration = Number(data?.duration || stored?.durationSeconds || 0);
          if (duration > 0) {
            persistProgress(stored?.watchedSeconds || 0, duration);
          }
        });

        player.on('durationchange', (data: any) => {
          tryResume(Number(data?.duration)).catch(() => {});
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
      } catch (error) {
        console.warn('Falha ao inicializar player Vimeo', error);
      }
    })();

    return () => {
      cancelled = true;
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy().catch(() => {});
        playerInstanceRef.current = null;
      }
    };
  }, [currentVideo?.videoId, currentVideo?.sourceType, embedSrc, persistProgress]);

  const handleMarkAsCompleted = () => {
    const lesson = videoList[currentIndex];
    if (!lesson) return;
    if (!completedIds.has(lesson.videoId)) {
      const next = new Set(completedIds); next.add(lesson.videoId); setCompletedIds(next);
    }
    if (lesson.sourceType === 'VIMEO' && playerInstanceRef.current) {
      playerInstanceRef.current.getDuration().then((duration) => {
        const total = Number(duration) || getStoredProgress(lesson)?.durationSeconds || 0;
        if (total > 0) {
          persistProgress(total, total);
        }
      }).catch(() => {
        const stored = getStoredProgress(lesson);
        if (stored?.durationSeconds) {
          persistProgress(stored.durationSeconds, stored.durationSeconds);
        }
      });
    } else {
      const stored = getStoredProgress(lesson);
      if (stored?.durationSeconds) {
        persistProgress(stored.durationSeconds, stored.durationSeconds);
      }
    }
  };
  useEffect(()=>{
    const uid = getCurrentUserId();
    if (!uid) return;
    const lesson = videoList[currentIndex];
    if (!lesson) return;
    const id = lesson.videoId;
    if (completedIds.has(id)){
      import('../../services/completions').then(m=> m.upsertCompletion(uid, id)).catch(()=>{});
    }
  }, [completedIds, currentIndex, videoList]);

  // Load completions for user once
  useEffect(()=>{
    const uid = getCurrentUserId();
    if (!uid) return;
    import('../../services/completions').then(async (m)=>{
      try { const list = await m.fetchCompletionsForUser(uid); setCompletedIds(new Set(list)); } catch {}
    });
  }, []);
  const navigate = useNavigate();
  // Filtro por matéria na sidebar
  const subjectOrder = ['biblia','fundamentos','ministerios','historia'];
  const subjects: SubjectOption[] = useMemo(() => {
    const map = new Map<string, string>();
    videoList.forEach(v => {
      if (v.subjectId) map.set(v.subjectId, v.subjectName || v.subjectId);
    });
    const arr = Array.from(map.entries()).map(([id, name]) => ({ id, name, count: videoList.filter(v => v.subjectId === id).length }));
    arr.sort((a,b)=> (subjectOrder.indexOf(a.id) === -1 ? 999 : subjectOrder.indexOf(a.id)) - (subjectOrder.indexOf(b.id) === -1 ? 999 : subjectOrder.indexOf(b.id)));
    return [{ id: 'all', name: 'Todas', count: videoList.length }, ...arr];
  }, [videoList]);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const filteredList = useMemo(() => filterSubject === 'all' ? videoList : videoList.filter(v => v.subjectId === filterSubject), [videoList, filterSubject]);
  useEffect(()=>{ sidebarRef.current?.scrollTo({ top: 0 }); }, [filterSubject]);
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
            <div className="video-and-sidebar">
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
                <div className="video-container" ref={videoRef}>
                  <iframe
                    key={currentVideo.videoId || embedSrc || currentVideo.videoUrl || currentVideo.id}
                    src={embedSrc || 'about:blank'}
                    title={currentVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <div className="action-bar" role="toolbar" aria-label="Controles da aula">
                  <div className="action-left">
                    <ReactionBar videoId={currentVideo.videoId || currentVideo.videoUrl || currentVideo.title} />
                  </div>
                  <div className="action-center">
                    {currentIndex > 0 && (
                      <button className="action-btn prev" onClick={handlePrevious}>Anterior</button>
                    )}
                    {currentIndex < videoList.length - 1 && (
                      <button className="action-btn next" onClick={handleNext}>Próxima</button>
                    )}
                  </div>
                  <div className="action-right">
                    {!completedIds.has(videoList[currentIndex].videoId) ? (
                      <button className="action-btn complete" onClick={handleMarkAsCompleted}>Concluir</button>
                    ) : (
                      <div className="completed-indicator">Concluída</div>
                    )}
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
                  <CommentSection videoId={currentVideo.videoId || currentVideo.videoUrl || currentVideo.title} />
                </div>
              </div>
              <div className="video-sidebar" ref={sidebarRef} data-filtered={filterSubject !== 'all'}>
                <h3 className="sidebar-title">Próximas Aulas</h3>
                <SubjectDropdown
                  label="Matéria"
                  value={filterSubject}
                  onChange={setFilterSubject}
                  options={subjects}
                />
                <ul className="sidebar-list">
                  {(() => {
                    const items: JSX.Element[] = [];
                    filteredList.forEach((video, index) => {
                      const globalIndex = videoList.findIndex(v => v.videoId === video.videoId);
                      if (globalIndex === -1) return;
                      items.push(
                        <li
                          key={`${video.videoId}-${index}`}
                          className={`sidebar-item ${globalIndex === currentIndex ? 'active' : ''}`}
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
                            <div className="status-indicator">
                              {completedIds.has(video.videoId) && (
                                <span className="completed-badge" aria-label="Aula concluída">Concluída</span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    });
                    return items;
                  })()}
                </ul>
                <button className="sidebar-cta" onClick={handleNext}>Ir para o próximo módulo</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default StreamerMestre;
