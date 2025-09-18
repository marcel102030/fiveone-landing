import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './streamerMestre.css';
import '../../components/Streamer/streamerShared.css';
import ReactionBar from '../../components/Streamer/ReactionBar';
import CommentSection from '../../components/Streamer/CommentSection';
import Header from './Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUserId } from '../../utils/user';
import { upsertProgress } from '../../services/progress';
import { mestreModulo1Videos } from './data/mestreModule1';
import SubjectDropdown, { SubjectOption } from '../../components/SubjectDropdown/SubjectDropdown';

const StreamerMestre = () => {
  const videoList = mestreModulo1Videos;

  const [searchParams] = useSearchParams();
  function resolveIndexFromParams(): number {
    const vid = searchParams.get('vid');
    const i = searchParams.get('i');
    const v = searchParams.get('v');
    if (vid) {
      const idx = videoList.findIndex(x => x.id === vid);
      if (idx >= 0) return idx;
    }
    if (i) {
      const idx = Number(i); if (!Number.isNaN(idx) && idx >= 0 && idx < videoList.length) return idx;
    }
    if (v) {
      const url = decodeURIComponent(v);
      const idx = videoList.findIndex(x => x.url === url || url.includes(x.url) || x.url.includes(url));
      if (idx >= 0) return idx;
    }
    return 0;
  }
  const initialIndex = resolveIndexFromParams();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  // Página de player não mostra mais a grade de módulos
  const isModuloAberto = true;
  const videoRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // searchParams já usado acima


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
      const offset = Math.max(0, Math.round(rect.top - contentRect.top));
      s.style.marginTop = `${offset}px`;
    };

    // Observa tamanho do container do vídeo e também o iframe
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    const iframe = el.querySelector('iframe');
    if (iframe) iframe.addEventListener('load', update, { once: true });

    window.addEventListener('resize', update);
    // chama múltiplas vezes no primeiro segundo para garantir o acerto após layout
    update();
    const t1 = setTimeout(update, 50);
    const t2 = setTimeout(update, 250);
    const t3 = setTimeout(update, 600);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = videoRef.current?.querySelector('iframe');
      if (iframe) {
        const key = `fiveone_progress::${currentVideo.url}`;
        const now = Date.now();
        let state: any = {};
        try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
        const watched = Number(state.watchedSeconds || 0) + 5; // +5s a cada intervalo
        const duration = Number(state.durationSeconds || 0); // se um dia vier das APIs
        const payload = { watchedSeconds: watched, durationSeconds: duration, lastAt: now };
        try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}

        const currentVideoData = {
          title: currentVideo.title,
          thumbnail: currentVideo.thumbnail || '/assets/images/miniatura_fundamentos_mestre.png',
          url: currentVideo.url,
          index: currentIndex,
          id: currentVideo.id,
          subjectName: (currentVideo as any).subjectName,
          subjectId: (currentVideo as any).subjectId,
          watchedSeconds: watched,
          durationSeconds: duration,
          lastAt: now
        };
        const existingWatched = JSON.parse(localStorage.getItem('videos_assistidos') || '[]');
        const filteredWatched = existingWatched.filter((video: any) => video.url !== currentVideoData.url);
        const updatedWatched = [currentVideoData, ...filteredWatched];
        const limitedWatched = updatedWatched.slice(0, 12);
        try { localStorage.setItem('videos_assistidos', JSON.stringify(limitedWatched)); } catch {}

        // Persistir no Supabase (a cada ~15s)
        const userId = getCurrentUserId();
        if (userId) {
          const lastSyncKey = `fiveone_progress_sync_${currentVideo.id || currentVideo.url}`;
          const lastSync = Number(sessionStorage.getItem(lastSyncKey) || 0);
          if (Date.now() - lastSync > 15000) {
            sessionStorage.setItem(lastSyncKey, String(Date.now()));
            upsertProgress({
              user_id: userId,
              video_id: currentVideo.id || currentVideo.url,
              last_at: new Date(now).toISOString(),
              watched_seconds: watched,
              duration_seconds: duration || null,
              title: currentVideo.title,
              thumbnail: currentVideo.thumbnail || '/assets/images/miniatura_fundamentos_mestre.png',
            }).catch(()=>{});
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleMarkAsCompleted = () => {
    const id = videoList[currentIndex].id;
    if (!completedIds.has(id)) {
      const next = new Set(completedIds); next.add(id); setCompletedIds(next);
    }
  };
  useEffect(()=>{
    const uid = getCurrentUserId();
    if (!uid) return;
    const id = videoList[currentIndex].id;
    if (completedIds.has(id)){
      import('../../services/completions').then(m=> m.upsertCompletion(uid, id)).catch(()=>{});
    }
  }, [completedIds, currentIndex]);

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
    videoList.forEach(v => map.set(v.subjectId as string, v.subjectName as string));
    const arr = Array.from(map.entries()).map(([id, name]) => ({ id, name, count: videoList.filter(v => v.subjectId === id).length }));
    arr.sort((a,b)=> (subjectOrder.indexOf(a.id) === -1 ? 999 : subjectOrder.indexOf(a.id)) - (subjectOrder.indexOf(b.id) === -1 ? 999 : subjectOrder.indexOf(b.id)));
    return [{ id: 'all', name: 'Todas', count: videoList.length }, ...arr];
  }, [videoList]);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const filteredList = useMemo(() => filterSubject === 'all' ? videoList : videoList.filter(v => v.subjectId === filterSubject), [videoList, filterSubject]);
  useEffect(()=>{ sidebarRef.current?.scrollTo({ top: 0 }); }, [filterSubject]);
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
          {isModuloAberto && (
            <div className="video-and-sidebar">
              <div className="video-content">
                <div className="back-row">
                  <button className="back-to-modules" onClick={() => navigate('/modulos-mestre')}>← Voltar aos Módulos</button>
                </div>
                <h2 className="streamer-titulo">{currentVideo.title}</h2>
                <div className="subject-info">
                  <span className="subject-pill" title={`${currentVideo.subjectName} • ${currentVideo.subjectTeacher}`}>
                    {currentVideo.subjectName} • {currentVideo.subjectTeacher}
                  </span>
                </div>
                <div className="video-container" ref={videoRef}>
                  <iframe
                    src={currentVideo.url}
                    title={currentVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="action-bar" role="toolbar" aria-label="Controles da aula">
                  <div className="action-left">
                    <ReactionBar videoId={currentVideo.id || currentVideo.url} />
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
                    {!completedIds.has(videoList[currentIndex].id) ? (
                      <button className="action-btn complete" onClick={handleMarkAsCompleted}>Concluir</button>
                    ) : (
                      <div className="completed-indicator">Concluída</div>
                    )}
                  </div>
                </div>

                {currentVideo.pdfUrl && (
                  <div className="material-card">
                    <div className="material-info">
                      <div className="material-icon" aria-hidden />
                      <div className="material-text">
                        <div className="material-title">Material complementar <span className="badge-pdf">PDF</span></div>
                        <div className="material-sub">{(() => { try { return (currentVideo.pdfUrl||'').split('/').pop() || 'Conteúdo de apoio em PDF'; } catch { return 'Conteúdo de apoio em PDF'; } })()}</div>
                      </div>
                    </div>
                    <button className="material-btn" onClick={() => window.open(currentVideo.pdfUrl!, '_blank')}>Ver/baixar PDF</button>
                  </div>
                )}
                <div className="engagement-panel">
                  <CommentSection videoId={currentVideo.id || currentVideo.url} />
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
                      const globalIndex = videoList.findIndex(v => v.id === video.id);
                      items.push(
                        <li
                          key={`${video.id}-${index}`}
                          className={`sidebar-item ${globalIndex === currentIndex ? 'active' : ''}`}
                          title={video.title}
                          onClick={() => setCurrentIndex(globalIndex)}
                        >
                          <img
                            src={video.thumbnail || '/assets/images/miniatura_fundamentos_apostololicos.png'}
                            alt={`Miniatura ${video.title}`}
                            className="sidebar-thumbnail"
                          />
                          <div className="sidebar-video-info">
                            <div className="sidebar-video-title">{video.title}</div>
                            <div className="sidebar-video-subject">{video.subjectName}</div>
                            <div className="status-indicator">
                              {completedIds.has(video.id) && (
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
