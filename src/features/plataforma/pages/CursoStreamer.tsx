import { Navigate, useParams } from 'react-router-dom';
import StreamerMestre from './streamerMestre';
import { isCourseLocked } from '../config/courseLaunch';
import { usePlatformUserProfile } from '../hooks/usePlatformUserProfile';

interface Props {
  courseId?: string;
}

const CursoStreamer = ({ courseId }: Props) => {
  const { courseId: paramId } = useParams<{ courseId: string }>();
  const id = courseId || paramId || '';
  const { profile } = usePlatformUserProfile();
  const isAdmin = profile?.role === 'ADMIN';

  // Pré-venda: bloqueia o acesso direto à aula (por URL) até o lançamento.
  // Manda para a tela do curso, que mostra o contador "abre em ...".
  if (isCourseLocked(id) && !isAdmin) {
    return <Navigate to={`/curso/${id}/modulos`} replace />;
  }

  return <StreamerMestre ministryId={id} />;
};

export default CursoStreamer;
