import './Contact.css';

const Contact = () => {
  return (
    <section className="contact-hero">
      <div className="hero-content">
        <h1 className="hero-title">CENTRAL DE ATENDIMENTO</h1>
      </div>
      <div className="contact-grid">
        <div className="contact-card">
          <div className="icon">🎓</div>
          <h2 className="contact-subtitle">ATENDIMENTO</h2>
          <p>Suporte exclusivo para alunos da Escola Five One.</p>
          <a href="https://wa.me/5583989004764" target="_blank" rel="noopener noreferrer" className="contact-button">FALAR COM ATENDIMENTO</a>
        </div>
        <div className="contact-card">
          <div className="icon">📩</div>
          <h2 className="contact-subtitle">DÚVIDAS</h2>
          <p>Está com dúvidas sobre como estudar conosco?</p>
          <a href="mailto:escolafiveone@gmail.com" className="contact-button">TIRAR DÚVIDAS</a>
        </div>
        <div className="contact-card">
          <div className="icon">💳</div>
          <h2 className="contact-subtitle">FINANCEIRO</h2>
          <p>Entre em contato com nosso departamento financeiro.</p>
          <a href="mailto:financeiro@fiveone.com" className="contact-button">FALAR COM FINANCEIRO</a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
