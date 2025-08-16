import { useEffect, useRef, useState } from 'react';
import './streamerMestre.css';
import Header from './Header';

const StreamerMestre = () => {
  const videoList = [
    {
      url: 'https://player.vimeo.com/video/1100734000',
      title: 'Aula 01 – Introdução à História da Igreja',
      thumbnail: '/assets/images/Introducao_historia_igreja.png',
      pdfUrl: '/assets/pdfs/aula01.pdf',
    },
    {
      url: 'https://www.youtube.com/embed/XQEGw923yD0',
      title: 'Aula 02 – A Igreja Primitiva',
      pdfUrl: '/assets/pdfs/aula02.pdf',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 03 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 04 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 05 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 06 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 07 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 08 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 09 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 10 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 11 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 12 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 13 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 14 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 15 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 16 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
    {
      url: 'https://www.youtube.com/embed/4KatysePW3U?start=2148',
      title: 'Aula 17 – Concílios e Doutrinas',
      thumbnail: '/assets/images/miniatura_fundamentos_mestre.png',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);
  const [isModuloAberto, setIsModuloAberto] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const resizeSidebar = () => {
      if (videoRef.current && sidebarRef.current) {
        const videoHeight = videoRef.current.offsetHeight;
        sidebarRef.current.style.height = `${videoHeight}px`;
      }
    };

    resizeSidebar();
    window.addEventListener('resize', resizeSidebar);

    return () => {
      window.removeEventListener('resize', resizeSidebar);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = videoRef.current?.querySelector('iframe');
      if (iframe) {
        // Attempt to get current time from the iframe's contentWindow if same-origin (likely not possible)
        // So for Vimeo/YouTube, we would need to use their APIs, but since it's not set up, we'll skip direct time reading.
        // Instead, as a workaround, we can save a dummy progress or assume the video is being watched when the iframe is present.

        // For demonstration, save a dummy progress of 1 (or you can implement API integration)
        // But here, we just store that user has started watching.
        localStorage.setItem('progress_mestre_aula_01', '1');
        localStorage.setItem('has_mestre_progress', 'true');
        const currentVideoData = {
          title: currentVideo.title,
          thumbnail: currentVideo.thumbnail || '/assets/images/miniatura_fundamentos_apostololicos.png',
          url: currentVideo.url
        };
        const existingWatched = JSON.parse(localStorage.getItem('videos_assistidos') || '[]');

        // Remove duplicatas com base na URL
        const filteredWatched = existingWatched.filter((video: any) => video.url !== currentVideoData.url);

        // Adiciona o vídeo atual ao início da lista
        const updatedWatched = [currentVideoData, ...filteredWatched];

        // Limita a lista a no máximo 10 vídeos
        const limitedWatched = updatedWatched.slice(0, 10);

        localStorage.setItem('videos_assistidos', JSON.stringify(limitedWatched));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleMarkAsCompleted = () => {
    if (!completedVideos.includes(currentIndex)) {
      setCompletedVideos([...completedVideos, currentIndex]);
    }
  };
  const currentVideo = videoList[currentIndex];
  const handleNext = () => {
    if (currentIndex < videoList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <Header />
      <div className="wrapper-central">
        {!isModuloAberto && (
          <div className="modulos-wrapper">
            <div className="modulos-container">
              <div
                className="modulo-card"
                role="button"
                tabIndex={0}
                onClick={() => setIsModuloAberto(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsModuloAberto(true);
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
        )}
        <main className="streamer-video-area">
          {isModuloAberto && (
            <div className="video-and-sidebar">
              <div className="video-content">
                <h2 className="streamer-titulo">{currentVideo.title}</h2>
                <div className="video-container" ref={videoRef}>
                  <iframe
                    src={currentVideo.url}
                    title={currentVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="button-wrapper">
                  <div className="button-area">
                    <div className="button-group-row">
                      {currentVideo.pdfUrl && (
                        <div className="left-button-wrapper">
                          <button
                            className="lesson-button pdf-view-button"
                            onClick={() => window.open(currentVideo.pdfUrl, '_blank')}
                          >
                            Baixar PDF da Aula
                          </button>
                        </div>
                      )}

                      <div className="center-buttons-wrapper">
                        {currentIndex > 0 && (
                          <button className="lesson-button prev-lesson-button" onClick={handlePrevious}>
                            Anterior
                          </button>
                        )}
                        {currentIndex < videoList.length - 1 && (
                          <button className="lesson-button next-lesson-button" onClick={handleNext}>
                            Próxima
                          </button>
                        )}
                      </div>

                      <div className="right-button-wrapper">
                        {!completedVideos.includes(currentIndex) ? (
                          <button className="lesson-button complete-lesson-button" onClick={handleMarkAsCompleted}>
                            Concluir
                          </button>
                        ) : (
                          <div className="completed-indicator">Concluída</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="video-sidebar" ref={sidebarRef}>
                <h3 className="sidebar-title">Próximas Aulas</h3>
                <ul className="sidebar-list">
                  {videoList.map((video, index) => (
                    <li
                      key={index}
                      className={`sidebar-item ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <img
                        src={video.thumbnail || '/assets/images/miniatura_fundamentos_apostololicos.png'}
                        alt={`Miniatura ${video.title}`}
                        className="sidebar-thumbnail"
                      />
                      <div className="sidebar-video-info">
                        <div className="sidebar-video-title">{video.title}</div>
                        <div className="status-indicator">
                          {completedVideos.includes(index) ? '✔️ Concluído' : ''}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default StreamerMestre;