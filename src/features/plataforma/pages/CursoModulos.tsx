import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import { getCurrentUserId } from '../../../shared/utils/user';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { fetchUserProgress } from '../services/progress';
import { fetchCompletionsForUser } from '../services/completions';
import { getMinistry, LessonRef, listLessons, subscribePlatformContent } from '../services/platformContent';
import { listCompletedLessonIds, reconcileCompletedLessons } from '../../../shared/utils/completedLessons';
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile';
import { getCourseLaunchDate, hasEarlyAccess } from '../config/courseLaunch';
import CourseLockScreen from '../components/CourseLockScreen';

type LessonView = LessonRef & { completed: boolean };

type ModuleView = {
  id: string;
  order: number;
  title: string;
  lessons: LessonView[];
  total: number;
  completed: number;
  percent: number;
  soon: boolean;
};

// ── Ícones (inline, sem dependências) ───────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" /><polyline points="8.5 12.5 11 15 15.5 9.5" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

interface Props {
  courseId?: string;
}

const CursoModulos = ({ courseId: propCourseId }: Props) => {
  const { courseId: paramId } = useParams<{ courseId: string }>();
  const courseId = propCourseId || paramId || '';
  const navigate = useNavigate();
  const { email: authEmail } = useAuth();
  const { profile } = usePlatformUserProfile();

  const [lessons, setLessons] = useState<LessonRef[]>(() =>
    listLessons({ ministryId: courseId, onlyPublished: true, onlyActive: true })
  );
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(listCompletedLessonIds()));
  // Mapa lessonId → timestamp (ms) da última vez assistida — usado p/ "continuar"
  const [lastAtById, setLastAtById] = useState<Map<string, number>>(() => new Map());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  // Garante que o auto-expand do módulo em andamento só rode uma vez
  const [autoExpanded, setAutoExpanded] = useState(false);

  useEffect(() => {
    const sync = () => setLessons(listLessons({ ministryId: courseId, onlyPublished: true, onlyActive: true }));
    sync();
    const unsubscribe = subscribePlatformContent(() => sync());
    return () => unsubscribe();
  }, [courseId]);

  // Sync completions: localStorage (instantâneo) + Supabase (cross-device)
  useEffect(() => {
    const refresh = () => setCompletedIds(new Set(listCompletedLessonIds()));
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  // Busca completions + progresso do servidor quando o usuário é identificado.
  useEffect(() => {
    const uid = getCurrentUserId() || authEmail;
    if (!uid) return;
    fetchCompletionsForUser(uid)
      // Banco = fonte de verdade: reconcilia (remove conclusões órfãs do local
      // que não existem no servidor), em vez de só fazer merge/união.
      .then((list) => setCompletedIds(new Set(reconcileCompletedLessons(list).keys())))
      .catch(() => {});
    fetchUserProgress(uid, 200)
      .then((rows) => {
        const map = new Map<string, number>();
        rows.forEach((r) => map.set(r.lesson_id, new Date(r.last_at).getTime()));
        setLastAtById(map);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authEmail]);

  const isCompleted = (l: LessonRef) => completedIds.has(l.videoId) || completedIds.has(l.id);
  const lastAtOf = (l: LessonRef) => lastAtById.get(l.videoId) ?? lastAtById.get(l.id) ?? 0;

  // ── Monta a estrutura de módulos + aulas ──────────────────────────────────
  const modules: ModuleView[] = useMemo(() => {
    const ministry = getMinistry(courseId);
    if (!ministry) return [];
    return ministry.modules.map((module) => {
      const list = lessons
        .filter((l) => l.moduleId === module.id)
        .sort((a, b) => a.order - b.order)
        .map((l) => ({ ...l, completed: isCompleted(l) }));
      const completed = list.filter((l) => l.completed).length;
      const total = list.length;
      return {
        id: module.id,
        order: module.order + 1,
        title: module.title,
        lessons: list,
        total,
        completed,
        percent: total ? Math.round((completed / total) * 100) : 0,
        soon: module.status !== 'published' || total === 0,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, courseId, completedIds]);

  // ── Métricas do curso inteiro ─────────────────────────────────────────────
  const courseStats = useMemo(() => {
    const all = modules.flatMap((m) => m.lessons);
    const total = all.length;
    const done = all.filter((l) => l.completed).length;
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [modules]);

  // ── Aula para "continuar de onde parou" ───────────────────────────────────
  // 1) aula não-concluída mais recentemente assistida
  // 2) primeira aula não-concluída do curso (próxima a assistir)
  const continueLesson = useMemo(() => {
    const all = modules.flatMap((m) => m.lessons);
    let best: LessonView | null = null;
    let bestAt = 0;
    all.forEach((l) => {
      if (l.completed) return;
      const at = lastAtOf(l);
      if (at > bestAt) { bestAt = at; best = l; }
    });
    if (best) return best;
    return all.find((l) => !l.completed) || null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, lastAtById]);

  // Abre automaticamente o módulo da aula "continuar" (uma vez)
  useEffect(() => {
    if (autoExpanded || !modules.length) return;
    const target = continueLesson?.moduleId || modules.find((m) => !m.soon)?.id;
    if (target) {
      setExpanded(new Set([target]));
      setAutoExpanded(true);
    }
  }, [modules, continueLesson, autoExpanded]);

  // ── Navegação ─────────────────────────────────────────────────────────────
  const goToLesson = (moduleId: string, videoId: string) => {
    navigate(`/curso/${courseId}/aula?vid=${encodeURIComponent(videoId)}&mod=${encodeURIComponent(moduleId)}`);
  };
  const resumeModule = (m: ModuleView) => {
    if (!m.lessons.length) return;
    let best: LessonView | null = null;
    let bestAt = 0;
    m.lessons.forEach((l) => {
      if (l.completed) return;
      const at = lastAtOf(l);
      if (at > bestAt) { bestAt = at; best = l; }
    });
    const target = best || m.lessons.find((l) => !l.completed) || m.lessons[0];
    goToLesson(m.id, target.videoId);
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const ministry = getMinistry(courseId);
  const courseName = ministry?.name || courseId;
  const tagline = ministry?.tagline || '';
  const started = courseStats.done > 0;

  // ── Trava de pré-venda: conteúdo só abre na data de lançamento ──────────────
  // Admins passam direto (para revisar antes de abrir ao público).
  const isAdmin = profile?.role === 'ADMIN';
  const earlyAccess = hasEarlyAccess(courseId, getCurrentUserId() || authEmail);
  const launchDate = getCourseLaunchDate(courseId);
  const courseLocked = !!launchDate && Date.now() < launchDate.getTime() && !isAdmin && !earlyAccess;
  if (courseLocked && launchDate) {
    return (
      <>
        <Header />
        <CourseLockScreen courseName={courseName} launchDate={launchDate} />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-navy pt-6 pb-16 px-4 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <button
            onClick={() => navigate('/plataforma')}
            className="flex items-center gap-1.5 text-sm text-slate hover:text-mint transition-colors mb-6"
          >
            ← Voltar aos cursos
          </button>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
            {/* ── Coluna esquerda: info do curso (fixa no desktop) ── */}
            <aside className="lg:col-span-1 lg:sticky lg:top-6 self-start">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-white tracking-tight">{courseName}</h1>
              {tagline && <p className="text-sm text-slate mt-1">{tagline}</p>}

              <div className="flex gap-2.5 mt-4">
                <div className="flex-1 bg-navy-light rounded-xl px-4 py-2.5 text-center">
                  <div className="text-xl font-bold text-mint tabular-nums">{courseStats.percent}%</div>
                  <div className="text-[11px] text-slate">concluído</div>
                </div>
                <div className="flex-1 bg-navy-light rounded-xl px-4 py-2.5 text-center">
                  <div className="text-xl font-bold text-slate-white tabular-nums">{courseStats.done}/{courseStats.total}</div>
                  <div className="text-[11px] text-slate">aulas</div>
                </div>
              </div>

              {/* Barra de progresso do curso */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-mint rounded-full transition-all duration-500" style={{ width: `${courseStats.percent}%` }} />
              </div>

          {/* ── Continuar de onde parou ── */}
          {continueLesson && (
            <button
              onClick={() => goToLesson(continueLesson.moduleId, continueLesson.videoId)}
              className="group w-full flex items-center gap-3.5 bg-navy-light border border-mint/25 hover:border-mint/50 rounded-2xl p-3.5 mt-5 text-left transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-mint text-navy flex items-center justify-center shrink-0">
                <PlayIcon />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] text-mint uppercase tracking-wider">
                  {started ? 'Continuar de onde parou' : 'Começar o curso'}
                </span>
                <span className="block text-sm text-slate-white truncate">
                  M{continueLesson.moduleOrder + 1} · {continueLesson.title}
                </span>
              </span>
              <span className="bg-mint text-navy text-sm font-semibold px-4 py-2 rounded-lg shrink-0 group-hover:bg-mint/90 transition-colors">
                {started ? 'Retomar' : 'Começar'}
              </span>
            </button>
          )}
            </aside>

            {/* ── Coluna direita: módulos (accordion) ── */}
            <div className="lg:col-span-2 mt-6 lg:mt-0 flex flex-col gap-3">
            {modules.map((m) => {
              const open = expanded.has(m.id);
              const accent = open && !m.soon;
              return (
                <div
                  key={m.id}
                  className={`bg-navy-light rounded-2xl overflow-hidden border transition-colors ${
                    accent ? 'border-mint/35' : 'border-white/10'
                  }`}
                >
                  {/* Cabeçalho do módulo */}
                  <button
                    onClick={() => !m.soon && toggle(m.id)}
                    className={`w-full flex items-center gap-3.5 p-3.5 text-left ${m.soon ? 'cursor-default opacity-70' : ''}`}
                    aria-expanded={open}
                  >
                    <span className={`w-11 h-11 rounded-xl bg-navy flex flex-col items-center justify-center shrink-0 border ${
                      accent ? 'border-mint/40' : 'border-white/10'
                    }`}>
                      <span className="text-[9px] text-slate leading-none">MÓD</span>
                      <span className={`text-lg font-bold leading-none ${accent ? 'text-mint' : 'text-slate-light'}`}>
                        {String(m.order).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-semibold text-slate-white">{m.title}</span>
                      {m.soon ? (
                        <span className="text-[11px] text-golden">Em breve</span>
                      ) : (
                        <span className="flex items-center gap-2 mt-1.5">
                          <span className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[180px]">
                            <span className="block h-full bg-mint rounded-full transition-all duration-500" style={{ width: `${m.percent}%` }} />
                          </span>
                          <span className="text-[11px] text-slate shrink-0">{m.completed}/{m.total} aulas</span>
                        </span>
                      )}
                    </span>
                    {!m.soon && <span className="text-mint shrink-0"><ChevronIcon open={open} /></span>}
                  </button>

                  {/* Lista de aulas */}
                  {open && !m.soon && (
                    <div className="border-t border-white/8 px-2.5 pb-2.5 pt-1">
                      {m.lessons.map((l) => {
                        const current = continueLesson?.id === l.id;
                        return (
                          <button
                            key={l.id}
                            onClick={() => goToLesson(m.id, l.videoId)}
                            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-colors ${
                              current ? 'bg-mint/10 border border-mint/30' : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <span className={`shrink-0 ${l.completed ? 'text-mint' : current ? 'text-mint' : 'text-slate/50'}`}>
                              {l.completed ? <CheckIcon /> : <PlayIcon />}
                            </span>
                            <span
                              className={`flex-1 text-[13px] ${
                                l.completed ? 'text-slate line-through' : current ? 'text-slate-white' : 'text-slate-light'
                              }`}
                            >
                              {l.title}
                            </span>
                            {current ? (
                              <span className="text-[11px] text-mint shrink-0">em andamento</span>
                            ) : l.durationMinutes ? (
                              <span className="flex items-center gap-1 text-[11px] text-slate shrink-0">
                                <ClockIcon /> {l.durationMinutes} min
                              </span>
                            ) : null}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => resumeModule(m)}
                        className="w-full mt-1.5 bg-mint text-navy text-[13px] font-semibold py-2.5 rounded-lg hover:bg-mint/90 transition-colors"
                      >
                        {m.completed === 0 ? 'Começar módulo →' : m.completed >= m.total ? 'Revisar módulo →' : 'Continuar módulo →'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CursoModulos;
