import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
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
  totalLessons: number;
  completedCount: number;
};

interface Props {
  courseId?: string;
}

const CursoModulos = ({ courseId: propCourseId }: Props) => {
  const { courseId: paramId } = useParams<{ courseId: string }>();
  const courseId = propCourseId || paramId || '';
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<LessonRef[]>(() =>
    listLessons({ ministryId: courseId, onlyPublished: true, onlyActive: true })
  );
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(listCompletedLessonIds()));

  useEffect(() => {
    const sync = () => setLessons(listLessons({ ministryId: courseId, onlyPublished: true, onlyActive: true }));
    sync();
    const unsubscribe = subscribePlatformContent(() => sync());
    return () => unsubscribe();
  }, [courseId]);

  useEffect(() => {
    const refresh = () => setCompletedIds(new Set(listCompletedLessonIds()));
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
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

    const goTo = (vid: string, byUrl = false) => {
      const base = `/curso/${courseId}/aula`;
      const param = byUrl ? 'v' : 'vid';
      navigate(`${base}?${param}=${encodeURIComponent(vid)}&mod=${encodeURIComponent(module.moduleId)}`);
    };

    // 1) caminho rápido: localStorage
    let localBest: string | null = null;
    let localAt = 0;
    try {
      const raw = localStorage.getItem('videos_assistidos');
      const arr = raw ? JSON.parse(raw) : [];
      (arr as any[]).forEach((v) => {
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
      if (idSet.has(localBest)) return goTo(localBest);
      if (urlSet.has(localBest)) return goTo(localBest, true);
    }

    // 2) background: remoto com timeout
    let navigated = false;
    const timer = setTimeout(() => {
      if (!navigated) { navigated = true; goTo(firstLesson.videoId); }
    }, 800);

    try {
      const uid = getCurrentUserId();
      if (uid) {
        const rows = await fetchUserProgress(uid, 100);
        let best: string | null = null; let bestAt = 0;
        rows.forEach((r) => {
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
            if (idSet.has(best)) return goTo(best);
            if (urlSet.has(best)) return goTo(best, true);
          }
          goTo(firstLesson.videoId);
        }
      }
    } catch {
      if (!navigated) { clearTimeout(timer); navigated = true; goTo(firstLesson.videoId); }
    }
  };

  const modules: ModuleCard[] = useMemo(() => {
    const ministry = getMinistry(courseId);
    if (!ministry) return [];
    return ministry.modules.map((module) => {
      const publishedLessons = lessons.filter((lesson) => lesson.moduleId === module.id);
      const topics = publishedLessons
        .map((lesson) => lesson.subjectName || lesson.title)
        .filter((value, index, array) => !!value && array.indexOf(value) === index)
        .slice(0, 4);
      const order = module.order + 1;
      // Prioridade: bannerModule (portrait 3:4, campo próprio do módulo)
      // → bannerPlayer da primeira aula (fallback landscape)
      // → imagem estática modulo01.png
      const bannerModule =
        module.bannerModule?.url || module.bannerModule?.dataUrl || null;
      const lessonBanner =
        publishedLessons.find((l) => l.bannerPlayer?.url || l.bannerPlayer?.dataUrl)?.bannerPlayer?.url ||
        publishedLessons.find((l) => l.bannerPlayer?.dataUrl)?.bannerPlayer?.dataUrl ||
        null;
      const banner = bannerModule || lessonBanner || null;
      const image = banner || `/assets/images/modulo${String(order).padStart(2, '0')}.png`;
      const totalLessons = publishedLessons.length;
      const completedCount = publishedLessons.filter(
        (l) => completedIds.has(l.videoId) || completedIds.has(l.id)
      ).length;
      return { id: order, moduleId: module.id, image, title: module.title, topics, soon: module.status !== 'published' || !publishedLessons.length, banner, totalLessons, completedCount };
    });
  }, [lessons, courseId, completedIds]);

  const ministry = getMinistry(courseId);
  const courseName = ministry?.name || courseId;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-navy pt-6 pb-12 px-4">
        <div className="max-w-screen-xl mx-auto">
          {courseName && (
            <button
              onClick={() => navigate('/plataforma')}
              className="flex items-center gap-1.5 text-sm text-slate hover:text-mint transition-colors mb-6"
            >
              ← Voltar aos cursos
            </button>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {modules.map((m) => {
              const clickable = !m.soon;
              const handle = () => { if (clickable) abrirModulo(m); };
              return (
                <div
                  key={m.id}
                  className={`group relative rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300 ${
                    clickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl' : 'cursor-default opacity-80'
                  }`}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : -1}
                  onClick={handle}
                  onKeyDown={(e) => {
                    if (!clickable) return;
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); }
                  }}
                  aria-label={`${m.title}${clickable ? '' : ' (em breve)'}`}
                >
                  {m.banner ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${m.banner})` }} />
                  ) : (
                    <img src={m.image} alt={m.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {m.soon && (
                    <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      Em Breve
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 z-10 group-hover:[@media(hover:hover)]:opacity-0 transition-opacity duration-200">
                    <p className="text-white font-semibold text-xs sm:text-sm">{m.title}</p>
                    {!m.soon && m.totalLessons > 0 && (
                      <div className="mt-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/60 text-[10px]">
                            {m.completedCount}/{m.totalLessons} aulas
                          </span>
                          {m.completedCount > 0 && (
                            <span className="text-mint text-[10px] font-semibold">
                              {Math.round((m.completedCount / m.totalLessons) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-mint rounded-full transition-all duration-500"
                            style={{ width: `${Math.round((m.completedCount / m.totalLessons) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {clickable && (
                    <div className="absolute inset-0 bg-navy/90 flex flex-col justify-center items-center p-3 sm:p-4 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <p className="text-mint text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">O que você vai ver</p>
                      <ul className="space-y-1 mb-3 sm:mb-4 w-full">
                        {m.topics.map((t, i) => (
                          <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                            <span className="text-mint mt-0.5">›</span>
                            <span className="line-clamp-2">{t}</span>
                          </li>
                        ))}
                      </ul>
                      {m.totalLessons > 0 && (
                        <p className="text-slate/60 text-[10px] mb-2">
                          {m.completedCount} de {m.totalLessons} aulas concluídas
                        </p>
                      )}
                      <button className="bg-mint text-navy text-xs font-bold px-4 py-2 rounded-full hover:bg-mint/90 transition-colors">
                        Entrar →
                      </button>
                    </div>
                  )}
                  {clickable && (
                    <div className="absolute bottom-2 right-2 z-10 [@media(hover:hover)]:hidden">
                      <span className="bg-mint/90 text-navy text-[10px] font-bold px-2 py-1 rounded-full">Entrar →</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CursoModulos;
