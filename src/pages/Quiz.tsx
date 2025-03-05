import { useEffect, useState } from "react";

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

  // Preload image when component mounts
  useEffect(() => {
    const img = new Image();
    img.src = logo;
  }, []);

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

  if (!quizStarted) {
    return (
      <section className="quiz-section">
        <div className="content-container">
          <h1>Quiz de aptidão 5 ministérios</h1>
          <p>
            Este quiz apresentará {TOTAL_QUESTIONS} pares de afirmações. Para
            cada par, escolha a afirmação que mais se identifica com você.
          </p>
          <p>
            Não existe resposta certa ou errada - seja honesto em suas escolhas
            para obter um resultado mais preciso.
          </p>
          <p>O teste leva em média 5-10 minutos para ser completado.</p>
          <button
            onClick={() => setQuizStarted(true)}
            className="start-button"
            aria-label="Iniciar o quiz"
          >
            Iniciar Quiz
          </button>
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

    const userName = "Confira seu resultado"; // You might want to make this dynamic

    return (
      <section className="quiz-section">
        <div className="content-container">
          <div className="results-header">
            <h2>Parabéns, seu resultado está pronto!</h2>
            <p>
              Leia com atenção as informações abaixo para tirar o máximo de
              proveito do seu teste. Nele você vai ver qual dos 5 dons você tem
              uma maior inclinação e como isso se aplica a sua vida.
            </p>
          </div>
          <div className="result-name">{userName}</div>
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
            aria-label="Reiniciar o quiz"
          >
            Reiniciar
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
      <div className="content-container">
        <h2>
          Comparação {currentQuestion + 1} de {TOTAL_QUESTIONS}
        </h2>
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
