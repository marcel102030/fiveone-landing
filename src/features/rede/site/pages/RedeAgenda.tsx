import { useEffect, useState } from 'react';
import RedeLayout, { WhatsAppLink } from '../RedeLayout';
import { PageHero, PrimeiroPasso, SectionHead, VerseBand, VisitCta } from '../RedeBlocks';
import { ENCONTROS, PHOTOS, PROGRAMACAO } from '../redeData';

/** Avança um passo a cada intervalo; cada cartão da galeria troca de foto. */
function useTick(interval = 4500) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), interval);
    return () => window.clearInterval(t);
  }, [interval]);
  return tick;
}

export default function RedeAgenda() {
  const tick = useTick();

  return (
    <RedeLayout title="Agenda">
      <PageHero
        image={PHOTOS.louvor}
        eyebrow="Agenda"
        title={
          <>
            Venha para a <em>mesa</em>
          </>
        }
        lead="Dois encontros por semana, nas casas de Campina Grande - PB. Palavra, louvor, pão partido e oração, com todos participando."
      />

      <section className="rs-section rs-section--light">
        <div className="rs-container">
          <SectionHead
            eyebrow="Toda semana"
            title={
              <>
                Encontros <em>semanais</em>
              </>
            }
            lead="Mande uma mensagem e um presbítero te passa os detalhes do próximo encontro na casa mais perto de você."
          />
          <ol className="rs-schedule">
            {PROGRAMACAO.map((item) => (
              <li key={item.titulo} className="rs-reveal">
                <span className="rs-schedule__when">
                  <em>{item.quando.split(' · ')[0]}</em>
                  <small>{item.quando.split(' · ')[1]}</small>
                </span>
                <div className="rs-schedule__what">
                  <div className="rs-tags">
                    <span>Semanal</span>
                    <span>Nas casas</span>
                    <span>Campina Grande</span>
                  </div>
                  <h3>{item.titulo}</h3>
                  <p>{item.descricao}</p>
                </div>
                <WhatsAppLink href={item.link} className="rs-btn rs-btn--outline rs-btn--sm">
                  {item.botao}
                </WhatsAppLink>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rs-section rs-section--dark">
        <div className="rs-container">
          <SectionHead
            eyebrow="Momentos reais da rede"
            title={
              <>
                Como são nossos <em>encontros</em>
              </>
            }
          />
          <div className="rs-gallery">
            {ENCONTROS.map((e) => {
              const active = tick % e.imagens.length;
              return (
                <figure key={e.destaque} className="rs-gallery__card rs-reveal">
                  {e.imagens.map((src, idx) => (
                    <img
                      key={`${src}-${idx}`}
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={idx === active ? 'is-active' : ''}
                    />
                  ))}
                  <figcaption>
                    <strong>
                      {e.titulo} <em>{e.destaque}</em>
                    </strong>
                    <span>{e.descricao}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <VerseBand image={PHOTOS.mesa} cite="Atos 2.42, 46">
        E perseveravam na doutrina dos apóstolos, e na comunhão, e no <em>partir do pão</em>, e nas orações… partindo
        o pão em casa, comiam juntos com alegria e singeleza de coração.
      </VerseBand>

      <PrimeiroPasso />

      <VisitCta image={PHOTOS.comunhao} />
    </RedeLayout>
  );
}
