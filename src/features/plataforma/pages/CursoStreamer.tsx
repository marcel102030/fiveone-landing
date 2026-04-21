import { useParams } from 'react-router-dom';
import StreamerMestre from './streamerMestre';

interface Props {
  courseId?: string;
}

const CursoStreamer = ({ courseId }: Props) => {
  const { courseId: paramId } = useParams<{ courseId: string }>();
  const id = courseId || paramId || '';
  return <StreamerMestre ministryId={id} />;
};

export default CursoStreamer;
