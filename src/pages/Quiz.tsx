import { useEffect, useState, useRef } from "react";
import InputMask from "react-input-mask";
import { CategoryEnum, Statement, ChoiceCategory } from "../types/quiz";
// @ts-ignore
// @ts-ignore


import { BsInfoCircleFill } from "react-icons/bs";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";


import logo from "../assets/images/logo-fiveone-white.png";
import mestreIcon from "../assets/images/icons/mestre.png";
import pastorIcon from "../assets/images/icons/pastor.png";
import profetaIcon from "../assets/images/icons/profeta.png";
import apostoloIcon from "../assets/images/icons/apostolo.png";
import evangelistaIcon from "../assets/images/icons/evangelista.png";
import escolaFiveOne from "../assets/images/escola-fiveone.jpeg";

import { generatePDF } from "../utils/pdfGenerators/mainPdfGenerator";


import { getRandomComparisonPair, categoryMetadata } from "../data/questions";

import "./Quiz.css";
import TrainingFormats from "../components/TrainingFormats";
import "../components/TrainingFormats.css";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// === Helpers (Passo 3) ===
interface EmailScoreItem { category: string; score: number }

async function sendResultsEmail(
  payload: {
    name: string;
    email: string;
    phone: string;
    scores: EmailScoreItem[];
    pdfBase64?: string;
    filename?: string;
  }
) {
  try {
    const res = await fetch("/api/send-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        scores: payload.scores,
        pdf: {
          filename: payload.filename || "resultado.pdf",
          // Temporário: se não houver PDF real ainda, envia um base64 simples
          base64: payload.pdfBase64 || "SGVsbG8gV29ybGQ=",
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("/api/send-quiz error:", data);
      return { ok: false, error: data } as const;
    }
    return { ok: true, id: data?.id } as const;
  } catch (e) {
    console.error("sendResultsEmail exception:", e);
    return { ok: false, error: e } as const;
  }
}

function computeScoresForEmail(categoryScores: Record<CategoryEnum, number>): EmailScoreItem[] {
  const total = Object.values(categoryScores).reduce((s, v) => s + v, 0);
  return Object.entries(categoryScores)
    .map(([cat, val]) => ({ category: String(cat), score: total > 0 ? Math.round((val / total) * 100) : 0 }))
    .sort((a, b) => b.score - a.score);
}

const gtag = window.gtag;


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
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        // Adiciona evento do Google Analytics
        if (typeof gtag === "function") {
          gtag("event", "quiz_completed", {
            event_category: "quiz",
            event_label: "Quiz dos 5 Ministérios",
          });
        }
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

  const handleDownloadPDF = async () => {
    const domNameToKey: Record<string, string> = {
      'Apóstolo': 'Apostólico',
      'Profeta': 'Profeta',
      'Evangelista': 'Evangelístico',
      'Pastor': 'Pastor',
      'Mestre': 'Mestre',
    };

    try {
      setIsGeneratingPDF(true);
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
        .sort((a, b) => b.score - a.score); // ordem decrescente

      if (sortedScores.length === 0) {
        alert('Erro ao gerar PDF. Não foi possível calcular seu Dom principal.');
        return;
      }

      const highestScore = sortedScores[0].score;
      const tiedDoms = sortedScores.filter(s => s.score === highestScore);

      for (const domResult of tiedDoms) {
        const mainDom = domNameToKey[domResult.metadata.name];

        console.log('Gerando PDF para:', mainDom);

        await generatePDF(
          userInfo.name,
          new Date().toLocaleDateString(),
          sortedScores.map((s) => ({
            dom: domNameToKey[s.metadata.name],
            valor: s.score,
          })),
          mainDom // dom principal atual
        );
      }

      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 8000);
    } catch (err) {
      setIsGeneratingPDF(false);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!quizStarted) {
    return (
      <section className="quiz-section">
        <div className="content-container">
          <h1>Descubra o seu Dom Ministerial</h1>
          <div className="top-start-button-wrapper">
            <button
              onClick={() => {
                setQuizStarted(true);
                if (typeof gtag === "function") {
                  gtag("event", "quiz_start", {
                    event_category: "quiz",
                    event_label: "Quiz dos 5 Ministérios",
                  });
                }
              }}
              className="start-button"
              aria-label="Iniciar o Teste (atalho superior)"
            >
              Começar Agora
            </button>
          </div>
          <div className="responsive-intro-wrapper">
            <div className="intro-section">
              <div className="theological-explanation">
                <div className="theological-block aligned-box">
                  <h3>Sobre o Teste</h3>
                  <p>
                    Este teste foi inspirado em Efésios 4:11-13, onde o apóstolo Paulo ensina
                    que Cristo concedeu dons ministeriais à Igreja: apóstolos, profetas,
                    evangelistas, pastores e mestres. Esses dons têm como finalidade edificar
                    o corpo de Cristo, levar os santos à maturidade e promover a unidade da fé.
                  </p>
                </div>
                <div className="theological-block aligned-box">
                  <h3>Objetivo do Teste</h3>
                  <p>
                    Cada afirmação neste Teste foi cuidadosamente pensada para refletir as
                    inclinações naturais e espirituais relacionadas a esses dons. O objetivo
                    é ajudá-lo a discernir com mais clareza qual dom ministerial está mais
                    presente em sua vida, não como um rótulo, mas como um ponto de partida
                    para seu desenvolvimento no serviço cristão.
                  </p>
                </div>
                <div className="theological-block aligned-box">
                  <h3>Considerações Finais</h3>
                  <p>
                    Lembre-se: todos os dons são importantes e complementares. Este quiz é apenas uma ferramenta de autoconhecimento à luz das Escrituras. Os resultados são baseados em suas respostas e não representam, de forma absoluta, o chamado de Deus para a sua vida.
                  </p>
                </div>
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
              🕒 O teste leva em média <strong>7 a 15 minutos</strong> para ser completado.
            </p>
          </div>
          <div className="start-form">
            <button
              onClick={() => {
                setQuizStarted(true);
                if (typeof gtag === "function") {
                  gtag("event", "quiz_start", {
                    event_category: "quiz",
                    event_label: "Quiz dos 5 Ministérios",
                  });
                }
              }}
              className="start-button"
              aria-label="Iniciar o Teste"
            >
              Quero Fazer o Teste
            </button>
          </div>
        </div>
        {/* ===== Formatos de Treinamento (Cards) ===== */}
        <div className="divider-line-only"></div>
        <TrainingFormats />
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

                  // Passo 4: gerar PDF real e enviar por e-mail (mesma lógica do handleDownloadPDF)
                  (async () => {
                    try {
                      const domNameToKey: Record<string, string> = {
                        "Apóstolo": "Apostólico",
                        "Profeta": "Profeta",
                        "Evangelista": "Evangelístico",
                        "Pastor": "Pastor",
                        "Mestre": "Mestre",
                      };

                      const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);

                      const sortedScores = Object.entries(categoryScores)
                        .map(([category, score]) => {
                          const metadata = categoryMetadata.find((c) => c.id === category);
                          const safeScore = totalScore > 0 ? (score / totalScore) * 100 : 0;
                          if (!metadata || isNaN(safeScore)) return null;
                          return { categoryEnum: category as CategoryEnum, score: safeScore, metadata };
                        })
                        .filter((e): e is NonNullable<typeof e> => e !== null)
                        .sort((a, b) => b.score - a.score);

                      if (sortedScores.length === 0) {
                        console.warn("Não foi possível calcular o Dom principal para envio por e-mail.");
                      } else {
                        const domPrincipal = domNameToKey[sortedScores[0].metadata.name] ?? "Apostólico";
                        const percentuaisPdf = sortedScores.map((s) => ({
                          dom: domNameToKey[s.metadata.name] ?? s.metadata.name,
                          valor: s.score,
                        }));

                        const hoje = new Date().toLocaleDateString("pt-BR");
                        const { base64, filename } = await generatePDF(
                          userInfo.name,
                          hoje,
                          percentuaisPdf,
                          domPrincipal
                        );

                        const scoresForEmail = computeScoresForEmail(categoryScores);
                        void sendResultsEmail({
                          name: userInfo.name,
                          email: userInfo.email,
                          phone: userInfo.phone,
                          scores: scoresForEmail,
                          pdfBase64: base64,   // PDF real
                          filename,            // Nome correto: Resultado_FiveOne_#.pdf
                        });
                      }
                    } catch (err) {
                      console.error("Falha ao gerar/enviar PDF:", err);
                    }
                  })();

                  if (typeof gtag === "function") {
                    gtag("event", "quiz_form_submitted", {
                      event_category: "quiz",
                      event_label: "Quiz dos 5 Ministérios",
                      value: 1,
                    });
                  }
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

  // Bloco de feedback fixo no topo (toast para PDF)
  const pdfToastBlock = (
    (isGeneratingPDF || showDownloadSuccess) && (
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#32f2cf",
          color: "#003f2d",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontWeight: "bold",
          zIndex: 9999,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        {isGeneratingPDF
          ? "📄 Gerando PDF... Por favor, aguarde o download."
          : "✅ PDF gerado e baixado com sucesso!"}
      </div>
    )
  );

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
      <>
        {pdfToastBlock}
      <section className="Teste-section">
        <div className="content-container" id="quiz-result" ref={pdfRef}>
          <div className="results-header" style={{ marginTop: "6rem" }}>
            <h2>Parabéns, seu resultado está pronto!</h2>
            <p>
              Leia com atenção as informações abaixo para tirar o máximo de proveito do seu teste. 
              Nele você vai ver quais dos 5 dons você tem uma maior inclinação, como isso se aplica 
              à sua vida e ainda poderá <strong>baixar o resultado em PDF</strong> ou 
              <strong> compartilhar nas redes sociais</strong>.
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
          <div className="down-arrow"></div>
        </div>
        {/* Fecha content-container antes de adicionar a nova section */}
        <div className="don-profile-wrapper">
          <h2
            style={{
              textAlign: "center",
              marginBottom: "2.5rem",
              marginTop: "5rem",
              fontSize: "2rem",
              color: "#ffffff",
            }}
          >
            Entenda seu Resultado
          </h2>
          <p
            style={{
              textAlign: "center",
              maxWidth: "750px",
              margin: "0 auto 3.5rem",
              fontSize: "1.15rem",
              lineHeight: "1.6",
              color: "#cfd8dc",
            }}
          >
            Os cinco dons ministeriais descritos em Efésios 4 — Apóstolo, Profeta, Evangelista, Pastor e Mestre — expressam dimensões únicas do ministério de Cristo distribuídas ao seu Corpo.
            A seguir, você encontrará uma explicação teológica de cada um desses dons, com base bíblica e doutrinária, para que compreenda o significado e a importância de cada um no contexto da edificação da Igreja.
          </p>
          <div className="don-profile-cards">
            {/* Aqui será implementado o conteúdo individual de cada dom */}
            <div className="don-card apostolo-card">
              <div className="don-card-header">
                <img src={apostoloIcon} alt="Ícone do Apóstolo" className="don-icon" />
                <h3>Apóstolo</h3>
              </div>
              <p>
                O papel do apóstolo no Corpo de Cristo é de extrema importância. Ele amplia a visão da igreja, assegurando que cada membro cumpra seu papel de forma eficaz, restaurando princípios fundamentais e mantendo a igreja ancorada em bases sólidas.
              </p>
              <p>
                Os apóstolos são desbravadores espirituais, frequentemente responsáveis por abrir novos caminhos, plantar igrejas e estabelecer fundamentos doutrinários. Sua liderança é marcada por coragem, visão estratégica e um profundo senso de missão.
              </p>
            </div>
            <div className="don-card profeta-card">
              <div className="don-card-header">
                <img src={profetaIcon} alt="Ícone do Profeta" className="don-icon" />
                <h3>Profeta</h3>
              </div>
              <p>
                O profeta é aquele que guarda a aliança. Sua principal função é garantir que a igreja permaneça fiel ao coração de Deus, confrontando desvios e chamando o povo de volta ao arrependimento e à intimidade com o Senhor.
              </p>
              <p>
                Profetas são sensíveis à voz de Deus e muitas vezes têm discernimento aguçado sobre tempos, estações e situações espirituais. São chamados a proclamar a verdade com ousadia e a alinhar a igreja com os valores do Reino.
              </p>
            </div>
            <div className="don-card evangelista-card">
              <div className="don-card-header">
                <img src={evangelistaIcon} alt="Ícone do Evangelista" className="don-icon" />
                <h3>Evangelista</h3>
              </div>
              <p>
                O evangelista é aquele que carrega no coração o anseio por alcançar os perdidos. Seu chamado está voltado à proclamação das boas novas de Jesus Cristo com paixão, clareza e compaixão.
              </p>
              <p>
                Evangelistas movem a igreja para fora das quatro paredes, inspirando-a a viver de forma missionária. Têm a capacidade de conectar o evangelho com a vida real das pessoas e convidá-las a uma transformação genuína em Cristo.
              </p>
            </div>
            <div className="don-card pastor-card">
              <div className="don-card-header">
                <img src={pastorIcon} alt="Ícone do Pastor" className="don-icon" />
                <h3>Pastor</h3>
              </div>
              <p>
                O pastor é aquele que cuida, consola e caminha junto. Ele tem um coração voltado ao rebanho, guiando com empatia, proximidade e zelo.
              </p>
              <p>
                Pastores promovem ambientes de cuidado e pertencimento dentro da igreja. Sua presença é marcada por serviço, escuta ativa e disposição para ajudar os outros a amadurecerem na fé.
              </p>
            </div>
            <div className="don-card mestre-card">
              <div className="don-card-header">
                <img src={mestreIcon} alt="Ícone do Mestre" className="don-icon" />
                <h3>Mestre</h3>
              </div>
              <p>
                O mestre é aquele que busca compreender e comunicar a verdade de Deus de forma clara e profunda. Tem paixão pelo ensino das Escrituras e pela formação espiritual da igreja.
              </p>
              <p>
                Mestres ajudam a igreja a permanecer sólida na Palavra, combatendo falsas doutrinas e promovendo crescimento teológico. Sua influência molda o entendimento e a prática cristã.
              </p>
            </div>

          </div>
        </div>
        {/* BLOCO ESCOLA FIVE ONE MOVIDO PARA CÁ */}
        <section className="promo-escola-section">
          <div className="promo-escola-image">
            <img src={escolaFiveOne} alt="Escola Five One" />
          </div>
          <div className="promo-escola-content">
            <h3>Descubra a Escola Five One</h3>
            <p>
              Viva sua verdadeira identidade em Cristo. Descubra seu chamado, desenvolva seu dom
              ministerial e conecte-se com uma comunidade de aprendizado e propósito.
            </p>
            <a href="https://escolafiveone.hotmart.host/formacao-de-mestre-five-one-df44d8cd-3a6b-44b0-aaec-652290fc529a" target="_blank" rel="noopener noreferrer">
             Quero Fazer Parte
            </a>
          </div>
        </section>
        <div className="social-share">
          <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "1rem" }}>
            Nos siga nas redes sociais:
          </p>
          <div className="share-buttons" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://www.instagram.com/fiveone.oficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram"
              aria-label="Instagram"
            >
              <FaInstagram size={24} />
              <span className="tooltip-share">Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@escola.five.one"
              target="_blank"
              rel="noopener noreferrer"
              className="tiktok"
              aria-label="TikTok"
            >
              <FaTiktok size={24} />
              <span className="tooltip-share">TikTok</span>
            </a>
            <a
              href="https://www.youtube.com/@Five_One_Movement"
              target="_blank"
              rel="noopener noreferrer"
              className="youtube"
              aria-label="YouTube"
              style={{ backgroundColor: "#FF0000", padding: "10px", borderRadius: "12px" }}
            >
              <FaYoutube size={24} color="#fff" />
            </a>
          </div>
        </div>
        <p className="pdf-download-note" style={{ textAlign: "center", marginTop: "3rem" }}>
          Clique para baixar um PDF com o seu resultado. Você pode guardar ou compartilhar!
        </p>
        <div className="pdf-download-wrapper">
          <button
            onClick={() => {
              console.log("Botão de download PDF clicado");
              handleDownloadPDF();
            }}
            className="start-button"
            aria-label="Baixar resultado em PDF"
          >
            Baixar Resultado em PDF
          </button>
        </div>
        <button
          onClick={onHandleReset}
          className="reset-button"
          aria-label="Reiniciar o Teste"
          style={{ backgroundColor: "#314b56", color: "white", marginTop: "1.5rem" }}
        >
          Reiniciar
        </button>
      </section>
      </>
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
    <>
      {pdfToastBlock}
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
  </>
);
};

export default Quiz;