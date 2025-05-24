import { useEffect, useState, useRef } from "react";
import InputMask from "react-input-mask";
import { CategoryEnum, Statement, ChoiceCategory, getProfileTextForDom } from "../types/quiz";
import jsPDF from "jspdf";
// @ts-ignore
// @ts-ignore
import html2pdf from "html2pdf.js";


import { BsInfoCircleFill } from "react-icons/bs";

import logo from "../assets/images/logo-fiveone-white.png";
import mestreIcon from "../assets/images/icons/mestre.png";
import pastorIcon from "../assets/images/icons/pastor.png";
import profetaIcon from "../assets/images/icons/profeta.png";
import apostoloIcon from "../assets/images/icons/apostolo.png";
import evangelistaIcon from "../assets/images/icons/evangelista.png";


import { getRandomComparisonPair, categoryMetadata } from "../data/questions";

import "./Quiz.css";


const categoryIcons: Record<CategoryEnum, string> = {
  [CategoryEnum.APOSTOLO]: apostoloIcon,
  [CategoryEnum.PROFETA]: profetaIcon,
  [CategoryEnum.EVANGELISTA]: evangelistaIcon,
  [CategoryEnum.PASTOR]: pastorIcon,
  [CategoryEnum.MESTRE]: mestreIcon,
};

const TOTAL_QUESTIONS = 50; // Number of comparisons to show

const Quiz = () => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingLeaveAction = useRef<(() => void) | null>(null);
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
  const [selectedCategory, setSelectedCategory] = useState<ChoiceCategory | null>(null);
  const [showSelectWarning, setShowSelectWarning] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const quizTopRef = useRef<HTMLDivElement | null>(null);
  const nextStepButtonRef = useRef<HTMLButtonElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Intercepta navegação via pushState/popstate (HashRouter-friendly)
  const lastHashRef = useRef(window.location.hash);

  useEffect(() => {
    const originalPushState = window.history.pushState;

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args as any);
      const newHash = window.location.hash;
      if (lastHashRef.current !== newHash) {
        const event = new PopStateEvent("popstate");
        window.dispatchEvent(event);
      }
      return result;
    };

    const handlePopState = () => {
      if (quizStarted && !showResults) {
        const currentHash = window.location.hash;
        const previousHash = lastHashRef.current;

        if (currentHash !== previousHash) {
          window.history.pushState(null, "", previousHash);
          pendingLeaveAction.current = () => {
            window.location.hash = currentHash;
          };
          setShowLeaveModal(true);
        }
      } else {
        lastHashRef.current = window.location.hash;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
    };
  }, [quizStarted, showResults]);

  const confirmLeave = () => {
    pendingLeaveAction.current?.();
    // Atualiza o hash sem disparar popstate e mantém o controle correto do hash
    window.history.pushState(null, "", window.location.hash);
    lastHashRef.current = window.location.hash;
    setShowLeaveModal(false);
  };

  const cancelLeave = () => {
    window.history.pushState(null, "", lastHashRef.current);
    pendingLeaveAction.current = null;
    setShowLeaveModal(false);
  };

  // Efeito para interceptar saída da página durante o quiz
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (quizStarted && !showResults) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizStarted, showResults]);

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

  const onHandleChoice = (chosenCategory: ChoiceCategory) => {
    setTransitioning(true);
    setTimeout(() => {
      setCategoryScores((prevScores) => {
        const updatedScores = { ...prevScores };

        if (chosenCategory === "ambas") {
          updatedScores[currentPair!.statement1.category] += 1;
          updatedScores[currentPair!.statement2.category] += 1;
        } else if (
          chosenCategory !== "nenhuma" &&
          chosenCategory in updatedScores
        ) {
          updatedScores[chosenCategory] += 1;
        }

        console.log("Categoria escolhida:", chosenCategory);
        console.log("Pontuações atualizadas:", updatedScores);

        return updatedScores;
      });

      if (currentQuestion >= TOTAL_QUESTIONS - 1) {
        setShowResults(true);
        setCurrentPair(null);
        setTransitioning(false);
        return;
      }

      const newPair = getRandomComparisonPair(usedStatements);
      if (!newPair) {
        setShowResults(true);
        setCurrentPair(null);
        setTransitioning(false);
        return;
      }

      setCurrentQuestion((prev) => prev + 1);
      setCurrentPair(newPair);
      setUsedStatements(
        (prev) => new Set([...prev, newPair.statement1.id, newPair.statement2.id])
      );

      setTransitioning(false);
    }, 300);
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
    if (!pdfRef.current) {
      console.warn("Referência do PDF não encontrada.");
      return;
    }

    // Verificação para garantir que a função está sendo chamada
    console.log("Gerando PDF com html2pdf");

    const opt = {
      margin: 0.5,
      filename: "resultado-teste-fiveone.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(pdfRef.current).save();
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
          <div style={{ marginTop: "-1.5rem" }}></div>
          <div className="intro-wrapper">
            <p className="intro-highlight">
              Este teste apresentará <strong>50 pares de afirmações</strong>.
            </p>
            <p className="intro-text">
              Para cada par, escolha a afirmação que mais se identifica com você.
            </p>
            <p className="intro-note">
              Não existe resposta certa ou errada – seja honesto em suas escolhas para obter um resultado mais preciso.
            </p>
            <p className="intro-time">
              🕒 O teste leva em média <strong>5 a 10 minutos</strong> para ser completado.
            </p>
          </div>
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

  if (
    showResults &&
    !userInfo.submitted &&
    userInfo &&
    typeof userInfo === "object"
  ) {
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
              {(inputProps) => (
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
    const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);

    const sortedScores = Object.entries(categoryScores)
      .map(([category, score]) => {
        const metadata = categoryMetadata.find((c) => c.id === category);
        const safeScore = totalScore > 0 ? (score / totalScore) * 100 : 0;

        if (!metadata || isNaN(safeScore)) {
          return null;
        }

        return {
          categoryEnum: category as CategoryEnum,
          score: safeScore,
          metadata,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => a.score - b.score); // wrap-reverse

    return (
      <section className="Teste-section">
        <div className="content-container" id="quiz-result" ref={pdfRef}>
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
                    alt={`${metadata?.name ?? "Ícone"} icon`}
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
          <p className="pdf-download-note" style={{ textAlign: "center" }}>
            Clique para baixar um PDF com o seu resultado. Você pode guardar ou compartilhar!
          </p>
          <div className="pdf-download-wrapper">
            <button
              onClick={() => {
                // Log extra para depuração do clique
                console.log("Botão de download PDF clicado");
                handleDownloadPDF();
              }}
              className="start-button"
              aria-label="Baixar resultado em PDF"
            >
              Baixar Resultado em PDF
            </button>
          </div>
          {/* Container para exportação PDF (visível para html2pdf, sem ocultação) */}
          <div>
            <div className="pdf-export-layout" ref={pdfRef}>
              <h1>Resultado Teste 5 Ministérios</h1>
              <h2>FIVE ONE Movement</h2>
              <div className="pdf-export-section">
                <span className="pdf-export-highlight">DATA DA AVALIAÇÃO:</span>
                <p>{new Date().toLocaleDateString()}</p>
                <span className="pdf-export-highlight">NOME DA PESSOA:</span>
                <p>{userInfo.name}</p>
                <span className="pdf-export-highlight">DOM MINISTERIAL:</span>
                <p>{sortedScores[0].metadata.name}</p>
              </div>
              <div className="pdf-export-section">
                <h3>Meu Perfil Ministerial</h3>
                {getProfileTextForDom(sortedScores[0].categoryEnum).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onHandleReset}
            className="reset-button"
            aria-label="Reiniciar o Teste"
            style={{ backgroundColor: "#314b56", color: "white" }}
          >
            Reiniciar
          </button>
        </div>
      </section>
    );
  }

  // ✅ Protege contra renderização fora do navegador (SSR)
  if (typeof window === "undefined") return null;

  // ✅ Protege contra estados incompletos no final do quiz
  if (!currentPair || !currentPair.statement1 || !currentPair.statement2) {
    console.warn("Bloqueando renderização pois currentPair está incompleto:", currentPair);
    return null;
  }

  return (
    <section className="quiz-section">
      <div className="content-container" ref={quizTopRef}>
        <h2>
          Etapa {currentQuestion + 1} de {TOTAL_QUESTIONS}
        </h2>
        <progress
          value={currentQuestion + 1}
          max={TOTAL_QUESTIONS}
          className="quiz-progress-bar"
        ></progress>
        <p>Selecione a opção com a qual você mais se identifica e clique em “Próxima Etapa”.</p>
        <div className={`statement-container ${transitioning ? "fade-out" : "fade-in"}`}>
          <button
            className={`statement-button${selectedCategory === currentPair.statement1.category ? " selected" : ""}`}
            onClick={() => setSelectedCategory(currentPair.statement1.category)}
            aria-label={currentPair.statement1.text}
            type="button"
          >
            {currentPair.statement1.text}
            {selectedCategory === currentPair.statement1.category && (
              <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
            )}
          </button>
          <button
            className={`statement-button${selectedCategory === currentPair.statement2.category ? " selected" : ""}`}
            onClick={() => setSelectedCategory(currentPair.statement2.category)}
            aria-label={currentPair.statement2.text}
            type="button"
          >
            {currentPair.statement2.text}
            {selectedCategory === currentPair.statement2.category && (
              <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
            )}
          </button>
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
            onClick={() => setSelectedCategory("nenhuma")}
            className={`statement-button none-button${selectedCategory === "nenhuma" ? " selected" : ""}`}
            aria-label="Nenhuma das opções acima"
            type="button"
          >
            Nenhuma das opções acima
            {selectedCategory === "nenhuma" && (
              <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
            )}
          </button>
          <button
            onClick={() => setSelectedCategory("ambas")}
            className={`statement-button both-button${selectedCategory === "ambas" ? " selected" : ""}`}
            aria-label="Me identifico com as duas afirmações"
            type="button"
          >
            Me identifico com as duas afirmações
            {selectedCategory === "ambas" && (
              <span className="selected-icon" aria-label="Selecionado" style={{ marginLeft: 8 }}>✓</span>
            )}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          {showSelectWarning && (
            <p style={{ color: "#ff5252", textAlign: "center", marginBottom: "1rem" }}>
              Por favor, selecione uma das opções antes de continuar.
            </p>
          )}
          <button
            ref={nextStepButtonRef}
            onClick={() => {
              if (!selectedCategory) {
                setShowSelectWarning(true);
                return;
              }

              // Adiciona a animação visual do clique
              if (nextStepButtonRef.current) {
                nextStepButtonRef.current.classList.add("ring");
                setTimeout(() => {
                  nextStepButtonRef.current?.classList.remove("ring");
                }, 500);
              }

              onHandleChoice(selectedCategory);
              setSelectedCategory(null);
              setShowSelectWarning(false);
            }}
            disabled={!selectedCategory}
            className="next-step-button"
            aria-label="Próxima Etapa"
          >
            Próxima Etapa
          </button>
        </div>
        {process.env.NODE_ENV === "development" &&
          currentPair &&
          currentPair.statement1 &&
          currentPair.statement2 && (
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
      {showLeaveModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Deseja sair do teste?</h3>
            <p>Suas respostas serão perdidas se você sair agora.</p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={confirmLeave}>
                Sair do Teste
              </button>
              <button className="cancel-button" onClick={cancelLeave}>
                Continuar Respondendo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Quiz;