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
import { openStoredFile } from "../../utils/storedFile";
import { useAdminToast } from "../../components/AdminToast";

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

const teacherOptions = [
  'Rodolfo Henner',
  'Marcelo Junior da Silva',
  'Suenia Karcia Freitas Paulino',
  'Pedro Henrique',
  'Luãn Marcos Costa Lã',
  'Jessica Plaster',
] as const;

const categoryOptions = [
  'Formação Teológica',
  'Formação Ministerial',
] as const;

const slugify = (value: string): string => {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const sourceTypeOptions: { value: LessonSourceType; label: string; helper: string }[] = [
  { value: "YOUTUBE", label: "YouTube", helper: "Cole a URL do vídeo do YouTube." },
  { value: "VIMEO", label: "Vimeo", helper: "Cole o link público ou o código de incorporação do Vimeo." },
];

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB — alinhado ao limite padrão de upload do Supabase Storage
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB — banners em linha ficam dentro de limites confortáveis

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
  embedCode: string;
  status: LessonStatus;
  releaseAt: string;
  materialFile: StoredFile | null;
  bannerContinue: StoredFile | null;
  bannerPlayer: StoredFile | null;
  bannerMobile: StoredFile | null;
  isActive: boolean;
};

const defaultLessonForm = (): LessonFormState => ({
  title: "",
  subtitle: "",
  subjectId: "",
  subjectName: "",
  subjectType: categoryOptions[0],
  instructor: "",
  description: "",
  contentType: "VIDEO",
  sourceType: "YOUTUBE",
  videoUrl: "",
  embedCode: "",
  status: "published",
  releaseAt: "",
  materialFile: null,
  bannerContinue: null,
  bannerPlayer: null,
  bannerMobile: null,
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
  const toast = useAdminToast();
  const [pendingLessonRemoval, setPendingLessonRemoval] = useState<null | { moduleId: string; lesson: LessonRef }>(null);

  const cleanupPreview = (file?: StoredFile | null) => {
    if (file?.dataUrl && file.dataUrl.startsWith("blob:")) {
      URL.revokeObjectURL(file.dataUrl);
    }
  };

  const resetLessonForm = () => {
    setLessonForm((prev) => {
      cleanupPreview(prev.materialFile || undefined);
      cleanupPreview(prev.bannerContinue || undefined);
      cleanupPreview(prev.bannerMobile || undefined);
      cleanupPreview(prev.bannerPlayer || undefined);
      return defaultLessonForm();
    });
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
        subjectType: lesson.subjectType || categoryOptions[0],
        instructor: lesson.instructor || "",
        description: lesson.description || "",
        contentType: lesson.contentType || "VIDEO",
        sourceType: lesson.sourceType || "YOUTUBE",
        videoUrl: lesson.videoUrl || "",
        embedCode: lesson.embedCode || "",
        status: lesson.status,
        releaseAt: lesson.releaseAt ? lesson.releaseAt.slice(0, 10) : "",
        materialFile: lesson.materialFile || null,
        bannerContinue: lesson.bannerContinue || null,
        bannerPlayer: lesson.bannerPlayer || null,
        bannerMobile: lesson.bannerMobile || null,
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
    setLessonForm((prev) => {
      const next: LessonFormState = { ...prev, [field]: value };
      if (field === "subjectName") {
        const newSlug = slugify(value);
        const previousAutoSlug = slugify(prev.subjectName || "");
        if (!prev.subjectId || prev.subjectId === previousAutoSlug) {
          next.subjectId = newSlug;
        }
      }
      if (field === "subjectType" && !value) {
        next.subjectType = categoryOptions[0];
      }
      return next;
    });
  };

  const extractVimeoEmbedSrc = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const doubleQuoteMatch = trimmed.match(/src\s*=\s*"([^"]+)"/i);
    if (doubleQuoteMatch?.[1]) return doubleQuoteMatch[1];
    const singleQuoteMatch = trimmed.match(/src\s*=\s*'([^']+)'/i);
    if (singleQuoteMatch?.[1]) return singleQuoteMatch[1];
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return null;
  };

  const handleEmbedCodeChange = (value: string) => {
    setLessonForm((prev) => {
      const next: LessonFormState = { ...prev, embedCode: value };
      const prevVideoUrl = prev.videoUrl.trim();
      const prevExtracted = extractVimeoEmbedSrc(prev.embedCode);
      const shouldSyncVideoUrl = !prevVideoUrl || (prevExtracted && prevVideoUrl === prevExtracted);
      if (shouldSyncVideoUrl) {
        next.videoUrl = extractVimeoEmbedSrc(value) || "";
      }
      return next;
    });
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
    const isPdf = file.type === "application/pdf";
    const dataUrl = isPdf ? URL.createObjectURL(file) : await readFileAsDataUrl(file);
    const stored: StoredFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl,
      uploadedAt: new Date().toISOString(),
      file,
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
    field: "materialFile" | "bannerContinue" | "bannerPlayer" | "bannerMobile",
    files: FileList | null,
  ) {
    if (!files || !files.length) return;
    const file = files[0];
    if (field === "materialFile" && file.type !== "application/pdf") {
      toast.error('Arquivo inválido', 'Envie um material complementar em PDF.');
      return;
    }
    if (field === "materialFile" && file.size > MAX_PDF_SIZE) {
      toast.error('PDF muito grande', 'Envie um arquivo de até 50 MB.');
      return;
    }
    if (field !== "materialFile" && !file.type.startsWith("image/")) {
      toast.error('Imagem inválida', 'Envie arquivos PNG ou JPG para os banners.');
      return;
    }
    if (field !== "materialFile" && file.size > MAX_IMAGE_SIZE) {
      toast.error('Imagem muito pesada', 'Utilize imagens de até 4 MB.');
      return;
    }
    try {
      const stored = await buildStoredFile(file);
      setLessonForm((prev) => ({ ...prev, [field]: stored }));
    } catch (error) {
      console.error("Falha ao ler arquivo", error);
      toast.error('Não foi possível processar', 'Tente selecionar o arquivo novamente.');
    }
  }

  const handleRemoveFile = (field: "materialFile" | "bannerContinue" | "bannerPlayer" | "bannerMobile") => {
    setLessonForm((prev) => {
      const next = { ...prev, [field]: null } as LessonFormState;
      cleanupPreview(prev[field]);
      return next;
    });
  };

  const handleModuleTitleCommit = async (moduleId: string) => {
    if (!selectedMinistry) return;
    const currentModule = selectedMinistry.modules.find((mod) => mod.id === moduleId);
    const desiredTitle = (moduleDraftTitles[moduleId] ?? currentModule?.title ?? "Módulo").trim();
    if (!currentModule || desiredTitle === currentModule.title) return;
    try {
      setModuleActionId(moduleId);
      await setModuleTitle(selectedMinistry.id, moduleId, desiredTitle);
      toast.success('Título atualizado', 'O módulo foi renomeado com sucesso.');
    } catch (error) {
      console.error("Erro ao atualizar título do módulo", error);
      toast.error('Não foi possível salvar', 'Tente novamente em instantes.');
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
      const status = await toggleModuleStatus(selectedMinistry.id, moduleId);
      const label = status === "published" ? "publicado" : status === "draft" ? "marcado como rascunho" : "atualizado";
      toast.success('Status do módulo atualizado', `O módulo foi ${label}.`);
    } catch (error) {
      console.error("Erro ao alternar status do módulo", error);
      toast.error('Não foi possível atualizar', 'Tente novamente em instantes.');
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
      toast.success('Status da aula atualizado', nextStatus === 'published' ? 'A aula foi publicada.' : 'A aula voltou para rascunho.');
    } catch (error) {
      console.error("Erro ao alternar status da aula", error);
      toast.error('Não foi possível atualizar', 'Tente novamente em instantes.');
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
      toast.info('Disponibilidade atualizada', !lesson.isActive ? 'A aula foi reativada na plataforma.' : 'A aula foi desativada para os alunos.');
    } catch (error) {
      console.error("Erro ao alternar disponibilidade da aula", error);
      toast.error('Não foi possível atualizar', 'Tente novamente em instantes.');
    } finally {
      setLessonActionId(null);
      setOpenMenu(null);
    }
  };

  const handleDeleteLesson = (moduleId: string, lesson: LessonRef) => {
    if (!selectedMinistry) return;
    setLessonActionId(lesson.id);
    setOpenMenu(null);
    setPendingLessonRemoval({ moduleId, lesson });
  };

  const confirmDeleteLesson = async () => {
    if (!selectedMinistry || !pendingLessonRemoval) return;
    const { moduleId, lesson } = pendingLessonRemoval;
    try {
      await deleteLesson(selectedMinistry.id, moduleId, lesson.id);
      toast.info('Aula removida', 'O conteúdo foi excluído da formação.');
    } catch (error) {
      console.error("Erro ao excluir aula", error);
      toast.error('Não foi possível remover', 'Tente novamente em instantes.');
    } finally {
      setLessonActionId(null);
      setPendingLessonRemoval(null);
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
      toast.warning('Informe o nome da aula', 'Digite um título para continuar.');
      return;
    }
    const trimmedVideoUrl = lessonForm.videoUrl.trim();
    const trimmedEmbedCode = lessonForm.embedCode.trim();
    const requiresVideoUrl = lessonForm.sourceType !== "VIMEO";
    if (requiresVideoUrl && !trimmedVideoUrl) {
      toast.warning('Link do vídeo obrigatório', 'Cole o link do YouTube para continuar.');
      return;
    }
    if (!requiresVideoUrl && !trimmedVideoUrl && !trimmedEmbedCode) {
      toast.warning('Informe o vídeo', 'Use o link público ou o código de incorporação do Vimeo.');
      return;
    }

    const subjectName = lessonForm.subjectName.trim();
    const subjectId = (lessonForm.subjectId || slugify(subjectName)).trim();
    const subjectType = lessonForm.subjectType?.trim() || categoryOptions[0];
    const instructor = lessonForm.instructor.trim();
    const basePayload: Partial<LessonInput> = {
      title: lessonForm.title,
      subtitle: lessonForm.subtitle,
      subjectId,
      subjectName,
      subjectType,
      instructor,
      description: lessonForm.description,
      contentType: lessonForm.contentType,
      sourceType: lessonForm.sourceType,
      videoUrl: trimmedVideoUrl,
      embedCode: trimmedEmbedCode,
      materialFile: lessonForm.materialFile,
      bannerContinue: lessonForm.bannerContinue,
      bannerPlayer: lessonForm.bannerPlayer,
      bannerMobile: lessonForm.bannerMobile,
      status: lessonForm.status,
      releaseAt: lessonForm.releaseAt ? new Date(lessonForm.releaseAt).toISOString() : null,
      isActive: lessonForm.isActive,
    };

    try {
      setLessonSubmitting(true);
      if (editingLesson) {
        await updateLesson(selectedMinistry.id, lessonModuleId, editingLesson.id, basePayload);
        toast.success('Aula atualizada', 'As alterações foram salvas.');
      } else {
        const created = await createLesson(selectedMinistry.id, lessonModuleId, basePayload as LessonInput);
        if (!created) {
          toast.error('Não foi possível criar a aula', 'Tente novamente em instantes.');
          return;
        }
        toast.success('Aula criada', 'O conteúdo foi adicionado ao módulo.');
      }
      closeLessonModal();
    } catch (error) {
      console.error("Erro ao salvar aula", error);
      toast.error('Não foi possível salvar', 'Verifique os dados e tente novamente.');
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
                onClick={() => toast.info('Em breve', 'A criação de módulos será liberada nas próximas atualizações.')}
              >
                Criar módulo
              </button>
              <button
                className="adm5-pill"
                onClick={() => toast.info('Exportação disponível em breve', 'Estamos finalizando o relatório completo da formação.')}
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
                        <button className="module-new-lesson" type="button" onClick={() => openLessonModal(module.id)}>
                          Nova aula
                        </button>
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
                      </div>
                    </div>
                    <div className="module-body">
                      {lessons.length ? (
                        <div className="lessons-list">
                          {lessons.map((lesson) => {
                            const thumb =
                              lesson.bannerContinue?.url ||
                              lesson.bannerContinue?.dataUrl ||
                              lesson.bannerMobile?.url ||
                              lesson.bannerMobile?.dataUrl ||
                              lesson.bannerPlayer?.url ||
                              lesson.bannerPlayer?.dataUrl ||
                              lesson.thumbnailUrl;
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
                                          const base = `${window.location.origin}${window.location.pathname}`;
                                          const cleaned = url.startsWith('#') ? url.slice(1) : url;
                                          window.open(`${base}#${cleaned}`, '_blank', 'noopener');
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
                <label>
                  Link do vídeo{lessonForm.sourceType === "VIMEO" ? "" : "*"}
                </label>
                <input
                  className="lesson-input"
                  value={lessonForm.videoUrl}
                  onChange={(event) => handleLessonFormChange("videoUrl", event.target.value)}
                  placeholder={lessonForm.sourceType === "VIMEO" ? "Cole a URL pública do vídeo no Vimeo" : "Cole a URL do vídeo no YouTube"}
                  required={lessonForm.sourceType !== "VIMEO" || !lessonForm.embedCode.trim()}
                />
                {lessonForm.sourceType === "VIMEO" && (
                  <p className="lesson-hint" style={{ marginTop: 4 }}>
                    Se preferir, deixe o link vazio e informe o código de incorporação do Vimeo abaixo.
                  </p>
                )}
              </div>

              {lessonForm.sourceType === "VIMEO" && (
                <div className="lesson-field">
                  <label>Código de incorporação (iframe)</label>
                  <textarea
                    className="lesson-textarea"
                    value={lessonForm.embedCode}
                    onChange={(event) => handleEmbedCodeChange(event.target.value)}
                    placeholder="Cole o snippet &lt;iframe&gt; gerado pelo Vimeo"
                    spellCheck={false}
                    rows={lessonForm.embedCode ? 5 : 3}
                  />
                  <p className="lesson-hint" style={{ marginTop: 4 }}>
                    Usaremos este player embutido quando preenchido. Prefira colar apenas o iframe do Vimeo.
                  </p>
                </div>
              )}

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
                  <select
                    className="lesson-select"
                    value={lessonForm.subjectType}
                    onChange={(event) => handleLessonFormChange("subjectType", event.target.value)}
                  >
                    <option value="">Selecione</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    {lessonForm.subjectType && !categoryOptions.includes(lessonForm.subjectType as typeof categoryOptions[number]) && (
                      <option value={lessonForm.subjectType}>{lessonForm.subjectType}</option>
                    )}
                  </select>
                </div>
                <div className="lesson-field">
                  <label>Professor(a)</label>
                  <select
                    className="lesson-select"
                    value={lessonForm.instructor}
                    onChange={(event) => handleLessonFormChange("instructor", event.target.value)}
                  >
                    <option value="">Selecione</option>
                    {teacherOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    {lessonForm.instructor && !teacherOptions.includes(lessonForm.instructor as typeof teacherOptions[number]) && (
                      <option value={lessonForm.instructor}>{lessonForm.instructor}</option>
                    )}
                  </select>
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
                          <button
                            type="button"
                            className="linklike"
                            onClick={() => openStoredFile(lessonForm.materialFile)}
                          >
                            Abrir
                          </button>
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
                        <img src={lessonForm.bannerContinue.dataUrl || lessonForm.bannerContinue.url || ''} alt="Pré-visualização banner continuar" />
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
                    <label>Imagem para mobile (opcional)</label>
                    <div className="upload-group">
                      <label className="upload-box">
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFileSelection("bannerMobile", event.target.files)} />
                        <span>Selecionar imagem</span>
                      </label>
                      {lessonForm.bannerMobile && (
                        <div className="file-preview">
                          <img src={lessonForm.bannerMobile.dataUrl || lessonForm.bannerMobile.url || ''} alt="Pré-visualização imagem mobile" />
                          <div className="file-info">
                            <strong>{lessonForm.bannerMobile.name}</strong>
                            <span>{lessonForm.bannerMobile.width && lessonForm.bannerMobile.height ? `${lessonForm.bannerMobile.width}x${lessonForm.bannerMobile.height}px` : null}</span>
                            <button type="button" className="linklike" onClick={() => handleRemoveFile("bannerMobile")}>Remover</button>
                          </div>
                        </div>
                      )}
                      <p className="lesson-hint">Sugestão: 1:1 ou 4:5 — será utilizada em telas menores.</p>
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

      {pendingLessonRemoval && (
        <div className="lesson-modal-overlay" onClick={()=> { setPendingLessonRemoval(null); setLessonActionId(null); }}>
          <div className="lesson-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Remover aula</h3>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>
              Tem certeza de que deseja remover a aula "{pendingLessonRemoval.lesson.title}" do módulo?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="admin-btn" onClick={()=> { setPendingLessonRemoval(null); setLessonActionId(null); }}>Cancelar</button>
              <button className="admin-btn primary" onClick={confirmDeleteLesson}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
