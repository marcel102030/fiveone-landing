// Datas de lançamento por curso NA PLATAFORMA.
// Pré-venda: o curso é vendido antes, mas o conteúdo só abre nesta data.
// Curso ausente do mapa = sem trava (acesso normal/imediato).
//
// Mantenha em sincronia com a data da pré-venda no site institucional
// (APOLOGETICA_LAUNCH_DATE em features/institucional/data/courses.ts).

export const COURSE_LAUNCH_DATES: Record<string, Date> = {
  APOLOGETICA: new Date('2026-07-06T09:00:00-03:00'),
};

// Acesso antecipado: e-mails que furam a trava de pré-venda (veem o conteúdo
// antes do lançamento), por curso. Use para alunos/testers específicos.
export const COURSE_EARLY_ACCESS: Record<string, string[]> = {
  APOLOGETICA: [
    'sueniakarcia@gmail.com',
    'marcelosilvajunior78@gmail.com',
  ],
};

/** true se o e-mail tem acesso antecipado liberado para o curso. */
export function hasEarlyAccess(courseId: string | null | undefined, email: string | null | undefined): boolean {
  if (!courseId || !email) return false;
  const list = COURSE_EARLY_ACCESS[courseId.toUpperCase()] || [];
  return list.includes(email.trim().toLowerCase());
}

/** Data de lançamento de um curso (ou null se não houver trava). */
export function getCourseLaunchDate(courseId: string | null | undefined): Date | null {
  if (!courseId) return null;
  return COURSE_LAUNCH_DATES[courseId.toUpperCase()] ?? null;
}

/** true se o curso ainda não abriu (agora < data de lançamento). */
export function isCourseLocked(courseId: string | null | undefined): boolean {
  const d = getCourseLaunchDate(courseId);
  return d ? Date.now() < d.getTime() : false;
}
