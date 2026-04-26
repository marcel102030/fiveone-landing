import { useEffect, useMemo, useState } from "react";
import "./AdministracaoFiveOne.css";
import "./ConteudoPlataforma.css";
import {
  createLesson,
  createMinistry,
  createModule,
  deleteLesson,
  deleteMinistry,
  deleteModule,
  bulkDeleteLessons,
  bulkSetLessonStatus,
  duplicateLesson,
  Enrollment,
  enrollUser,
  findUserByEmail,
  getModule,
  listEnrollments,
  listLessons,
  LessonInput,
  LessonRef,
  LessonStatus,
  LessonSourceType,
  MinistryKey,
  ModuleStatus,
  moveLesson,
  moveModule,
  setLessonActive,
  setLessonStatus,
  setModuleBanner,
  setMinistryBanner,
  setModuleStatus,
  setModuleTitle,
  StoredFile,
  unenrollUser,
  updateLesson,
  updateMinistry,
  updateModuleDescription,
  usePlatformContent,
} from "../../services/platformContent";
import { openStoredFile } from "../../../../shared/utils/storedFile";
import { useAdminToast } from "../../../../shared/components/AdminToast";

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
  'Teologia',
  'Bíblia',
  'Escatologia',
  'Apologética',
  'Ministerial',
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
  durationMinutes: string;
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
  durationMinutes: "",
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
  const [activeTab, setActiveTab] = useState<"modules" | "info" | "enrollments" | "certificate">("modules");
  const [selectedMinistryId, setSelectedMinistryId] = useState<MinistryKey>(() => content.ministries[0]?.id || "");
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
      selectedMinistry.modules.forEach((mod) => { next[mod.id] = mod.title; });
      return next;
    });
    setModuleDraftDesc((prev) => {
      const next = { ...prev };
      selectedMinistry.modules.forEach((mod) => { next[mod.id] = mod.description ?? ''; });
      return next;
    });
    setModuleDraftHighlight((prev) => {
      const next = { ...prev };
      selectedMinistry.modules.forEach((mod) => { next[mod.id] = mod.highlight ?? ''; });
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

  useEffect(() => {
    if (activeTab === 'enrollments' && selectedMinistry) {
      loadEnrollments(selectedMinistry.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedMinistry?.id]);

  // ── Busca de aulas ────────────────────────────────────────────────────────
  const [lessonSearch, setLessonSearch] = useState('');

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [bulkActionSubmitting, setBulkActionSubmitting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // ── Módulo: mover / descrição ─────────────────────────────────────────────
  const [moduleActionMoveId, setModuleActionMoveId] = useState<string | null>(null);
  const [moduleDraftDesc, setModuleDraftDesc] = useState<Record<string, string>>({});
  const [moduleDraftHighlight, setModuleDraftHighlight] = useState<Record<string, string>>({});

  // ── Matrículas ────────────────────────────────────────────────────────────
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollNewInput, setEnrollNewInput] = useState('');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [unenrollPending, setUnenrollPending] = useState<string | null>(null);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');

  // ── Novo Curso ────────────────────────────────────────────────────────────
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState<{ title: string; id: string; tagline: string; color: string; banner: StoredFile | null }>({ title: '', id: '', tagline: '', color: '#38bdf8', banner: null });
  const [newCourseSubmitting, setNewCourseSubmitting] = useState(false);

  // ── Excluir Curso ─────────────────────────────────────────────────────
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [deleteCourseSubmitting, setDeleteCourseSubmitting] = useState(false);
  const [deleteCourseConfirmText, setDeleteCourseConfirmText] = useState('');

  const handleDeleteCourse = async () => {
    if (!selectedMinistry) return;
    setDeleteCourseSubmitting(true);
    try {
      await deleteMinistry(selectedMinistry.id);
      toast.success('Curso excluído', 'O curso e todo seu conteúdo foram removidos.');
      setShowDeleteCourseModal(false);
      setDeleteCourseConfirmText('');
    } catch {
      toast.error('Erro ao excluir curso', 'Tente novamente em instantes.');
    } finally {
      setDeleteCourseSubmitting(false);
    }
  };

  // ── Editar Curso ──────────────────────────────────────────────────────
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editCourseForm, setEditCourseForm] = useState({ title: '', tagline: '', color: '#38bdf8', icon: '' });
  const [editCourseSubmitting, setEditCourseSubmitting] = useState(false);

  const openEditCourseModal = () => {
    if (!selectedMinistry) return;
    setEditCourseForm({ title: selectedMinistry.name, tagline: selectedMinistry.tagline, color: selectedMinistry.focusColor, icon: selectedMinistry.icon || '' });
    setShowEditCourseModal(true);
  };

  const handleEditCourse = async () => {
    if (!selectedMinistry || !editCourseForm.title.trim()) return;
    setEditCourseSubmitting(true);
    try {
      await updateMinistry(selectedMinistry.id, {
        title: editCourseForm.title,
        tagline: editCourseForm.tagline,
        focusColor: editCourseForm.color,
        gradient: `linear-gradient(135deg, #0f172a, ${editCourseForm.color}44)`,
        icon: editCourseForm.icon || undefined,
      });
      toast.success('Curso atualizado', 'As informações foram salvas.');
      setShowEditCourseModal(false);
    } catch {
      toast.error('Erro ao salvar', 'Tente novamente em instantes.');
    } finally {
      setEditCourseSubmitting(false);
    }
  };

  // ── Excluir Módulo ────────────────────────────────────────────────────
  const [pendingModuleRemoval, setPendingModuleRemoval] = useState<{ moduleId: string; title: string } | null>(null);
  const [deleteModuleSubmitting, setDeleteModuleSubmitting] = useState(false);

  const handleDeleteModule = async () => {
    if (!selectedMinistry || !pendingModuleRemoval) return;
    setDeleteModuleSubmitting(true);
    try {
      await deleteModule(selectedMinistry.id, pendingModuleRemoval.moduleId);
      toast.info('Módulo excluído', 'O módulo e suas aulas foram removidos.');
      setPendingModuleRemoval(null);
    } catch {
      toast.error('Erro ao excluir módulo', 'Tente novamente em instantes.');
    } finally {
      setDeleteModuleSubmitting(false);
    }
  };

  // ── Módulo: mover ─────────────────────────────────────────────────────────
  const handleMoveModule = async (moduleId: string, direction: -1 | 1) => {
    if (!selectedMinistry) return;
    setModuleActionMoveId(moduleId);
    try {
      await moveModule(selectedMinistry.id, moduleId, direction);
    } catch {
      toast.error('Não foi possível reordenar', 'Tente novamente em instantes.');
    } finally {
      setModuleActionMoveId(null);
    }
  };

  // ── Módulo: mudar status ───────────────────────────────────────────────────
  const handleSetModuleStatus = async (moduleId: string, status: ModuleStatus) => {
    if (!selectedMinistry) return;
    try {
      setModuleActionId(moduleId);
      await setModuleStatus(selectedMinistry.id, moduleId, status);
      toast.success('Status atualizado', `Módulo agora está como "${moduleStatusLabel[status]}".`);
    } catch {
      toast.error('Não foi possível atualizar', 'Tente novamente em instantes.');
    } finally {
      setModuleActionId(null);
    }
  };

  // ── Matrículas ─────────────────────────────────────────────────────────────
  const loadEnrollments = async (ministryId: string) => {
    setEnrollmentsLoading(true);
    try {
      const data = await listEnrollments(ministryId);
      setEnrollments(data);
    } catch {
      toast.error('Erro ao carregar matrículas', 'Tente novamente em instantes.');
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleEnrollUser = async () => {
    if (!selectedMinistry || !enrollNewInput.trim()) return;
    setEnrollSubmitting(true);
    try {
      let userId = enrollNewInput.trim();
      // Se parecer e-mail, tenta resolver o UUID pelo e-mail
      if (userId.includes('@')) {
        const found = await findUserByEmail(userId);
        if (!found) {
          toast.error('Usuário não encontrado', `Nenhuma conta com o e-mail "${userId}". Verifique ou use o UUID diretamente.`);
          setEnrollSubmitting(false);
          return;
        }
        userId = found;
      }
      await enrollUser(selectedMinistry.id, userId);
      toast.success('Aluno matriculado', 'O acesso foi concedido ao curso.');
      setEnrollNewInput('');
      await loadEnrollments(selectedMinistry.id);
    } catch (err: any) {
      const isDuplicate = err?.message?.includes('duplicate') || err?.code === '23505';
      toast.error('Erro ao matricular', isDuplicate ? 'Este aluno já está matriculado.' : 'Verifique o ID e tente novamente.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  const handleUnenroll = async (userEmail: string) => {
    if (!selectedMinistry) return;
    setUnenrollPending(userEmail);
    try {
      await unenrollUser(selectedMinistry.id, userEmail);
      toast.info('Matrícula removida', 'O aluno perdeu acesso ao curso.');
      setEnrollments((prev) => prev.filter((e) => e.userEmail !== userEmail));
    } catch {
      toast.error('Erro ao remover matrícula', 'Tente novamente em instantes.');
    } finally {
      setUnenrollPending(null);
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  };

  const handleBulkStatus = async (status: LessonStatus) => {
    if (!selectedLessons.size) return;
    setBulkActionSubmitting(true);
    try {
      await bulkSetLessonStatus(Array.from(selectedLessons), status);
      toast.success(`${selectedLessons.size} aula(s) atualizadas`, `Status alterado para "${lessonStatusLabel[status]}".`);
      setSelectedLessons(new Set());
    } catch {
      toast.error('Erro ao atualizar aulas', 'Tente novamente em instantes.');
    } finally {
      setBulkActionSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedLessons.size) return;
    setBulkActionSubmitting(true);
    try {
      await bulkDeleteLessons(Array.from(selectedLessons));
      toast.info(`${selectedLessons.size} aula(s) excluídas`, 'O conteúdo foi removido permanentemente.');
      setSelectedLessons(new Set());
      setShowBulkDeleteConfirm(false);
    } catch {
      toast.error('Erro ao excluir aulas', 'Tente novamente em instantes.');
    } finally {
      setBulkActionSubmitting(false);
    }
  };

  // ── Módulo: descrição inline ───────────────────────────────────────────────
  const handleModuleDescCommit = async (moduleId: string) => {
    if (!selectedMinistry) return;
    try {
      await updateModuleDescription(
        selectedMinistry.id,
        moduleId,
        moduleDraftDesc[moduleId] ?? '',
        moduleDraftHighlight[moduleId] ?? '',
      );
    } catch {
      toast.error('Não foi possível salvar descrição', 'Tente novamente em instantes.');
    }
  };

  // ── Banner do Curso (editar curso existente) ───────────────────────────
  const [showMinistryBannerModal, setShowMinistryBannerModal] = useState(false);
  const [ministryBannerFile, setMinistryBannerFile] = useState<StoredFile | null>(null);
  const [ministryBannerSubmitting, setMinistryBannerSubmitting] = useState(false);

  // ── Banner do Módulo ───────────────────────────────────────────────────
  const [moduleBannerModal, setModuleBannerModal] = useState<{ moduleId: string; title: string } | null>(null);
  const [moduleBannerFile, setModuleBannerFile] = useState<StoredFile | null>(null);
  const [moduleBannerSubmitting, setModuleBannerSubmitting] = useState(false);

  const handleCreateCourse = async () => {
    if (!newCourseForm.title.trim()) { toast.warning('Nome obrigatório', 'Informe o nome do curso.'); return; }
    setNewCourseSubmitting(true);
    try {
      const autoId = newCourseForm.id.trim() ||
        newCourseForm.title.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      await createMinistry({
        id: autoId,
        title: newCourseForm.title.trim(),
        tagline: newCourseForm.tagline.trim(),
        focusColor: newCourseForm.color,
        gradient: `linear-gradient(135deg, #0f172a, ${newCourseForm.color}44)`,
        banner: newCourseForm.banner,
      });
      toast.success('Curso criado', `"${newCourseForm.title}" foi adicionado à plataforma.`);
      setNewCourseForm({ title: '', id: '', tagline: '', color: '#38bdf8', banner: null });
      setShowNewCourseModal(false);
    } catch (err: any) {
      const isDuplicate = err?.message?.includes('duplicate') || err?.code === '23505';
      toast.error('Erro ao criar curso', isDuplicate ? 'Já existe um curso com esse ID.' : 'Verifique os dados e tente novamente.');
    } finally {
      setNewCourseSubmitting(false);
    }
  };

  const handleSaveMinistryBanner = async () => {
    if (!selectedMinistry) return;
    setMinistryBannerSubmitting(true);
    try {
      await setMinistryBanner(selectedMinistry.id, ministryBannerFile);
      toast.success('Capa do curso salva', 'A imagem foi atualizada com sucesso.');
      setShowMinistryBannerModal(false);
      setMinistryBannerFile(null);
    } catch {
      toast.error('Erro ao salvar capa', 'Tente novamente em instantes.');
    } finally {
      setMinistryBannerSubmitting(false);
    }
  };

  const handleSaveModuleBanner = async () => {
    if (!selectedMinistry || !moduleBannerModal) return;
    setModuleBannerSubmitting(true);
    try {
      await setModuleBanner(selectedMinistry.id, moduleBannerModal.moduleId, moduleBannerFile);
      toast.success('Imagem do módulo salva', 'A imagem foi atualizada com sucesso.');
      setModuleBannerModal(null);
      setModuleBannerFile(null);
    } catch {
      toast.error('Erro ao salvar imagem', 'Tente novamente em instantes.');
    } finally {
      setModuleBannerSubmitting(false);
    }
  };

  async function handleBannerFileSelect(file: File, setter: (f: StoredFile | null) => void) {
    if (!file.type.startsWith('image/')) { toast.error('Arquivo inválido', 'Envie uma imagem PNG ou JPG.'); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast.error('Imagem muito pesada', 'Utilize imagens de até 4 MB.'); return; }
    try {
      const stored = await buildStoredFile(file);
      setter(stored);
    } catch {
      toast.error('Erro ao processar imagem', 'Tente selecionar o arquivo novamente.');
    }
  }

  // ── Criar Módulo ──────────────────────────────────────────────────────────
  const [showNewModuleModal, setShowNewModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleSubmitting, setNewModuleSubmitting] = useState(false);

  const handleCreateModule = async () => {
    if (!selectedMinistry) return;
    setNewModuleSubmitting(true);
    try {
      await createModule(selectedMinistry.id, newModuleTitle.trim() || 'Módulo');
      toast.success('Módulo criado', 'O módulo foi adicionado ao curso.');
      setNewModuleTitle('');
      setShowNewModuleModal(false);
    } catch {
      toast.error('Erro ao criar módulo', 'Tente novamente em instantes.');
    } finally {
      setNewModuleSubmitting(false);
    }
  };

  // ── Aulas ─────────────────────────────────────────────────────────────────
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
        durationMinutes: lesson.durationMinutes ? String(lesson.durationMinutes) : "",
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

  const decodeHtmlEntities = (raw: string): string => {
    let out = raw;
    for (let i = 0; i < 4; i += 1) {
      const prev = out;
      out = prev
        .replace(/&amp;/gi, '&')
        .replace(/&#0*38;/gi, '&')
        .replace(/&#x0*26;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#0*34;/gi, '"')
        .replace(/&#x0*22;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&#0*39;/gi, "'")
        .replace(/&#x0*27;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&#0*60;/gi, '<')
        .replace(/&#x0*3c;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#0*62;/gi, '>')
        .replace(/&#x0*3e;/gi, '>');
      if (out === prev) break;
    }
    return out;
  };

  const stripSurroundingQuotes = (raw: string): string => {
    let out = raw.trim();
    if ((out.startsWith('"') && out.endsWith('"')) || (out.startsWith("'") && out.endsWith("'"))) {
      out = out.slice(1, -1).trim();
    }
    return out;
  };

  const maybeDecodeURIComponentUrl = (raw: string): string => {
    let out = raw;
    for (let i = 0; i < 2; i += 1) {
      const looksEncodedUrl =
        /^[a-z][a-z0-9+.-]*%3a%2f%2f/i.test(out) ||
        out.startsWith('%2F%2F') ||
        out.startsWith('%2f%2f');
      if (!looksEncodedUrl) break;
      try {
        out = decodeURIComponent(out);
      } catch {
        break;
      }
    }
    return out;
  };

  const decodeHtmlUrl = (raw: string): string => {
    let out = decodeHtmlEntities(raw);
    out = stripSurroundingQuotes(out);
    out = maybeDecodeURIComponentUrl(out);
    out = decodeHtmlEntities(out);
    out = stripSurroundingQuotes(out);
    if (out.startsWith('//')) out = `https:${out}`;
    return out;
  };

  const extractVimeoEmbedSrc = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const decoded = decodeHtmlEntities(trimmed);
    const decodedMaybeUrl = decodeHtmlUrl(decoded);
    if (/^https?:\/\//i.test(decodedMaybeUrl)) return decodedMaybeUrl;

    const doubleQuoteMatch = decoded.match(/src\s*=\s*"([^"]+)"/i);
    if (doubleQuoteMatch?.[1]) return decodeHtmlUrl(doubleQuoteMatch[1]);
    const singleQuoteMatch = decoded.match(/src\s*=\s*'([^']+)'/i);
    if (singleQuoteMatch?.[1]) return decodeHtmlUrl(singleQuoteMatch[1]);
    const unquotedMatch = decoded.match(/src\s*=\s*([^\s>]+)/i);
    if (unquotedMatch?.[1]) return decodeHtmlUrl(unquotedMatch[1]);

    try {
      if (typeof DOMParser !== 'undefined') {
        const doc = new DOMParser().parseFromString(decoded, 'text/html');
        const src = doc.querySelector('iframe')?.getAttribute('src');
        if (src) return decodeHtmlUrl(src);
      }
    } catch {}

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
      toast.info('Aula removida', 'O conteúdo foi excluído do curso.');
    } catch (error) {
      console.error("Erro ao excluir aula", error);
      toast.error('Não foi possível remover', 'Tente novamente em instantes.');
    } finally {
      setLessonActionId(null);
      setPendingLessonRemoval(null);
      setOpenMenu(null);
    }
  };

  const handleMoveLesson = async (moduleId: string, lesson: LessonRef, direction: -1 | 1) => {
    if (!selectedMinistry) return;
    try {
      setLessonActionId(lesson.id);
      await moveLesson(selectedMinistry.id, moduleId, lesson.id, direction);
    } catch {
      toast.error('Não foi possível reordenar', 'Tente novamente em instantes.');
    } finally {
      setLessonActionId(null);
    }
  };

  const handleDuplicateLesson = async (moduleId: string, lesson: LessonRef) => {
    if (!selectedMinistry) return;
    setOpenMenu(null);
    try {
      setLessonActionId(lesson.id);
      await duplicateLesson(selectedMinistry.id, moduleId, lesson.id);
      toast.success('Aula duplicada', 'Uma cópia em rascunho foi criada no mesmo módulo.');
    } catch {
      toast.error('Não foi possível duplicar', 'Tente novamente em instantes.');
    } finally {
      setLessonActionId(null);
    }
  };

  const handleCopyLessonLink = (lesson: LessonRef) => {
    const courseId = selectedMinistryId;
    const url = lesson.videoId
      ? `/curso/${courseId}/aula?vid=${encodeURIComponent(lesson.videoId)}`
      : `/curso/${courseId}/modulos`;
    const base = `${window.location.origin}${window.location.pathname}`;
    const fullUrl = `${base}#${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success('Link copiado!', fullUrl);
    }).catch(() => {
      toast.error('Não foi possível copiar', 'Copie manualmente: ' + fullUrl);
    });
    setOpenMenu(null);
  };

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.lesson-menu') && !target.closest('.lesson-menu-trigger')) {
        setOpenMenu(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setShowDeleteCourseModal(false);
        setShowEditCourseModal(false);
        setPendingModuleRemoval(null);
        setShowMinistryBannerModal(false);
        setModuleBannerModal(null);
        setShowNewModuleModal(false);
        setShowNewCourseModal(false);
        setShowBulkDeleteConfirm(false);
        setPendingLessonRemoval(null);
        closeLessonModal();
      }
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
      durationMinutes: lessonForm.durationMinutes ? Number(lessonForm.durationMinutes) : undefined,
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
      <p className="adm5-sub">Gerencie cursos, módulos e aulas que serão exibidas na plataforma dos alunos.</p>
      <div className="content-help-bar">
        Aqui você encontra todas as opções para customizar sua plataforma:
        <button className="content-help-link">Como criar uma aula?</button>
        <button className="content-help-link">Como criar uma aula de avaliação?</button>
        <button className="content-help-link">Como configurar o certificado?</button>
        <button className="content-help-link">Como colocar o conteúdo na vitrine?</button>
      </div>

      <div className="content-ministry-grid">
        <button className="course-card add-card" onClick={() => setShowNewCourseModal(true)}>
          <div style={{ fontSize: 24 }}>+</div>
          Novo curso
        </button>
        {content.ministries.map((ministry) => (
          <button
            key={ministry.id}
            className={`course-card ${selectedMinistryId === ministry.id ? "active" : ""}`}
            onClick={() => {
              setSelectedMinistryId(ministry.id);
              setActiveTab("modules");
            }}
          >
            <div
              className="card-thumb"
              style={{
                background: ministry.gradient,
                backgroundImage: ministry.banner?.url || ministry.banner?.dataUrl
                  ? `url(${ministry.banner.url || ministry.banner.dataUrl})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
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
                onClick={() => {
                  setMinistryBannerFile(selectedMinistry.banner ?? null);
                  setShowMinistryBannerModal(true);
                }}
              >
                🖼 Capa do curso
              </button>
              <button
                className="adm5-pill"
                onClick={openEditCourseModal}
              >
                Editar curso
              </button>
              <button
                className="adm5-pill danger"
                onClick={() => { setDeleteCourseConfirmText(''); setShowDeleteCourseModal(true); }}
              >
                Excluir curso
              </button>
              <button
                className="adm5-pill"
                onClick={() => { setNewModuleTitle(''); setShowNewModuleModal(true); }}
              >
                Criar módulo
              </button>
              <button
                className="adm5-pill"
                onClick={() => toast.info('Exportação disponível em breve', 'Estamos finalizando o relatório completo do curso.')}
              >
                Exportar visão
              </button>
            </div>
          </div>

          <div className="ministry-tabs">
            <button className={`ministry-tab ${activeTab === "modules" ? "active" : ""}`} onClick={() => setActiveTab("modules")}>
              Módulos
            </button>
            <button className={`ministry-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
              Informações
            </button>
            <button className={`ministry-tab ${activeTab === "enrollments" ? "active" : ""}`} onClick={() => setActiveTab("enrollments")}>
              Matrículas
            </button>
            <button className={`ministry-tab ${activeTab === "certificate" ? "active" : ""}`} onClick={() => setActiveTab("certificate")}>
              Certificado
            </button>
          </div>

          {activeTab === "modules" && (
            <div className="modules-list">
              {/* ── Busca ── */}
              <div className="lesson-search-wrap">
                <input
                  className="lesson-search-input"
                  placeholder="Buscar aula por título, matéria ou professor…"
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                />
                {lessonSearch && (
                  <button className="lesson-search-clear" onClick={() => setLessonSearch('')} title="Limpar">✕</button>
                )}
              </div>

              {/* ── Bulk toolbar ── */}
              {selectedLessons.size > 0 && (
                <div className="bulk-toolbar">
                  <span className="bulk-count">{selectedLessons.size} aula(s) selecionada(s)</span>
                  <button className="adm5-pill" disabled={bulkActionSubmitting} onClick={() => handleBulkStatus('published')}>Publicar</button>
                  <button className="adm5-pill" disabled={bulkActionSubmitting} onClick={() => handleBulkStatus('draft')}>Rascunho</button>
                  <button className="adm5-pill danger" disabled={bulkActionSubmitting} onClick={() => setShowBulkDeleteConfirm(true)}>Excluir</button>
                  <button className="adm5-pill" disabled={bulkActionSubmitting} onClick={() => setSelectedLessons(new Set())}>✕ Limpar</button>
                </div>
              )}

              {selectedMinistry.modules.map((module, moduleIdx) => {
                const isOpen = expandedModuleId === module.id;
                const moduleMenuOpen = openMenu?.moduleId === module.id;
                const allLessons = moduleLessons.filter((lesson) => lesson.moduleId === module.id);
                const lessons = lessonSearch.trim()
                  ? allLessons.filter((l) => {
                      const q = lessonSearch.toLowerCase();
                      return l.title.toLowerCase().includes(q) ||
                        (l.subjectName || '').toLowerCase().includes(q) ||
                        (l.instructor || '').toLowerCase().includes(q);
                    })
                  : allLessons;
                const hasDraftInPublished = module.status === 'published' && allLessons.some(l => l.status !== 'published');
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
                        {/* Reordenar módulo */}
                        <div className="lesson-reorder">
                          <button
                            type="button"
                            className="lesson-reorder-btn"
                            title="Mover módulo para cima"
                            disabled={moduleIdx === 0 || moduleActionMoveId === module.id}
                            onClick={() => handleMoveModule(module.id, -1)}
                          >▲</button>
                          <button
                            type="button"
                            className="lesson-reorder-btn"
                            title="Mover módulo para baixo"
                            disabled={moduleIdx === selectedMinistry.modules.length - 1 || moduleActionMoveId === module.id}
                            onClick={() => handleMoveModule(module.id, 1)}
                          >▼</button>
                        </div>
                        <span className="module-lesson-count">
                          {(() => {
                            const pub = allLessons.filter(l => l.status === 'published').length;
                            const total = allLessons.length;
                            if (total === 0) return '0 aulas';
                            return `${total} aula${total !== 1 ? 's' : ''} · ${pub} pub.`;
                          })()}
                        </span>
                        {hasDraftInPublished && (
                          <span className="module-draft-warning" title="Este módulo está publicado mas contém aulas em rascunho">
                            ⚠ rascunhos
                          </span>
                        )}
                        <button className="module-new-lesson" type="button" onClick={() => openLessonModal(module.id)}>
                          Nova aula
                        </button>
                        <button
                          className="adm5-pill"
                          type="button"
                          title="Imagem do card do módulo (retrato 3:4)"
                          onClick={() => {
                            setModuleBannerFile(module.bannerModule ?? null);
                            setModuleBannerModal({ moduleId: module.id, title: module.title });
                          }}
                        >
                          🖼 Imagem
                        </button>
                        <select
                          className="module-status-select"
                          value={module.status}
                          disabled={moduleActionId === module.id}
                          onChange={(e) => handleSetModuleStatus(module.id, e.target.value as ModuleStatus)}
                        >
                          {(Object.keys(moduleStatusLabel) as ModuleStatus[]).map((s) => (
                            <option key={s} value={s}>{moduleStatusLabel[s]}</option>
                          ))}
                        </select>
                        <button
                          className="adm5-pill danger"
                          type="button"
                          onClick={() => setPendingModuleRemoval({ moduleId: module.id, title: module.title })}
                          disabled={moduleActionId === module.id}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <div className="module-body">
                      {/* ── Descrição do módulo ── */}
                      <div className="module-desc-section">
                        <textarea
                          className="module-desc-input"
                          placeholder="Descrição do módulo (visível para o aluno)…"
                          rows={2}
                          value={moduleDraftDesc[module.id] ?? ''}
                          onChange={(e) => setModuleDraftDesc((p) => ({ ...p, [module.id]: e.target.value }))}
                          onBlur={() => handleModuleDescCommit(module.id)}
                        />
                        <input
                          className="module-desc-input"
                          placeholder="Destaque / frase curta do módulo (opcional)…"
                          value={moduleDraftHighlight[module.id] ?? ''}
                          onChange={(e) => setModuleDraftHighlight((p) => ({ ...p, [module.id]: e.target.value }))}
                          onBlur={() => handleModuleDescCommit(module.id)}
                        />
                      </div>

                      {lessons.length ? (
                        <div className="lessons-list">
                          {lessons.map((lesson, lessonIdx) => {
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
                                <input
                                  type="checkbox"
                                  className="lesson-checkbox"
                                  checked={selectedLessons.has(lesson.id)}
                                  onChange={() => toggleLessonSelection(lesson.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  title="Selecionar aula"
                                />
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
                                    {lesson.durationMinutes && (
                                      <span className="lesson-tag lesson-tag--duration">⏱ {lesson.durationMinutes} min</span>
                                    )}
                                    {lesson.releaseAt && new Date(lesson.releaseAt) > new Date() && (
                                      <span className="lesson-tag lesson-tag--scheduled" title={`Liberada em ${new Date(lesson.releaseAt).toLocaleDateString('pt-BR')}`}>
                                        🗓 {new Date(lesson.releaseAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                      </span>
                                    )}
                                    {lesson.status === 'scheduled' && lesson.releaseAt && new Date(lesson.releaseAt) <= new Date() && (
                                      <span className="lesson-tag lesson-tag--expired" title="Data de liberação já passou — considere publicar esta aula manualmente">
                                        ⚠ programada vencida
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="lesson-actions">
                                  <div className="lesson-reorder">
                                    <button
                                      type="button"
                                      className="lesson-reorder-btn"
                                      title="Mover para cima"
                                      disabled={lessonIdx === 0 || lessonActionId === lesson.id}
                                      onClick={() => handleMoveLesson(module.id, lesson, -1)}
                                    >▲</button>
                                    <button
                                      type="button"
                                      className="lesson-reorder-btn"
                                      title="Mover para baixo"
                                      disabled={lessonIdx === lessons.length - 1 || lessonActionId === lesson.id}
                                      onClick={() => handleMoveLesson(module.id, lesson, 1)}
                                    >▼</button>
                                  </div>
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
                                          const courseId = selectedMinistryId;
                                          const url = lesson.videoId
                                            ? `/curso/${courseId}/aula?vid=${encodeURIComponent(lesson.videoId)}`
                                            : `/curso/${courseId}/modulos`;
                                          const base = `${window.location.origin}${window.location.pathname}`;
                                          const cleaned = url.startsWith('#') ? url.slice(1) : url;
                                          window.open(`${base}#${cleaned}`, '_blank', 'noopener');
                                          setOpenMenu(null);
                                        }}
                                      >
                                        Abrir player
                                      </button>
                                      <button type="button" role="menuitem" onClick={() => handleCopyLessonLink(lesson)}>
                                        Copiar link
                                      </button>
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleDuplicateLesson(module.id, lesson)}
                                        disabled={lessonActionId === lesson.id}
                                      >
                                        Duplicar
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
                          {lessonSearch.trim()
                            ? `Nenhuma aula encontrada para "${lessonSearch}".`
                            : 'Nenhuma aula cadastrada para este módulo ainda. Clique em "Nova aula" para começar.'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "info" && (
            <div className="info-tab">
              <div className="info-tab-grid">
                <div className="info-stat">
                  <span className="info-stat-label">ID do curso</span>
                  <code className="info-stat-value">{selectedMinistry.id}</code>
                </div>
                <div className="info-stat">
                  <span className="info-stat-label">Módulos</span>
                  <span className="info-stat-value">{selectedMinistry.modules.length}</span>
                </div>
                <div className="info-stat">
                  <span className="info-stat-label">Aulas totais</span>
                  <span className="info-stat-value">
                    {selectedMinistry.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                  </span>
                </div>
                <div className="info-stat">
                  <span className="info-stat-label">Aulas publicadas</span>
                  <span className="info-stat-value" style={{ color: '#4ade80' }}>
                    {selectedMinistry.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.status === 'published').length, 0)}
                  </span>
                </div>
                <div className="info-stat">
                  <span className="info-stat-label">Cor do curso</span>
                  <span className="info-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: selectedMinistry.focusColor, display: 'inline-block', border: '1px solid #334155' }} />
                    {selectedMinistry.focusColor}
                  </span>
                </div>
                <div className="info-stat">
                  <span className="info-stat-label">Ícone</span>
                  <span className="info-stat-value" style={{ fontSize: 11, color: '#64748b', wordBreak: 'break-all' }}>{selectedMinistry.icon || '—'}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#475569', marginTop: 20 }}>
                Para editar nome, descrição, cor e ícone do curso, use o botão <strong style={{ color: '#e2e8f0' }}>Editar curso</strong> no cabeçalho acima.
              </p>
            </div>
          )}

          {activeTab === "enrollments" && (
            <div className="enrollments-tab">
              <div className="enroll-add-row">
                <input
                  className="lesson-input"
                  style={{ flex: 1, maxWidth: 400 }}
                  placeholder="E-mail ou UUID do aluno"
                  value={enrollNewInput}
                  onChange={(e) => setEnrollNewInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleEnrollUser(); }}
                />
                <button
                  className="adm5-pill primary"
                  onClick={handleEnrollUser}
                  disabled={enrollSubmitting || !enrollNewInput.trim()}
                >
                  {enrollSubmitting ? 'Matriculando…' : '+ Matricular'}
                </button>
              </div>
              <p className="lesson-hint" style={{ marginBottom: 14 }}>
                Aceita e-mail (busca automática) ou UUID (Authentication → Users no Supabase).
              </p>

              {enrollmentsLoading ? (
                <div style={{ color: '#64748b', fontSize: 13 }}>Carregando matrículas…</div>
              ) : enrollments.length === 0 ? (
                <div className="empty-state">Nenhum aluno matriculado neste curso ainda.</div>
              ) : (
                <>
                  <div className="lesson-search-wrap" style={{ marginBottom: 10 }}>
                    <input
                      className="lesson-search-input"
                      placeholder={`Filtrar entre ${enrollments.length} aluno(s)…`}
                      value={enrollmentSearch}
                      onChange={(e) => setEnrollmentSearch(e.target.value)}
                    />
                    {enrollmentSearch && (
                      <button className="lesson-search-clear" onClick={() => setEnrollmentSearch('')}>✕</button>
                    )}
                  </div>
                  <div className="enrollments-list">
                    <div className="enrollment-header-row">
                      <span>Usuário</span>
                      <span>Matriculado em</span>
                      <span></span>
                    </div>
                    {enrollments
                      .filter((e) => {
                        if (!enrollmentSearch.trim()) return true;
                        const q = enrollmentSearch.toLowerCase();
                        return (e.userEmail || '').toLowerCase().includes(q) ||
                          (e.userName || '').toLowerCase().includes(q);
                      })
                      .map((e) => (
                        <div key={e.userEmail} className="enrollment-row">
                          <div className="enrollment-user">
                            <span className="enrollment-name">{e.userName || e.userEmail || '—'}</span>
                            {e.userEmail && e.userName && <span className="enrollment-email">{e.userEmail}</span>}
                          </div>
                          <span className="enrollment-date">
                            {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString('pt-BR') : '—'}
                          </span>
                          <button
                            className="adm5-pill danger"
                            style={{ fontSize: 11, padding: '3px 10px' }}
                            disabled={unenrollPending === e.userEmail}
                            onClick={() => handleUnenroll(e.userEmail)}
                          >
                            {unenrollPending === e.userEmail ? '…' : 'Remover'}
                          </button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "certificate" && (
            <div style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              <p>
                Configure aqui as regras para emissão de certificados do curso selecionado. Defina carga horária mínima,
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

              <div className="lesson-field" style={{ maxWidth: 200 }}>
                <label>Duração (minutos)</label>
                <input
                  className="lesson-input"
                  type="number"
                  min="1"
                  max="999"
                  value={lessonForm.durationMinutes}
                  onChange={(event) => handleLessonFormChange("durationMinutes", event.target.value)}
                  placeholder="Ex: 45"
                />
                <p className="lesson-hint">Exibida no card da aula para o aluno.</p>
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

                <div className="lesson-field">
                  <label>Banner do player (16:9) — tela da aula</label>
                  <div className="upload-group">
                    <label className="upload-box">
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFileSelection("bannerPlayer", event.target.files)} />
                      <span>Selecionar imagem</span>
                    </label>
                    {lessonForm.bannerPlayer && (
                      <div className="file-preview">
                        <img src={lessonForm.bannerPlayer.dataUrl || lessonForm.bannerPlayer.url || ''} alt="Pré-visualização banner player" />
                        <div className="file-info">
                          <strong>{lessonForm.bannerPlayer.name}</strong>
                          <span>{lessonForm.bannerPlayer.width && lessonForm.bannerPlayer.height ? `${lessonForm.bannerPlayer.width}x${lessonForm.bannerPlayer.height}px` : null}</span>
                          <button type="button" className="linklike" onClick={() => handleRemoveFile("bannerPlayer")}>Remover</button>
                        </div>
                      </div>
                    )}
                    <p className="lesson-hint">Recomendado 1280×720 px. Exibido na tela do player e como fallback no card do módulo.</p>
                  </div>
                </div>

                <div className="form-two-col">
                  <div className="lesson-field">
                    <label>Banner "Continuar assistindo" (3:5)</label>
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
                      <p className="lesson-hint">Recomendado 300×580 px, proporção vertical. Aparece no carrossel da plataforma.</p>
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

      {/* ── Modal: Novo Curso ──────────────────────────────────────────────── */}
      {showNewCourseModal && (
        <div className="lesson-modal-overlay" onClick={() => setShowNewCourseModal(false)}>
          <div className="lesson-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3>Novo Curso</h3>
            <p style={{ color: '#94a3b8', marginTop: 4, marginBottom: 16, fontSize: 13 }}>
              Preencha os dados do novo curso. Ele aparecerá imediatamente na plataforma dos alunos matriculados.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="lesson-label">Nome do curso *</label>
                <input
                  className="lesson-input"
                  placeholder="Ex: Introdução à Apologética"
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm((f) => ({ ...f, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="lesson-label">ID do curso (gerado automaticamente se vazio)</label>
                <input
                  className="lesson-input"
                  placeholder="Ex: APOLOGETICA"
                  value={newCourseForm.id}
                  onChange={(e) => setNewCourseForm((f) => ({ ...f, id: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))}
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>Apenas letras maiúsculas, números e _</span>
              </div>
              <div>
                <label className="lesson-label">Descrição curta (opcional)</label>
                <input
                  className="lesson-input"
                  placeholder="Ex: Defesa racional da fé cristã."
                  value={newCourseForm.tagline}
                  onChange={(e) => setNewCourseForm((f) => ({ ...f, tagline: e.target.value }))}
                />
              </div>
              <div>
                <label className="lesson-label">Cor do curso</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={newCourseForm.color}
                    onChange={(e) => setNewCourseForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{newCourseForm.color}</span>
                </div>
              </div>
              <div>
                <label className="lesson-label">Capa do curso (opcional) — 1200×800 px</label>
                <div className="upload-group">
                  <label className="upload-box">
                    <input type="file" accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleBannerFileSelect(e.target.files?.[0]!, (f) => setNewCourseForm((prev) => ({ ...prev, banner: f })))} />
                    <span>Selecionar imagem</span>
                  </label>
                  {newCourseForm.banner && (
                    <div className="file-preview">
                      <img src={newCourseForm.banner.dataUrl || newCourseForm.banner.url || ''} alt="Capa" style={{ maxHeight: 80, borderRadius: 6 }} />
                      <div className="file-info">
                        <strong>{newCourseForm.banner.name}</strong>
                        {newCourseForm.banner.width && <span>{newCourseForm.banner.width}×{newCourseForm.banner.height}px</span>}
                        <button type="button" className="linklike" onClick={() => setNewCourseForm((f) => ({ ...f, banner: null }))}>Remover</button>
                      </div>
                    </div>
                  )}
                  <p className="lesson-hint">Recomendado 1200×800 px. Aparece no card do curso na plataforma.</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="admin-btn" onClick={() => setShowNewCourseModal(false)} disabled={newCourseSubmitting}>Cancelar</button>
              <button className="admin-btn primary" onClick={handleCreateCourse} disabled={newCourseSubmitting || !newCourseForm.title.trim()}>
                {newCourseSubmitting ? 'Criando…' : 'Criar curso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Capa do Curso ───────────────────────────────────────────── */}
      {showMinistryBannerModal && selectedMinistry && (
        <div className="lesson-modal-overlay" onClick={() => { setShowMinistryBannerModal(false); setMinistryBannerFile(null); }}>
          <div className="lesson-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3>Capa do curso — {selectedMinistry.name}</h3>
            <p style={{ color: '#94a3b8', marginTop: 4, marginBottom: 16, fontSize: 13 }}>
              Imagem exibida no card do curso na plataforma. Recomendado <strong style={{ color: '#e2e8f0' }}>1200×800 px</strong> (proporção 3:2).
            </p>
            <div className="upload-group">
              <label className="upload-box">
                <input type="file" accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleBannerFileSelect(e.target.files?.[0]!, setMinistryBannerFile)} />
                <span>{ministryBannerFile ? 'Trocar imagem' : 'Selecionar imagem'}</span>
              </label>
              {ministryBannerFile && (
                <div className="file-preview">
                  <img src={ministryBannerFile.dataUrl || ministryBannerFile.url || ''} alt="Capa" style={{ maxHeight: 100, borderRadius: 6 }} />
                  <div className="file-info">
                    <strong>{ministryBannerFile.name}</strong>
                    {ministryBannerFile.width && <span>{ministryBannerFile.width}×{ministryBannerFile.height}px</span>}
                    <button type="button" className="linklike" onClick={() => setMinistryBannerFile(null)}>Remover</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="admin-btn" onClick={() => { setShowMinistryBannerModal(false); setMinistryBannerFile(null); }} disabled={ministryBannerSubmitting}>Cancelar</button>
              <button className="admin-btn primary" onClick={handleSaveMinistryBanner} disabled={ministryBannerSubmitting}>
                {ministryBannerSubmitting ? 'Salvando…' : 'Salvar capa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Imagem do Módulo ───────────────────────────────────────── */}
      {moduleBannerModal && (
        <div className="lesson-modal-overlay" onClick={() => { setModuleBannerModal(null); setModuleBannerFile(null); }}>
          <div className="lesson-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3>Imagem do módulo</h3>
            <p style={{ color: '#94a3b8', marginTop: 4, marginBottom: 4, fontSize: 13 }}>
              <strong style={{ color: '#e2e8f0' }}>{moduleBannerModal.title}</strong>
            </p>
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 13 }}>
              Imagem do card do módulo na página de módulos. Recomendado <strong style={{ color: '#e2e8f0' }}>600×800 px</strong> (proporção retrato 3:4).
            </p>
            <div className="upload-group">
              <label className="upload-box">
                <input type="file" accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleBannerFileSelect(e.target.files?.[0]!, setModuleBannerFile)} />
                <span>{moduleBannerFile ? 'Trocar imagem' : 'Selecionar imagem'}</span>
              </label>
              {moduleBannerFile && (
                <div className="file-preview">
                  <img src={moduleBannerFile.dataUrl || moduleBannerFile.url || ''} alt="Imagem do módulo" style={{ maxHeight: 100, borderRadius: 6 }} />
                  <div className="file-info">
                    <strong>{moduleBannerFile.name}</strong>
                    {moduleBannerFile.width && <span>{moduleBannerFile.width}×{moduleBannerFile.height}px</span>}
                    <button type="button" className="linklike" onClick={() => setModuleBannerFile(null)}>Remover</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="admin-btn" onClick={() => { setModuleBannerModal(null); setModuleBannerFile(null); }} disabled={moduleBannerSubmitting}>Cancelar</button>
              <button className="admin-btn primary" onClick={handleSaveModuleBanner} disabled={moduleBannerSubmitting}>
                {moduleBannerSubmitting ? 'Salvando…' : 'Salvar imagem'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Criar Módulo ────────────────────────────────────────────── */}
      {showNewModuleModal && (
        <div className="lesson-modal-overlay" onClick={() => setShowNewModuleModal(false)}>
          <div className="lesson-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3>Criar Módulo</h3>
            <p style={{ color: '#94a3b8', marginTop: 4, marginBottom: 16, fontSize: 13 }}>
              Adicionando módulo ao curso <strong style={{ color: '#e2e8f0' }}>{selectedMinistry?.name}</strong>.
            </p>
            <div>
              <label className="lesson-label">Nome do módulo</label>
              <input
                className="lesson-input"
                placeholder="Ex: Módulo 1 — Introdução"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateModule(); }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="admin-btn" onClick={() => setShowNewModuleModal(false)} disabled={newModuleSubmitting}>Cancelar</button>
              <button className="admin-btn primary" onClick={handleCreateModule} disabled={newModuleSubmitting}>
                {newModuleSubmitting ? 'Criando…' : 'Criar módulo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Excluir Curso ───────────────────────────────────────────── */}
      {showDeleteCourseModal && selectedMinistry && (
        <div className="lesson-modal-overlay" onClick={() => { setShowDeleteCourseModal(false); setDeleteCourseConfirmText(''); }}>
          <div className="lesson-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#f87171' }}>Excluir curso</h3>
            <p style={{ color: '#94a3b8', marginTop: 8, marginBottom: 16, fontSize: 13, lineHeight: 1.6 }}>
              Esta ação é <strong style={{ color: '#f87171' }}>irreversível</strong>. Todos os módulos, aulas e matrículas do curso{' '}
              <strong style={{ color: '#e2e8f0' }}>{selectedMinistry.name}</strong> serão permanentemente removidos.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label className="lesson-label" style={{ marginBottom: 6, display: 'block' }}>
                Para confirmar, digite o nome do curso: <strong style={{ color: '#e2e8f0' }}>{selectedMinistry.name}</strong>
              </label>
              <input
                className="lesson-input"
                placeholder={selectedMinistry.name}
                value={deleteCourseConfirmText}
                onChange={(e) => setDeleteCourseConfirmText(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="admin-btn" onClick={() => { setShowDeleteCourseModal(false); setDeleteCourseConfirmText(''); }} disabled={deleteCourseSubmitting}>
                Cancelar
              </button>
              <button
                className="admin-btn danger"
                onClick={handleDeleteCourse}
                disabled={deleteCourseSubmitting || deleteCourseConfirmText !== selectedMinistry.name}
              >
                {deleteCourseSubmitting ? 'Excluindo…' : 'Excluir definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Curso ────────────────────────────────────────────── */}
      {showEditCourseModal && selectedMinistry && (
        <div className="lesson-modal-overlay" onClick={() => setShowEditCourseModal(false)}>
          <div className="lesson-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3>Editar curso</h3>
            <p style={{ color: '#94a3b8', marginTop: 4, marginBottom: 16, fontSize: 13 }}>
              Atualize as informações do curso <strong style={{ color: '#e2e8f0' }}>{selectedMinistry.name}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="lesson-label">Nome do curso *</label>
                <input
                  className="lesson-input"
                  value={editCourseForm.title}
                  onChange={(e) => setEditCourseForm((f) => ({ ...f, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="lesson-label">Descrição curta</label>
                <input
                  className="lesson-input"
                  value={editCourseForm.tagline}
                  onChange={(e) => setEditCourseForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="Ex: Defesa racional da fé cristã."
                />
              </div>
              <div>
                <label className="lesson-label">Cor do curso</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={editCourseForm.color}
                    onChange={(e) => setEditCourseForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{editCourseForm.color}</span>
                </div>
              </div>
              <div>
                <label className="lesson-label">Ícone do curso (URL do SVG)</label>
                <input
                  className="lesson-input"
                  value={editCourseForm.icon}
                  onChange={(e) => setEditCourseForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="/assets/icons/mestre.svg"
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>Ícones disponíveis: apostolo, profeta, evangelista, pastor, mestre, default</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="admin-btn" onClick={() => setShowEditCourseModal(false)} disabled={editCourseSubmitting}>Cancelar</button>
              <button className="admin-btn primary" onClick={handleEditCourse} disabled={editCourseSubmitting || !editCourseForm.title.trim()}>
                {editCourseSubmitting ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar exclusão em massa ───────────────────────────── */}
      {showBulkDeleteConfirm && (
        <div className="lesson-modal-overlay" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="lesson-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#f87171' }}>Excluir {selectedLessons.size} aula(s)</h3>
            <p style={{ color: '#94a3b8', marginTop: 8, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
              Esta ação é <strong style={{ color: '#f87171' }}>irreversível</strong>. As{' '}
              <strong style={{ color: '#e2e8f0' }}>{selectedLessons.size} aula(s) selecionada(s)</strong> serão
              permanentemente removidas da plataforma, incluindo progresso e materiais associados.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="admin-btn"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkActionSubmitting}
              >
                Cancelar
              </button>
              <button
                className="admin-btn danger"
                onClick={handleBulkDelete}
                disabled={bulkActionSubmitting}
              >
                {bulkActionSubmitting ? 'Excluindo…' : `Excluir ${selectedLessons.size} aula(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Excluir Módulo ─────────────────────────────────────────── */}
      {pendingModuleRemoval && (
        <div className="lesson-modal-overlay" onClick={() => setPendingModuleRemoval(null)}>
          <div className="lesson-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#f87171' }}>Excluir módulo</h3>
            <p style={{ color: '#94a3b8', marginTop: 8, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
              Tem certeza de que deseja excluir o módulo{' '}
              <strong style={{ color: '#e2e8f0' }}>{pendingModuleRemoval.title}</strong>?{' '}
              Todas as aulas vinculadas serão removidas permanentemente.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="admin-btn" onClick={() => setPendingModuleRemoval(null)} disabled={deleteModuleSubmitting}>Cancelar</button>
              <button className="admin-btn danger" onClick={handleDeleteModule} disabled={deleteModuleSubmitting}>
                {deleteModuleSubmitting ? 'Excluindo…' : 'Excluir módulo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
