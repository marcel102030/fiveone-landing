import Header from './Header';
import './streamerMestre.css';
import '../../components/Streamer/streamerShared.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../utils/user';
import { fetchUserProgress } from '../../services/progress';
import { mestreModulo1Videos } from './data/mestreModule1';

type ModuleCard = {
  id: number;
  image: string;
  title: string;
  topics: string[];
  soon?: boolean;
};

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

  const modules: ModuleCard[] = [
    {
      id: 1,
      image: '/assets/images/modulo01.png',
      title: 'Módulo 01',
      topics: [
        'Conheça a sua Bíblia',
        'Fundamentos do Ministério de Mestre',
        'Introdução aos 5 Ministérios',
        'História da Igreja I',
      ],
    },
    {
      id: 2,
      image: '/assets/images/modulo02.png',
      title: 'Módulo 02',
      topics: [
        'A Doutrina de Deus',
        'Relacionamentos de Aliança',
        'Ambiente do Ministério de Mestre',
        'História da Igreja II',
      ],
      soon: true,
    },
    {
      id: 3,
      image: '/assets/images/modulo03.png',
      title: 'Módulo 03',
      topics: [
        'Anjos e Demônios',
        'O Ministério de Mestre – Parte 1',
        'Apologética Cristã PT 1',
        'História da Igreja III',
      ],
      soon: true,
    },
    {
      id: 4,
      image: '/assets/images/modulo04.png',
      title: 'Módulo 04',
      topics: [
        'Doutrina da Revelação',
        'Fundamentos da Estatologia Cristã',
        'O Ministério de Mestre – Parte 2',
        'História da Igreja IV',
      ],
      soon: true,
    },
    {
      id: 5,
      image: '/assets/images/modulo05.png',
      title: 'Módulo 05',
      topics: [
        'O Ministério de Mestre – Parte 3',
        'A Doutrina da Igreja',
        'Escatologia: Glorificação do Filho do Homem',
        'História da Igreja V',
      ],
      soon: true,
    },
    {
      id: 6,
      image: '/assets/images/modulo06.png',
      title: 'Módulo 06',
      topics: [
        'Cristo nos Relatos dos Evangelhos',
        'O Espírito Santo: Sua Pessoa e Obra',
        'A Origem e Desenvolvimento do Ministério de Mestre',
        'História da Igreja VI',
      ],
      soon: true,
    },
    {
      id: 7,
      image: '/assets/images/modulo07.png',
      title: 'Módulo 07',
      topics: [
        'O Impacto e o Fruto do Ministério de Mestre',
        'A Revelação da Glória de Cristo',
        'Práticas de Espiritualidade Cristã',
        'História da Igreja VII',
      ],
      soon: true,
    },
    {
      id: 8,
      image: '/assets/images/modulo08.png',
      title: 'Módulo 08',
      topics: [
        'Os Desafios e as Demandas do Ministério de Mestre',
        'Fundamentos de Ética Cristã e Ministerial',
        'O Papel de Israel no Propósito Divino',
        'História da Igreja VIII',
      ],
      soon: true,
    },
  ];

  return (
    <>
      <Header />
      <div className="wrapper-central">
        <div className="modulos-wrapper">
          <div className="modulos-container">
            {modules.map((m) => {
              const clickable = m.id === 1;
              const handle = () => { if (clickable) abrirModulo01(); };
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
                  <div className="aula-card modulo">
                    <img src={m.image} alt={m.title} className="modulo-card-image" loading="lazy" />
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
