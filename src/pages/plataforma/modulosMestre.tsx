import Header from './Header';
import './streamerMestre.css';
import '../../components/Streamer/streamerShared.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../utils/user';
import { fetchUserProgress } from '../../services/progress';
import { mestreModulo1Videos } from './data/mestreModule1';

const ModulosMestre = () => {
  const navigate = useNavigate();

  const abrirModulo01 = async () => {
    // 1) caminho rápido: localStorage
    const idSet = new Set(mestreModulo1Videos.map(v => v.id));
    const urlSet = new Set(mestreModulo1Videos.map(v => v.url));
    let localBest: string | null = null;
    let localAt = 0;
    try {
      const raw = localStorage.getItem('videos_assistidos');
      const arr = raw ? JSON.parse(raw) : [];
      (arr as any[]).forEach(v => {
        const key = v.id || v.url;
        const at = v.lastAt || 0;
        if ((idSet.has(key) || urlSet.has(key)) && at > localAt) {
          localAt = at; localBest = key;
        }
      });
    } catch {}
    if (localBest) {
      if (idSet.has(localBest)) return navigate(`/streamer-mestre?vid=${encodeURIComponent(localBest)}`);
      if (urlSet.has(localBest)) return navigate(`/streamer-mestre?v=${encodeURIComponent(localBest)}`);
    }

    // 2) background: tenta remoto com timeout curto; senão abre a primeira aula
    let navigated = false;
    const timer = setTimeout(() => {
      if (!navigated) {
        navigated = true;
        navigate(`/streamer-mestre?vid=${encodeURIComponent(mestreModulo1Videos[0].id)}`);
      }
    }, 800);

    try {
      const uid = getCurrentUserId();
      if (uid) {
        const rows = await fetchUserProgress(uid, 100);
        let best: string | null = null; let bestAt = 0;
        rows.forEach(r => {
          if (idSet.has(r.video_id) || urlSet.has(r.video_id)) {
            const at = new Date(r.last_at).getTime();
            if (at > bestAt) { bestAt = at; best = r.video_id; }
          }
        });
        if (!navigated) {
          clearTimeout(timer);
          navigated = true;
          if (best) {
            if (idSet.has(best)) return navigate(`/streamer-mestre?vid=${encodeURIComponent(best)}`);
            if (urlSet.has(best)) return navigate(`/streamer-mestre?v=${encodeURIComponent(best)}`);
          }
          navigate(`/streamer-mestre?vid=${encodeURIComponent(mestreModulo1Videos[0].id)}`);
        }
      }
    } catch {
      if (!navigated) {
        clearTimeout(timer);
        navigated = true;
        navigate(`/streamer-mestre?vid=${encodeURIComponent(mestreModulo1Videos[0].id)}`);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="wrapper-central">
        <div className="modulos-wrapper">
          <div className="modulos-container">
            <div
              className="modulo-card"
              role="button"
              tabIndex={0}
              onClick={abrirModulo01}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  abrirModulo01();
                }
              }}
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            >
              <div className="aula-card">
                <img
                  src="/assets/images/modulo01.png"
                  alt="Módulo 01"
                  className="modulo-card-image"
                />
                <div className="modulo-card-label">Módulo 01</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo02.png"
                  alt="Módulo 02"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 02</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo03.png"
                  alt="Módulo 03"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 03</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo04.png"
                  alt="Módulo 04"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 04</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo05.png"
                  alt="Módulo 05"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 05</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo06.png"
                  alt="Módulo 06"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 06</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo07.png"
                  alt="Módulo 07"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 07</div>
              </div>
            </div>

            <div className="modulo-card" style={{ transition: 'all 0.3s ease' }}>
              <div className="aula-card">
                <img
                  src="/assets/images/modulo08.png"
                  alt="Módulo 08"
                  className="modulo-card-image"
                />
                <div className="badge-embreve">Em Breve</div>
                <div className="modulo-card-label">Módulo 08</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModulosMestre;
