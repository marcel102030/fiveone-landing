import { FormEvent } from "react";
import "./Contact.css";

const channels = [
  {
    icon: "🎓",
    title: "Central de atendimento",
    tag: "Alunos e interessados",
    description: "Suporte dedicado para alunos matriculados e interessados nas trilhas ministeriais.",
    action: {
      label: "Falar com atendimento",
      href: "https://wa.me/5583989004764",
      external: true,
    },
  },
  {
    icon: "💡",
    title: "Consultoria para igrejas",
    tag: "Pastores e líderes",
    description: "Quer levar o Five One para sua comunidade? Fale com nosso time pedagógico e monte um plano sob medida.",
    action: {
      label: "Agendar conversa",
      href: "#/solucoes",
    },
  },
  {
    icon: "💳",
    title: "Financeiro e administrativo",
    tag: "Gestão e contratos",
    description: "Renovação de matrícula, boletos ou contratos. Estamos prontos para ajudar.",
    action: {
      label: "Enviar e-mail",
      href: "mailto:financeiro@fiveone.com",
    },
  },
];

const Contact = () => {
  const contactHighlights = [
    { icon: "🕘", text: "Atendimento de segunda a sexta, das 9h às 18h" },
    { icon: "🤝", text: "Equipe pastoral, acadêmica e administrativa integrada" },
    { icon: "⚡", text: "Retorno em até 24 horas úteis pelos canais informados" },
  ];

  const quickActions = [
    {
      label: "Abrir WhatsApp agora",
      href: "https://wa.me/5583987181731",
      external: true,
    },
    {
      label: "Enviar e-mail",
      href: "mailto:escolafiveone@gmail.com",
    },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const message = formData.get("message");

    const mailto = `mailto:escolafiveone@gmail.com?subject=Contato%20via%20site%20Five%20One&body=${encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\n\nMensagem:\n${message}`
    )}`;
    window.location.href = mailto;
  };

  return (
    <div className="contact-page">
      <header className="contact-hero">
        <div className="content-container">
          <h1 className="section-label">Central Five One</h1>
          <h2>Como podemos caminhar com você hoje?</h2>
          <p>
            Escolha um canal direto ou envie uma mensagem pelo formulário. Nossa equipe responde em até 24 horas úteis.
          </p>
          <ul className="contact-highlights">
            {contactHighlights.map((item) => (
              <li key={item.text}>
                <span className="contact-highlight-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
          <div className="contact-quick-actions">
            {quickActions.map((action) => (
              <a
                key={action.label}
                className="btn primary"
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noopener noreferrer" : undefined}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <section className="contact-channels">
        <div className="content-container channel-grid">
          {channels.map((channel) => (
            <article key={channel.title} className="channel-card">
              <div className="channel-icon" aria-hidden="true">{channel.icon}</div>
              <span className="channel-tag">{channel.tag}</span>
              <h2>{channel.title}</h2>
              <p>{channel.description}</p>
              <a
                className="btn primary"
                href={channel.action.href}
                target={channel.action.external ? "_blank" : undefined}
                rel={channel.action.external ? "noopener noreferrer" : undefined}
              >
                {channel.action.label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-form-section">
        <div className="content-container form-grid">
          <div className="form-intro">
            <span className="section-label">Envie uma mensagem</span>
            <h2>Conte um pouco sobre a sua necessidade</h2>
            <p>
              Preencha o formulário e explique seu contexto. Podemos ajudar com formações individuais, treinamentos para equipes, mentorias ou dúvidas administrativas.
            </p>
            <ul>
              <li>Retorno em até 1 dia útil</li>
              <li>Atendimento via e-mail ou WhatsApp</li>
              <li>Equipe preparada para discipulado e gestão ministerial</li>
            </ul>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Nome completo
              <input type="text" name="name" placeholder="Seu nome" required />
            </label>
            <label>
              E-mail
              <input type="email" name="email" placeholder="nome@email.com" required />
            </label>
            <label>
              Telefone / WhatsApp
              <input type="tel" name="phone" placeholder="(00) 00000-0000" />
            </label>
            <label className="form-full">
              Mensagem
              <textarea name="message" placeholder="Como podemos ajudar?" rows={5} required />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn primary">
                Enviar mensagem
              </button>
              <span className="form-disclaimer">
                Ao enviar, você concorda em ser contatado pelos canais informados.
              </span>
              <div className="form-help">
                <span>Tempo médio de resposta: 12h</span>
                <span>Preferencialmente via WhatsApp</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="contact-cta">
        <div className="content-container">
          <div className="contact-cta-card">
            <div>
              <span className="section-label">Atendimento imediato</span>
              <h2>Prefere falar agora com alguém da equipe?</h2>
              <p>Nosso time está disponível no WhatsApp para direcionar seu pedido ou encaminhá-lo para o setor responsável.</p>
            </div>
            <div className="cta-actions">
              <a className="btn primary" href="https://wa.me/5583987181731" target="_blank" rel="noopener noreferrer">
                Abrir WhatsApp
              </a>
              <a className="btn outline" href="mailto:escolafiveone@gmail.com">
                Enviar e-mail
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
