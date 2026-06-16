import { Navigate, useParams } from 'react-router-dom';
import StreamerMestre from './streamerMestre';
import { isCourseLocked, hasEarlyAccess } from '../config/courseLaunch';
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile';
import { getCurrentUserId } from '../../../shared/utils/user';

interface Props {
  courseId?: string;
}

const CursoStreamer = ({ courseId }: Props) => {
  const { courseId: paramId } = useParams<{ courseId: string }>();
  const id = courseId || paramId || '';
  const { profile } = usePlatformUserProfile();
  const isAdmin = profile?.role === 'ADMIN';
  const allowed = isAdmin || hasEarlyAccess(id, getCurrentUserId() || profile?.email || null);

  // Pré-venda: bloqueia o acesso direto à aula (por URL) até o lançamento.
  // Manda para a tela do curso, que mostra o contador "abre em ...".
  // Admins e e-mails com acesso antecipado passam direto.
  if (isCourseLocked(id) && !allowed) {
    return <Navigate to={`/curso/${id}/modulos`} replace />;
  }

  return <StreamerMestre ministryId={id} />;
};

export default CursoStreamer;
