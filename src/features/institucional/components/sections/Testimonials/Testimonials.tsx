import "./Testimonials.css";

const testimonials = [
  {
    content:
      "A Escola Five One me ajudou a crescer espiritualmente e a descobrir meu chamado ministerial. Recomendo a todos!",
    author: "João Silva",
  },
  {
    content:
      "As aulas são ricas em conteúdo e os professores são inspiradores. Aprendi muito sobre meu papel no Corpo de Cristo.",
    author: "Maria Oliveira",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="content-container">
        <h2>O que dizem nossos alunos</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p>{testimonial.content}</p>
              <span className="testimonial-author">- {testimonial.author}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
