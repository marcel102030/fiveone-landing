import Header from "./Header";
import "./plataforma.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getCurrentUserId } from "../../utils/user";
import { fetchUserProgress } from "../../services/progress";

const PaginaInicial = () => {
  const [modalContent, setModalContent] = useState("");
  const [showModal, setShowModal] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [lastWatchedArray, setLastWatchedArray] = useState<any[]>([]);
  useEffect(() => {
    let active = true;
    async function load() {
      const uid = getCurrentUserId();
      if (uid) {
        try {
          const rows = await fetchUserProgress(uid, 24);
          if (!active) return;
          if (rows && rows.length) {
            setLastWatchedArray(rows.map(r => ({
              id: r.video_id,
              url: '',
              index: undefined,
              title: r.title,
              thumbnail: r.thumbnail,
              watchedSeconds: r.watched_seconds,
              durationSeconds: r.duration_seconds || undefined,
              lastAt: new Date(r.last_at).getTime(),
            })));
            return;
          }
        } catch {}
      }
      // fallback localStorage
      try {
        const raw = localStorage.getItem('videos_assistidos');
        const parsed = raw ? JSON.parse(raw) : [];
        const byKey = new Map<string, any>();
        (parsed as any[]).forEach(v => {
          const key = v.id || v.url;
          const prev = byKey.get(key);
          if (!prev || (v.lastAt || 0) > (prev.lastAt || 0)) byKey.set(key, v);
        });
        const arr = Array.from(byKey.values());
        arr.sort((a,b)=> (b.lastAt||0) - (a.lastAt||0));
        if (active) setLastWatchedArray(arr);
      } catch { if (active) setLastWatchedArray([]); }
    }
    load();
    return () => { active = false; };
  }, []);

  const scrollCarousel = (direction: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction * 300,
        behavior: "smooth",
      });
    }
  };

  const handleShowModal = (message: string) => {
    setModalContent(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent("");
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Header />
      <div id="inicio" className="inicio-container">
        <div className="hero-caption">Escola de Formação Ministerial</div>
        <button className="section-arrow" aria-label="Ir para Bem-vindos" onClick={() => scrollToId(lastWatchedArray.length ? 'sec-bem-vindos' : 'sec-formacao')}>
          <span className="chevron" />
        </button>
      </div>
      <section id="sec-bem-vindos" className="bem-vindos">
        {lastWatchedArray.length ? (
          <div className="continuar-banner">
            <div className="continuar-banner-info">
              <div className="cb-title">Última Aula Assistida</div>
              <div className="cb-sub">{lastWatchedArray[0].title}</div>
            </div>
            <button className="cb-btn" onClick={() => {
              const v:any = lastWatchedArray[0];
              if (v.id) window.location.hash = `#/streamer-mestre?vid=${encodeURIComponent(v.id)}`;
              else if (typeof v.index === 'number') window.location.hash = `#/streamer-mestre?i=${v.index}`;
              else window.location.hash = `#/streamer-mestre?v=${encodeURIComponent(v.url)}`;
            }}>Retomar aula</button>
          </div>
        ) : null}
        <h2>Bem-Vindos</h2>
        <p>Sua Jornada Começa aqui</p>
        <div className="bem-vindos-container">
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/BemVindo.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/OQueEFiveOne.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/SuaJornada.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/Conectese.png')" }}
          />
          <div
            className="bem-vindos-item"
            role="button"
            style={{ backgroundImage: "url('/assets/images/Explore.png')" }}
          />
        </div>
        <div className="section-arrow-wrap">
          <button className="section-arrow" aria-label="Ir para Continuar Assistindo" onClick={() => scrollToId(lastWatchedArray.length ? 'sec-continuar' : 'sec-formacao')}>
            <span className="chevron" />
          </button>
        </div>
      </section>
      {lastWatchedArray.length ? (
          <section id="sec-continuar" className="continuar-assistindo">
            <div className="continuar-seta">↓</div>
            <h2>Continuar Assistindo</h2>
            <div className="carousel-wrapper">
              <button className="arrow left" onClick={() => scrollCarousel(-1)}>‹</button>
              <div className="continuar-container" ref={carouselRef}>
                {lastWatchedArray.map((video: any, index: number) => (
                  <div
                    key={index}
                    className="continuar-card"
                    style={{ backgroundImage: `url('${video.thumbnail}')` }}
                    role="button"
                    title={video.title}
                    onClick={() => {
                      if (video.id) navigate(`/streamer-mestre?vid=${encodeURIComponent(video.id)}`);
                      else if (typeof video.index === 'number') navigate(`/streamer-mestre?i=${video.index}`);
                      else navigate(`/streamer-mestre?v=${encodeURIComponent(video.url)}`);
                    }}
                  >
                    <div className="continuar-overlay">
                      <p>{video.title}</p>
                      <div className="continuar-meta">
                        {typeof video.durationSeconds === 'number' && video.durationSeconds > 0 ? (
                          <span className="dur">{Math.floor(video.durationSeconds/60)}:{String(Math.floor(video.durationSeconds%60)).padStart(2,'0')}</span>
                        ) : (
                          <span className="dur">{Math.max(1, Math.floor((video.watchedSeconds||0)/60))} min vistos</span>
                        )}
                      </div>
                      <div className="play-badge" aria-hidden>▶</div>
                      <div className="continuar-progress">
                        <div className="bar" style={{ width: `${Math.min(100, Math.round(((video.watchedSeconds||0) / (video.durationSeconds||1800)) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="arrow right" onClick={() => scrollCarousel(1)}>›</button>
            </div>
            <div className="section-arrow-wrap">
              <button className="section-arrow" aria-label="Ir para Formação Ministerial" onClick={() => scrollToId('sec-formacao')}>
                <span className="chevron" />
              </button>
            </div>
          </section>
        ) : null}
      <section id="sec-formacao" className="formacao-ministerial">
        <div className="arrow-icon">↓</div>
        <h2>Sua Formação Ministerial</h2>
        <div className="formacao-container">
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/apostolo.png')" }}
            onClick={() => handleShowModal('Em breve: O Dom Apostólico estará disponível com conteúdos exclusivos sobre como reconhecê-lo e desenvolvê-lo.')}
            role="button"
            tabIndex={0}
          />
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/profeta.png')" }}
            onClick={() => handleShowModal('Em breve: O Dom Profético será ativado com recursos para interpretação, proclamação e exortação segundo a Palavra.')}
            role="button"
            tabIndex={0}
          />
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/evangelista.png')" }}
            onClick={() => handleShowModal('Em breve: Conteúdos evangelísticos para equipar você na proclamação do Evangelho serão liberados.')}
            role="button"
            tabIndex={0}
          />
          <div
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/pastor.png')" }}
            onClick={() => handleShowModal('Em breve: O Dom Pastoral estará disponível com fundamentos para cuidado e discipulado cristão.')}
            role="button"
            tabIndex={0}
          />
          <Link
            to="/streamer-mestre"
            className="formacao-item"
            style={{ backgroundImage: "url('/assets/images/mestre.png')" }}
          />
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <p>{modalContent}</p>
              <button onClick={handleCloseModal} className="modal-close-button">Fechar</button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

const AppRouter = () => {
  return <PaginaInicial />;
};

export default AppRouter;
