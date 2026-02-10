import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminRedeIgrejas.css";
import { useAdminToast } from "../components/AdminToast";
import { usePlatformUserProfile } from "../hooks/usePlatformUserProfile";
import { supabaseAnonKey, supabaseUrl } from "../lib/supabaseClient";
import { normalizePhone } from "../utils/phone";
import {
  RedeHouseChurch,
  RedeHouseMember,
  RedeMember,
  RedeMemberApplication,
  RedeMemberGift,
  RedeMemberFollowupLog,
  RedeMemberQuestionnaire,
  RedeMinistryLeader,
  RedePresbitero,
  assignPresbiteroToHouse,
  createRedeHouseChurch,
  createRedeMember,
  createRedeMemberFollowupLog,
  createRedeMemberInvite,
  createRedeMinistryLeader,
  createRedePresbitero,
  deleteRedeHouseChurch,
  deleteRedeMember,
  deleteRedeMinistryLeader,
  deleteRedePresbitero,
  getRedeMemberByEmail,
  getRedeMemberByPhone,
  listRedeHouseChurches,
  listRedeHouseMembers,
  listRedeMemberApplications,
  listRedeMemberFollowupLogsAll,
  listRedeMemberFollowupLogs,
  listRedeMemberGifts,
  listRedeMemberQuestionnaires,
  listRedeMembers,
  listRedeMinistryLeaders,
  listRedePresbiteros,
  replaceRedeHouseMembers,
  replaceRedeMemberGifts,
  replaceRedeMemberHouse,
  updateRedeHouseChurch,
  updateRedeMember,
  updateRedeMemberApplication,
  updateRedeMinistryLeader,
  updateRedePresbitero,
  upsertRedeMemberQuestionnaire,
} from "../services/redeIgrejas";
import { updateUserMemberLink, updateUserRole } from "../services/userAccount";

const MINISTRY_OPTIONS = [
  { value: "apostolo", label: "Tenho identificação com o dom Apostólico" },
  { value: "profeta", label: "Tenho identificação com o dom Profético" },
  { value: "evangelista", label: "Tenho identificação com o dom Evangelístico" },
  { value: "pastor", label: "Tenho identificação com o dom Pastoral" },
  { value: "mestre", label: "Tenho identificação com o dom de Mestre" },
];

const MEMBER_TYPE_OPTIONS = [
  { value: "membro", label: "Membro" },
  { value: "visitante", label: "Visitante" },
  { value: "congregado", label: "Congregado" },
];

type MemberQuestionnaireForm = Omit<RedeMemberQuestionnaire, "member_id" | "created_at" | "updated_at">;

type MemberFormState = {
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  city: string;
  state: string;
  address: string;
  member_type: string;
  status: string;
  house_id: string;
  joined_at: string;
  notes: string;
};

type PresbiteroFormState = {
  member_id: string;
  house_id: string;
  since_date: string;
  status: string;
  notes: string;
};

type LeaderFormState = {
  member_id: string;
  ministry: string;
  region: string;
  status: string;
  notes: string;
};

type HouseFormState = {
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  meeting_day: string;
  meeting_time: string;
  capacity: string;
  status: string;
  presbitero_id: string;
  notes: string;
};

type QuestionnaireBoolField =
  | "wants_preach_house"
  | "wants_preach_network"
  | "wants_bible_study"
  | "wants_open_house"
  | "wants_be_presbitero"
  | "wants_be_ministry_leader"
  | "wants_discipleship"
  | "wants_serve_worship"
  | "wants_serve_intercession"
  | "wants_serve_children"
  | "wants_serve_media"
  | "wants_serve_hospitality"
  | "wants_serve_teaching"
  | "wants_serve_pastoral_care"
  | "wants_serve_practical_support"
  | "routine_bible_reading"
  | "routine_prayer"
  | "routine_fasting"
  | "routine_in_development"
  | "ministry_discernment"
  | "discipleship_current"
  | "discipleship_leads"
  | "available_for_training"
  | "available_for_missions";

type RedeSectionKey = "members" | "presbiteros" | "leaders" | "houses";

const LOCAL_CALLINGS: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "wants_preach_house", label: "Sente-se chamado a compartilhar a Palavra na Igreja na Casa" },
  { id: "wants_bible_study", label: "Deseja conduzir estudo bíblico nas casas" },
  { id: "wants_open_house", label: "Tem desejo de abrir sua casa para uma Igreja na Casa" },
  { id: "wants_be_presbitero", label: "Sente-se chamado a caminhar para o presbitério" },
  { id: "wants_discipleship", label: "Deseja caminhar e cuidar de pessoas no discipulado local" },
];

const NETWORK_CALLINGS: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "wants_preach_network", label: "Sente-se chamado a pregar para a rede" },
  { id: "wants_be_ministry_leader", label: "Sente-se chamado a servir na liderança dos 5 dons" },
  { id: "available_for_training", label: "Disponível para treinamento e capacitação na rede" },
  { id: "available_for_missions", label: "Disponível para missões e envios" },
];

const SERVICE_AREAS: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "wants_serve_worship", label: "Louvor e adoração" },
  { id: "wants_serve_intercession", label: "Intercessão" },
  { id: "wants_serve_children", label: "Ministério com crianças" },
  { id: "wants_serve_media", label: "Mídia e comunicação" },
  { id: "wants_serve_hospitality", label: "Hospitalidade e acolhimento" },
  { id: "wants_serve_teaching", label: "Ensino" },
  { id: "wants_serve_pastoral_care", label: "Cuidado pastoral" },
  { id: "wants_serve_practical_support", label: "Apoio prático" },
];

const SPIRITUAL_ROUTINE: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "routine_bible_reading", label: "Tenho rotina de leitura bíblica" },
  { id: "routine_prayer", label: "Tenho rotina de oração" },
  { id: "routine_fasting", label: "Pratico jejum regularmente" },
  { id: "routine_in_development", label: "Minha rotina espiritual está em desenvolvimento" },
];

const DISCIPLESHIP_STATUS: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "discipleship_current", label: "Já caminho em discipulado" },
  { id: "wants_discipleship", label: "Desejo caminhar em discipulado" },
  { id: "discipleship_leads", label: "Acompanho outras pessoas no discipulado" },
];

const VISIT_EXPERIENCE_LABELS: Record<string, string> = {
  culto_casa: "Participei de um culto na casa",
  estudo_biblico: "Participei de um estudo bíblico",
  convidado_alguem: "Fui convidado(a) por alguém",
  nao_participei: "Ainda não participei, mas gostaria",
  redes_sociais: "Conheci a igreja pelas redes sociais",
  nao_sei: "Não sei / prefiro não responder",
};

const CARE_NEEDS_LABELS: Record<string, string> = {
  caminhar: "Gostaria que alguém caminhasse comigo mais de perto",
  conversar_lideranca: "Gostaria de conversar com alguém da liderança",
  oracao: "Gostaria de receber oração",
  momento_dificil: "Estou passando por um momento difícil",
  apenas_conhecendo: "Apenas conhecendo por enquanto",
  nao_sei: "Não sei / prefiro não responder",
};

const FAITH_JOURNEY_LABELS: Record<string, string> = {
  novo_na_fe: "Sou novo(a) na fé cristã",
  quero_aprender: "Já sigo a Cristo, mas quero aprender mais",
  caminho_ha_tempo: "Já caminho com Jesus há algum tempo",
  retomando: "Estou retomando minha fé",
  tenho_duvidas: "Ainda tenho dúvidas sobre a fé cristã",
  prefiro_nao_informar: "Prefiro não informar agora",
};

const DOUBTS_INTERESTS_LABELS: Record<string, string> = {
  duvidas_biblicas: "Tenho dúvidas bíblicas",
  duvidas_teologicas: "Tenho dúvidas teológicas",
  duvidas_igreja_casas: "Tenho dúvidas sobre a Igreja nas Casas",
  entender_evangelho: "Gostaria de entender melhor o Evangelho",
  estudar_biblia: "Gostaria de estudar a Bíblia",
  nenhuma_duvida: "Não tenho dúvidas no momento",
};

const CONTACT_PREFERENCES_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  participar: "Prefiro apenas participar por enquanto",
  sem_contato: "Ainda não desejo contato",
  nao_sei: "Não sei / prefiro não responder",
};

const PREFERRED_CONTACT_CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
};

const CLOSE_REASON_LABELS: Record<string, string> = {
  virou_membro: "Virou membro",
  outra_igreja: "Caminhou para outra igreja",
  nao_cristao: "Não era cristão / não quis continuar",
  apenas_visitou: "Preferiu apenas visitar",
  sem_retorno: "Sem retorno / desistiu",
  outro: "Outro motivo",
};

const FOLLOWUP_CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "ligacao", label: "Ligação" },
  { value: "visita", label: "Visita" },
  { value: "presencial", label: "Presencial" },
  { value: "outro", label: "Outro" },
];

const FOLLOWUP_OUTCOMES = [
  { value: "contato_realizado", label: "Contato realizado" },
  { value: "sem_resposta", label: "Sem resposta" },
  { value: "reagendar", label: "Reagendar" },
  { value: "nao_interessado", label: "Não interessado" },
  { value: "outro", label: "Outro" },
];

const emptyQuestionnaire: MemberQuestionnaireForm = {
  wants_preach_house: false,
  wants_preach_network: false,
  wants_bible_study: false,
  wants_open_house: false,
  wants_be_presbitero: false,
  wants_be_ministry_leader: false,
  wants_discipleship: false,
  wants_serve_worship: false,
  wants_serve_intercession: false,
  wants_serve_children: false,
  wants_serve_media: false,
  wants_serve_hospitality: false,
  wants_serve_teaching: false,
  wants_serve_pastoral_care: false,
  wants_serve_practical_support: false,
  routine_bible_reading: false,
  routine_prayer: false,
  routine_fasting: false,
  routine_in_development: false,
  ministry_discernment: false,
  discipleship_current: false,
  discipleship_leads: false,
  available_for_training: false,
  available_for_missions: false,
  notes: "",
};

const emptyMemberForm: MemberFormState = {
  full_name: "",
  email: "",
  phone: "",
  birthdate: "",
  gender: "",
  city: "",
  state: "",
  address: "",
  member_type: "membro",
  status: "ativo",
  house_id: "",
  joined_at: "",
  notes: "",
};

const emptyPresbiteroForm: PresbiteroFormState = {
  member_id: "",
  house_id: "",
  since_date: "",
  status: "ativo",
  notes: "",
};

const emptyLeaderForm: LeaderFormState = {
  member_id: "",
  ministry: "",
  region: "",
  status: "ativo",
  notes: "",
};

const emptyHouseForm: HouseFormState = {
  name: "",
  city: "",
  neighborhood: "",
  address: "",
  meeting_day: "",
  meeting_time: "",
  capacity: "",
  status: "ativa",
  presbitero_id: "",
  notes: "",
};

const toNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

const toLocalDateTimeInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminRedeIgrejas() {
  const navigate = useNavigate();
  const toast = useAdminToast();
  const { profile: platformProfile } = usePlatformUserProfile();
  const auditMemberId = platformProfile?.memberId || null;
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<RedeMember[]>([]);
  const [presbiteros, setPresbiteros] = useState<RedePresbitero[]>([]);
  const [leaders, setLeaders] = useState<RedeMinistryLeader[]>([]);
  const [houses, setHouses] = useState<RedeHouseChurch[]>([]);
  const [houseMembers, setHouseMembers] = useState<RedeHouseMember[]>([]);
  const [memberGifts, setMemberGifts] = useState<RedeMemberGift[]>([]);
  const [questionnaires, setQuestionnaires] = useState<RedeMemberQuestionnaire[]>([]);
  const [applications, setApplications] = useState<RedeMemberApplication[]>([]);
  const [followupLogs, setFollowupLogs] = useState<RedeMemberFollowupLog[]>([]);
  const [connStatus, setConnStatus] = useState<string | null>(null);
  const [connTesting, setConnTesting] = useState(false);

  const [memberQuery, setMemberQuery] = useState("");
  const [memberHouseFilter, setMemberHouseFilter] = useState("__ALL__");
  const [memberPresbFilter, setMemberPresbFilter] = useState("__ALL__");

  const [memberForm, setMemberForm] = useState<MemberFormState>(emptyMemberForm);
  const [memberQuestionnaire, setMemberQuestionnaire] = useState<MemberQuestionnaireForm>(emptyQuestionnaire);
  const [memberGiftsSelected, setMemberGiftsSelected] = useState<string[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);

  const [presbiteroForm, setPresbiteroForm] = useState<PresbiteroFormState>(emptyPresbiteroForm);
  const [editingPresbiteroId, setEditingPresbiteroId] = useState<string | null>(null);
  const [presbiteroSaving, setPresbiteroSaving] = useState(false);

  const [leaderForm, setLeaderForm] = useState<LeaderFormState>(emptyLeaderForm);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [leaderSaving, setLeaderSaving] = useState(false);

  const [houseForm, setHouseForm] = useState<HouseFormState>(emptyHouseForm);
  const [houseMembersSelected, setHouseMembersSelected] = useState<string[]>([]);
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
  const [houseSaving, setHouseSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<RedeSectionKey>("members");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [presbiteroModalOpen, setPresbiteroModalOpen] = useState(false);
  const [leaderModalOpen, setLeaderModalOpen] = useState(false);
  const [houseModalOpen, setHouseModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCreating, setInviteCreating] = useState(false);
  const [inviteTypeModalOpen, setInviteTypeModalOpen] = useState(false);
  const [inviteType, setInviteType] = useState<string>("membro");
  const [inviteHouseId, setInviteHouseId] = useState<string>("");

  const [conversionApplication, setConversionApplication] = useState<RedeMemberApplication | null>(null);
  const [conversionCloseReason, setConversionCloseReason] = useState("");
  const [conversionNotes, setConversionNotes] = useState("");

  const [followupLogOpen, setFollowupLogOpen] = useState(false);
  const [followupLogApplication, setFollowupLogApplication] = useState<RedeMemberApplication | null>(null);
  const [followupLogEntries, setFollowupLogEntries] = useState<RedeMemberFollowupLog[]>([]);
  const [followupLogLoading, setFollowupLogLoading] = useState(false);
  const [followupLogSaving, setFollowupLogSaving] = useState(false);
  const [followupLogForm, setFollowupLogForm] = useState({
    contact_method: "",
    contacted_at: "",
    outcome: "",
    notes: "",
  });

  const [applicationHouseFilter, setApplicationHouseFilter] = useState("__ALL__");
  const [applicationResponsibleFilter, setApplicationResponsibleFilter] = useState("__ALL__");
  const [applicationPreferredContactFilter, setApplicationPreferredContactFilter] = useState("__ALL__");
  const [applicationOverdueFilter, setApplicationOverdueFilter] = useState("__ALL__");
  const [applicationDetailsOpen, setApplicationDetailsOpen] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState<RedeMemberApplication | null>(null);

  useEffect(() => {
    setMemberModalOpen(false);
    setPresbiteroModalOpen(false);
    setLeaderModalOpen(false);
    setHouseModalOpen(false);
    setInviteModalOpen(false);
    setInviteTypeModalOpen(false);
    setFollowupLogOpen(false);
    setApplicationDetailsOpen(false);
  }, [activeTab]);

  const handleTestConnection = useCallback(async () => {
    setConnTesting(true);
    setConnStatus(null);
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        setConnStatus("Env do Supabase está vazia.");
        return;
      }
      const response = await fetch(`${supabaseUrl}/rest/v1/rede_member?select=id&limit=1`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      const body = await response.text();
      setConnStatus(`${response.status} - ${body.slice(0, 140)}`);
    } catch (err: any) {
      setConnStatus(`Fetch falhou: ${err?.message || String(err)}`);
    } finally {
      setConnTesting(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const tasks = [
      { label: "membros", fn: listRedeMembers, setter: setMembers, empty: [] as RedeMember[] },
      { label: "presbíteros", fn: listRedePresbiteros, setter: setPresbiteros, empty: [] as RedePresbitero[] },
      { label: "líderes", fn: listRedeMinistryLeaders, setter: setLeaders, empty: [] as RedeMinistryLeader[] },
      { label: "casas", fn: listRedeHouseChurches, setter: setHouses, empty: [] as RedeHouseChurch[] },
      { label: "membros_casa", fn: listRedeHouseMembers, setter: setHouseMembers, empty: [] as RedeHouseMember[] },
      { label: "dons", fn: listRedeMemberGifts, setter: setMemberGifts, empty: [] as RedeMemberGift[] },
      { label: "questionários", fn: listRedeMemberQuestionnaires, setter: setQuestionnaires, empty: [] as RedeMemberQuestionnaire[] },
      { label: "solicitações", fn: listRedeMemberApplications, setter: setApplications, empty: [] as RedeMemberApplication[] },
      { label: "logs_acompanhamento", fn: listRedeMemberFollowupLogsAll, setter: setFollowupLogs, empty: [] as RedeMemberFollowupLog[] },
    ];

    const results = await Promise.allSettled(tasks.map((task) => task.fn()));
    const errors: string[] = [];

    results.forEach((result, index) => {
      const task = tasks[index];
      if (result.status === "fulfilled") {
        task.setter(result.value as any);
      } else {
        task.setter(task.empty as any);
        const message = result.reason?.message || String(result.reason);
        errors.push(`${task.label}: ${message}`);
        console.error("Falha ao carregar", task.label, result.reason);
      }
    });

    if (errors.length) {
      const message = errors.join(" | ");
      setError(message);
      toastRef.current.error("Não foi possível carregar", message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const giftLabelMap = useMemo(
    () => new Map(MINISTRY_OPTIONS.map((opt) => [opt.value, opt.label])),
    []
  );

  const houseMap = useMemo(() => new Map(houses.map((house) => [house.id, house])), [houses]);
  const presbiteroNameMap = useMemo(() => {
    const map = new Map<string, string>();
    presbiteros.forEach((presb) => {
      const name = presb.member?.full_name || "";
      if (name) map.set(presb.id, name);
    });
    return map;
  }, [presbiteros]);

  const memberGiftMap = useMemo(() => {
    const map = new Map<string, string[]>();
    memberGifts.forEach((gift) => {
      if (!map.has(gift.member_id)) map.set(gift.member_id, []);
      map.get(gift.member_id)?.push(gift.gift);
    });
    return map;
  }, [memberGifts]);

  const memberHouseMap = useMemo(() => {
    const map = new Map<string, RedeHouseMember>();
    houseMembers.forEach((item) => {
      const existing = map.get(item.member_id);
      if (!existing || item.is_primary) {
        map.set(item.member_id, item);
      }
    });
    return map;
  }, [houseMembers]);

  const houseMembersByHouse = useMemo(() => {
    const map = new Map<string, string[]>();
    houseMembers.forEach((item) => {
      if (!map.has(item.house_id)) map.set(item.house_id, []);
      map.get(item.house_id)?.push(item.member_id);
    });
    return map;
  }, [houseMembers]);

  const houseMemberCounts = useMemo(() => {
    const counts = new Map<string, number>();
    houseMembers.forEach((item) => {
      counts.set(item.house_id, (counts.get(item.house_id) || 0) + 1);
    });
    return counts;
  }, [houseMembers]);

  const openApplications = useMemo(
    () => applications.filter((app) => (app.status || "pendente") === "pendente"),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const now = Date.now();
    return openApplications.filter((app) => {
      const matchesHouse =
        applicationHouseFilter === "__ALL__" ||
        (applicationHouseFilter === "__NONE__" ? !app.house_id : app.house_id === applicationHouseFilter);
      const matchesResponsible =
        applicationResponsibleFilter === "__ALL__" ||
        (applicationResponsibleFilter === "__NONE__"
          ? !app.followup_assigned_member_id
          : app.followup_assigned_member_id === applicationResponsibleFilter);
      const channelKey = app.allow_contact === false
        ? "sem_contato"
        : app.preferred_contact_channel || "nao_informado";
      const matchesContact =
        applicationPreferredContactFilter === "__ALL__" || channelKey === applicationPreferredContactFilter;
      const nextContactAt = app.next_contact_at ? new Date(app.next_contact_at).getTime() : NaN;
      const isOverdue = Number.isFinite(nextContactAt) && nextContactAt < now;
      const matchesOverdue =
        applicationOverdueFilter === "__ALL__" || (applicationOverdueFilter === "atrasado" && isOverdue);
      return matchesHouse && matchesResponsible && matchesContact && matchesOverdue;
    });
  }, [
    openApplications,
    applicationHouseFilter,
    applicationResponsibleFilter,
    applicationPreferredContactFilter,
    applicationOverdueFilter,
  ]);

  const followupPending = useMemo(
    () => filteredApplications.filter((app) => (app.followup_status || "pendente") === "pendente"),
    [filteredApplications]
  );
  const followupActive = useMemo(
    () => filteredApplications.filter((app) => (app.followup_status || "pendente") === "em_acompanhamento"),
    [filteredApplications]
  );
  const followupClosed = useMemo(
    () => filteredApplications.filter((app) => (app.followup_status || "pendente") === "concluido"),
    [filteredApplications]
  );

  const visitorApplications = useMemo(
    () => applications.filter((app) => app.member_type === "visitante"),
    [applications]
  );

  const convertedVisitorApplications = useMemo(
    () => visitorApplications.filter((app) => Boolean(app.approved_member_id) || app.followup_closed_reason === "virou_membro"),
    [visitorApplications]
  );

  const conversionRate = useMemo(() => {
    if (!visitorApplications.length) return 0;
    return (convertedVisitorApplications.length / visitorApplications.length) * 100;
  }, [visitorApplications.length, convertedVisitorApplications.length]);

  const firstContactMap = useMemo(() => {
    const map = new Map<string, string>();
    followupLogs.forEach((log) => {
      if (!log.application_id || !log.contacted_at) return;
      const existing = map.get(log.application_id);
      if (!existing || new Date(log.contacted_at).getTime() < new Date(existing).getTime()) {
        map.set(log.application_id, log.contacted_at);
      }
    });
    return map;
  }, [followupLogs]);

  const averageFirstContactDays = useMemo(() => {
    const durations: number[] = [];
    visitorApplications.forEach((app) => {
      const firstContact = firstContactMap.get(app.id);
      if (!firstContact || !app.created_at) return;
      const start = new Date(app.created_at).getTime();
      const contact = new Date(firstContact).getTime();
      if (Number.isFinite(start) && Number.isFinite(contact) && contact >= start) {
        durations.push((contact - start) / (1000 * 60 * 60 * 24));
      }
    });
    if (!durations.length) return null;
    const sum = durations.reduce((acc, value) => acc + value, 0);
    return sum / durations.length;
  }, [visitorApplications, firstContactMap]);

  const closeReasonStats = useMemo(() => {
    const tally = new Map<string, number>();
    applications.forEach((app) => {
      const reason = app.followup_closed_reason;
      if (!reason) return;
      tally.set(reason, (tally.get(reason) || 0) + 1);
    });
    return Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [applications]);

  const conversionByHouse = useMemo(() => {
    const map = new Map<string, { key: string; total: number; converted: number; houseName: string }>();
    visitorApplications.forEach((app) => {
      const key = app.house_id || "__NONE__";
      const houseName = app.house_id ? houseMap.get(app.house_id)?.name || "Casa" : "Sem casa";
      const entry = map.get(key) || { key, total: 0, converted: 0, houseName };
      entry.total += 1;
      if (app.approved_member_id || app.followup_closed_reason === "virou_membro") {
        entry.converted += 1;
      }
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [visitorApplications, houseMap]);


  const questionnaireMap = useMemo(() => {
    const map = new Map<string, RedeMemberQuestionnaire>();
    questionnaires.forEach((item) => map.set(item.member_id, item));
    return map;
  }, [questionnaires]);

  const presbiteroHouseMap = useMemo(() => {
    const map = new Map<string, RedeHouseChurch>();
    houses.forEach((house) => {
      if (house.presbitero_id) map.set(house.presbitero_id, house);
    });
    return map;
  }, [houses]);

  const filteredMembers = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    return members.filter((member) => {
      const houseId = memberHouseMap.get(member.id)?.house_id || "";
      const house = houseMap.get(houseId);
      const presbiteroId = house?.presbitero_id || "";
      const presbName = presbiteroNameMap.get(presbiteroId) || "";
      const matchesQuery =
        !query ||
        member.full_name.toLowerCase().includes(query) ||
        (house?.name || "").toLowerCase().includes(query) ||
        presbName.toLowerCase().includes(query);
      const matchesHouse = memberHouseFilter === "__ALL__" || houseId === memberHouseFilter;
      const matchesPresb = memberPresbFilter === "__ALL__" || presbiteroId === memberPresbFilter;
      return matchesQuery && matchesHouse && matchesPresb;
    });
  }, [members, memberQuery, memberHouseFilter, memberPresbFilter, houseMap, memberHouseMap, presbiteroNameMap]);

  const resetMemberForm = () => {
    setMemberForm(emptyMemberForm);
    setMemberQuestionnaire(emptyQuestionnaire);
    setMemberGiftsSelected([]);
    setEditingMemberId(null);
    setConversionApplication(null);
    setConversionCloseReason("");
    setConversionNotes("");
  };

  const openMemberModal = () => {
    resetMemberForm();
    setMemberModalOpen(true);
  };

  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("pt-BR");
  };

  const formatOptionList = (values: string[] | null | undefined, labels: Record<string, string>) => {
    if (!values || !values.length) return "-";
    return values.map((value) => labels[value] || value).join(", ");
  };

  const openMemberModalFromApplication = (application: RedeMemberApplication, closeReason: string, notes: string) => {
    setMemberForm({
      full_name: application.full_name || "",
      email: application.email || "",
      phone: application.phone ? normalizePhone(application.phone) : "",
      birthdate: "",
      gender: "",
      city: application.city || "",
      state: application.state || "",
      address: application.address || "",
      member_type: "membro",
      status: "ativo",
      house_id: application.house_id || "",
      joined_at: "",
      notes: application.notes || "",
    });
    setMemberQuestionnaire(emptyQuestionnaire);
    setMemberGiftsSelected([]);
    setEditingMemberId(null);
    setConversionApplication(application);
    setConversionCloseReason(closeReason);
    setConversionNotes(notes);
    setMemberModalOpen(true);
  };

  const resetPresbiteroForm = () => {
    setPresbiteroForm(emptyPresbiteroForm);
    setEditingPresbiteroId(null);
  };

  const openPresbiteroModal = () => {
    resetPresbiteroForm();
    setPresbiteroModalOpen(true);
  };

  const resetLeaderForm = () => {
    setLeaderForm(emptyLeaderForm);
    setEditingLeaderId(null);
  };

  const openLeaderModal = () => {
    resetLeaderForm();
    setLeaderModalOpen(true);
  };

  const resetHouseForm = () => {
    setHouseForm(emptyHouseForm);
    setHouseMembersSelected([]);
    setEditingHouseId(null);
  };

  const openHouseModal = () => {
    resetHouseForm();
    setHouseModalOpen(true);
  };

  const toggleMemberGift = (gift: string) => {
    setMemberGiftsSelected((prev) =>
      prev.includes(gift) ? prev.filter((item) => item !== gift) : [...prev, gift]
    );
  };

  const toggleQuestion = (field: QuestionnaireBoolField) => {
    setMemberQuestionnaire((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const toggleHouseMemberSelection = (memberId: string) => {
    setHouseMembersSelected((prev) =>
      prev.includes(memberId) ? prev.filter((item) => item !== memberId) : [...prev, memberId]
    );
  };

  const handleEditMember = (member: RedeMember) => {
    setConversionApplication(null);
    setConversionCloseReason("");
    setConversionNotes("");
    const houseMember = memberHouseMap.get(member.id);
    const questionnaire = questionnaireMap.get(member.id);
    setMemberForm({
      full_name: member.full_name || "",
      email: member.email || "",
      phone: member.phone || "",
      birthdate: member.birthdate || "",
      gender: member.gender || "",
      city: member.city || "",
      state: member.state || "",
      address: member.address || "",
      member_type: member.member_type || "membro",
      status: member.status === "visitante" ? "em_acompanhamento" : (member.status || "ativo"),
      house_id: houseMember?.house_id || "",
      joined_at: houseMember?.joined_at || "",
      notes: member.notes || "",
    });
    setMemberQuestionnaire({
      wants_preach_house: questionnaire?.wants_preach_house ?? false,
      wants_preach_network: questionnaire?.wants_preach_network ?? false,
      wants_bible_study: questionnaire?.wants_bible_study ?? false,
      wants_open_house: questionnaire?.wants_open_house ?? false,
      wants_be_presbitero: questionnaire?.wants_be_presbitero ?? false,
      wants_be_ministry_leader: questionnaire?.wants_be_ministry_leader ?? false,
      wants_discipleship: questionnaire?.wants_discipleship ?? false,
      wants_serve_worship: questionnaire?.wants_serve_worship ?? false,
      wants_serve_intercession: questionnaire?.wants_serve_intercession ?? false,
      wants_serve_children: questionnaire?.wants_serve_children ?? false,
      wants_serve_media: questionnaire?.wants_serve_media ?? false,
      wants_serve_hospitality: questionnaire?.wants_serve_hospitality ?? false,
      wants_serve_teaching: questionnaire?.wants_serve_teaching ?? false,
      wants_serve_pastoral_care: questionnaire?.wants_serve_pastoral_care ?? false,
      wants_serve_practical_support: questionnaire?.wants_serve_practical_support ?? false,
      routine_bible_reading: questionnaire?.routine_bible_reading ?? false,
      routine_prayer: questionnaire?.routine_prayer ?? false,
      routine_fasting: questionnaire?.routine_fasting ?? false,
      routine_in_development: questionnaire?.routine_in_development ?? false,
      ministry_discernment: questionnaire?.ministry_discernment ?? false,
      discipleship_current: questionnaire?.discipleship_current ?? false,
      discipleship_leads: questionnaire?.discipleship_leads ?? false,
      available_for_training: questionnaire?.available_for_training ?? false,
      available_for_missions: questionnaire?.available_for_missions ?? false,
      notes: questionnaire?.notes || "",
    });
    setMemberGiftsSelected(memberGiftMap.get(member.id) || []);
    setEditingMemberId(member.id);
    setMemberModalOpen(true);
  };

  const handleDeleteMember = async (member: RedeMember) => {
    if (!window.confirm(`Excluir membro ${member.full_name}?`)) return;
    try {
      await deleteRedeMember(member.id);
      toast.success("Membro removido", "O cadastro foi removido.");
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível remover", err?.message || String(err));
    }
  };

  const handleEditPresbitero = (presbitero: RedePresbitero) => {
    const house = presbiteroHouseMap.get(presbitero.id);
    setPresbiteroForm({
      member_id: presbitero.member_id,
      house_id: house?.id || "",
      since_date: presbitero.since_date || "",
      status: presbitero.status || "ativo",
      notes: presbitero.notes || "",
    });
    setEditingPresbiteroId(presbitero.id);
    setPresbiteroModalOpen(true);
  };

  const handleDeletePresbitero = async (presbitero: RedePresbitero) => {
    const name = presbitero.member?.full_name || "presbítero";
    if (!window.confirm(`Excluir presbítero ${name}?`)) return;
    try {
      await deleteRedePresbitero(presbitero.id);
      toast.success("Presbítero removido", "O cadastro foi removido.");
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível remover", err?.message || String(err));
    }
  };

  const handleEditLeader = (leader: RedeMinistryLeader) => {
    setLeaderForm({
      member_id: leader.member_id,
      ministry: leader.ministry,
      region: leader.region || "",
      status: leader.status || "ativo",
      notes: leader.notes || "",
    });
    setEditingLeaderId(leader.id);
    setLeaderModalOpen(true);
  };

  const handleDeleteLeader = async (leader: RedeMinistryLeader) => {
    const name = leader.member?.full_name || "líder";
    if (!window.confirm(`Excluir líder ${name}?`)) return;
    try {
      await deleteRedeMinistryLeader(leader.id);
      toast.success("Líder removido", "O cadastro foi removido.");
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível remover", err?.message || String(err));
    }
  };

  const handleEditHouse = (house: RedeHouseChurch) => {
    const memberIds = houseMembersByHouse.get(house.id) || [];
    setHouseForm({
      name: house.name || "",
      city: house.city || "",
      neighborhood: house.neighborhood || "",
      address: house.address || "",
      meeting_day: house.meeting_day || "",
      meeting_time: house.meeting_time || "",
      capacity: house.capacity?.toString() || "",
      status: house.status || "ativa",
      presbitero_id: house.presbitero_id || "",
      notes: house.notes || "",
    });
    setHouseMembersSelected(memberIds);
    setEditingHouseId(house.id);
    setHouseModalOpen(true);
  };

  const handleDeleteHouse = async (house: RedeHouseChurch) => {
    if (!window.confirm(`Excluir casa ${house.name}?`)) return;
    try {
      await deleteRedeHouseChurch(house.id);
      toast.success("Casa removida", "O cadastro foi removido.");
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível remover", err?.message || String(err));
    }
  };

  const handleGenerateInvite = async (type: string) => {
    setInviteCreating(true);
    try {
      const token = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      const selectedHouse = inviteHouseId ? houseMap.get(inviteHouseId) : null;
      const presbiteroId = selectedHouse?.presbitero_id || null;
      const invite = await createRedeMemberInvite({
        token,
        status: "ativo",
        house_id: selectedHouse?.id || null,
        presbitero_id: presbiteroId,
        member_type: type,
        expires_at: null,
      });
      const link = `${window.location.origin}/#/rede/cadastro?token=${invite.token}`;
      setInviteLink(link);
      setInviteModalOpen(true);
    } catch (err: any) {
      toast.error("Não foi possível gerar link", err?.message || String(err));
    } finally {
      setInviteCreating(false);
    }
  };

  const handleApproveApplication = async (application: RedeMemberApplication) => {
    if (!window.confirm(`Aprovar cadastro de ${application.full_name}?`)) return;
    try {
      const existingByEmail = application.email ? await getRedeMemberByEmail(application.email) : null;
      const existingByPhone = !existingByEmail && application.phone ? await getRedeMemberByPhone(application.phone) : null;
      const existing = existingByEmail || existingByPhone;
      if (existing) {
        const matchedBy = existingByEmail ? "e-mail" : "telefone";
        const confirmLink = window.confirm(
          `Encontramos um membro com este ${matchedBy}: ${existing.full_name}. Deseja vincular este cadastro ao membro existente?`
        );
        if (confirmLink) {
          if (application.email) {
            try {
              await updateUserMemberLink(application.email, existing.id);
              await updateUserRole(application.email, "MEMBER");
            } catch {
              // ignore linkage failures
            }
          }
          await updateRedeMemberApplication(application.id, {
            status: "aprovado",
            reviewed_at: new Date().toISOString(),
            approved_member_id: existing.id,
            followup_status: "concluido",
            followup_closed_at: new Date().toISOString(),
            updated_by_member_id: auditMemberId,
          });
          toast.success("Cadastro aprovado", "Cadastro vinculado ao membro existente.");
          await loadAll();
          return;
        }
      }

      const member = await createRedeMember({
        full_name: application.full_name,
        email: application.email,
        phone: application.phone ? normalizePhone(application.phone) : null,
        birthdate: application.birthdate,
        gender: application.gender,
        city: application.city,
        state: application.state,
        address: application.address,
        member_type: application.member_type || "membro",
        status: "ativo",
        notes: application.notes,
        created_by_member_id: auditMemberId,
        updated_by_member_id: auditMemberId,
      });

      if (application.email) {
        try {
          await updateUserMemberLink(application.email, member.id);
          await updateUserRole(application.email, "MEMBER");
        } catch {
          // ignore linkage failures
        }
      }

      await replaceRedeMemberGifts(member.id, application.gifts || []);
      await replaceRedeMemberHouse(member.id, application.house_id || null, null);
      await upsertRedeMemberQuestionnaire({
        member_id: member.id,
        wants_preach_house: application.wants_preach_house,
        wants_preach_network: application.wants_preach_network,
        wants_bible_study: application.wants_bible_study,
        wants_open_house: application.wants_open_house,
        wants_be_presbitero: application.wants_be_presbitero,
        wants_be_ministry_leader: application.wants_be_ministry_leader,
        wants_discipleship: application.wants_discipleship,
        wants_serve_worship: application.wants_serve_worship,
        wants_serve_intercession: application.wants_serve_intercession,
        wants_serve_children: application.wants_serve_children,
        wants_serve_media: application.wants_serve_media,
        wants_serve_hospitality: application.wants_serve_hospitality,
        wants_serve_teaching: application.wants_serve_teaching,
        wants_serve_pastoral_care: application.wants_serve_pastoral_care,
        wants_serve_practical_support: application.wants_serve_practical_support,
        routine_bible_reading: application.routine_bible_reading,
        routine_prayer: application.routine_prayer,
        routine_fasting: application.routine_fasting,
        routine_in_development: application.routine_in_development,
        ministry_discernment: application.ministry_discernment,
        discipleship_current: application.discipleship_current,
        discipleship_leads: application.discipleship_leads,
        available_for_training: application.available_for_training,
        available_for_missions: application.available_for_missions,
        notes: application.notes,
      });

      await updateRedeMemberApplication(application.id, {
        status: "aprovado",
        reviewed_at: new Date().toISOString(),
        approved_member_id: member.id,
        followup_status: "concluido",
        followup_closed_at: new Date().toISOString(),
        updated_by_member_id: auditMemberId,
      });
      toast.success("Cadastro aprovado", "O membro foi adicionado à rede.");
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível aprovar", err?.message || String(err));
    }
  };

  const handleRejectApplication = async (application: RedeMemberApplication) => {
    if (!window.confirm(`Rejeitar cadastro de ${application.full_name}?`)) return;
    try {
      await updateRedeMemberApplication(application.id, {
        status: "rejeitado",
        reviewed_at: new Date().toISOString(),
        followup_status: "concluido",
        followup_closed_at: new Date().toISOString(),
        updated_by_member_id: auditMemberId,
      });
      toast.success("Cadastro rejeitado", "A solicitação foi marcada como rejeitada.");
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível rejeitar", err?.message || String(err));
    }
  };

  const [followupTab, setFollowupTab] = useState<"pendente" | "em_acompanhamento" | "concluido">("pendente");
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [followupCloseOpen, setFollowupCloseOpen] = useState(false);
  const [followupSelected, setFollowupSelected] = useState<RedeMemberApplication | null>(null);
  const [followupAssignedId, setFollowupAssignedId] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [followupCloseReason, setFollowupCloseReason] = useState("");
  const [followupSaving, setFollowupSaving] = useState(false);

  const openFollowupAssign = (application: RedeMemberApplication) => {
    setFollowupSelected(application);
    setFollowupAssignedId(application.followup_assigned_member_id || "");
    setFollowupNotes(application.followup_notes || "");
    setFollowupModalOpen(true);
  };

  const openFollowupClose = (application: RedeMemberApplication) => {
    setFollowupSelected(application);
    setFollowupCloseReason(application.followup_closed_reason || "");
    setFollowupNotes(application.followup_notes || "");
    setFollowupCloseOpen(true);
  };

  const resetFollowupLogForm = () => {
    setFollowupLogForm({
      contact_method: "",
      contacted_at: toLocalDateTimeInput(new Date()),
      outcome: "",
      notes: "",
    });
  };

  const openFollowupLog = async (application: RedeMemberApplication) => {
    setFollowupLogApplication(application);
    setFollowupLogOpen(true);
    setFollowupLogLoading(true);
    setFollowupLogEntries([]);
    resetFollowupLogForm();
    try {
      const logs = await listRedeMemberFollowupLogs(application.id);
      setFollowupLogEntries(logs);
    } catch (err: any) {
      toast.error("Não foi possível carregar registros", err?.message || String(err));
    } finally {
      setFollowupLogLoading(false);
    }
  };

  const openApplicationDetails = (application: RedeMemberApplication) => {
    setApplicationDetails(application);
    setApplicationDetailsOpen(true);
  };

  const handleFollowupAssign = async () => {
    if (!followupSelected) return;
    if (!followupAssignedId) {
      toast.warning("Informe o responsável", "Selecione o membro que vai acompanhar.");
      return;
    }
    setFollowupSaving(true);
    try {
      const now = new Date();
      const startedAt = followupSelected.followup_started_at || now.toISOString();
      const nextContactAt = followupSelected.next_contact_at || addDays(now, 3).toISOString();
      await updateRedeMemberApplication(followupSelected.id, {
        followup_status: "em_acompanhamento",
        followup_assigned_member_id: followupAssignedId,
        followup_notes: followupNotes || null,
        followup_started_at: startedAt,
        next_contact_at: nextContactAt,
        updated_by_member_id: auditMemberId,
      });
      toast.success("Acompanhamento iniciado", "Responsável definido.");
      setFollowupModalOpen(false);
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível atualizar", err?.message || String(err));
    } finally {
      setFollowupSaving(false);
    }
  };

  const handleFollowupClose = async () => {
    if (!followupSelected) return;
    if (!followupCloseReason) {
      toast.warning("Informe o motivo", "Selecione um motivo de encerramento.");
      return;
    }
    if (followupCloseReason === "virou_membro") {
      setFollowupCloseOpen(false);
      openMemberModalFromApplication(followupSelected, followupCloseReason, followupNotes || "");
      return;
    }
    setFollowupSaving(true);
    try {
      await updateRedeMemberApplication(followupSelected.id, {
        followup_status: "concluido",
        followup_closed_reason: followupCloseReason,
        followup_notes: followupNotes || null,
        followup_closed_at: new Date().toISOString(),
        updated_by_member_id: auditMemberId,
      });
      toast.success("Acompanhamento fechado", "O atendimento foi concluído.");
      setFollowupCloseOpen(false);
      await loadAll();
    } catch (err: any) {
      toast.error("Não foi possível atualizar", err?.message || String(err));
    } finally {
      setFollowupSaving(false);
    }
  };

  const handleFollowupLogSave = async () => {
    if (!followupLogApplication) return;
    if (!followupLogForm.contact_method) {
      toast.warning("Informe o contato", "Selecione como o contato foi feito.");
      return;
    }
    if (!followupLogForm.contacted_at) {
      toast.warning("Informe a data", "Selecione quando o contato aconteceu.");
      return;
    }
    setFollowupLogSaving(true);
    try {
      const contactedAt = new Date(followupLogForm.contacted_at);
      await createRedeMemberFollowupLog({
        application_id: followupLogApplication.id,
        contact_method: followupLogForm.contact_method,
        contacted_at: Number.isNaN(contactedAt.getTime()) ? null : contactedAt.toISOString(),
        outcome: followupLogForm.outcome || null,
        notes: followupLogForm.notes || null,
        created_by_member_id: auditMemberId,
      });
      const lastContactAt = Number.isNaN(contactedAt.getTime()) ? null : contactedAt.toISOString();
      const nextContactAt = Number.isNaN(contactedAt.getTime()) ? null : addDays(contactedAt, 7).toISOString();
      const nextAttempts = (followupLogApplication.contact_attempts || 0) + 1;
      await updateRedeMemberApplication(followupLogApplication.id, {
        last_contact_at: lastContactAt,
        next_contact_at: nextContactAt,
        contact_attempts: nextAttempts,
        updated_by_member_id: auditMemberId,
      });
      setFollowupLogApplication((prev) => prev ? ({ ...prev, last_contact_at: lastContactAt, next_contact_at: nextContactAt, contact_attempts: nextAttempts }) : prev);
      const logs = await listRedeMemberFollowupLogs(followupLogApplication.id);
      setFollowupLogEntries(logs);
      resetFollowupLogForm();
      toast.success("Contato registrado", "O acompanhamento foi atualizado.");
    } catch (err: any) {
      toast.error("Não foi possível salvar", err?.message || String(err));
    } finally {
      setFollowupLogSaving(false);
    }
  };

  const handleMemberSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberForm.full_name.trim()) {
      toast.warning("Informe o nome", "Preencha o nome do membro para continuar.");
      return;
    }
    setMemberSaving(true);
    try {
      const payload = {
        full_name: memberForm.full_name.trim(),
        email: toNull(memberForm.email),
        phone: toNull(normalizePhone(memberForm.phone)),
        birthdate: toNull(memberForm.birthdate),
        gender: toNull(memberForm.gender),
        city: toNull(memberForm.city),
        state: toNull(memberForm.state),
        address: toNull(memberForm.address),
        member_type: toNull(memberForm.member_type) || "membro",
        status: toNull(memberForm.status) || "ativo",
        notes: toNull(memberForm.notes),
        updated_by_member_id: auditMemberId,
      };

      let memberId = editingMemberId;
      if (editingMemberId) {
        await updateRedeMember(editingMemberId, payload);
      } else {
        const created = await createRedeMember({
          ...payload,
          created_by_member_id: auditMemberId,
        });
        memberId = created.id;
      }

      if (!memberId) throw new Error("Falha ao obter membro.");

      await replaceRedeMemberGifts(memberId, memberGiftsSelected);
      await replaceRedeMemberHouse(memberId, memberForm.house_id || null, toNull(memberForm.joined_at));

      await upsertRedeMemberQuestionnaire({
        member_id: memberId,
        ...memberQuestionnaire,
        notes: toNull(memberQuestionnaire.notes || ""),
      });

      if (conversionApplication) {
        await updateRedeMemberApplication(conversionApplication.id, {
          status: "aprovado",
          reviewed_at: new Date().toISOString(),
          approved_member_id: memberId,
          followup_status: "concluido",
          followup_closed_reason: conversionCloseReason || "virou_membro",
          followup_notes: toNull(conversionNotes || ""),
          followup_closed_at: new Date().toISOString(),
          updated_by_member_id: auditMemberId,
        });
      }

      toast.success("Cadastro salvo", "Os dados do membro foram atualizados.");
      resetMemberForm();
      await loadAll();
      setMemberModalOpen(false);
    } catch (err: any) {
      toast.error("Não foi possível salvar", err?.message || String(err));
    } finally {
      setMemberSaving(false);
    }
  };

  const handlePresbiteroSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!presbiteroForm.member_id) {
      toast.warning("Informe o membro", "Selecione o membro para criar o presbítero.");
      return;
    }
    setPresbiteroSaving(true);
    try {
      const payload = {
        member_id: presbiteroForm.member_id,
        since_date: toNull(presbiteroForm.since_date),
        status: toNull(presbiteroForm.status) || "ativo",
        notes: toNull(presbiteroForm.notes),
      };

      let presbiteroId = editingPresbiteroId;
      if (editingPresbiteroId) {
        await updateRedePresbitero(editingPresbiteroId, payload);
      } else {
        const created = await createRedePresbitero(payload);
        presbiteroId = created.id;
      }

      if (!presbiteroId) throw new Error("Falha ao obter presbítero.");

      await assignPresbiteroToHouse(presbiteroId, presbiteroForm.house_id || null);

      toast.success("Presbítero salvo", "O cadastro foi atualizado.");
      resetPresbiteroForm();
      await loadAll();
      setPresbiteroModalOpen(false);
    } catch (err: any) {
      toast.error("Não foi possível salvar", err?.message || String(err));
    } finally {
      setPresbiteroSaving(false);
    }
  };

  const handleLeaderSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!leaderForm.member_id || !leaderForm.ministry) {
      toast.warning("Informe os dados", "Selecione o membro e o ministério.");
      return;
    }
    setLeaderSaving(true);
    try {
      const payload = {
        member_id: leaderForm.member_id,
        ministry: leaderForm.ministry,
        region: toNull(leaderForm.region),
        status: toNull(leaderForm.status) || "ativo",
        notes: toNull(leaderForm.notes),
      };

      if (editingLeaderId) {
        await updateRedeMinistryLeader(editingLeaderId, payload);
      } else {
        await createRedeMinistryLeader(payload);
      }

      toast.success("Líder salvo", "O cadastro foi atualizado.");
      resetLeaderForm();
      await loadAll();
      setLeaderModalOpen(false);
    } catch (err: any) {
      toast.error("Não foi possível salvar", err?.message || String(err));
    } finally {
      setLeaderSaving(false);
    }
  };

  const handleHouseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!houseForm.name.trim()) {
      toast.warning("Informe o nome", "Preencha o nome da casa para continuar.");
      return;
    }
    setHouseSaving(true);
    try {
      const payload = {
        name: houseForm.name.trim(),
        city: toNull(houseForm.city),
        neighborhood: toNull(houseForm.neighborhood),
        address: toNull(houseForm.address),
        meeting_day: toNull(houseForm.meeting_day),
        meeting_time: toNull(houseForm.meeting_time),
        capacity: toNumberOrNull(houseForm.capacity),
        status: toNull(houseForm.status) || "ativa",
        presbitero_id: toNull(houseForm.presbitero_id),
        notes: toNull(houseForm.notes),
      };

      let houseId = editingHouseId;
      if (editingHouseId) {
        await updateRedeHouseChurch(editingHouseId, payload);
      } else {
        const created = await createRedeHouseChurch(payload);
        houseId = created.id;
      }

      if (!houseId) throw new Error("Falha ao obter casa.");

      await replaceRedeHouseMembers(houseId, houseMembersSelected);

      toast.success("Casa salva", "O cadastro foi atualizado.");
      resetHouseForm();
      await loadAll();
      setHouseModalOpen(false);
    } catch (err: any) {
      toast.error("Não foi possível salvar", err?.message || String(err));
    } finally {
      setHouseSaving(false);
    }
  };

  const selectedMemberHouse = memberForm.house_id ? houseMap.get(memberForm.house_id) : null;
  const selectedInviteHouse = inviteHouseId ? houseMap.get(inviteHouseId) : null;
  const selectedInvitePresbName = selectedInviteHouse?.presbitero_id
    ? presbiteroNameMap.get(selectedInviteHouse.presbitero_id) || "-"
    : "-";
  const selectedPresbName = selectedMemberHouse?.presbitero_id
    ? presbiteroNameMap.get(selectedMemberHouse.presbitero_id) || "-"
    : "-";

  return (
    <div className="admin-wrap rede-wrap">
      <header className="admin-header">
        <div className="admin-header-text">
          <span className="admin-pill">Rede de Igrejas</span>
          <h1 className="admin-title">Rede de Igrejas nas Casas</h1>
          <p className="admin-subtitle">
            Estruture cadastros, vínculos e acompanhamento da rede. Os presbíteros lideram as casas e os membros compõem a rede.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/administracao")}>Voltar ao hub</button>
        </div>
      </header>

      {import.meta.env.DEV && (
        <section className="admin-section rede-debug">
          <div className="rede-debug-row">
            <div>
              <div className="rede-debug-label">Supabase URL</div>
              <div className="rede-debug-value">{supabaseUrl || "(vazio)"}</div>
            </div>
            <div>
              <div className="rede-debug-label">Anon key</div>
              <div className="rede-debug-value">
                {supabaseAnonKey
                  ? `***${supabaseAnonKey.slice(-6)} (${supabaseAnonKey.length})`
                  : "(vazio)"}
              </div>
            </div>
            <button
              className="admin-btn admin-btn--outline"
              type="button"
              onClick={handleTestConnection}
              disabled={connTesting}
            >
              {connTesting ? "Testando..." : "Testar conexão"}
            </button>
          </div>
          {connStatus && <div className="rede-debug-status">Resposta: {connStatus}</div>}
        </section>
      )}

      <section className="admin-section admin-section--kpis">
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-icon stat-icon--members" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Membros</div>
              <div className="stat-number">{members.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--church" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Igrejas nas casas</div>
              <div className="stat-number">{houses.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--engagement" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Presbíteros</div>
              <div className="stat-number">{presbiteros.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--responses" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Líderes 5 ministérios</div>
              <div className="stat-number">{leaders.length}</div>
            </div>
          </div>
        </div>
      </section>

      <nav className="rede-tabs" aria-label="Cadastros da rede">
        {[
          { key: "members", label: "Membros", count: members.length, icon: "members" },
          { key: "houses", label: "Igrejas nas casas", count: houses.length, icon: "houses" },
          { key: "presbiteros", label: "Presbíteros", count: presbiteros.length, icon: "presbiteros" },
          { key: "leaders", label: "Líderes 5 ministérios", count: leaders.length, icon: "leaders" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`rede-tab ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.key as RedeSectionKey)}
          >
            <span className={`rede-tab-icon rede-tab-icon--${tab.icon}`} aria-hidden="true" />
            <span className="rede-tab-label">{tab.label}</span>
            <span className="rede-tab-count">{tab.count}</span>
          </button>
        ))}
      </nav>

      {loading && <p className="admin-msg">Carregando...</p>}
      {!loading && error && <p className="admin-msg admin-msg--error">Erro: {error}</p>}

      {activeTab === "members" && (
        <section className="admin-section rede-section rede-block">
          <div className="rede-block-header">
            <div className="rede-title">
              <span className="rede-title-icon rede-title-icon--members" aria-hidden="true" />
              <div>
                <div className="rede-title-row">
                  <h2 className="admin-h2">Cadastro de Membros</h2>
                  <span className="rede-title-count">{members.length} membros</span>
                </div>
                <p className="rede-subtitle">Filtre por casa e presbítero para acompanhar os membros da rede.</p>
              </div>
            </div>
            <div className="rede-section-actions">
              <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
              <button
                className="admin-btn admin-btn--outline"
                onClick={() => {
                  setInviteType("membro");
                  setInviteHouseId("");
                  setInviteTypeModalOpen(true);
                }}
                disabled={inviteCreating}
              >
                {inviteCreating ? "Gerando..." : "Gerar link de cadastro"}
              </button>
              <button className="admin-btn admin-btn--primary" onClick={openMemberModal}>+ Novo membro</button>
            </div>
          </div>

          <div className="rede-grid">
            <article className="rede-card rede-card--wide">
              <div className="rede-card-head">
                <h3>Membros da rede</h3>
                <span className="rede-badge">{filteredMembers.length} registros</span>
              </div>

            <div className="admin-search rede-search">
              <div className="admin-search-field">
                <label className="admin-field-label" htmlFor="memberSearch">Buscar</label>
                <input
                  id="memberSearch"
                  className="admin-search-input"
                  value={memberQuery}
                  onChange={(event) => setMemberQuery(event.target.value)}
                  placeholder="Nome, casa ou presbítero"
                />
              </div>
              <div className="admin-filter-field">
                <label className="admin-field-label" htmlFor="memberHouse">Casa</label>
                <select
                  id="memberHouse"
                  className="admin-filter-select"
                  value={memberHouseFilter}
                  onChange={(event) => setMemberHouseFilter(event.target.value)}
                >
                  <option value="__ALL__">Todas as casas</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-filter-field">
                <label className="admin-field-label" htmlFor="memberPresb">Presbítero</label>
                <select
                  id="memberPresb"
                  className="admin-filter-select"
                  value={memberPresbFilter}
                  onChange={(event) => setMemberPresbFilter(event.target.value)}
                >
                  <option value="__ALL__">Todos os presbíteros</option>
                  {presbiteros.map((presb) => (
                    <option key={presb.id} value={presb.id}>{presb.member?.full_name || "(Sem nome)"}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rede-table-wrap">
              <table className="admin-table rede-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="admin-th">Membro</th>
                    <th className="admin-th">Tipo</th>
                    <th className="admin-th">Casa</th>
                    <th className="admin-th">Presbítero</th>
                    <th className="admin-th">Dom</th>
                    <th className="admin-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const houseId = memberHouseMap.get(member.id)?.house_id || "";
                    const house = houseMap.get(houseId);
                    const presbName = house?.presbitero_id ? presbiteroNameMap.get(house.presbitero_id) : null;
                    const gifts = memberGiftMap.get(member.id) || [];
                    return (
                      <tr key={member.id} className="admin-row">
                        <td className="admin-td">
                          <div className="rede-member-name">{member.full_name}</div>
                          <span className="rede-muted">{member.status || "ativo"}</span>
                        </td>
                        <td className="admin-td">
                          {MEMBER_TYPE_OPTIONS.find((opt) => opt.value === member.member_type)?.label || member.member_type || "-"}
                        </td>
                        <td className="admin-td">{house?.name || "-"}</td>
                        <td className="admin-td">{presbName || "-"}</td>
                        <td className="admin-td">
                          {gifts.length ? gifts.map((gift) => giftLabelMap.get(gift) || gift).join(", ") : "-"}
                        </td>
                        <td className="admin-td">
                          <div className="rede-actions">
                            <button className="admin-chip admin-chip--ghost" onClick={() => handleEditMember(member)}>Editar</button>
                            <button className="admin-chip rede-chip-danger" onClick={() => handleDeleteMember(member)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredMembers.length && (
                    <tr className="admin-row admin-row-empty">
                      <td className="admin-td admin-empty" colSpan={6}>
                        <div className="admin-empty-state">
                          <span className="admin-empty-title">Nenhum membro encontrado</span>
                          <span className="admin-empty-sub">Ajuste os filtros para continuar.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </article>

            <article className="rede-card rede-card--wide">
              <div className="rede-card-head">
                <div className="rede-card-title">
                  <h3>Solicitações</h3>
                  <span className="rede-badge">{followupPending.length} pendentes</span>
                </div>
                <div className="rede-tab-inline">
                  <button
                    className={`admin-chip ${followupTab === "pendente" ? "admin-chip--active" : "admin-chip--ghost"}`}
                    onClick={() => setFollowupTab("pendente")}
                  >
                    Pendentes
                  </button>
                  <button
                    className={`admin-chip ${followupTab === "em_acompanhamento" ? "admin-chip--active" : "admin-chip--ghost"}`}
                    onClick={() => setFollowupTab("em_acompanhamento")}
                  >
                    Em acompanhamento
                  </button>
                  <button
                    className={`admin-chip ${followupTab === "concluido" ? "admin-chip--active" : "admin-chip--ghost"}`}
                    onClick={() => setFollowupTab("concluido")}
                  >
                    Concluídos
                  </button>
                </div>
              </div>
              <div className="rede-filter-row">
                <label className="admin-field">Casa
                  <select
                    className="admin-input"
                    value={applicationHouseFilter}
                    onChange={(event) => setApplicationHouseFilter(event.target.value)}
                  >
                    <option value="__ALL__">Todas</option>
                    <option value="__NONE__">Sem casa</option>
                    {houses.map((house) => (
                      <option key={house.id} value={house.id}>{house.name}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">Responsável
                  <select
                    className="admin-input"
                    value={applicationResponsibleFilter}
                    onChange={(event) => setApplicationResponsibleFilter(event.target.value)}
                  >
                    <option value="__ALL__">Todos</option>
                    <option value="__NONE__">Sem responsável</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.full_name}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">Preferência de contato
                  <select
                    className="admin-input"
                    value={applicationPreferredContactFilter}
                    onChange={(event) => setApplicationPreferredContactFilter(event.target.value)}
                  >
                    <option value="__ALL__">Todas</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligacao">Ligação</option>
                    <option value="sem_contato">Não deseja contato</option>
                    <option value="nao_informado">Não informado</option>
                  </select>
                </label>
                <label className="admin-field">Prioridade
                  <select
                    className="admin-input"
                    value={applicationOverdueFilter}
                    onChange={(event) => setApplicationOverdueFilter(event.target.value)}
                  >
                    <option value="__ALL__">Todas</option>
                    <option value="atrasado">Atrasados</option>
                  </select>
                </label>
              </div>
              <div className="rede-table-wrap">
                <table className="admin-table rede-table">
                  <thead>
                    <tr className="admin-thead-row">
                      <th className="admin-th">Nome</th>
                      <th className="admin-th">Tipo</th>
                      <th className="admin-th">Contato</th>
                      <th className="admin-th">Casa</th>
                      <th className="admin-th">Responsável</th>
                      <th className="admin-th">Status</th>
                      <th className="admin-th">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(followupTab === "pendente" ? followupPending : followupTab === "em_acompanhamento" ? followupActive : followupClosed).map((application) => {
                      const house = application.house_id ? houseMap.get(application.house_id) : null;
                      const typeLabel = MEMBER_TYPE_OPTIONS.find((opt) => opt.value === application.member_type)?.label;
                      const isVisitor = application.member_type === "visitante";
                      const assignedName = application.followup_assigned_member_id
                        ? members.find((m) => m.id === application.followup_assigned_member_id)?.full_name
                        : "-";
                      return (
                        <tr key={application.id} className="admin-row">
                          <td className="admin-td">
                            <div className="rede-member-name">{application.full_name}</div>
                            <span className="rede-muted">{application.city || "-"}</span>
                          </td>
                          <td className="admin-td">{typeLabel || application.member_type || "-"}</td>
                          <td className="admin-td">{application.phone || application.email || "-"}</td>
                          <td className="admin-td">{house?.name || (isVisitor ? "Ainda não participou" : "-")}</td>
                          <td className="admin-td">{assignedName}</td>
                          <td className="admin-td">{application.followup_status || "pendente"}</td>
                          <td className="admin-td">
                            <div className="rede-actions">
                              <button className="admin-chip admin-chip--ghost" onClick={() => openApplicationDetails(application)}>
                                Detalhes
                              </button>
                              {followupTab === "pendente" ? (
                                <>
                                  {isVisitor ? (
                                    <button className="admin-chip admin-chip--ghost" onClick={() => openFollowupAssign(application)}>
                                      Acompanhar
                                    </button>
                                  ) : (
                                    <>
                                      <button className="admin-chip admin-chip--ghost" onClick={() => handleApproveApplication(application)}>Aceitar</button>
                                      <button className="admin-chip rede-chip-danger" onClick={() => handleRejectApplication(application)}>Rejeitar</button>
                                    </>
                                  )}
                                </>
                              ) : followupTab === "em_acompanhamento" ? (
                                <>
                                  <button className="admin-chip admin-chip--ghost" onClick={() => openFollowupLog(application)}>
                                    Registrar contato
                                  </button>
                                  <button className="admin-chip admin-chip--ghost" onClick={() => openFollowupClose(application)}>
                                    Concluir
                                  </button>
                                </>
                              ) : (
                                <span className="rede-muted">Concluído</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!(followupTab === "pendente" ? followupPending : followupTab === "em_acompanhamento" ? followupActive : followupClosed).length && (
                      <tr className="admin-row admin-row-empty">
                        <td className="admin-td admin-empty" colSpan={7}>
                          <div className="admin-empty-state">
                            <span className="admin-empty-title">Nenhuma solicitação encontrada</span>
                            <span className="admin-empty-sub">Selecione outra aba para ver mais solicitações.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rede-card rede-card--wide">
              <div className="rede-card-head">
                <div className="rede-card-title">
                  <h3>Relatórios de acompanhamento</h3>
                </div>
              </div>
              <div className="rede-metrics">
                <div className="rede-metric">
                  <span className="rede-metric-title">Conversão visitante → membro</span>
                  <strong>{conversionRate.toFixed(1)}%</strong>
                  <span className="rede-metric-sub">{convertedVisitorApplications.length} de {visitorApplications.length}</span>
                </div>
                <div className="rede-metric">
                  <span className="rede-metric-title">Tempo médio até 1º contato</span>
                  <strong>{averageFirstContactDays === null ? "-" : `${averageFirstContactDays.toFixed(1)} dias`}</strong>
                  <span className="rede-metric-sub">Baseado em visitantes com registro</span>
                </div>
                <div className="rede-metric">
                  <span className="rede-metric-title">Motivos mais comuns</span>
                  {closeReasonStats.length ? (
                    <ul className="rede-metric-list">
                    {closeReasonStats.map(([reason, count]) => (
                        <li key={reason}>{CLOSE_REASON_LABELS[reason] || reason} ({count})</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="rede-metric-sub">Sem registros</span>
                  )}
                </div>
              </div>

              <div className="rede-metric-table">
                <div className="rede-metric-table-title">Conversão por casa</div>
                {conversionByHouse.length ? (
                  <div className="rede-metric-table-body">
                    {conversionByHouse.map((item) => {
                      const pct = item.total ? (item.converted / item.total) * 100 : 0;
                      return (
                        <div key={item.key} className="rede-metric-row">
                          <span>{item.houseName}</span>
                          <span>{item.converted}/{item.total}</span>
                          <span>{pct.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="rede-metric-sub">Sem dados de visitantes por casa.</span>
                )}
              </div>
            </article>
          </div>
        </section>
      )}

      {memberModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setMemberModalOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>{editingMemberId ? "Editar membro" : conversionApplication ? "Converter visitante em membro" : "Novo cadastro de membro"}</h3>
                <p className="rede-muted">Preencha os dados e salve o cadastro do membro.</p>
                {conversionApplication && (
                  <p className="rede-muted">Visitante: {conversionApplication.full_name}</p>
                )}
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setMemberModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <form className="rede-form" onSubmit={handleMemberSubmit}>
                <div className="rede-form-grid">
                  <label className="admin-field">Nome completo
                    <input
                      className="admin-input"
                      type="text"
                      value={memberForm.full_name}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, full_name: event.target.value }))}
                      placeholder="Ex.: Maria Souza"
                    />
                  </label>
                  <label className="admin-field">E-mail
                    <input
                      className="admin-input"
                      type="email"
                      value={memberForm.email}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="email@dominio.com"
                    />
                  </label>
                  <label className="admin-field">Telefone
                    <input
                      className="admin-input"
                      type="tel"
                      value={memberForm.phone}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="(83) 9 9999-9999"
                    />
                  </label>
                  <label className="admin-field">Data de nascimento
                    <input
                      className="admin-input"
                      type="date"
                      value={memberForm.birthdate}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, birthdate: event.target.value }))}
                    />
                  </label>
                  <label className="admin-field">Gênero
                    <select
                      className="admin-input"
                      value={memberForm.gender}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, gender: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </label>
                  <label className="admin-field">Cidade
                    <input
                      className="admin-input"
                      type="text"
                      value={memberForm.city}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="Campina Grande"
                    />
                  </label>
                  <label className="admin-field">Estado
                    <input
                      className="admin-input"
                      type="text"
                      value={memberForm.state}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, state: event.target.value }))}
                      placeholder="PB"
                    />
                  </label>
                <label className="admin-field">Endereço
                  <input
                    className="admin-input"
                    type="text"
                    value={memberForm.address}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder="Rua, número"
                  />
                </label>
                <label className="admin-field">Tipo
                  <select
                    className="admin-input"
                    value={memberForm.member_type}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, member_type: event.target.value }))}
                  >
                    {MEMBER_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">Casa vinculada
                  <select
                    className="admin-input"
                    value={memberForm.house_id}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, house_id: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {houses.map((house) => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Presbítero da casa
                    <input className="admin-input" type="text" value={selectedPresbName} disabled />
                  </label>
                  <label className="admin-field">Status
                    <select
                      className="admin-input"
                      value={memberForm.status}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="em_acompanhamento">Em acompanhamento</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </label>
                  <label className="admin-field">Data de entrada
                    <input
                      className="admin-input"
                      type="date"
                      value={memberForm.joined_at}
                      onChange={(event) => setMemberForm((prev) => ({ ...prev, joined_at: event.target.value }))}
                    />
                  </label>
                </div>

                <details className="rede-accordion" open>
                  <summary>Chamado ministerial (em discernimento)</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      <label className="rede-check">
                        <input
                          type="checkbox"
                          name="ministry_discernment"
                          checked={memberQuestionnaire.ministry_discernment}
                          onChange={() => toggleQuestion("ministry_discernment")}
                        />
                        Ainda estou em processo de discernimento
                      </label>
                      {MINISTRY_OPTIONS.map((option) => (
                        <label key={option.value} className="rede-check">
                          <input
                            type="checkbox"
                            name="ministerial_gift"
                            value={option.value}
                            checked={memberGiftsSelected.includes(option.value)}
                            onChange={() => toggleMemberGift(option.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="rede-accordion">
                  <summary>Serviço e liderança local na Igreja na Casa</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {LOCAL_CALLINGS.map((question) => (
                        <label key={question.id} className="rede-check">
                          <input
                            type="checkbox"
                            name={question.id}
                            checked={memberQuestionnaire[question.id]}
                            onChange={() => toggleQuestion(question.id)}
                          />
                          {question.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="rede-accordion">
                  <summary>Serviço e envio para a Rede</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {NETWORK_CALLINGS.map((question) => (
                        <label key={question.id} className="rede-check">
                          <input
                            type="checkbox"
                            name={question.id}
                            checked={memberQuestionnaire[question.id]}
                            onChange={() => toggleQuestion(question.id)}
                          />
                          {question.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="rede-accordion">
                  <summary>Áreas de serviço</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {SERVICE_AREAS.map((area) => (
                        <label key={area.id} className="rede-check">
                          <input
                            type="checkbox"
                            name={area.id}
                            checked={memberQuestionnaire[area.id]}
                            onChange={() => toggleQuestion(area.id)}
                          />
                          {area.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="rede-accordion">
                  <summary>Rotina espiritual</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {SPIRITUAL_ROUTINE.map((item) => (
                        <label key={item.id} className="rede-check">
                          <input
                            type="checkbox"
                            name={item.id}
                            checked={memberQuestionnaire[item.id]}
                            onChange={() => toggleQuestion(item.id)}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="rede-accordion">
                  <summary>Situação de discipulado</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {DISCIPLESHIP_STATUS.map((item) => (
                        <label key={item.id} className="rede-check">
                          <input
                            type="checkbox"
                            name={item.id}
                            checked={memberQuestionnaire[item.id]}
                            onChange={() => toggleQuestion(item.id)}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <label className="admin-field">Partilha pastoral
                  <textarea
                    className="admin-input rede-textarea"
                    rows={3}
                    value={memberForm.notes}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Conte sobre sua caminhada, dons em discernimento ou necessidades"
                  />
                </label>

                <div className="rede-form-actions">
                  <button className="admin-btn admin-btn--outline" type="button" onClick={resetMemberForm}>
                    {editingMemberId ? "Cancelar edição" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={memberSaving}>
                    {memberSaving ? "Salvando..." : editingMemberId ? "Salvar alterações" : "Salvar cadastro"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {inviteModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setInviteModalOpen(false)}>
          <div className="rede-modal rede-modal--compact" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>Link de cadastro gerado</h3>
                <p className="rede-muted">Envie este link para o membro preencher o cadastro.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setInviteModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <div className="rede-link-box">
                <input className="admin-input" value={inviteLink || ""} readOnly />
                <button
                  className="admin-btn admin-btn--primary"
                  type="button"
                  onClick={() => inviteLink && navigator.clipboard?.writeText(inviteLink)}
                  disabled={!inviteLink}
                >
                  Copiar link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {followupModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setFollowupModalOpen(false)}>
          <div className="rede-modal rede-modal--compact" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>Definir responsável</h3>
                <p className="rede-muted">Escolha quem vai acompanhar este visitante.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setFollowupModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <label className="admin-field">Responsável pelo acompanhamento
                <select
                  className="admin-input"
                  value={followupAssignedId}
                  onChange={(event) => setFollowupAssignedId(event.target.value)}
                >
                  <option value="">Selecione</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.full_name}</option>
                  ))}
                </select>
              </label>
              <label className="admin-field">Observação pastoral
                <textarea
                  className="admin-input rede-textarea"
                  rows={3}
                  value={followupNotes}
                  onChange={(event) => setFollowupNotes(event.target.value)}
                  placeholder="Anote algo importante para o acompanhamento"
                />
              </label>
              <div className="rede-form-actions">
                <button className="admin-btn admin-btn--outline" type="button" onClick={() => setFollowupModalOpen(false)}>
                  Cancelar
                </button>
                <button className="admin-btn admin-btn--primary" type="button" onClick={handleFollowupAssign} disabled={followupSaving}>
                  {followupSaving ? "Salvando..." : "Iniciar acompanhamento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {followupCloseOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setFollowupCloseOpen(false)}>
          <div className="rede-modal rede-modal--compact" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>Concluir acompanhamento</h3>
                <p className="rede-muted">Informe o motivo do encerramento.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setFollowupCloseOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <label className="admin-field">Motivo de encerramento
                <select
                  className="admin-input"
                  value={followupCloseReason}
                  onChange={(event) => setFollowupCloseReason(event.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="virou_membro">Virou membro</option>
                  <option value="outra_igreja">Caminhou para outra igreja</option>
                  <option value="nao_cristao">Não era cristão / não quis continuar</option>
                  <option value="apenas_visitou">Preferiu apenas visitar</option>
                  <option value="sem_retorno">Sem retorno / desistiu</option>
                  <option value="outro">Outro motivo</option>
                </select>
              </label>
              <label className="admin-field">Observação pastoral
                <textarea
                  className="admin-input rede-textarea"
                  rows={3}
                  value={followupNotes}
                  onChange={(event) => setFollowupNotes(event.target.value)}
                  placeholder="Se quiser, registre um detalhe final"
                />
              </label>
              <div className="rede-form-actions">
                <button className="admin-btn admin-btn--outline" type="button" onClick={() => setFollowupCloseOpen(false)}>
                  Cancelar
                </button>
                <button className="admin-btn admin-btn--primary" type="button" onClick={handleFollowupClose} disabled={followupSaving}>
                  {followupSaving ? "Salvando..." : "Concluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {followupLogOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setFollowupLogOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>Registro de acompanhamento</h3>
                <p className="rede-muted">{followupLogApplication?.full_name || "Visitante"}</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setFollowupLogOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              {followupLogLoading ? (
                <p className="rede-muted">Carregando registros...</p>
              ) : followupLogEntries.length ? (
                <div className="rede-followup-list">
                  {followupLogEntries.map((entry) => {
                    const methodLabel = FOLLOWUP_CONTACT_METHODS.find((item) => item.value === entry.contact_method)?.label || entry.contact_method || "-";
                    const outcomeLabel = FOLLOWUP_OUTCOMES.find((item) => item.value === entry.outcome)?.label || entry.outcome || "-";
                    return (
                      <div key={entry.id} className="rede-followup-item">
                        <div className="rede-followup-header">
                          <strong>{methodLabel}</strong>
                          <span className="rede-muted">{formatDateTime(entry.contacted_at)}</span>
                        </div>
                        <div className="rede-followup-meta">
                          <span>Resultado: {outcomeLabel}</span>
                        </div>
                        {entry.notes && <p className="rede-followup-notes">{entry.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rede-muted">Nenhum registro ainda.</p>
              )}

              <div className="rede-form">
                <label className="admin-field">Método de contato
                  <select
                    className="admin-input"
                    value={followupLogForm.contact_method}
                    onChange={(event) => setFollowupLogForm((prev) => ({ ...prev, contact_method: event.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {FOLLOWUP_CONTACT_METHODS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">Data do contato
                  <input
                    className="admin-input"
                    type="datetime-local"
                    value={followupLogForm.contacted_at}
                    onChange={(event) => setFollowupLogForm((prev) => ({ ...prev, contacted_at: event.target.value }))}
                  />
                </label>
                <label className="admin-field">Resultado
                  <select
                    className="admin-input"
                    value={followupLogForm.outcome}
                    onChange={(event) => setFollowupLogForm((prev) => ({ ...prev, outcome: event.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {FOLLOWUP_OUTCOMES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">Observação
                  <textarea
                    className="admin-input rede-textarea"
                    rows={3}
                    value={followupLogForm.notes}
                    onChange={(event) => setFollowupLogForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Detalhes importantes do contato"
                  />
                </label>
              </div>
              <div className="rede-form-actions">
                <button className="admin-btn admin-btn--outline" type="button" onClick={() => setFollowupLogOpen(false)}>
                  Cancelar
                </button>
                <button className="admin-btn admin-btn--primary" type="button" onClick={handleFollowupLogSave} disabled={followupLogSaving}>
                  {followupLogSaving ? "Salvando..." : "Registrar contato"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {applicationDetailsOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setApplicationDetailsOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>Detalhes da solicitação</h3>
                <p className="rede-muted">{applicationDetails?.full_name || "-"}</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setApplicationDetailsOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              {applicationDetails && (() => {
                const house = applicationDetails.house_id ? houseMap.get(applicationDetails.house_id) : null;
                const responsibleName = applicationDetails.followup_assigned_member_id
                  ? members.find((m) => m.id === applicationDetails.followup_assigned_member_id)?.full_name || "-"
                  : "-";
                const contactChannel = applicationDetails.allow_contact === false
                  ? "Não deseja contato"
                  : PREFERRED_CONTACT_CHANNEL_LABELS[applicationDetails.preferred_contact_channel || ""] || "-";
                return (
                  <>
                    <div className="rede-detail-grid">
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Tipo</span>
                        <span>{MEMBER_TYPE_OPTIONS.find((opt) => opt.value === applicationDetails.member_type)?.label || applicationDetails.member_type || "-"}</span>
                      </div>
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Contato</span>
                        <span>{applicationDetails.phone || applicationDetails.email || "-"}</span>
                      </div>
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Casa</span>
                        <span>{house?.name || "-"}</span>
                      </div>
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Responsável</span>
                        <span>{responsibleName}</span>
                      </div>
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Status</span>
                        <span>{applicationDetails.followup_status || "pendente"}</span>
                      </div>
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Motivo de encerramento</span>
                        <span>{applicationDetails.followup_closed_reason ? (CLOSE_REASON_LABELS[applicationDetails.followup_closed_reason] || applicationDetails.followup_closed_reason) : "-"}</span>
                      </div>
                      <div className="rede-detail-item">
                        <span className="rede-detail-title">Criado em</span>
                        <span>{formatDateTime(applicationDetails.created_at)}</span>
                      </div>
                    </div>

                    <div className="rede-detail-section">
                      <h4>Contato e consentimento</h4>
                      <div className="rede-detail-grid">
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Pode contatar?</span>
                          <span>{applicationDetails.allow_contact === false ? "Não" : "Sim"}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Canal preferido</span>
                          <span>{contactChannel}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Último contato</span>
                          <span>{formatDateTime(applicationDetails.last_contact_at)}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Próximo contato</span>
                          <span>{formatDateTime(applicationDetails.next_contact_at)}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Tentativas</span>
                          <span>{applicationDetails.contact_attempts ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rede-detail-section">
                      <h4>Respostas do visitante</h4>
                      <div className="rede-detail-grid">
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Visita</span>
                          <span>{formatOptionList(applicationDetails.visit_experience, VISIT_EXPERIENCE_LABELS)}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Convidado por</span>
                          <span>{applicationDetails.invited_by_name || applicationDetails.invited_by || "-"}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Cuidado</span>
                          <span>{formatOptionList(applicationDetails.care_needs, CARE_NEEDS_LABELS)}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Caminhada cristã</span>
                          <span>{formatOptionList(applicationDetails.faith_journey, FAITH_JOURNEY_LABELS)}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Dúvidas/interesses</span>
                          <span>{formatOptionList(applicationDetails.doubts_interests, DOUBTS_INTERESTS_LABELS)}</span>
                        </div>
                        <div className="rede-detail-item">
                          <span className="rede-detail-title">Preferências</span>
                          <span>{formatOptionList(applicationDetails.contact_preferences, CONTACT_PREFERENCES_LABELS)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {inviteTypeModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setInviteTypeModalOpen(false)}>
          <div className="rede-modal rede-modal--compact" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>Tipo do link de cadastro</h3>
                <p className="rede-muted">Escolha o tipo para este link.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setInviteTypeModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <label className="admin-field">Tipo de cadastro
                <select
                  className="admin-input"
                  value={inviteType}
                  onChange={(event) => setInviteType(event.target.value)}
                >
                  {MEMBER_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="admin-field">Casa (opcional)
                <select
                  className="admin-input"
                  value={inviteHouseId}
                  onChange={(event) => setInviteHouseId(event.target.value)}
                >
                  <option value="">Sem casa vinculada</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
              </label>
              <label className="admin-field">Presbítero responsável
                <input className="admin-input" type="text" value={selectedInvitePresbName} disabled />
              </label>
              <div className="rede-form-actions">
                <button className="admin-btn admin-btn--outline" type="button" onClick={() => setInviteTypeModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="admin-btn admin-btn--primary"
                  type="button"
                  onClick={() => {
                    setInviteTypeModalOpen(false);
                    handleGenerateInvite(inviteType);
                  }}
                  disabled={inviteCreating}
                >
                  {inviteCreating ? "Gerando..." : "Gerar link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "presbiteros" && (
        <section className="admin-section rede-section rede-block">
          <div className="rede-block-header">
            <div className="rede-title">
              <span className="rede-title-icon rede-title-icon--presbiteros" aria-hidden="true" />
              <div>
                <div className="rede-title-row">
                  <h2 className="admin-h2">Cadastro de Presbíteros</h2>
                  <span className="rede-title-count">{presbiteros.length} presbíteros</span>
                </div>
                <p className="rede-subtitle">Presbíteros são membros que lideram as casas.</p>
              </div>
            </div>
          <div className="rede-section-actions">
            <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
            <button className="admin-btn admin-btn--primary" onClick={openPresbiteroModal}>+ Novo presbítero</button>
          </div>
        </div>

        <div className="rede-grid">
          <article className="rede-card rede-card--wide">
            <div className="rede-card-head">
              <h3>Presbíteros ativos</h3>
              <span className="rede-badge">{presbiteros.length} registros</span>
            </div>
            <div className="rede-table-wrap">
              <table className="admin-table rede-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="admin-th">Presbítero</th>
                    <th className="admin-th">Casa</th>
                    <th className="admin-th">Contato</th>
                    <th className="admin-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {presbiteros.map((presb) => {
                    const house = presbiteroHouseMap.get(presb.id);
                    return (
                      <tr key={presb.id} className="admin-row">
                        <td className="admin-td">
                          <div className="rede-member-name">{presb.member?.full_name || "(Sem nome)"}</div>
                          <span className="rede-muted">{presb.status || "ativo"}</span>
                        </td>
                        <td className="admin-td">{house?.name || "-"}</td>
                        <td className="admin-td">{presb.member?.phone || "-"}</td>
                        <td className="admin-td">
                          <div className="rede-actions">
                            <button className="admin-chip admin-chip--ghost" onClick={() => handleEditPresbitero(presb)}>Editar</button>
                            <button className="admin-chip rede-chip-danger" onClick={() => handleDeletePresbitero(presb)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!presbiteros.length && (
                    <tr className="admin-row admin-row-empty">
                      <td className="admin-td admin-empty" colSpan={4}>
                        <div className="admin-empty-state">
                          <span className="admin-empty-title">Nenhum presbítero encontrado</span>
                          <span className="admin-empty-sub">Cadastre um presbítero para continuar.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
      )}

      {activeTab === "leaders" && (
        <section className="admin-section rede-section rede-block">
          <div className="rede-block-header">
            <div className="rede-title">
              <span className="rede-title-icon rede-title-icon--leaders" aria-hidden="true" />
              <div>
                <div className="rede-title-row">
                  <h2 className="admin-h2">Cadastro de Líderes 5 Ministérios</h2>
                  <span className="rede-title-count">{leaders.length} líderes</span>
                </div>
                <p className="rede-subtitle">Líderes ligados a um dos cinco dons ministeriais.</p>
              </div>
            </div>
          <div className="rede-section-actions">
            <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
            <button className="admin-btn admin-btn--primary" onClick={openLeaderModal}>+ Novo líder</button>
          </div>
        </div>

        <div className="rede-grid">
          <article className="rede-card rede-card--wide">
            <div className="rede-card-head">
              <h3>Líderes cadastrados</h3>
              <span className="rede-badge">{leaders.length} registros</span>
            </div>
            <div className="rede-table-wrap">
              <table className="admin-table rede-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="admin-th">Líder</th>
                    <th className="admin-th">Ministério</th>
                    <th className="admin-th">Região</th>
                    <th className="admin-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader) => (
                    <tr key={leader.id} className="admin-row">
                      <td className="admin-td">
                        <div className="rede-member-name">{leader.member?.full_name || "(Sem nome)"}</div>
                        <span className="rede-muted">{leader.status || "ativo"}</span>
                      </td>
                      <td className="admin-td">{giftLabelMap.get(leader.ministry) || leader.ministry}</td>
                      <td className="admin-td">{leader.region || "-"}</td>
                      <td className="admin-td">
                        <div className="rede-actions">
                          <button className="admin-chip admin-chip--ghost" onClick={() => handleEditLeader(leader)}>Editar</button>
                          <button className="admin-chip rede-chip-danger" onClick={() => handleDeleteLeader(leader)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!leaders.length && (
                    <tr className="admin-row admin-row-empty">
                      <td className="admin-td admin-empty" colSpan={4}>
                        <div className="admin-empty-state">
                          <span className="admin-empty-title">Nenhum líder encontrado</span>
                          <span className="admin-empty-sub">Cadastre um líder para continuar.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
      )}

      {presbiteroModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setPresbiteroModalOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>{editingPresbiteroId ? "Editar presbítero" : "Novo presbítero"}</h3>
                <p className="rede-muted">Defina o membro e a casa liderada.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setPresbiteroModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <form className="rede-form" onSubmit={handlePresbiteroSubmit}>
                <div className="rede-form-grid">
                  <label className="admin-field">Membro
                    <select
                      className="admin-input"
                      value={presbiteroForm.member_id}
                      onChange={(event) => setPresbiteroForm((prev) => ({ ...prev, member_id: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>{member.full_name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Casa liderada
                    <select
                      className="admin-input"
                      value={presbiteroForm.house_id}
                      onChange={(event) => setPresbiteroForm((prev) => ({ ...prev, house_id: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {houses.map((house) => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Data de consagração
                    <input
                      className="admin-input"
                      type="date"
                      value={presbiteroForm.since_date}
                      onChange={(event) => setPresbiteroForm((prev) => ({ ...prev, since_date: event.target.value }))}
                    />
                  </label>
                  <label className="admin-field">Status
                    <select
                      className="admin-input"
                      value={presbiteroForm.status}
                      onChange={(event) => setPresbiteroForm((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="em_acompanhamento">Em acompanhamento</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </label>
                </div>
                <label className="admin-field">Observações
                  <textarea
                    className="admin-input rede-textarea"
                    rows={3}
                    value={presbiteroForm.notes}
                    onChange={(event) => setPresbiteroForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Notas pastorais"
                  />
                </label>
                <div className="rede-form-actions">
                  <button className="admin-btn admin-btn--outline" type="button" onClick={resetPresbiteroForm}>
                    {editingPresbiteroId ? "Cancelar edição" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={presbiteroSaving}>
                    {presbiteroSaving ? "Salvando..." : editingPresbiteroId ? "Salvar alterações" : "Salvar presbítero"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === "houses" && (
        <section className="admin-section rede-section rede-block">
          <div className="rede-block-header">
            <div className="rede-title">
              <span className="rede-title-icon rede-title-icon--houses" aria-hidden="true" />
              <div>
                <div className="rede-title-row">
                  <h2 className="admin-h2">Cadastro de Igrejas nas Casas</h2>
                  <span className="rede-title-count">{houses.length} casas</span>
                </div>
                <p className="rede-subtitle">Cada casa está vinculada a um presbítero e aos membros que participam.</p>
              </div>
            </div>
          <div className="rede-section-actions">
            <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
            <button className="admin-btn admin-btn--primary" onClick={openHouseModal}>+ Nova casa</button>
          </div>
        </div>

        <div className="rede-grid">
          <article className="rede-card rede-card--wide">
            <div className="rede-card-head">
              <h3>Igrejas nas casas</h3>
              <span className="rede-badge">{houses.length} casas</span>
            </div>
            <div className="rede-table-wrap">
              <table className="admin-table rede-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="admin-th">Casa</th>
                    <th className="admin-th">Cidade</th>
                    <th className="admin-th">Presbítero</th>
                    <th className="admin-th">Membros</th>
                    <th className="admin-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.map((house) => {
                    const presbName = house.presbitero_id ? presbiteroNameMap.get(house.presbitero_id) : null;
                    const count = houseMemberCounts.get(house.id) || 0;
                    return (
                      <tr key={house.id} className="admin-row">
                        <td className="admin-td">
                          <div className="rede-member-name">{house.name}</div>
                          <span className="rede-muted">{house.status || "ativa"}</span>
                        </td>
                        <td className="admin-td">{house.city || "-"}</td>
                        <td className="admin-td">{presbName || "-"}</td>
                        <td className="admin-td">{count}</td>
                        <td className="admin-td">
                          <div className="rede-actions">
                            <button className="admin-chip admin-chip--ghost" onClick={() => handleEditHouse(house)}>Editar</button>
                            <button className="admin-chip rede-chip-danger" onClick={() => handleDeleteHouse(house)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!houses.length && (
                    <tr className="admin-row admin-row-empty">
                      <td className="admin-td admin-empty" colSpan={5}>
                        <div className="admin-empty-state">
                          <span className="admin-empty-title">Nenhuma casa encontrada</span>
                          <span className="admin-empty-sub">Cadastre uma casa para continuar.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
        </section>
      )}

      {houseModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setHouseModalOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>{editingHouseId ? "Editar igreja na casa" : "Nova igreja na casa"}</h3>
                <p className="rede-muted">Preencha os dados da casa e vincule membros.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setHouseModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <form className="rede-form" onSubmit={handleHouseSubmit}>
                <div className="rede-form-grid">
                  <label className="admin-field">Nome da casa
                    <input
                      className="admin-input"
                      type="text"
                      value={houseForm.name}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Ex.: Casa Centro"
                    />
                  </label>
                  <label className="admin-field">Cidade
                    <input
                      className="admin-input"
                      type="text"
                      value={houseForm.city}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="Campina Grande"
                    />
                  </label>
                  <label className="admin-field">Bairro
                    <input
                      className="admin-input"
                      type="text"
                      value={houseForm.neighborhood}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, neighborhood: event.target.value }))}
                      placeholder="Bairro"
                    />
                  </label>
                  <label className="admin-field">Endereço
                    <input
                      className="admin-input"
                      type="text"
                      value={houseForm.address}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, address: event.target.value }))}
                      placeholder="Rua / número"
                    />
                  </label>
                  <label className="admin-field">Dia de encontro
                    <select
                      className="admin-input"
                      value={houseForm.meeting_day}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, meeting_day: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option>Domingo</option>
                      <option>Segunda</option>
                      <option>Terça</option>
                      <option>Quarta</option>
                      <option>Quinta</option>
                      <option>Sexta</option>
                      <option>Sábado</option>
                    </select>
                  </label>
                  <label className="admin-field">Horário
                    <input
                      className="admin-input"
                      type="time"
                      value={houseForm.meeting_time}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, meeting_time: event.target.value }))}
                    />
                  </label>
                  <label className="admin-field">Presbítero
                    <select
                      className="admin-input"
                      value={houseForm.presbitero_id}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, presbitero_id: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {presbiteros.map((presb) => (
                        <option key={presb.id} value={presb.id}>{presb.member?.full_name || "(Sem nome)"}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Capacidade
                    <input
                      className="admin-input"
                      type="number"
                      min={0}
                      value={houseForm.capacity}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, capacity: event.target.value }))}
                      placeholder="Ex.: 25"
                    />
                  </label>
                  <label className="admin-field">Status
                    <select
                      className="admin-input"
                      value={houseForm.status}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="ativa">Ativa</option>
                      <option value="em_formacao">Em formação</option>
                      <option value="em_pausa">Em pausa</option>
                    </select>
                  </label>
                </div>

                <details className="rede-accordion">
                  <summary>Membros vinculados</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {members.map((member) => (
                        <label key={member.id} className="rede-check">
                          <input
                            type="checkbox"
                            name={`house_member_${member.id}`}
                            checked={houseMembersSelected.includes(member.id)}
                            onChange={() => toggleHouseMemberSelection(member.id)}
                          />
                          {member.full_name}
                        </label>
                      ))}
                    </div>
                  </div>
                </details>

                <label className="admin-field">Observações
                  <textarea
                    className="admin-input rede-textarea"
                    rows={3}
                    value={houseForm.notes}
                    onChange={(event) => setHouseForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Notas da casa"
                  />
                </label>

                <div className="rede-form-actions">
                  <button className="admin-btn admin-btn--outline" type="button" onClick={resetHouseForm}>
                    {editingHouseId ? "Cancelar edição" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={houseSaving}>
                    {houseSaving ? "Salvando..." : editingHouseId ? "Salvar alterações" : "Salvar casa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {leaderModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setLeaderModalOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>{editingLeaderId ? "Editar líder 5 ministérios" : "Novo líder 5 ministérios"}</h3>
                <p className="rede-muted">Selecione o membro e o ministério.</p>
              </div>
              <button className="rede-modal-close" type="button" onClick={() => setLeaderModalOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="rede-modal-body">
              <form className="rede-form" onSubmit={handleLeaderSubmit}>
                <div className="rede-form-grid">
                  <label className="admin-field">Membro
                    <select
                      className="admin-input"
                      value={leaderForm.member_id}
                      onChange={(event) => setLeaderForm((prev) => ({ ...prev, member_id: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>{member.full_name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Ministério
                    <select
                      className="admin-input"
                      value={leaderForm.ministry}
                      onChange={(event) => setLeaderForm((prev) => ({ ...prev, ministry: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {MINISTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Região
                    <input
                      className="admin-input"
                      type="text"
                      value={leaderForm.region}
                      onChange={(event) => setLeaderForm((prev) => ({ ...prev, region: event.target.value }))}
                      placeholder="Ex.: Campina Grande"
                    />
                  </label>
                  <label className="admin-field">Status
                    <select
                      className="admin-input"
                      value={leaderForm.status}
                      onChange={(event) => setLeaderForm((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="em_acompanhamento">Em acompanhamento</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </label>
                </div>
                <label className="admin-field">Observações
                  <textarea
                    className="admin-input rede-textarea"
                    rows={3}
                    value={leaderForm.notes}
                    onChange={(event) => setLeaderForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Notas ministeriais"
                  />
                </label>
                <div className="rede-form-actions">
                  <button className="admin-btn admin-btn--outline" type="button" onClick={resetLeaderForm}>
                    {editingLeaderId ? "Cancelar edição" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={leaderSaving}>
                    {leaderSaving ? "Salvando..." : editingLeaderId ? "Salvar alterações" : "Salvar líder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
