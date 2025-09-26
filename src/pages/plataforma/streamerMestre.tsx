import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

const StreamerMestre = () => {
  const [videoList, setVideoList] = useState<LessonRef[]>(() => listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));

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
    const interval = setInterval(() => {
      const iframe = videoRef.current?.querySelector('iframe');
      const currentVideo = videoList[currentIndex];
      if (!iframe || !currentVideo) return;
      const progressKeyBase = currentVideo.videoUrl || currentVideo.videoId;
      if (!progressKeyBase) return;
      const key = `fiveone_progress::${progressKeyBase}`;
      const now = Date.now();
      let state: any = {};
      try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
      const watched = Number(state.watchedSeconds || 0) + 5;
      const duration = Number(state.durationSeconds || 0);
      const payload = { watchedSeconds: watched, durationSeconds: duration, lastAt: now };
      try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}

      const bannerContinue = currentVideo.bannerContinue;
      const bannerPlayer = currentVideo.bannerPlayer;
      const bannerMobile = currentVideo.bannerMobile;
      const resolvedBannerContinue = bannerContinue?.url || bannerContinue?.dataUrl || null;
      const resolvedBannerPlayer = bannerPlayer?.url || bannerPlayer?.dataUrl || null;
      const resolvedBannerMobile = bannerMobile?.url || bannerMobile?.dataUrl || null;
      const previewImage =
        (isMobile ? resolvedBannerMobile || resolvedBannerContinue : resolvedBannerContinue || resolvedBannerPlayer) ||
        resolvedBannerMobile ||
        currentVideo.thumbnailUrl ||
        '/assets/images/miniatura_fundamentos_mestre.png';

      const currentVideoData = {
        title: currentVideo.title,
        thumbnail: previewImage,
        url: currentVideo.videoUrl || currentVideo.videoId,
        index: currentIndex,
        id: currentVideo.videoId,
        subjectName: currentVideo.subjectName,
        subjectId: currentVideo.subjectId,
        bannerContinue: resolvedBannerContinue,
        bannerMobile: resolvedBannerMobile,
        watchedSeconds: watched,
        durationSeconds: duration,
        lastAt: now,
      };
      const existingWatched = JSON.parse(localStorage.getItem('videos_assistidos') || '[]');
      const filteredWatched = existingWatched.filter((video: any) => video.url !== currentVideoData.url);
      const updatedWatched = [currentVideoData, ...filteredWatched];
      const limitedWatched = updatedWatched.slice(0, 12);
      try { localStorage.setItem('videos_assistidos', JSON.stringify(limitedWatched)); } catch {}

      const userId = getCurrentUserId();
      if (userId) {
        const lastSyncKey = `fiveone_progress_sync_${currentVideo.videoId || currentVideo.videoUrl}`;
        const lastSync = Number(sessionStorage.getItem(lastSyncKey) || 0);
        if (Date.now() - lastSync > 15000) {
          sessionStorage.setItem(lastSyncKey, String(Date.now()));
          upsertProgress({
            user_id: userId,
            video_id: currentVideo.videoId || currentVideo.videoUrl || currentVideo.title,
            last_at: new Date(now).toISOString(),
            watched_seconds: watched,
            duration_seconds: duration || null,
            title: currentVideo.title,
            thumbnail: previewImage,
          }).catch(()=>{});
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, videoList, isMobile]);

  const handleMarkAsCompleted = () => {
    const lesson = videoList[currentIndex];
    if (!lesson) return;
    if (!completedIds.has(lesson.videoId)) {
      const next = new Set(completedIds); next.add(lesson.videoId); setCompletedIds(next);
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
  const currentVideo = videoList[currentIndex];
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
                  {currentVideo.embedCode ? (
                    <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: currentVideo.embedCode }} />
                  ) : (
                    <iframe
                      key={currentVideo.videoId}
                      src={currentVideo.videoUrl || ''}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
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
