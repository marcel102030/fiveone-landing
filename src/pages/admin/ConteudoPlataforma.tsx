import { useEffect, useMemo, useState } from "react";
import "../AdministracaoFiveOne.css";
import "./ConteudoPlataforma.css";
import {
  createLesson,
  deleteLesson,
  getModule,
  listLessons,
  LessonInput,
  LessonRef,
  LessonStatus,
  LessonSourceType,
  MinistryKey,
  ModuleStatus,
  setLessonActive,
  setLessonStatus,
  setModuleTitle,
  StoredFile,
  toggleModuleStatus,
  updateLesson,
  usePlatformContent,
} from "../../services/platformContent";

const moduleStatusLabel: Record<ModuleStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  scheduled: "Programado",
  archived: "Arquivado",
};

const lessonStatusLabel: Record<LessonStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  scheduled: "Programado",
};

const sourceTypeOptions: { value: LessonSourceType; label: string; helper: string }[] = [
  { value: "YOUTUBE", label: "YouTube", helper: "Cole a URL do vídeo do YouTube." },
  { value: "VIMEO", label: "Vimeo", helper: "Cole o link público do Vimeo." },
];

type LessonFormState = {
  title: string;
  subtitle: string;
  subjectId: string;
  subjectName: string;
  subjectType: string;
  instructor: string;
  description: string;
  contentType: LessonInput["contentType"];
  sourceType: LessonSourceType;
  videoUrl: string;
  status: LessonStatus;
  releaseAt: string;
  materialFile: StoredFile | null;
  bannerContinue: StoredFile | null;
  bannerPlayer: StoredFile | null;
  isActive: boolean;
};

const defaultLessonForm = (): LessonFormState => ({
  title: "",
  subtitle: "",
  subjectId: "",
  subjectName: "",
  subjectType: "Formação T",
  instructor: "",
  description: "",
  contentType: "VIDEO",
  sourceType: "YOUTUBE",
  videoUrl: "",
  status: "published",
  releaseAt: "",
  materialFile: null,
  bannerContinue: null,
  bannerPlayer: null,
  isActive: true,
});

export default function AdminConteudoPlataforma() {
  document.title = "Administração | Five One — Conteúdo";
  const content = usePlatformContent();
  const [activeTab, setActiveTab] = useState<"modules" | "info" | "certificate">("modules");
  const [selectedMinistryId, setSelectedMinistryId] = useState<MinistryKey>(() => content.ministries[0]?.id || "MESTRE");
  const [isHydrating, setIsHydrating] = useState(!content.ministries.length);
  useEffect(() => {
    if (!content.ministries.some((m) => m.id === selectedMinistryId) && content.ministries[0]) {
      setSelectedMinistryId(content.ministries[0].id);
    }
  }, [content.ministries, selectedMinistryId]);
  useEffect(() => {
    if (content.ministries.length) {
      setIsHydrating(false);
    }
  }, [content.ministries.length]);

  const selectedMinistry = useMemo(() => {
    return content.ministries.find((m) => m.id === selectedMinistryId) || content.ministries[0] || null;
  }, [content.ministries, selectedMinistryId]);

  const moduleFingerprint = selectedMinistry
    ? selectedMinistry.modules.map((m) => `${m.id}:${m.title}`).join("|")
    : "";
  const [moduleDraftTitles, setModuleDraftTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!selectedMinistry) return;
    setModuleDraftTitles((prev) => {
      const next = { ...prev };
      selectedMinistry.modules.forEach((mod) => {
        next[mod.id] = mod.title;
      });
      return next;
    });
  }, [selectedMinistry?.id, moduleFingerprint]);

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedMinistry?.modules.length) {
      setExpandedModuleId(selectedMinistry.modules[0].id);
    } else {
      setExpandedModuleId(null);
    }
  }, [selectedMinistry?.id]);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(() => defaultLessonForm());
  const [editingLesson, setEditingLesson] = useState<LessonRef | null>(null);
  const [openMenu, setOpenMenu] = useState<null | { moduleId: string; lessonId: string }>(null);
  const [moduleActionId, setModuleActionId] = useState<string | null>(null);
  const [lessonActionId, setLessonActionId] = useState<string | null>(null);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);

  const resetLessonForm = () => {
    setLessonForm(defaultLessonForm());
    setEditingLesson(null);
  };

  const openLessonModal = (moduleId: string, lesson?: LessonRef) => {
    setLessonModuleId(moduleId);
    setOpenMenu(null);
    setLessonSubmitting(false);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        subtitle: lesson.subtitle || "",
        subjectId: lesson.subjectId || "",
        subjectName: lesson.subjectName || "",
        subjectType: lesson.subjectType || "Formação T",
        instructor: lesson.instructor || "",
        description: lesson.description || "",
        contentType: lesson.contentType || "VIDEO",
        sourceType: lesson.sourceType || "YOUTUBE",
        videoUrl: lesson.videoUrl || "",
        status: lesson.status,
        releaseAt: lesson.releaseAt ? lesson.releaseAt.slice(0, 10) : "",
        materialFile: lesson.materialFile || null,
        bannerContinue: lesson.bannerContinue || null,
        bannerPlayer: lesson.bannerPlayer || null,
        isActive: lesson.isActive,
      });
    } else {
      resetLessonForm();
    }
    setShowLessonModal(true);
  };

  const closeLessonModal = () => {
    setShowLessonModal(false);
    setLessonModuleId(null);
    setLessonSubmitting(false);
    resetLessonForm();
  };

  const handleLessonFormChange = (field: keyof LessonFormState, value: string) => {
    setLessonForm((prev) => ({ ...prev, [field]: value } as LessonFormState));
  };

  const handleLessonStatusChange = (status: LessonStatus) => {
    setLessonForm((prev) => ({ ...prev, status }));
  };

  async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  }

  async function buildStoredFile(file: File): Promise<StoredFile> {
    const dataUrl = await readFileAsDataUrl(file);
    const stored: StoredFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl,
      uploadedAt: new Date().toISOString(),
    };
    if (file.type.startsWith("image/")) {
      const dims = await getImageDimensions(dataUrl);
      if (dims) {
        stored.width = dims.width;
        stored.height = dims.height;
      }
    }
    return stored;
  }

  async function handleFileSelection(
    field: "materialFile" | "bannerContinue" | "bannerPlayer",
    files: FileList | null,
  ) {
    if (!files || !files.length) return;
    const file = files[0];
    if (field === "materialFile" && file.type !== "application/pdf") {
      alert("Envie um arquivo PDF.");
      return;
    }
    if (field !== "materialFile" && !file.type.startsWith("image/")) {
      alert("Envie uma imagem nos formatos PNG ou JPG.");
      return;
    }
    try {
      const stored = await buildStoredFile(file);
      setLessonForm((prev) => ({ ...prev, [field]: stored }));
    } catch (error) {
      console.error("Falha ao ler arquivo", error);
      alert("Não foi possível processar o arquivo selecionado.");
    }
  }

  const handleRemoveFile = (field: "materialFile" | "bannerContinue" | "bannerPlayer") => {
    setLessonForm((prev) => ({ ...prev, [field]: null }));
  };

  const handleModuleTitleCommit = async (moduleId: string) => {
    if (!selectedMinistry) return;
    const currentModule = selectedMinistry.modules.find((mod) => mod.id === moduleId);
    const desiredTitle = (moduleDraftTitles[moduleId] ?? currentModule?.title ?? "Módulo").trim();
    if (!currentModule || desiredTitle === currentModule.title) return;
    try {
      setModuleActionId(moduleId);
      await setModuleTitle(selectedMinistry.id, moduleId, desiredTitle);
    } catch (error) {
      console.error("Erro ao atualizar título do módulo", error);
      alert("Não foi possível salvar o título do módulo. Tente novamente.");
      setModuleDraftTitles((prev) => ({
        ...prev,
        [moduleId]: currentModule.title,
      }));
    } finally {
      setModuleActionId(null);
    }
  };

  const handleToggleModuleStatus = async (moduleId: string) => {
    if (!selectedMinistry) return;
    try {
      setModuleActionId(moduleId);
      await toggleModuleStatus(selectedMinistry.id, moduleId);
    } catch (error) {
      console.error("Erro ao alternar status do módulo", error);
      alert("Não foi possível atualizar o status do módulo. Tente novamente.");
    } finally {
      setModuleActionId(null);
    }
  };

  const handleToggleLessonStatus = async (moduleId: string, lesson: LessonRef) => {
    if (!selectedMinistry) return;
    const nextStatus: LessonStatus = lesson.status === "published" ? "draft" : "published";
    try {
      setLessonActionId(lesson.id);
      await setLessonStatus(selectedMinistry.id, moduleId, lesson.id, nextStatus);
    } catch (error) {
      console.error("Erro ao alternar status da aula", error);
      alert("Não foi possível atualizar o status da aula. Tente novamente.");
    } finally {
      setLessonActionId(null);
      setOpenMenu(null);
    }
  };

  const handleToggleLessonActive = async (moduleId: string, lesson: LessonRef) => {
    if (!selectedMinistry) return;
    try {
      setLessonActionId(lesson.id);
      await setLessonActive(selectedMinistry.id, moduleId, lesson.id, !lesson.isActive);
    } catch (error) {
      console.error("Erro ao alternar disponibilidade da aula", error);
      alert("Não foi possível atualizar a disponibilidade da aula. Tente novamente.");
    } finally {
      setLessonActionId(null);
      setOpenMenu(null);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lesson: LessonRef) => {
    if (!selectedMinistry) return;
    if (!confirm(`Remover a aula "${lesson.title}"?`)) return;
    try {
      setLessonActionId(lesson.id);
      await deleteLesson(selectedMinistry.id, moduleId, lesson.id);
      alert("Aula removida com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir aula", error);
      alert("Não foi possível remover a aula. Tente novamente.");
    } finally {
      setLessonActionId(null);
      setOpenMenu(null);
    }
  };

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.lesson-menu') && !target.closest('.lesson-menu-trigger')) {
        setOpenMenu(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('click', onClickAway);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClickAway);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const selectedModule = lessonModuleId && selectedMinistry
    ? selectedMinistry.modules.find((m) => m.id === lessonModuleId) || null
    : null;

  const selectedSourceOption = useMemo(() => {
    return sourceTypeOptions.find((opt) => opt.value === lessonForm.sourceType) || sourceTypeOptions[0];
  }, [lessonForm.sourceType]);

  const moduleLessons = useMemo(() => {
    if (!selectedMinistry) return [] as LessonRef[];
    return listLessons({ ministryId: selectedMinistry.id });
  }, [selectedMinistry?.id, content.updatedAt]);

  const handleSubmitLesson = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMinistry || !lessonModuleId) return;
    if (!getModule(selectedMinistry.id, lessonModuleId)) return;
    if (!lessonForm.title.trim()) {
      alert("Informe o nome da aula.");
      return;
    }
    if (!lessonForm.videoUrl.trim()) {
      alert("Informe o link do vídeo (YouTube ou Vimeo).");
      return;
    }

    const basePayload: Partial<LessonInput> = {
      title: lessonForm.title,
      subtitle: lessonForm.subtitle,
      subjectId: lessonForm.subjectId,
      subjectName: lessonForm.subjectName,
      subjectType: lessonForm.subjectType,
      instructor: lessonForm.instructor,
      description: lessonForm.description,
      contentType: lessonForm.contentType,
      sourceType: lessonForm.sourceType,
      videoUrl: lessonForm.videoUrl,
      materialFile: lessonForm.materialFile,
      bannerContinue: lessonForm.bannerContinue,
      bannerPlayer: lessonForm.bannerPlayer,
      status: lessonForm.status,
      releaseAt: lessonForm.releaseAt ? new Date(lessonForm.releaseAt).toISOString() : null,
      isActive: lessonForm.isActive,
    };

    try {
      setLessonSubmitting(true);
      if (editingLesson) {
        await updateLesson(selectedMinistry.id, lessonModuleId, editingLesson.id, basePayload);
        alert("Aula atualizada com sucesso.");
      } else {
        const created = await createLesson(selectedMinistry.id, lessonModuleId, basePayload as LessonInput);
        if (!created) {
          alert("Não foi possível criar a aula. Tente novamente.");
          return;
        }
        alert("Aula criada com sucesso!");
      }
      closeLessonModal();
    } catch (error) {
      console.error("Erro ao salvar aula", error);
      alert("Não foi possível salvar a aula. Verifique os dados e tente novamente.");
    } finally {
      setLessonSubmitting(false);
    }
  };

  return (
    <div className="adm5-wrap">
      {isHydrating && (
        <div className="adm5-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Carregando conteúdo da plataforma...</span>
        </div>
      )}
      <div className="adm5-topbar" style={{ marginBottom: 12 }}>
        <h1 className="adm5-title">Conteúdo da Plataforma</h1>
        <button
          className="adm5-pill"
          onClick={() => (window.history.length ? history.back() : (location.hash = "#/admin/administracao"))}
        >
          ← Voltar ao hub
        </button>
      </div>
      <p className="adm5-sub">Gerencie formações, módulos e aulas que serão exibidas na plataforma dos alunos.</p>
      <div className="content-help-bar">
        Aqui você encontra todas as opções para customizar sua plataforma:
        <button className="content-help-link">Como criar uma aula?</button>
        <button className="content-help-link">Como criar uma aula de avaliação?</button>
        <button className="content-help-link">Como configurar o certificado?</button>
        <button className="content-help-link">Como colocar o conteúdo na vitrine?</button>
      </div>

      <div className="content-ministry-grid">
        <div className="course-card add-card">
          <div style={{ fontSize: 24 }}>+</div>
          Novo curso
        </div>
        {content.ministries.map((ministry) => (
          <button
            key={ministry.id}
            className={`course-card ${selectedMinistryId === ministry.id ? "active" : ""}`}
            onClick={() => {
              setSelectedMinistryId(ministry.id);
              setActiveTab("modules");
            }}
          >
            <div className="card-thumb" style={{ background: ministry.gradient }} />
            <div className="card-icon">
              <img src={ministry.icon} alt={ministry.name} />
            </div>
            <div className="card-name">{ministry.name}</div>
            <div className="card-tagline">{ministry.tagline}</div>
          </button>
        ))}
      </div>

      {selectedMinistry ? (
        <div className="ministry-detail">
          <div className="ministry-header">
            <div>
              <h2>{selectedMinistry.name}</h2>
              <p>{selectedMinistry.tagline}</p>
            </div>
            <div className="ministry-actions">
              <button
                className="adm5-pill"
                onClick={() => alert("Recurso de criação de módulos ficará disponível em breve.")}
              >
                Criar módulo
              </button>
              <button
                className="adm5-pill"
                onClick={() => alert("Em breve você poderá exportar um relatório da formação.")}
              >
                Exportar visão
              </button>
            </div>
          </div>

          <div className="ministry-tabs">
            <button
              className={`ministry-tab ${activeTab === "modules" ? "active" : ""}`}
              onClick={() => setActiveTab("modules")}
            >
              Módulos
            </button>
            <button
              className={`ministry-tab ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Informações
            </button>
            <button
              className={`ministry-tab ${activeTab === "certificate" ? "active" : ""}`}
              onClick={() => setActiveTab("certificate")}
            >
              Certificado
            </button>
          </div>

          {activeTab === "modules" && (
            <div className="modules-list">
              {selectedMinistry.modules.map((module) => {
                const isOpen = expandedModuleId === module.id;
                const moduleMenuOpen = openMenu?.moduleId === module.id;
                const lessons = moduleLessons.filter((lesson) => lesson.moduleId === module.id);
                return (
                  <div
                    key={module.id}
                    className={`module-card ${isOpen ? "open" : ""} ${moduleMenuOpen ? 'module-card--menu-open' : ''}`}
                  >
                    <div className="module-header">
                      <div className="module-left">
                        <button
                          className="module-toggle"
                          type="button"
                          onClick={() => setExpandedModuleId(isOpen ? null : module.id)}
                        >
                          ▶
                        </button>
                        <input
                          className="module-title-input"
                          value={moduleDraftTitles[module.id] || module.title}
                          onChange={(event) => {
                            const { value } = event.target;
                            setModuleDraftTitles((prev) => ({ ...prev, [module.id]: value }));
                          }}
                          onBlur={() => handleModuleTitleCommit(module.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.currentTarget.blur();
                            }
                          }}
                          disabled={moduleActionId === module.id}
                        />
                      </div>
                      <div className="module-actions">
                        <span className={`status-pill ${module.status}`}>{moduleStatusLabel[module.status]}</span>
                        <button
                          className="adm5-pill"
                          onClick={() => handleToggleModuleStatus(module.id)}
                          disabled={moduleActionId === module.id}
                        >
                          {moduleActionId === module.id
                            ? "Atualizando..."
                            : module.status === "published"
                            ? "Despublicar"
                            : "Publicar"}
                        </button>
                        <button className="adm5-pill" onClick={() => openLessonModal(module.id)}>
                          Nova aula
                        </button>
                      </div>
                    </div>
                    <div className="module-body">
                      {lessons.length ? (
                        <div className="lessons-list">
                          {lessons.map((lesson) => {
                            const thumb = lesson.bannerContinue?.dataUrl || lesson.bannerPlayer?.dataUrl || lesson.thumbnailUrl;
                            const sourceLabel = sourceTypeOptions.find((opt) => opt.value === lesson.sourceType)?.label;
                            const isMenuOpen = openMenu?.lessonId === lesson.id && openMenu?.moduleId === module.id;
                            return (
                              <div
                                key={lesson.id}
                                className={`lesson-row ${lesson.isActive ? '' : 'lesson-row--inactive'} ${
                                  isMenuOpen ? 'lesson-row--menu-open' : ''
                                } ${lessonActionId === lesson.id ? 'lesson-row--loading' : ''}`}
                              >
                                <div className="lesson-thumb">
                                  {thumb ? (
                                    <img src={thumb} alt={lesson.title} />
                                  ) : (
                                    <span>#{lesson.order + 1}</span>
                                  )}
                                </div>
                                <div className="lesson-info">
                                  <div className="lesson-title">{lesson.title}</div>
                                  {lesson.subtitle && <div className="lesson-subtitle">{lesson.subtitle}</div>}
                                  <div className="lesson-tags">
                                    {lesson.subjectName && <span className="lesson-tag">{lesson.subjectName}</span>}
                                    {sourceLabel && <span className="lesson-tag">{sourceLabel}</span>}
                                    {lesson.instructor && <span className="lesson-tag">{lesson.instructor}</span>}
                                  </div>
                                </div>
                                <div className="lesson-actions">
                                  <div className="lesson-status-group">
                                    <span className={`status-pill ${lesson.status}`}>{lessonStatusLabel[lesson.status]}</span>
                                    {!lesson.isActive && <span className="status-pill inactive">Inativa</span>}
                                  </div>
                                  <button
                                    type="button"
                                    className="lesson-menu-trigger"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenMenu((prev) =>
                                        prev && prev.lessonId === lesson.id && prev.moduleId === module.id
                                          ? null
                                          : { moduleId: module.id, lessonId: lesson.id }
                                      );
                                    }}
                                    aria-haspopup="menu"
                                    aria-expanded={isMenuOpen}
                                    disabled={lessonActionId === lesson.id}
                                  >
                                    <span className="dots" aria-hidden>⋯</span>
                                    <span className="sr-only">Abrir opções da aula</span>
                                  </button>
                                  {isMenuOpen && (
                                    <div className="lesson-menu" role="menu">
                                      <button type="button" role="menuitem" onClick={() => openLessonModal(module.id, lesson)}>Editar</button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                          const url = lesson.videoId ? `/streamer-mestre?vid=${encodeURIComponent(lesson.videoId)}` : '/streamer-mestre';
                                          window.open(`#${url}`, '_blank', 'noopener');
                                          setOpenMenu(null);
                                        }}
                                      >
                                        Abrir player
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleToggleLessonStatus(module.id, lesson)}
                                        disabled={lessonActionId === lesson.id}
                                      >
                                        {lesson.status === "published" ? "Despublicar" : "Publicar"}
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleToggleLessonActive(module.id, lesson)}
                                        disabled={lessonActionId === lesson.id}
                                      >
                                        {lesson.isActive ? "Desativar" : "Ativar"}
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        className="danger"
                                        onClick={() => handleDeleteLesson(module.id, lesson)}
                                        disabled={lessonActionId === lesson.id}
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          Nenhuma aula cadastrada para este módulo ainda. Clique em "Nova aula" para começar.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "info" && (
            <div style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              <p>
                Utilize esta área para registrar detalhes da formação, visão geral do ministério e orientações para os alunos.
                Em breve você poderá editar textos ricos, anexar materiais de apoio e definir destaques para a vitrine.
              </p>
            </div>
          )}

          {activeTab === "certificate" && (
            <div style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              <p>
                Configure aqui as regras para emissão de certificados da formação selecionada. Defina carga horária mínima,
                lições obrigatórias e o modelo do certificado. Este recurso estará disponível nas próximas iterações.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {showLessonModal && selectedMinistry && selectedModule && (
        <div className="lesson-modal-overlay" onClick={closeLessonModal}>
          <div className="lesson-modal" onClick={(event) => event.stopPropagation()}>
            <div>
              <h3>{editingLesson ? "Edite sua aula" : "Crie sua nova aula"}</h3>
              <p style={{ color: "#94a3b8", margin: "4px 0 0" }}>
                Módulo {selectedModule.order + 1} · {selectedModule.title}
              </p>
            </div>
            <form className="lesson-form-grid" onSubmit={handleSubmitLesson}>
              <div className="lesson-field">
                <label>Nome da aula*</label>
                <input
                  className="lesson-input"
                  value={lessonForm.title}
                  onChange={(event) => handleLessonFormChange("title", event.target.value)}
                  placeholder="Digite o nome da aula"
                  maxLength={190}
                  required
                />
              </div>

              <div className="lesson-field">
                <label>Subtítulo (opcional)</label>
                <input
                  className="lesson-input"
                  value={lessonForm.subtitle}
                  onChange={(event) => handleLessonFormChange("subtitle", event.target.value)}
                  placeholder="Ex: Conheça a Sua Bíblia — Rodolfo"
                />
              </div>

              <div className="lesson-field">
                <label>Formato do conteúdo</label>
                <div className="pill-group">
                  {sourceTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`pill-option ${lessonForm.sourceType === option.value ? "active" : ""}`}
                      onClick={() => handleLessonFormChange("sourceType", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="lesson-hint">{selectedSourceOption.helper}</p>
              </div>

              <div className="lesson-field">
                <label>Link do vídeo*</label>
                <input
                  className="lesson-input"
                  value={lessonForm.videoUrl}
                  onChange={(event) => handleLessonFormChange("videoUrl", event.target.value)}
                  placeholder="Cole a URL do vídeo (YouTube ou Vimeo)"
                  required
                />
              </div>

              <div className="form-two-col">
                <div className="lesson-field">
                  <label>Matéria</label>
                  <input
                    className="lesson-input"
                    value={lessonForm.subjectName}
                    onChange={(event) => handleLessonFormChange("subjectName", event.target.value)}
                    placeholder="Ex: Conheça a Sua Bíblia"
                  />
                </div>
                <div className="lesson-field">
                  <label>Código da matéria</label>
                  <input
                    className="lesson-input"
                    value={lessonForm.subjectId}
                    onChange={(event) => handleLessonFormChange("subjectId", event.target.value)}
                    placeholder="Ex: biblia"
                  />
                </div>
              </div>

              <div className="form-two-col">
                <div className="lesson-field">
                  <label>Categoria</label>
                  <input
                    className="lesson-input"
                    value={lessonForm.subjectType}
                    onChange={(event) => handleLessonFormChange("subjectType", event.target.value)}
                    placeholder="Formação T / Formação M"
                  />
                </div>
                <div className="lesson-field">
                  <label>Professor(a)</label>
                  <input
                    className="lesson-input"
                    value={lessonForm.instructor}
                    onChange={(event) => handleLessonFormChange("instructor", event.target.value)}
                    placeholder="Quem ministra esta aula?"
                  />
                </div>
              </div>

              <div className="lesson-field">
                <label>Descrição da aula</label>
                <textarea
                  className="lesson-textarea"
                  value={lessonForm.description}
                  onChange={(event) => handleLessonFormChange("description", event.target.value)}
                  placeholder="Resuma os principais tópicos abordados nesta aula."
                />
              </div>

              <div className="form-two-col">
                <div className="lesson-field">
                  <label>Status da aula</label>
                  <div className="pill-group">
                    {(["draft", "published", "scheduled"] as LessonStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`pill-option ${lessonForm.status === status ? "active" : ""}`}
                        onClick={() => handleLessonStatusChange(status)}
                      >
                        {lessonStatusLabel[status]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lesson-field">
                  <label>Data de liberação (opcional)</label>
                  <input
                    type="date"
                    className="lesson-input"
                    value={lessonForm.releaseAt}
                    onChange={(event) => handleLessonFormChange("releaseAt", event.target.value)}
                  />
                  <label className="toggle-box">
                    <input
                      type="checkbox"
                      checked={lessonForm.isActive}
                      onChange={(event) => setLessonForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    />
                    Aula ativa para os alunos
                  </label>
                </div>
              </div>

              <div className="lesson-field">
                <label>Material complementar (PDF)</label>
                <div className="upload-group">
                  <label className="upload-box">
                    <input type="file" accept="application/pdf" onChange={(event) => handleFileSelection("materialFile", event.target.files)} />
                    <span>Selecionar PDF</span>
                  </label>
                  {lessonForm.materialFile && (
                    <div className="file-info">
                      <div>
                        <strong>{lessonForm.materialFile.name}</strong>
                        <span>{Math.round(lessonForm.materialFile.size / 1024)} KB</span>
                      </div>
                      <div className="file-actions">
                        <button type="button" className="linklike" onClick={() => window.open(lessonForm.materialFile?.dataUrl, "_blank")}>Abrir</button>
                        <button type="button" className="linklike" onClick={() => handleRemoveFile("materialFile")}>Remover</button>
                      </div>
                    </div>
                  )}
                  <p className="lesson-hint">Formato PDF. O material ficará disponível na área de materiais complementares da plataforma.</p>
                </div>
              </div>

              <div className="form-two-col">
                <div className="lesson-field">
                  <label>Banner "Continuar assistindo" (300x580px)</label>
                  <div className="upload-group">
                    <label className="upload-box">
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFileSelection("bannerContinue", event.target.files)} />
                      <span>Selecionar imagem</span>
                    </label>
                    {lessonForm.bannerContinue && (
                      <div className="file-preview">
                        <img src={lessonForm.bannerContinue.dataUrl} alt="Pré-visualização banner continuar" />
                        <div className="file-info">
                          <strong>{lessonForm.bannerContinue.name}</strong>
                          <span>{lessonForm.bannerContinue.width && lessonForm.bannerContinue.height ? `${lessonForm.bannerContinue.width}x${lessonForm.bannerContinue.height}px` : null}</span>
                          <button type="button" className="linklike" onClick={() => handleRemoveFile("bannerContinue")}>Remover</button>
                        </div>
                      </div>
                    )}
                    <p className="lesson-hint">Recomendado 300x580 px, proporção vertical.</p>
                  </div>
                </div>
                <div className="lesson-field">
                  <label>Banner da aula (1200x768px)</label>
                  <div className="upload-group">
                    <label className="upload-box">
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFileSelection("bannerPlayer", event.target.files)} />
                      <span>Selecionar imagem</span>
                    </label>
                    {lessonForm.bannerPlayer && (
                      <div className="file-preview">
                        <img src={lessonForm.bannerPlayer.dataUrl} alt="Pré-visualização banner da aula" />
                        <div className="file-info">
                          <strong>{lessonForm.bannerPlayer.name}</strong>
                          <span>{lessonForm.bannerPlayer.width && lessonForm.bannerPlayer.height ? `${lessonForm.bannerPlayer.width}x${lessonForm.bannerPlayer.height}px` : null}</span>
                          <button type="button" className="linklike" onClick={() => handleRemoveFile("bannerPlayer")}>Remover</button>
                        </div>
                      </div>
                    )}
                    <p className="lesson-hint">Recomendado 1200x768 px, formato horizontal.</p>
                  </div>
                </div>
              </div>

              <div className="lesson-modal-actions">
                <button type="button" className="adm5-pill" onClick={closeLessonModal} disabled={lessonSubmitting}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="adm5-pill primary"
                  disabled={lessonSubmitting}
                  aria-busy={lessonSubmitting}
                >
                  {lessonSubmitting
                    ? "Salvando..."
                    : editingLesson
                    ? "Salvar alterações"
                    : "Salvar aula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
