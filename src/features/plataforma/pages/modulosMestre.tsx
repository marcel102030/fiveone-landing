import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import './streamerMestre.css';
import '../components/Streamer/streamerShared.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../../shared/utils/user';
import { fetchUserProgress } from '../services/progress';
import { getMinistry, LessonRef, listLessons, subscribePlatformContent } from '../services/platformContent';
import { listCompletedLessonIds } from '../../../shared/utils/completedLessons';

type ModuleCard = {
  id: number;
  moduleId: string;
  image: string;
  title: string;
  topics: string[];
  soon?: boolean;
  banner?: string | null;
};

const ModulosMestre = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonRef[]>(() => listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));

  useEffect(() => {
    const sync = () => {
      setLessons(listLessons({ ministryId: 'MESTRE', onlyPublished: true, onlyActive: true }));
    };
    sync();
    const unsubscribe = subscribePlatformContent(() => sync());
    return () => unsubscribe();
  }, []);

  const abrirModulo = async (module: ModuleCard) => {
    const moduleLessons = lessons.filter((lesson) => lesson.moduleId === module.moduleId);
    if (!moduleLessons.length) return;
    const completedIds = new Set(listCompletedLessonIds());
    const idSet = new Set(moduleLessons.map((lesson) => lesson.videoId));
    const urlSet = new Set(moduleLessons.map((lesson) => lesson.videoUrl).filter(Boolean) as string[]);
    const lessonById = new Map(moduleLessons.map((lesson) => [lesson.videoId, lesson] as const));
    const lessonByUrl = new Map(moduleLessons.filter((lesson) => !!lesson.videoUrl).map((lesson) => [lesson.videoUrl as string, lesson] as const));
    const firstLesson = moduleLessons[0];
    // 1) caminho rápido: localStorage
    let localBest: string | null = null;
    let localAt = 0;
    try {
      const raw = localStorage.getItem('videos_assistidos');
      const arr = raw ? JSON.parse(raw) : [];
      (arr as any[]).forEach(v => {
        const key = v.id || v.videoId || v.video_id || v.url;
        const lesson = lessonById.get(key) || lessonByUrl.get(key);
        if (lesson && completedIds.has(lesson.videoId)) return;
        const at = v.lastAt || 0;
        if ((idSet.has(key) || urlSet.has(key)) && at > localAt) {
          localAt = at; localBest = key;
        }
      });
    } catch {}
    if (localBest) {
      if (idSet.has(localBest)) return navigate(`/streamer-mestre?vid=${encodeURIComponent(localBest)}&mod=${encodeURIComponent(module.moduleId)}`);
      if (urlSet.has(localBest)) return navigate(`/streamer-mestre?v=${encodeURIComponent(localBest)}&mod=${encodeURIComponent(module.moduleId)}`);
    }

    // 2) background: tenta remoto com timeout curto; senão abre a primeira aula
    let navigated = false;
    const timer = setTimeout(() => {
      if (!navigated) {
        navigated = true;
        navigate(`/streamer-mestre?vid=${encodeURIComponent(firstLesson.videoId)}&mod=${encodeURIComponent(module.moduleId)}`);
      }
    }, 800);

    try {
      const uid = getCurrentUserId();
      if (uid) {
        const rows = await fetchUserProgress(uid, 100);
        let best: string | null = null; let bestAt = 0;
        rows.forEach(r => {
          if (completedIds.has(r.lesson_id)) return;
          if (idSet.has(r.lesson_id) || urlSet.has(r.lesson_id)) {
            const at = new Date(r.last_at).getTime();
            if (at > bestAt) { bestAt = at; best = r.lesson_id; }
          }
        });
        if (!navigated) {
          clearTimeout(timer);
          navigated = true;
          if (best) {
            if (idSet.has(best)) return navigate(`/streamer-mestre?vid=${encodeURIComponent(best)}&mod=${encodeURIComponent(module.moduleId)}`);
            if (urlSet.has(best)) return navigate(`/streamer-mestre?v=${encodeURIComponent(best)}&mod=${encodeURIComponent(module.moduleId)}`);
          }
          navigate(`/streamer-mestre?vid=${encodeURIComponent(firstLesson.videoId)}&mod=${encodeURIComponent(module.moduleId)}`);
        }
      }
    } catch {
      if (!navigated) {
        clearTimeout(timer);
        navigated = true;
        navigate(`/streamer-mestre?vid=${encodeURIComponent(firstLesson.videoId)}&mod=${encodeURIComponent(module.moduleId)}`);
      }
    }
  };

  const modules: ModuleCard[] = useMemo(() => {
    const ministry = getMinistry('MESTRE');
    if (!ministry) return [];
    return ministry.modules.map((module) => {
      const publishedLessons = lessons.filter((lesson) => lesson.moduleId === module.id);
      const topics = publishedLessons
        .map((lesson) => lesson.subjectName || lesson.title)
        .filter((value, index, array) => !!value && array.indexOf(value) === index)
        .slice(0, 4);
      const order = module.order + 1;
      const banner =
        publishedLessons.find((lesson) => lesson.bannerPlayer?.url || lesson.bannerPlayer?.dataUrl)?.bannerPlayer?.url ||
        publishedLessons.find((lesson) => lesson.bannerPlayer?.dataUrl)?.bannerPlayer?.dataUrl ||
        null;
      const image = banner || `/assets/images/modulo${String(order).padStart(2, '0')}.png`;
      return {
        id: order,
        moduleId: module.id,
        image,
        title: module.title,
        topics,
        soon: module.status !== 'published' || !publishedLessons.length,
        banner,
      };
    });
  }, [lessons]);

  return (
    <>
      <Header />
      <div className="wrapper-central">
        <div className="modulos-wrapper">
          <div className="modulos-container">
            {modules.map((m) => {
              const clickable = !m.soon;
              const handle = () => { if (clickable) abrirModulo(m); };
              return (
                <div
                  key={m.id}
                  className={`modulo-card ${clickable ? 'clickable' : 'disabled'}`}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : -1}
                  onClick={handle}
                  onKeyDown={(e) => {
                    if (!clickable) return;
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); }
                  }}
                  style={{ transition: 'all 0.3s ease', cursor: clickable ? 'pointer' : 'default' }}
                  aria-label={`${m.title}${clickable ? '' : ' (em breve)'}`}
                >
                  <div className="aula-card modulo" style={m.banner ? { backgroundImage: `url(${m.banner})` } : undefined}>
                    {!m.banner && (
                      <img src={m.image} alt={m.title} className="modulo-card-image" loading="lazy" />
                    )}
                    {m.soon && <div className="badge-embreve">Em Breve</div>}
                    <div className="modulo-card-label">{m.title}</div>
                    <div className="modulo-overlay">
                      <div className="mo-panel">
                        <div className="mo-title">O que você vai ver</div>
                        <ul className="mo-list">
                          {m.topics.map((t, i) => (
                            <li key={i} className="mo-item">{t}</li>
                          ))}
                        </ul>
                        {clickable ? <button className="mo-cta">Entrar</button> : <div className="mo-disabled">Em breve</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModulosMestre;
