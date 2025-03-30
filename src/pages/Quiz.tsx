import { useEffect, useState, useRef } from "react";
import InputMask from "react-input-mask";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { BsInfoCircleFill } from "react-icons/bs";

import logo from "../assets/images/logo-fiveone-white.png";
import mestreIcon from "../assets/images/icons/mestre.png";
import pastorIcon from "../assets/images/icons/pastor.png";
import profetaIcon from "../assets/images/icons/profeta.png";
import apostoloIcon from "../assets/images/icons/apostolo.png";
import evangelistaIcon from "../assets/images/icons/evangelista.png";

import StatementButton from "../components/StatementButton";

import { getRandomComparisonPair, categoryMetadata } from "../data/questions";

import "./Quiz.css";

import { CategoryEnum, Statement } from "../types/quiz";

const categoryIcons: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]: apostoloIcon,
  [CategoryEnum.PROFETA]: profetaIcon,
  [CategoryEnum.EVANGELISTA]: evangelistaIcon,
  [CategoryEnum.PASTOR]: pastorIcon,
  [CategoryEnum.MESTRE]: mestreIcon,
};

const TOTAL_QUESTIONS = 50; // Number of comparisons to show

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [categoryScores, setCategoryScores] = useState<
    Record<CategoryEnum, number>
  >({
    [CategoryEnum.APOSTOLO]: 0,
    [CategoryEnum.PROFETA]: 0,
    [CategoryEnum.EVANGELISTA]: 0,
    [CategoryEnum.PASTOR]: 0,
    [CategoryEnum.MESTRE]: 0,
  });
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [usedStatements, setUsedStatements] = useState<Set<number>>(new Set());
  const [currentPair, setCurrentPair] = useState<{
    statement1: Statement;
    statement2: Statement;
  } | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    submitted: false,
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const quizTopRef = useRef<HTMLDivElement | null>(null);

  // Preload image when component mounts
  useEffect(() => {
    const img = new Image();
    img.src = logo;
  }, []);

  // Scroll to top when quiz starts
  useEffect(() => {
    if (quizStarted && quizTopRef.current) {
      quizTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [quizStarted]);

  // Initialize the quiz with first pair
  useEffect(() => {
    if (quizStarted && !currentPair) {
      const pair = getRandomComparisonPair(usedStatements);
      if (pair) {
        setCurrentPair(pair);
        setUsedStatements(
          (prev) => new Set([...prev, pair.statement1.id, pair.statement2.id])
        );
      } else {
        setShowResults(true);
      }
    }
  }, [quizStarted, currentPair, usedStatements]);

  const onHandleChoice = (chosenCategory: CategoryEnum) => {
    // Update scores
    setCategoryScores((prevScores) => ({
      ...prevScores,
      [chosenCategory]: prevScores[chosenCategory] + 1,
    }));

    // Check if quiz should end
    if (currentQuestion >= TOTAL_QUESTIONS - 1) {
      setShowResults(true);
      return;
    }

    // Get next question pair
    const newPair = getRandomComparisonPair(usedStatements);
    if (!newPair) {
      setShowResults(true);
      return;
    }

    // Update question state
    setCurrentQuestion((prev) => prev + 1);
    setCurrentPair(newPair);
    setUsedStatements(
      (prev) => new Set([...prev, newPair.statement1.id, newPair.statement2.id])
    );
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  const onHandleReset = () => {
    setQuizStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setCurrentPair(null);
    setUsedStatements(new Set());
    setCategoryScores(
      Object.values(CategoryEnum).reduce(
        (acc, category) => ({ ...acc, [category]: 0 }),
        {} as Record<CategoryEnum, number>
      )
    );
  };

  const handleDownloadPDF = () => {
    const sortedScores = Object.entries(categoryScores)
      .map(([category, score]) => ({
        categoryEnum: category as CategoryEnum,
        score: (score / TOTAL_QUESTIONS) * 100,
        metadata: categoryMetadata.find((c) => c.id === category)!,
      }))
      .sort((a, b) => b.score - a.score);

    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Resultado do Teste Ministerial", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Nome: ${userInfo.name}`, 20, 35);
    pdf.text(`Email: ${userInfo.email}`, 20, 42);
    pdf.text(`Telefone: ${userInfo.phone}`, 20, 49);

    // Tabela de Resultados
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pontuação por Dom:", 20, 65);

    let yOffset = 75;
    sortedScores.forEach(({ metadata, score }) => {
      pdf.setFontSize(12);
      pdf.setTextColor(33, 33, 33);
      pdf.text(`${metadata.name}: ${score.toFixed(1)}%`, 25, yOffset);
      yOffset += 10;
    });

    const mainGift = sortedScores[0];
 
    // Orientação específica com base no dom principal
    let guidance = "";
    switch (mainGift.categoryEnum) {
      case CategoryEnum.APOSTOLO:
        guidance = `O Meu Perfil Ministerial

Dom Principal: Apostólico

INTRODUÇÃO
Essa é uma avaliação ministerial baseada no modelo de Efésios 4:7,11-12, onde encontramos os cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino. Esses dons são fundamentais para a edificação da Igreja e o crescimento do Corpo de Cristo. Cada crente possui uma inclinação natural para um ou mais desses dons, contribuindo para a missão e expansão do Reino de Deus.

O dom Apostólico tem como principal função a expansão do Reino, a plantação de igrejas e a inovação no ministério. Os apóstolos são pioneiros, visionários e catalisadores da obra missionária.

VISÃO GERAL DO DOM APOSTÓLICO
A pessoa com dom apostólico possui uma forte inclinação para iniciar novas obras, conectar pessoas e estabelecer fundamentos duradouros no Reino de Deus. Ele sente um chamado para desenvolver e mobilizar outros para a missão, assumindo riscos para ampliar a obra de Deus.

Os apóstolos têm um papel vital na estrutura da Igreja, pois trabalham para fortalecer e expandir a obra de Cristo. Eles operam frequentemente na transição entre culturas, promovem a contextualização da mensagem do Evangelho e mantêm o DNA do Reino de Deus.

CARACTERÍSTICAS DO APOSTÓLICO
- Pensamento visionário e estratégico
- Disposição para assumir riscos e iniciar novos projetos
- Capacidade de liderar e influenciar outros
- Forte senso de missão e envio
- Habilidade de conectar diferentes grupos e ministérios
- Inconformismo com o status quo
- Facilidade para trabalhar com redes e expansão

FUNÇÕES PRINCIPAIS DO APOSTÓLICO
- Semeador do DNA da Igreja
- Plantador de igrejas e comunidades
- Mobilizador de líderes
- Conector translocal
- Provedor de inovação ministerial
- Garantidor da fidelidade à visão e missão

REFERÊNCIAS BÍBLICAS
Lucas 10:1-3; 1 Coríntios 3:5-9,11

PONTOS CEGOS E DESAFIOS
- Autocracia e domínio excessivo
- Falta de empatia
- Impaciência
- Falta de compromisso com detalhes
- Desgaste e esgotamento

IMPACTO DO DOM APOSTÓLICO NA IGREJA
- Extensão do Reino de Deus para novas regiões e culturas
- Fortalecimento da missão e envio de novos líderes
- Inovação e adaptação do ministério para desafios contemporâneos
- Manutenção da fidelidade ao DNA do Reino de Deus
- Criação de redes ministeriais para colaboração e apoio entre igrejas e organizações

CONCLUSÃO
O dom Apostólico é essencial para a vitalidade da Igreja. Ele impulsiona a missão, inovação e expansão do Reino de Deus, capacitando líderes e estabelecendo bases para um crescimento sustentável. Quando equilibrado com os outros dons ministeriais, o apostólico ajuda a criar uma Igreja saudável, missionária e contextualizada para impactar o mundo de forma transformadora.`;
        break;
      case CategoryEnum.PROFETA:
        guidance = `O Meu Perfil Ministerial

Dom Principal: Profético

INTRODUÇÃO
Essa é uma avaliação ministerial baseada no modelo de Efésios 4:7,11-12, onde encontramos os cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino. Esses dons são fundamentais para a edificação da Igreja e o crescimento do Corpo de Cristo. Cada crente possui uma inclinação natural para um ou mais desses dons, contribuindo para a missão e expansão do Reino de Deus.

O dom Profético é essencial para manter a fidelidade da Igreja a Deus. Os profetas são guardiões da aliança, zelando para que o povo de Deus viva em justiça, santidade e fidelidade ao Senhor. Eles desafiam o status quo, denunciam injustiças e chamam a Igreja ao arrependimento e à pureza.

VISÃO GERAL DO DOM PROFÉTICO
A pessoa com dom profético tem uma percepção aguçada da vontade de Deus e do que está acontecendo no mundo espiritual. Profetas são sensíveis à voz do Senhor e chamados para exortar, corrigir e inspirar a Igreja a viver de acordo com os princípios do Reino de Deus.

Os profetas desempenham um papel crucial na Igreja, ajudando-a a se manter alinhada com a verdade de Deus e conduzindo o povo a uma relação mais profunda com Ele. Eles possuem um forte senso de justiça e não se conformam com estruturas humanas que se desviam da essência do Evangelho.

CARACTERÍSTICAS DO PROFETA
- Sensibilidade espiritual aguçada
- Busca constante por justiça e verdade
- Compromisso inabalável com a vontade de Deus
- Coragem para confrontar e exortar
- Chamado para discernir e revelar a verdade
- Intensa paixão por santidade e arrependimento
- Capacidade de inspirar e desafiar a Igreja

FUNÇÕES PRINCIPAIS DO PROFETA
- Guardião da Aliança
- Voz profética de exortação e consolo
- Discernidor espiritual
- Intercessor e guerreiro de oração
- Despertador da Igreja

REFERÊNCIAS BÍBLICAS
Jeremias 1:9-10; Amós 3:7

PONTOS CEGOS E DESAFIOS
- Rigidez e inflexibilidade
- Isolamento
- Tendência ao julgamento severo
- Falta de paciência com processos e lideranças
- Sensibilidade extrema

IMPACTO DO DOM PROFÉTICO NA IGREJA
- Mantém a Igreja alinhada com a vontade de Deus
- Promove arrependimento, santidade e compromisso com o Reino
- Ajuda a discernir tempos e direções espirituais
- Exorta e encoraja a Igreja a viver segundo os princípios do Evangelho
- Desperta a paixão pela justiça e pelo amor a Deus

CONCLUSÃO
O dom Profético é essencial para a vitalidade e pureza da Igreja. Ele garante que o Corpo de Cristo se mantenha fiel ao Senhor, trazendo discernimento, direção e correção para o povo de Deus. Quando equilibrado com os outros dons ministeriais, o dom profético fortalece a Igreja e a conduz a uma relação mais profunda com Deus.`;
        break;
      case CategoryEnum.EVANGELISTA:
        guidance = `O Meu Perfil Ministerial

Dom Principal: Evangelista

INTRODUÇÃO
Essa é uma avaliação ministerial baseada no modelo de Efésios 4:7,11-12, onde encontramos os cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino. Esses dons são fundamentais para a edificação da Igreja e o crescimento do Corpo de Cristo. Cada crente possui uma inclinação natural para um ou mais desses dons, contribuindo para a missão e expansão do Reino de Deus.

O dom Evangelístico é essencial para a propagação do Evangelho e o crescimento da Igreja. O evangelista tem uma paixão ardente por compartilhar a mensagem de salvação com os perdidos e trazê-los para uma relação transformadora com Cristo.

VISÃO GERAL DO DOM EVANGELÍSTICO
A pessoa com dom evangelístico tem uma capacidade inata de comunicar as boas-novas de Jesus de forma clara e convincente. Seu coração está voltado para os que ainda não conhecem a Cristo, e sua vida é marcada por um desejo constante de ver pessoas sendo salvas.

O evangelista se destaca por sua abordagem envolvente, sua habilidade de conectar-se com diferentes públicos e sua disposição em levar o Evangelho a qualquer lugar. Sua influência pode impactar tanto grandes multidões quanto interações individuais.

CARACTERÍSTICAS DO EVANGELISTA
- Paixão intensa por compartilhar o Evangelho
- Habilidade de comunicar a mensagem de forma clara e cativante
- Facilidade para construir relações com diferentes tipos de pessoas
- Coragem para abordar desconhecidos e falar sobre Cristo
- Energia e entusiasmo contagiantes
- Capacidade de mobilizar a Igreja para missões e evangelismo
- Sensibilidade para identificar oportunidades de evangelização

FUNÇÕES PRINCIPAIS DO EVANGELISTA
- Compartilhamento do Evangelho
- Mobilização da Igreja para o evangelismo
- Construção de pontes entre a Igreja e os não convertidos
- Desenvolvimento de estratégias evangelísticas eficazes
- Acompanhamento de novos convertidos
- Uso criativo da cultura para a evangelização

REFERÊNCIAS BÍBLICAS
Mateus 28:19-20; Romanos 10:14-15

PONTOS CEGOS E DESAFIOS
- Tendência a negligenciar o discipulado
- Superficialidade na mensagem
- Falta de paciência com processos longos
- Necessidade excessiva de aprovação
- Dificuldade em lidar com rejeição

IMPACTO DO DOM EVANGELÍSTICO NA IGREJA
- Expansão do Reino de Deus por meio da conversão de novos crentes
- Desenvolvimento de uma cultura evangelística na Igreja
- Aumento do envolvimento dos membros na missão de Cristo
- Criação de estratégias inovadoras para alcançar os perdidos
- Promoção de um ambiente acolhedor para os que ainda não conhecem Jesus

CONCLUSÃO
O dom Evangelístico é essencial para o crescimento e dinamismo da Igreja. Ele impulsiona o Corpo de Cristo a sair das quatro paredes e levar o Evangelho a todos os lugares. Quando equilibrado com os outros dons ministeriais, o evangelista fortalece a missão da Igreja e colabora para um movimento de conversão e discipulado efetivo.`;
        break;
      case CategoryEnum.PASTOR:
        guidance = `O Meu Perfil Ministerial

Dom Principal: Pastoral

INTRODUÇÃO
Essa é uma avaliação ministerial baseada no modelo de Efésios 4:7,11-12, onde encontramos os cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino. Esses dons são fundamentais para a edificação da Igreja e o crescimento do Corpo de Cristo. Cada crente possui uma inclinação natural para um ou mais desses dons, contribuindo para a missão e expansão do Reino de Deus.

O dom Pastoral é essencial para o cuidado e desenvolvimento espiritual da Igreja. O pastor tem um coração voltado para as pessoas, garantindo que cresçam em maturidade, amor e compromisso com Cristo.

VISÃO GERAL DO DOM PASTORAL
A pessoa com dom pastoral possui um profundo senso de compaixão e zelo pelo bem-estar das pessoas. Seu papel é cuidar, orientar e discipular, ajudando a Igreja a crescer em unidade e amor.

Os pastores têm um papel vital na criação de comunidades saudáveis e espiritualmente maduras. Eles ajudam a curar feridas emocionais, proporcionam um ambiente seguro para o crescimento espiritual e garantem que as necessidades espirituais e emocionais do rebanho sejam supridas.

CARACTERÍSTICAS DO PASTOR
- Compaixão genuína pelos outros
- Disposição para ouvir e aconselhar
- Habilidade para criar ambientes de acolhimento e pertencimento
- Forte compromisso com o discipulado e a formação espiritual
- Paciência e dedicação ao crescimento dos membros da Igreja
- Sensibilidade para identificar necessidades emocionais e espirituais
- Capacidade de promover unidade e harmonia na comunidade

FUNÇÕES PRINCIPAIS DO PASTOR
- Cuidado e aconselhamento
- Criação de uma comunidade saudável
- Discipulado e formação espiritual
- Mediação de conflitos
- Ensino prático da Palavra
- Cuidado com os necessitados

REFERÊNCIAS BÍBLICAS
João 10:11; 1 Pedro 5:2-3

PONTOS CEGOS E DESAFIOS
- Tendência à sobrecarga emocional
- Dificuldade em delegar tarefas
- Excesso de empatia
- Aversão ao conflito
- Risco de co-dependência

IMPACTO DO DOM PASTORAL NA IGREJA
- Fortalecimento dos laços comunitários e do amor entre os crentes
- Desenvolvimento de um ambiente seguro e acolhedor na Igreja
- Aconselhamento e apoio espiritual para crescimento pessoal
- Promoção da unidade e resolução de conflitos saudáveis
- Engajamento ativo no cuidado dos necessitados

CONCLUSÃO
O dom Pastoral é essencial para o cuidado e fortalecimento da Igreja. Ele ajuda os crentes a crescerem em amor, unidade e maturidade espiritual, garantindo que a comunidade seja um reflexo vivo do amor de Cristo. Quando equilibrado com os outros dons ministeriais, o pastor promove um ambiente onde todos podem florescer espiritualmente e se sentir parte do Corpo de Cristo.`;
        break;
      case CategoryEnum.MESTRE:
        guidance = `O Meu Perfil Ministerial
        
Dom Principal: Mestre
        
INTRODUÇÃO
Essa é uma avaliação ministerial baseada no modelo de Efésios 4:7,11-12, onde encontramos os cinco dons ministeriais: Apostólico, Profético, Evangelístico, Pastoral e de Ensino. Esses dons são fundamentais para a edificação da Igreja e o crescimento do Corpo de Cristo. Cada crente possui uma inclinação natural para um ou mais desses dons, contribuindo para a missão e expansão do Reino de Deus.
        
O dom de Mestre é essencial para o ensino, a edificação e a formação teológica e espiritual dos crentes. O mestre tem um papel fundamental na sistematização e transmissão do conhecimento bíblico, ajudando a Igreja a crescer em compreensão e aplicação da Palavra de Deus.
        
VISÃO GERAL DO DOM DE ENSINO
A pessoa com dom de Mestre possui um amor profundo pelo conhecimento e pela verdade. Seu objetivo é ajudar outros a compreenderem as Escrituras e aplicá-las em suas vidas. Ele tem a habilidade de organizar conceitos complexos em formas acessíveis e claras.
        
Os mestres desempenham um papel essencial na estruturação do ensino dentro da Igreja, promovendo o crescimento intelectual e espiritual dos crentes. Eles ajudam a estabelecer bases sólidas de entendimento bíblico, prevenindo erros doutrinários e fortalecendo a maturidade dos fiéis.
        
CARACTERÍSTICAS DO MESTRE
- Amor pelo estudo e pelo ensino das Escrituras
- Capacidade de explicar conceitos complexos de forma clara
- Paixão pela verdade e pela doutrina bíblica
- Habilidade de organizar e estruturar o conhecimento
- Compromisso com a formação espiritual e intelectual dos crentes
- Paciência para ensinar e discipular
- Busca constante por sabedoria e entendimento
        
FUNÇÕES PRINCIPAIS DO MESTRE
- Ensino e exposição bíblica
- Desenvolvimento de material teológico
- Discipulado intelectual e espiritual
- Correção de erros doutrinários
- Treinamento de novos líderes e professores
- Interpretação das Escrituras
        
REFERÊNCIAS BÍBLICAS
Mateus 7:28-29; 2 Timóteo 2:15
        
PONTOS CEGOS E DESAFIOS
- Tendência ao intelectualismo excessivo
- Dificuldade em lidar com aqueles que aprendem de forma diferente
- Orgulho intelectual
- Falta de conexão emocional
- Resistência a novas formas de ensino
        
IMPACTO DO DOM DE ENSINO NA IGREJA
- Fortalecimento da sã doutrina e da maturidade espiritual
- Desenvolvimento de uma Igreja fundamentada na Palavra
- Prevenção contra heresias e falsas doutrinas
- Formação de novos líderes e discipuladores
- Promoção de um ambiente de aprendizado e crescimento contínuo
        
CONCLUSÃO
O dom de Mestre é essencial para a formação e crescimento sólido da Igreja. Ele garante que a Palavra de Deus seja corretamente ensinada, compreendida e aplicada. Quando equilibrado com os outros dons ministeriais, o mestre contribui para uma Igreja madura, firme na verdade e capaz de discipular outras gerações com sabedoria e conhecimento profundo da Palavra.`;
        break;
    }
 
    // Adicionar orientação ao PDF
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Orientação com base no seu dom:", 20, yOffset);
    yOffset += 10;
 
    const splitGuidance = pdf.splitTextToSize(guidance, 170);
    pdf.text(splitGuidance, 20, yOffset);
 
    yOffset += splitGuidance.length * 7;
 
    // Rodapé
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      "Este resultado é apenas uma ferramenta de autoconhecimento ministerial.",
      20,
      280
    );
    pdf.text("Baseado em Efésios 4:11-13", 20, 285);
 
    pdf.save("resultado-teste-fiveone.pdf");
  };

  if (!quizStarted) {
    return (
      <section className="quiz-section">
        <div className="content-container">
          <h1>Descubra o seu Dom Ministerial</h1>
          <div className="top-start-button-wrapper">
            <button
              onClick={() => setQuizStarted(true)}
              className="start-button"
              aria-label="Iniciar o Teste (atalho superior)"
            >
              Começar Agora
            </button>
          </div>
          <div className="responsive-intro-wrapper">
            <div className="intro-section">
              <div className="theological-explanation">
              <h3>Base Teológica do Teste</h3>
              <p>
                Este teste foi inspirado em Efésios 4:11-13, onde o apóstolo Paulo ensina
                que Cristo concedeu dons ministeriais à Igreja: apóstolos, profetas,
                evangelistas, pastores e mestres. Esses dons têm como finalidade edificar
                o corpo de Cristo, levar os santos à maturidade e promover a unidade da fé.
              </p>
              <p>
                Cada afirmação neste Teste foi cuidadosamente pensada para refletir as
                inclinações naturais e espirituais relacionadas a esses dons. O objetivo
                é ajudá-lo a discernir com mais clareza qual dom ministerial está mais
                presente em sua vida, não como um rótulo, mas como um ponto de partida
                para seu desenvolvimento no serviço cristão.
              </p>
              <p>
                Lembre-se: todos os dons são importantes e complementares. Este quiz é
                apenas uma ferramenta de autoconhecimento à luz das Escrituras.
              </p>
              </div>
            </div>
          </div>
          <p>
            Este Teste apresentará {TOTAL_QUESTIONS} pares de afirmações. Para
            cada par, escolha a afirmação que mais se identifica com você.
          </p>
          <p>
            Não existe resposta certa ou errada - seja honesto em suas escolhas
            para obter um resultado mais preciso.
          </p>
          <p>O teste leva em média 5-10 minutos para ser completado.</p>
          <div className="start-form">
            <button
              onClick={() => setQuizStarted(true)}
              className="start-button"
              aria-label="Iniciar o Teste"
            >
              Quero Fazer o Teste
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (showResults && !userInfo.submitted) {
    return (
      <section className="quiz-section">
        <div className="content-container">
          <h2>Quase lá!</h2>
          <p>Antes de ver seu resultado, preencha as informações abaixo:</p>
          <div className="start-form">
            <input
              type="text"
              placeholder="Nome"
              value={userInfo.name}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() =>
                setFormErrors((prev) => ({ ...prev, name: !userInfo.name.trim() }))
              }
              className={`username-input ${formErrors.name ? "input-error" : ""}`}
            />
            {formErrors.name && <span className="error-msg">Preencha seu nome</span>}
            <input
              type="email"
              placeholder="Email"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() =>
                setFormErrors((prev) => ({
                  ...prev,
                  email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email),
                }))
              }
              className={`username-input ${formErrors.email ? "input-error" : ""}`}
            />
            {formErrors.email && (
              <span className="error-msg">Digite um email válido</span>
            )}
            <InputMask
              mask="(99) 99999-9999"
              value={userInfo.phone}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, phone: e.target.value }))
              }
              onBlur={() =>
                setFormErrors((prev) => ({
                  ...prev,
                  phone: userInfo.phone.replace(/\D/g, "").length !== 11,
                }))
              }
            >
              {(inputProps: any) => (
                <input
                  {...inputProps}
                  type="tel"
                  placeholder="Telefone"
                  className={`username-input ${formErrors.phone ? "input-error" : ""}`}
                />
              )}
            </InputMask>
            {formErrors.phone && (
              <span className="error-msg">Digite um telefone válido</span>
            )}
            <button
              onClick={() => {
                const hasErrors = {
                  name: !userInfo.name.trim(),
                  email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email),
                  phone: userInfo.phone.replace(/\D/g, "").length !== 11,
                };
                setFormErrors(hasErrors);

                if (!Object.values(hasErrors).some(Boolean)) {
                  setUserInfo((prev) => ({ ...prev, submitted: true }));
                }
              }}
              className="start-button"
            >
              Ver resultado
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (showResults) {
    const sortedScores = Object.entries(categoryScores)
      .map(([category, score]) => ({
        categoryEnum: category as CategoryEnum,
        score: (score / TOTAL_QUESTIONS) * 100,
        metadata: categoryMetadata.find((c) => c.id === category)!,
      }))
      .sort((a, b) => a.score - b.score); // Order is reversed to work with wrap-reverse

    return (
      <section className="Teste-section">
        <div className="content-container" id="quiz-result">
          <div className="results-header" style={{ marginTop: "6rem" }}>
            <h2>Parabéns, seu resultado está pronto!</h2>
            <p>
              Leia com atenção as informações abaixo para tirar o máximo de
              proveito do seu teste. Nele você vai ver quais dos 5 dons você tem
              uma maior inclinação e como isso se aplica a sua vida.
            </p>
          </div>
          <div className="result-name">{userInfo.name}</div>
          <div className="results">
            {sortedScores.map(({ categoryEnum: category, score, metadata }) => (
              <div
                key={category}
                className={`result-item ${category.toLowerCase()}`}
              >
                <div className="category-icon-wrapper">
                  <img
                    src={categoryIcons[category]}
                    alt={`${metadata.name} icon`}
                    className="category-icon"
                  />
                </div>
                <div className="category-title">
                  <h3>{metadata.name}</h3>
                  <div
                    className="info-icon"
                    role="tooltip"
                    aria-label={metadata.description}
                  >
                    <BsInfoCircleFill size={16} />
                    <span className="tooltip">{metadata.description}</span>
                  </div>
                </div>
                <p>{score.toFixed(1)}%</p>
              </div>
            ))}
          </div>
          <button
            onClick={onHandleReset}
            className="reset-button"
            aria-label="Reiniciar o Teste"
          >
            Reiniciar
          </button>
          <div className="pdf-download-wrapper">
            <button
              onClick={handleDownloadPDF}
              className="start-button"
              aria-label="Baixar resultado em PDF"
            >
              Baixar Resultado em PDF
            </button>
            <p className="pdf-download-note">
              Clique para baixar um PDF com o seu resultado. Você pode guardar ou compartilhar!
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!currentPair) {
    return null;
  }

  return (
    <section className="quiz-section">
      <div className="content-container" ref={quizTopRef}>
        <h2>
          Comparação {currentQuestion + 1} de {TOTAL_QUESTIONS}
        </h2>
        <progress
          value={currentQuestion + 1}
          max={TOTAL_QUESTIONS}
          className="quiz-progress-bar"
        ></progress>
        <p>Com qual dessas afirmações você mais se identifica?</p>
        <div className="statement-container">
          <StatementButton
            statement={currentPair.statement1}
            onHandleChoice={onHandleChoice}
          />
          <StatementButton
            statement={currentPair.statement2}
            onHandleChoice={onHandleChoice}
          />
        </div>
        <div
          className="dual-options-wrapper"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              if (currentQuestion >= TOTAL_QUESTIONS - 1) {
                setShowResults(true);
                return;
              }

              const newPair = getRandomComparisonPair(usedStatements);
              if (!newPair) {
                setShowResults(true);
                return;
              }

              setCurrentQuestion((prev) => prev + 1);
              setCurrentPair(newPair);
              setUsedStatements(
                (prev) => new Set([...prev, newPair.statement1.id, newPair.statement2.id])
              );
              document.activeElement instanceof HTMLElement && document.activeElement.blur();
            }}
            className="statement-button none-button"
            aria-label="Nenhuma das opções acima"
          >
            Nenhuma das opções acima
          </button>
          <button
            onClick={() => {
              setCategoryScores((prevScores) => ({
                ...prevScores,
                [currentPair!.statement1.category]: prevScores[currentPair!.statement1.category] + 1,
                [currentPair!.statement2.category]: prevScores[currentPair!.statement2.category] + 1,
              }));

              if (currentQuestion >= TOTAL_QUESTIONS - 1) {
                setShowResults(true);
                return;
              }

              const newPair = getRandomComparisonPair(usedStatements);
              if (!newPair) {
                setShowResults(true);
                return;
              }

              setCurrentQuestion((prev) => prev + 1);
              setCurrentPair(newPair);
              setUsedStatements(
                (prev) => new Set([...prev, newPair.statement1.id, newPair.statement2.id])
              );
              document.activeElement instanceof HTMLElement && document.activeElement.blur();
            }}
            className="statement-button both-button"
            aria-label="Me identifico com as duas afirmações"
          >
            Me identifico com as duas afirmações
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="debug-info">
            {[currentPair.statement1, currentPair.statement2].map(
              (statement, index) => (
                <p key={statement.id}>
                  Categoria {index + 1}:{" "}
                  {
                    categoryMetadata.find((c) => c.id === statement.category)
                      ?.name
                  }
                </p>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Quiz;
