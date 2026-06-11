// Datas de lançamento por curso NA PLATAFORMA.
// Pré-venda: o curso é vendido antes, mas o conteúdo só abre nesta data.
// Curso ausente do mapa = sem trava (acesso normal/imediato).
//
// Mantenha em sincronia com a data da pré-venda no site institucional
// (APOLOGETICA_LAUNCH_DATE em features/institucional/data/courses.ts).

export const COURSE_LAUNCH_DATES: Record<string, Date> = {
  APOLOGETICA: new Date('2026-07-06T09:00:00-03:00'),
};

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
