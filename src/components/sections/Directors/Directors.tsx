import sueniaUrl from "../../../assets/images/people/suenia.jpeg";
import marceloUrl from "../../../assets/images/people/marcelo.jpeg";
import rodolfoUrl from "../../../assets/images/people/rodolfo.jpeg";

import "./Directors.css";

const directors = [
  {
    name: "SUENIA KARCIA",
    role: "Diretora Executiva",
    image: sueniaUrl,
    description:
      "Historiadora e mestranda em História com ênfase no ensino da História da Igreja, atua com dedicação na área acadêmica e na formação de novos olhares sobre a fé e a tradição religiosa. Com uma trajetória que une pesquisa e ensino, busca enriquecer a compreensão sobre o papel da igreja ao longo da história.",
  },
  {
    name: "MARCELO JUNIOR",
    role: "CEO",
    image: marceloUrl,
    description:
      "Pós-graduado em Educação Cristã pelo Instituto Reformado de São Paulo e em Ciências da Religião pela Faculdade Batista Ipemig, Marcelo Junior dedica sua vida ao ensino sobre os 5 Ministérios de Efésios 4. Com uma paixão profunda pela formação ministerial, ele busca capacitar seus alunos a descobrirem e desenvolverem seus dons para o serviço e edificação da igreja.",
  },
  {
    name: "RODOLFO HENNER",
    role: "Diretor Acadêmico",
    image: rodolfoUrl,
    description:
      "Atua no ministério de ensino há mais de 10 anos, servindo à Igreja Batista Memorial e à igreja brasileira como um todo.",
  },
];

const Directors = () => {
  return (
    <section className="directors-section">
      <div className="content-container">
        <h2>DIRETORES DA ESCOLA FIVE ONE</h2>
        <div className="directors-grid">
          {directors.map((director, index) => (
            <div key={index} className="director-card">
              <div className="director-image">
                <img src={director.image} alt={director.name} />
              </div>
              <h3>{director.name}</h3>
              <span className="director-role">{director.role}</span>
              <p>{director.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Directors;
