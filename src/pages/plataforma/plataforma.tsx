import Header from "./Header";
import "./plataforma.css";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUserId } from "../../utils/user";
import { fetchUserProgress, deleteProgressExceptForUser } from "../../services/progress";
import { listLessons, LessonRef, subscribePlatformContent } from "../../services/platformContent";
import {
  COMPLETED_EVENT,
  CompletedLessonInfo,
  mergeCompletedLessons,
  readCompletedLessons,
} from "../../utils/completedLessons";

type ModalState = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => Promise<void> | void;
};

const PaginaInicial = () => {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [mestreLessons, setMestreLessons] = useState<LessonRef[]>(() => listLessons({ ministryId: "MESTRE", onlyPublished: true, onlyActive: true }));
  const [lastWatchedArray, setLastWatchedArray] = useState<any[]>([]);
  const [completedMap, setCompletedMap] = useState<Map<string, CompletedLessonInfo>>(() => readCompletedLessons());
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    setMestreLessons(listLessons({ ministryId: "MESTRE", onlyPublished: true, onlyActive: true }));
    const unsubscribe = subscribePlatformContent(() => {
      setMestreLessons(listLessons({ ministryId: "MESTRE", onlyPublished: true, onlyActive: true }));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sync = () => setCompletedMap(readCompletedLessons());
    sync();
    const handler = () => sync();
    window.addEventListener(COMPLETED_EVENT, handler);
    const storageHandler = (event: StorageEvent) => {
      if (event.key === 'fiveone_completed_lessons_v1') sync();
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(COMPLETED_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);
  const lessonByVideoId = useMemo(() => {
    const map = new Map<string, LessonRef>();
    mestreLessons.forEach((lesson) => {
      map.set(lesson.videoId, lesson);
    });
    return map;
  }, [mestreLessons]);
  useEffect(() => {
    let active = true;
    // 1) carrega localStorage imediatamente para evitar atraso
    try {
      const raw = localStorage.getItem('videos_assistidos');
      const parsed = raw ? JSON.parse(raw) : [];
      const byKey = new Map<string, any>();
      (parsed as any[]).forEach(v => {
        const key = v.id || v.url;
        const prev = byKey.get(key);
        if (!prev || (v.lastAt || 0) > (prev.lastAt || 0)) byKey.set(key, v);
      });
      const localArr = Array.from(byKey.values());
      localArr.sort((a,b)=> (b.lastAt||0) - (a.lastAt||0));
      if (localArr.length) {
        const enrichedLocal = localArr.map((item: any) => {
          const lesson = lessonByVideoId.get(item.id || item.videoId || item.url);
          return {
            ...item,
            subjectName: item.subjectName || lesson?.subjectName,
            bannerContinue: item.bannerContinue || lesson?.bannerContinue?.url || lesson?.bannerContinue?.dataUrl || null,
            bannerMobile: item.bannerMobile || lesson?.bannerMobile?.url || lesson?.bannerMobile?.dataUrl || null,
            thumbnail:
              item.thumbnail ||
              lesson?.bannerContinue?.url ||
              lesson?.bannerContinue?.dataUrl ||
              lesson?.bannerMobile?.url ||
              lesson?.bannerMobile?.dataUrl ||
              lesson?.thumbnailUrl ||
              item.bannerContinue,
          };
        });
        setLastWatchedArray(enrichedLocal);
      }
    } catch {}

    // 2) busca remota em background e atualiza caso tenha dados
    (async () => {
      const uid = getCurrentUserId();
      if (!uid) return;
      try {
        const rows = await fetchUserProgress(uid, 24);
        if (!active) return;
        if (rows && rows.length) {
          const merged = mergeCompletedLessons(rows.map((r) => r.video_id));
          setCompletedMap(merged);
          const remote = rows.map(r => ({
            id: r.video_id,
            url: '',
            index: undefined,
            title: r.title,
            thumbnail: r.thumbnail,
            watchedSeconds: r.watched_seconds,
            durationSeconds: r.duration_seconds || undefined,
            lastAt: new Date(r.last_at).getTime(),
            subjectName: lessonByVideoId.get(r.video_id)?.subjectName,
            bannerContinue:
              lessonByVideoId.get(r.video_id)?.bannerContinue?.url ||
              lessonByVideoId.get(r.video_id)?.bannerContinue?.dataUrl ||
              null,
            bannerMobile:
              lessonByVideoId.get(r.video_id)?.bannerMobile?.url ||
              lessonByVideoId.get(r.video_id)?.bannerMobile?.dataUrl ||
              null,
          }));
          setLastWatchedArray(remote);
        }
      } catch {}
    })();

    return () => { active = false; };
  }, [lessonByVideoId]);

  const completedIds = useMemo(() => new Set(Array.from(completedMap.keys())), [completedMap]);

  const getVideoKey = useCallback((video: any): string | null => {
    if (!video) return null;
    if (typeof video.id === 'string' && video.id) return video.id;
    if (typeof video.videoId === 'string' && video.videoId) return video.videoId;
    if (typeof video.video_id === 'string' && video.video_id) return video.video_id;
    if (typeof video.url === 'string' && video.url) return video.url;
    return null;
  }, []);

  const visibleLastWatched = useMemo(() => {
    if (!lastWatchedArray.length) return [] as any[];
    return lastWatchedArray.filter((item) => {
      const key = getVideoKey(item);
      if (!key) return true;
      return !completedIds.has(key);
    });
  }, [lastWatchedArray, completedIds, getVideoKey]);

  const performClearHistory = useCallback(async () => {
    const completedIdList = Array.from(completedIds.values()).filter((id): id is string => typeof id === 'string' && id.length > 0);
    const keepBases = new Set<string>();
    let storedWatched: Array<{ id?: string; videoId?: string; url?: string }> = [];

    try {
      const watchedRaw = localStorage.getItem('videos_assistidos');
      if (watchedRaw) {
        const parsed = JSON.parse(watchedRaw);
        if (Array.isArray(parsed)) storedWatched = parsed as Array<{ id?: string; videoId?: string; url?: string }>;
      }
    } catch {}

    if (completedIdList.length) {
      mestreLessons.forEach((lesson) => {
        if (!lesson.videoId) return;
        if (!completedIds.has(lesson.videoId)) return;
        const base = lesson.videoUrl || lesson.videoId;
        if (base) keepBases.add(base);
      });
      storedWatched.forEach((item) => {
        const candidateId = item?.id || item?.videoId;
        if (candidateId && completedIds.has(candidateId)) {
          const base = (typeof item?.url === 'string' && item.url) || candidateId;
          if (base) keepBases.add(base);
        }
      });
    }

    try {
      localStorage.removeItem('videos_assistidos');
      const progressPrefix = 'fiveone_progress::';
      const progressKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(progressPrefix)) {
          const base = key.slice(progressPrefix.length);
          if (!keepBases.has(base)) {
            progressKeys.push(key);
          }
        }
      }
      progressKeys.forEach((key) => {
        try { localStorage.removeItem(key); } catch {}
      });

      try {
        const syncPrefix = 'fiveone_progress_sync_';
        const syncKeys: string[] = [];
        for (let i = 0; i < sessionStorage.length; i += 1) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(syncPrefix)) {
            syncKeys.push(key);
          }
        }
        syncKeys.forEach((key) => {
          try { sessionStorage.removeItem(key); } catch {}
        });
      } catch {}

      const uid = getCurrentUserId();
      if (uid) {
        await deleteProgressExceptForUser(uid, completedIdList);
      }

      setLastWatchedArray([]);
    } catch (error) {
      console.error('Falha ao limpar histórico', error);
      throw error;
    }
  }, [completedIds, mestreLessons]);

  const handleClearContinue = useCallback(() => {
    setModalState({
      title: 'Limpar histórico',
      message:
        'Ao limpar o histórico, todas as aulas que não foram concluídas terão o progresso reiniciado. As aulas já concluídas continuarão marcadas como concluídas. Deseja continuar?',
      cancelLabel: 'Cancelar',
      confirmLabel: 'Limpar histórico',
      onConfirm: async () => {
        await performClearHistory();
      },
    });
  }, [performClearHistory]);

  const scrollCarousel = (direction: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction * 300,
        behavior: "smooth",
      });
    }
  };

  const handleShowModal = (message: string, title?: string) => {
    setModalState({ message, title });
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleModalConfirm = useCallback(async () => {
    const action = modalState?.onConfirm;
    setModalState(null);
    if (!action) return;
    try {
      await action();
    } catch (error) {
      console.error('Ação do modal falhou', error);
      setModalState({ title: 'Ops!', message: 'Não foi possível concluir a ação. Tente novamente em instantes.' });
    }
  }, [modalState]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroSlides = [
    { title: 'Escola de Formação Ministerial', text: 'Conteúdos bíblicos e ministeriais para sua jornada.' },
    { title: 'Estude no seu ritmo', text: 'Aulas organizadas por módulos, com histórico e materiais.' },
    { title: 'Faça parte da comunidade', text: 'Conecte-se e cresça junto com outros alunos.' },
  ];

  const bemVindosRef = useRef<HTMLDivElement | null>(null);

  const scrollBemVindos = (direction: 1 | -1) => {
    const container = bemVindosRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  };
  const [hsIndex, setHsIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHsIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Header />
      <div id="inicio" className="inicio-container">
        <div className="hero-slider" role="region" aria-label="Destaques">
          <div className="hs-track">
            {heroSlides.map((s, i) => (
              <div key={i} className={`hs-slide ${i === hsIndex ? 'active' : ''}`} aria-hidden={i !== hsIndex}>
                <h2 className="hs-title">{s.title}</h2>
                <p className="hs-text">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="hs-actions">
            <button className="hs-btn primary" onClick={() => scrollToId('sec-formacao')}>Explorar módulos</button>
            {visibleLastWatched.length > 0 && (
              <button
                className="hs-btn outline"
                onClick={() => {
                  const v:any = visibleLastWatched[0];
                  if (v.id) navigate(`/streamer-mestre?vid=${encodeURIComponent(v.id)}`);
                  else if (typeof v.index === 'number') navigate(`/streamer-mestre?i=${v.index}`);
                  else navigate(`/streamer-mestre?v=${encodeURIComponent(v.url)}`);
                }}
              >
                Retomar aula
              </button>
            )}
          </div>
          <div className="hs-dots" role="tablist">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`hs-dot ${i === hsIndex ? 'active' : ''}`}
                aria-label={`Ir para slide ${i + 1}`}
                aria-selected={i === hsIndex}
                onClick={() => setHsIndex(i)}
              />
            ))}
          </div>
        </div>
        <button className="section-arrow" aria-label="Ir para Bem-vindos" onClick={() => scrollToId(visibleLastWatched.length ? 'sec-bem-vindos' : 'sec-formacao')}>
          <span className="chevron" />
        </button>
      </div>
      <section id="sec-bem-vindos" className="bem-vindos">
        {visibleLastWatched.length ? (
          <div className="continuar-banner">
            <div className="continuar-banner-info">
              <div className="cb-title">Última Aula Assistida</div>
              <div className="cb-sub">{visibleLastWatched[0].title}</div>
              {visibleLastWatched[0].subjectName && (
                <div className="cb-pill">{visibleLastWatched[0].subjectName}</div>
              )}
            </div>
            <button className="cb-btn" onClick={() => {
              const v:any = visibleLastWatched[0];
              if (v.id) window.location.hash = `#/streamer-mestre?vid=${encodeURIComponent(v.id)}`;
              else if (typeof v.index === 'number') window.location.hash = `#/streamer-mestre?i=${v.index}`;
              else window.location.hash = `#/streamer-mestre?v=${encodeURIComponent(v.url)}`;
            }}>Retomar aula</button>
          </div>
        ) : null}
        <h2>Bem-Vindos</h2>
        <p>Sua Jornada Começa aqui</p>
        <div className="bem-vindos-carousel" aria-label="Bem-vindos">
          <button type="button" className="bw-arrow bw-arrow--prev" onClick={() => scrollBemVindos(-1)} aria-label="Cartões anteriores">
            ‹
          </button>
          <div className="bem-vindos-container" ref={bemVindosRef}>
            <div
              className="bem-vindos-item"
              role="button"
              style={{ backgroundImage: "url('/assets/images/BemVindo.png')" }}
            />
            <div
              className="bem-vindos-item"
              role="button"
              style={{ backgroundImage: "url('/assets/images/OQueEFiveOne.png')" }}
            />
            <div
              className="bem-vindos-item"
              role="button"
              style={{ backgroundImage: "url('/assets/images/SuaJornada.png')" }}
            />
            <div
              className="bem-vindos-item"
              role="button"
              style={{ backgroundImage: "url('/assets/images/Conectese.png')" }}
            />
            <div
              className="bem-vindos-item"
              role="button"
              style={{ backgroundImage: "url('/assets/images/Explore.png')" }}
            />
          </div>
          <button type="button" className="bw-arrow bw-arrow--next" onClick={() => scrollBemVindos(1)} aria-label="Próximos cartões">
            ›
          </button>
        </div>
        <div className="section-arrow-wrap">
          <button className="section-arrow" aria-label="Ir para Continuar Assistindo" onClick={() => scrollToId(visibleLastWatched.length ? 'sec-continuar' : 'sec-formacao')}>
            <span className="chevron" />
          </button>
        </div>
      </section>
      {visibleLastWatched.length ? (
          <section id="sec-continuar" className="continuar-assistindo">
            <div className="continuar-seta">↓</div>
            <h2>Continuar Assistindo</h2>
            <button className="clear-continue-btn" onClick={handleClearContinue}>Limpar histórico</button>
            <div className="carousel-wrapper">
              <button className="arrow left" onClick={() => scrollCarousel(-1)}>‹</button>
              <div
                className={`continuar-container ${visibleLastWatched.length <= 1 ? 'single' : ''}`}
                ref={carouselRef}
              >
                {visibleLastWatched.map((video: any, index: number) => {
                  const desktopImage = video.thumbnail || video.bannerContinue || video.bannerMobile || '/assets/images/miniatura_fundamentos_mestre.png';
                  const mobileImage = video.bannerMobile || video.bannerContinue || video.thumbnail || desktopImage;
                  const selectedImage = isMobile ? mobileImage : desktopImage;
                  const cardStyle = selectedImage ? { backgroundImage: `url('${selectedImage}')` } : undefined;
                  const watchedSeconds = Number(video.watchedSeconds || 0);
                  const durationSeconds = Number(video.durationSeconds || 0);
                  const effectiveDuration = durationSeconds > 0 ? durationSeconds : Math.max(watchedSeconds, 1);
                  const progressPercent = effectiveDuration > 0 ? Math.min(100, Math.round((watchedSeconds / effectiveDuration) * 100)) : 0;
                  return (
                    <div
                      key={index}
                      className="continuar-card"
                      style={cardStyle}
                      role="button"
                      title={video.title}
                      onClick={() => {
                        if (video.id) navigate(`/streamer-mestre?vid=${encodeURIComponent(video.id)}`);
                        else if (typeof video.index === 'number') navigate(`/streamer-mestre?i=${video.index}`);
                        else navigate(`/streamer-mestre?v=${encodeURIComponent(video.url)}`);
                      }}
                    >
                      <div className="continuar-overlay">
                        <p>{video.title}</p>
                        {video.subjectName && <span className="continuar-subject">{video.subjectName}</span>}
                        <div className="continuar-meta">
                          {durationSeconds > 0 ? (
                            <span className="dur">{Math.floor(durationSeconds/60)}:{String(Math.floor(durationSeconds%60)).padStart(2,'0')}</span>
                          ) : (
                            <span className="dur">{Math.max(1, Math.floor(watchedSeconds/60))} min vistos</span>
                          )}
                        </div>
                        <div className="play-badge" aria-hidden>▶</div>
                        <div className="continuar-progress">
                          <div className="bar" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="arrow right" onClick={() => scrollCarousel(1)}>›</button>
            </div>
            <div className="section-arrow-wrap">
              <button className="section-arrow" aria-label="Ir para Formação Ministerial" onClick={() => scrollToId('sec-formacao')}>
                <span className="chevron" />
              </button>
            </div>
          </section>
        ) : null}
      <section id="sec-formacao" className="formacao-ministerial">
        {/* <div className="arrow-icon">↓</div> */}
        <h2>Sua Formação Ministerial</h2>
        <div className="formacao-container">
          <div
            className="formacao-item"
            onClick={() => handleShowModal('Em breve: O Dom Apostólico estará disponível com conteúdos exclusivos sobre como reconhecê-lo e desenvolvê-lo.')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleShowModal('Em breve: O Dom Apostólico estará disponível com conteúdos exclusivos sobre como reconhecê-lo e desenvolvê-lo.');
              }
            }}
          >
            <img src="/assets/images/apostolo.png" alt="Formação Apostólica em breve" loading="lazy" />
          </div>
          <div
            className="formacao-item"
            onClick={() => handleShowModal('Em breve: O Dom Profético será ativado com recursos para interpretação, proclamação e exortação segundo a Palavra.')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleShowModal('Em breve: O Dom Profético será ativado com recursos para interpretação, proclamação e exortação segundo a Palavra.');
              }
            }}
          >
            <img src="/assets/images/profeta.png" alt="Formação Profética em breve" loading="lazy" />
          </div>
          <div
            className="formacao-item"
            onClick={() => handleShowModal('Em breve: Conteúdos evangelísticos para equipar você na proclamação do Evangelho serão liberados.')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleShowModal('Em breve: Conteúdos evangelísticos para equipar você na proclamação do Evangelho serão liberados.');
              }
            }}
          >
            <img src="/assets/images/evangelista.png" alt="Formação Evangelística em breve" loading="lazy" />
          </div>
          <div
            className="formacao-item"
            onClick={() => handleShowModal('Em breve: O Dom Pastoral estará disponível com fundamentos para cuidado e discipulado cristão.')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleShowModal('Em breve: O Dom Pastoral estará disponível com fundamentos para cuidado e discipulado cristão.');
              }
            }}
          >
            <img src="/assets/images/pastor.png" alt="Formação Pastoral em breve" loading="lazy" />
          </div>
          <Link to="/modulos-mestre" className="formacao-item" aria-label="Acessar formação Mestre">
            <img src="/assets/images/mestre.png" alt="Formação Mestre" loading="lazy" />
          </Link>
        </div>
        {modalState && (
          <div className="custom-modal-overlay" role="dialog" aria-modal="true" onClick={handleCloseModal}>
            <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
              {modalState.title && <h3>{modalState.title}</h3>}
              <p>{modalState.message}</p>
              {modalState.onConfirm ? (
                <div className="custom-modal-actions">
                  <button type="button" className="custom-modal-button secondary" onClick={handleCloseModal}>
                    {modalState.cancelLabel || 'Cancelar'}
                  </button>
                  <button type="button" className="custom-modal-button primary" onClick={handleModalConfirm}>
                    {modalState.confirmLabel || 'Confirmar'}
                  </button>
                </div>
              ) : (
                <div className="custom-modal-actions single">
                  <button type="button" className="custom-modal-button primary" onClick={handleCloseModal}>
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

const AppRouter = () => {
  return <PaginaInicial />;
};

export default AppRouter;
