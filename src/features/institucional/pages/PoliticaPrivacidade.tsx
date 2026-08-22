import { useEffect } from "react";
import { Link } from "react-router-dom";

// Política de Privacidade — base para o consentimento LGPD na captação de leads
// (quiz "Descubra seu Dom", newsletter, formulários). Texto genérico; recomenda-se
// revisão jurídica antes de considerá-lo definitivo.
const CONTACT_EMAIL = "escolafiveone@gmail.com";
const UPDATED_AT = "22 de agosto de 2026";

const sectionStyle: React.CSSProperties = { marginTop: "2rem" };
const h2Style: React.CSSProperties = {
  color: "#64ffda",
  fontSize: "1.15rem",
  fontWeight: 700,
  marginBottom: "0.6rem",
};
const pStyle: React.CSSProperties = {
  color: "#cfd8dc",
  lineHeight: 1.7,
  fontSize: "0.98rem",
  marginBottom: "0.6rem",
};

export default function PoliticaPrivacidade() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Política de Privacidade | Five One";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b2a", padding: "6rem 1.25rem 4rem" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <Link
          to="/descubra-seu-dom"
          style={{ color: "#64ffda", fontSize: "0.9rem", textDecoration: "none" }}
        >
          ← Voltar
        </Link>

        <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: 800, marginTop: "1rem", letterSpacing: "-0.02em" }}>
          Política de Privacidade
        </h1>
        <p style={{ color: "#7f98a6", fontSize: "0.85rem", marginTop: "0.4rem" }}>
          Última atualização: {UPDATED_AT}
        </p>

        <section style={sectionStyle}>
          <p style={pStyle}>
            Esta Política descreve como o <strong>Movimento Five One</strong> coleta, usa e protege
            os seus dados pessoais quando você utiliza nossos formulários — incluindo o teste
            "Descubra seu Dom", a newsletter e os formulários de contato —, em conformidade com a
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Quais dados coletamos</h2>
          <p style={pStyle}>
            No teste dos 5 Ministérios e nos formulários de captação, coletamos os dados que você
            nos fornece diretamente: <strong>nome, e-mail e telefone</strong>. Também registramos as
            suas respostas ao teste e o resultado gerado, além de dados técnicos básicos de uso
            (como um identificador anônimo de dispositivo e origem do acesso) para fins estatísticos.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Para que usamos</h2>
          <p style={pStyle}>
            Utilizamos os seus dados para: enviar o resultado do teste (por e-mail, com o PDF);
            comunicar novidades, conteúdos e cursos do Five One; e melhorar a experiência e a
            qualidade dos nossos materiais. Não vendemos os seus dados a terceiros.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Base legal</h2>
          <p style={pStyle}>
            O tratamento dos seus dados se baseia no seu <strong>consentimento</strong>, manifestado
            ao marcar a caixa de aceite antes de enviar o formulário. Você pode revogar esse
            consentimento a qualquer momento (ver seção 6).
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Compartilhamento e processadores</h2>
          <p style={pStyle}>
            Para operar o serviço, utilizamos fornecedores que processam dados em nosso nome, como
            plataformas de hospedagem, banco de dados e envio de e-mail. Esses fornecedores tratam os
            dados apenas conforme as nossas instruções e com medidas de segurança adequadas.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Por quanto tempo guardamos</h2>
          <p style={pStyle}>
            Mantemos os seus dados pelo tempo necessário às finalidades acima ou até que você
            solicite a exclusão. Após isso, os dados são eliminados ou anonimizados, salvo obrigação
            legal de retenção.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Seus direitos</h2>
          <p style={pStyle}>
            Você pode, a qualquer momento, solicitar acesso, correção, portabilidade ou exclusão dos
            seus dados, bem como revogar o consentimento e cancelar o recebimento de comunicações.
            Para exercer esses direitos, escreva para{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#64ffda" }}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Contato</h2>
          <p style={pStyle}>
            Dúvidas sobre esta Política ou sobre o tratamento dos seus dados podem ser enviadas para{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#64ffda" }}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
