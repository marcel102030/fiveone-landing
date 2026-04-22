// Serviço de certificados acessado pelo próprio aluno (anon key).
// A tabela platform_certificate é legível sem autenticação (RLS permissiva
// para leitura pública — necessário para a página de verificação pública).
// Filtramos por user_id = email para expor apenas os certificados do usuário.

import { supabase } from '../../../shared/lib/supabaseClient';

export interface StudentCertificate {
  id: string;
  user_id: string;
  ministry_id: string;
  issued_at: string;
  verify_code: string;
  courseName: string | null;
}

/**
 * Busca todos os certificados emitidos para um e-mail de aluno,
 * enriquecidos com o nome do curso (platform_ministry.title).
 */
export async function fetchStudentCertificates(email: string): Promise<StudentCertificate[]> {
  const { data, error } = await supabase
    .from('platform_certificate')
    .select('id, user_id, ministry_id, issued_at, verify_code')
    .eq('user_id', email.trim().toLowerCase())
    .order('issued_at', { ascending: false });

  if (error || !data?.length) return [];

  // Busca nomes dos cursos em paralelo
  const ministryIds = [...new Set(data.map(c => c.ministry_id))];
  const { data: ministries } = await supabase
    .from('platform_ministry')
    .select('id, title')
    .in('id', ministryIds);

  const nameMap = new Map((ministries ?? []).map(m => [m.id, m.title as string]));

  return data.map(c => ({
    ...c,
    courseName: nameMap.get(c.ministry_id) ?? null,
  }));
}
