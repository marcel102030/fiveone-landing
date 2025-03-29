import { useEffect, useState, useRef } from "react";
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
    const input = document.getElementById("quiz-result");

    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resultado-teste-fiveone.pdf");
    });
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
              className="username-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              className="username-input"
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={userInfo.phone}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="username-input"
            />
            <button
              onClick={() =>
                setUserInfo((prev) => ({ ...prev, submitted: true }))
              }
              className="start-button"
              disabled={
                !userInfo.name.trim() ||
                !userInfo.email.trim() ||
                !userInfo.phone.trim()
              }
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
          <button
            onClick={handleDownloadPDF}
            className="start-button"
            aria-label="Baixar resultado em PDF"
          >
            Baixar Resultado em PDF
          </button>
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
          style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}
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
