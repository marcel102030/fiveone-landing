import type { FormEvent } from 'react';
import RedeLayout, { ArrowIcon, WhatsAppLink, useRedeSite } from '../RedeLayout';
import { PageHero } from '../RedeBlocks';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, REDE_EMAIL, REDE_PHONE_DISPLAY, WHATSAPP } from '../redeData';

const PASSOS = [
  'Sua mensagem chega ao WhatsApp da rede e uma pessoa de verdade lê.',
  'Um presbítero responde com um nome e um próximo passo.',
  'Se você é de Campina Grande, te convidamos para um encontro numa casa perto de você.',
];

function CartaForm() {
  const { openWhatsApp } = useRedeSite();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nome = String(data.get('nome') || '').trim();
    const telefone = String(data.get('telefone') || '').trim();
    const mensagem = String(data.get('mensagem') || '').trim();
    const texto = [
      'Olá, Rede de Igrejas nas Casas! Vim pelo site.',
      '',
      mensagem,
      '',
      `— ${nome}`,
      ...(telefone ? [`Telefone: ${telefone}`] : []),
    ].join('\n');
    openWhatsApp(`https://wa.me/5583987181731?text=${encodeURIComponent(texto)}`);
  };

  return (
    <form className="rs-letter rs-reveal" onSubmit={onSubmit}>
      <p className="rs-letter__salute">Querida Rede,</p>
      <label className="rs-letter__field rs-letter__field--area">
        <span className="sr-only">Sua mensagem</span>
        <textarea name="mensagem" rows={6} required placeholder="Escreva aqui sua pergunta, sua história ou como podemos caminhar com você…" />
      </label>
      <p className="rs-letter__closing">Com carinho,</p>
      <div className="rs-letter__row">
        <label className="rs-letter__field">
          <span>Seu nome</span>
          <input name="nome" type="text" autoComplete="name" required />
        </label>
        <label className="rs-letter__field">
          <span>WhatsApp (opcional)</span>
          <input name="telefone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <button type="submit" className="rs-btn rs-btn--primary">
        Enviar pelo WhatsApp <ArrowIcon />
      </button>
    </form>
  );
}

export default function RedeContato() {
  return (
    <RedeLayout title="Contato">
      <PageHero
        eyebrow="Diga olá"
        title={
          <>
            Vamos <em>conversar</em>
          </>
        }
        lead="Tem uma pergunta, uma história, ou quer fazer parte da família? Escreva pra gente."
      />

      <section className="rs-section rs-section--light rs-section--tight-top">
        <div className="rs-container rs-contact">
          <CartaForm />

          <div className="rs-contact__side">
            <div className="rs-reveal">
              <span className="rs-eyebrow">O que acontece depois</span>
              <ol className="rs-rows rs-rows--compact">
                {PASSOS.map((p, i) => (
                  <li key={p}>
                    <span className="rs-rows__num">{i + 1}</span>
                    <p>{p}</p>
                  </li>
                ))}
              </ol>
            </div>

            <dl className="rs-contact__info rs-reveal">
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <WhatsAppLink href={WHATSAPP.geral}>{REDE_PHONE_DISPLAY}</WhatsAppLink>
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${REDE_EMAIL}`}>{REDE_EMAIL}</a>
                </dd>
              </div>
              <div>
                <dt>Instagram</dt>
                <dd>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                    {INSTAGRAM_HANDLE}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Onde estamos</dt>
                <dd>Catolé · Campina Grande — PB</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </RedeLayout>
  );
}
