import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminRedeIgrejas.css";
import { useAdminToast } from "../components/AdminToast";
import { supabaseAnonKey, supabaseUrl } from "../lib/supabaseClient";
import {
  RedeHouseChurch,
  RedeHouseMember,
  RedeMember,
  RedeMemberApplication,
  RedeMemberGift,
  RedeMemberQuestionnaire,
  RedeMinistryLeader,
  RedePresbitero,
  assignPresbiteroToHouse,
  createRedeHouseChurch,
  createRedeMember,
  createRedeMemberInvite,
  createRedeMinistryLeader,
  createRedePresbitero,
  deleteRedeHouseChurch,
  deleteRedeMember,
  deleteRedeMinistryLeader,
  deleteRedePresbitero,
  listRedeHouseChurches,
  listRedeHouseMembers,
  listRedeMemberApplications,
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

const MINISTRY_OPTIONS = [
  { value: "apostolo", label: "Apostolo" },
  { value: "profeta", label: "Profeta" },
  { value: "evangelista", label: "Evangelista" },
  { value: "pastor", label: "Pastor" },
  { value: "mestre", label: "Mestre" },
];

const MEMBER_TYPE_OPTIONS = [
  { value: "membro", label: "Membro" },
  { value: "visitante", label: "Visitante" },
  { value: "outro", label: "Outro" },
];

type MemberQuestionnaireForm = Omit<RedeMemberQuestionnaire, "member_id" | "created_at" | "updated_at">;

type MemberFormState = {
  full_name: string;
  email: string;
  phone: string;
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
  | "available_for_training"
  | "available_for_missions";

type RedeSectionKey = "members" | "presbiteros" | "leaders" | "houses";

const MEMBER_QUESTIONS: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "wants_preach_house", label: "Deseja pregar em uma Igreja na Casa" },
  { id: "wants_preach_network", label: "Deseja pregar para a rede" },
  { id: "wants_bible_study", label: "Deseja dar estudo biblico em uma Igreja nas Casas" },
  { id: "wants_open_house", label: "Deseja abrir sua casa para uma Igreja na Casa" },
  { id: "wants_be_presbitero", label: "Deseja ser presbitero" },
  { id: "wants_be_ministry_leader", label: "Deseja liderar um dos 5 ministerios" },
  { id: "wants_discipleship", label: "Deseja liderar discipulado" },
  { id: "available_for_training", label: "Disponivel para treinamento e capacitacao" },
  { id: "available_for_missions", label: "Disponivel para missoes e viagens" },
];

const SERVICE_AREAS: { id: QuestionnaireBoolField; label: string }[] = [
  { id: "wants_serve_worship", label: "Louvor e adoracao" },
  { id: "wants_serve_intercession", label: "Intercessao" },
  { id: "wants_serve_children", label: "Ministerio com criancas" },
  { id: "wants_serve_media", label: "Midia e comunicacao" },
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
  available_for_training: false,
  available_for_missions: false,
  notes: "",
};

const emptyMemberForm: MemberFormState = {
  full_name: "",
  email: "",
  phone: "",
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

export default function AdminRedeIgrejas() {
  const navigate = useNavigate();
  const toast = useAdminToast();
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

  useEffect(() => {
    setMemberModalOpen(false);
    setPresbiteroModalOpen(false);
    setLeaderModalOpen(false);
    setHouseModalOpen(false);
    setInviteModalOpen(false);
  }, [activeTab]);

  const handleTestConnection = useCallback(async () => {
    setConnTesting(true);
    setConnStatus(null);
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        setConnStatus("Env do Supabase esta vazia.");
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
      { label: "presbiteros", fn: listRedePresbiteros, setter: setPresbiteros, empty: [] as RedePresbitero[] },
      { label: "lideres", fn: listRedeMinistryLeaders, setter: setLeaders, empty: [] as RedeMinistryLeader[] },
      { label: "casas", fn: listRedeHouseChurches, setter: setHouses, empty: [] as RedeHouseChurch[] },
      { label: "membros_casa", fn: listRedeHouseMembers, setter: setHouseMembers, empty: [] as RedeHouseMember[] },
      { label: "dons", fn: listRedeMemberGifts, setter: setMemberGifts, empty: [] as RedeMemberGift[] },
      { label: "questionarios", fn: listRedeMemberQuestionnaires, setter: setQuestionnaires, empty: [] as RedeMemberQuestionnaire[] },
      { label: "solicitacoes", fn: listRedeMemberApplications, setter: setApplications, empty: [] as RedeMemberApplication[] },
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
      toastRef.current.error("Nao foi possivel carregar", message);
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

  const pendingApplications = useMemo(
    () => applications.filter((app) => app.status === "pendente"),
    [applications]
  );

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
  };

  const openMemberModal = () => {
    resetMemberForm();
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
    const houseMember = memberHouseMap.get(member.id);
    const questionnaire = questionnaireMap.get(member.id);
    setMemberForm({
      full_name: member.full_name || "",
      email: member.email || "",
      phone: member.phone || "",
      city: member.city || "",
      state: member.state || "",
      address: member.address || "",
      member_type: member.member_type || "membro",
      status: member.status || "ativo",
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
      toast.error("Nao foi possivel remover", err?.message || String(err));
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
    const name = presbitero.member?.full_name || "presbitero";
    if (!window.confirm(`Excluir presbitero ${name}?`)) return;
    try {
      await deleteRedePresbitero(presbitero.id);
      toast.success("Presbitero removido", "O cadastro foi removido.");
      await loadAll();
    } catch (err: any) {
      toast.error("Nao foi possivel remover", err?.message || String(err));
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
    const name = leader.member?.full_name || "lider";
    if (!window.confirm(`Excluir lider ${name}?`)) return;
    try {
      await deleteRedeMinistryLeader(leader.id);
      toast.success("Lider removido", "O cadastro foi removido.");
      await loadAll();
    } catch (err: any) {
      toast.error("Nao foi possivel remover", err?.message || String(err));
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
      toast.error("Nao foi possivel remover", err?.message || String(err));
    }
  };

  const handleGenerateInvite = async () => {
    setInviteCreating(true);
    try {
      const token = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      const invite = await createRedeMemberInvite({
        token,
        status: "ativo",
        house_id: null,
        presbitero_id: null,
        expires_at: null,
      });
      const link = `${window.location.origin}/#/rede/cadastro?token=${invite.token}`;
      setInviteLink(link);
      setInviteModalOpen(true);
    } catch (err: any) {
      toast.error("Nao foi possivel gerar link", err?.message || String(err));
    } finally {
      setInviteCreating(false);
    }
  };

  const handleApproveApplication = async (application: RedeMemberApplication) => {
    if (!window.confirm(`Aprovar cadastro de ${application.full_name}?`)) return;
    try {
      const member = await createRedeMember({
        full_name: application.full_name,
        email: application.email,
        phone: application.phone,
        city: application.city,
        state: application.state,
        address: application.address,
        member_type: application.member_type || "membro",
        status: "ativo",
        notes: application.notes,
      });

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
        available_for_training: application.available_for_training,
        available_for_missions: application.available_for_missions,
        notes: application.notes,
      });

      await updateRedeMemberApplication(application.id, {
        status: "aprovado",
        reviewed_at: new Date().toISOString(),
        approved_member_id: member.id,
      });
      toast.success("Cadastro aprovado", "O membro foi adicionado a rede.");
      await loadAll();
    } catch (err: any) {
      toast.error("Nao foi possivel aprovar", err?.message || String(err));
    }
  };

  const handleRejectApplication = async (application: RedeMemberApplication) => {
    if (!window.confirm(`Rejeitar cadastro de ${application.full_name}?`)) return;
    try {
      await updateRedeMemberApplication(application.id, {
        status: "rejeitado",
        reviewed_at: new Date().toISOString(),
      });
      toast.success("Cadastro rejeitado", "A solicitacao foi marcada como rejeitada.");
      await loadAll();
    } catch (err: any) {
      toast.error("Nao foi possivel rejeitar", err?.message || String(err));
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
        phone: toNull(memberForm.phone),
        city: toNull(memberForm.city),
        state: toNull(memberForm.state),
        address: toNull(memberForm.address),
        member_type: toNull(memberForm.member_type) || "membro",
        status: toNull(memberForm.status) || "ativo",
        notes: toNull(memberForm.notes),
      };

      let memberId = editingMemberId;
      if (editingMemberId) {
        await updateRedeMember(editingMemberId, payload);
      } else {
        const created = await createRedeMember(payload);
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

      toast.success("Cadastro salvo", "Os dados do membro foram atualizados.");
      resetMemberForm();
      await loadAll();
      setMemberModalOpen(false);
    } catch (err: any) {
      toast.error("Nao foi possivel salvar", err?.message || String(err));
    } finally {
      setMemberSaving(false);
    }
  };

  const handlePresbiteroSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!presbiteroForm.member_id) {
      toast.warning("Informe o membro", "Selecione o membro para criar o presbitero.");
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

      if (!presbiteroId) throw new Error("Falha ao obter presbitero.");

      await assignPresbiteroToHouse(presbiteroId, presbiteroForm.house_id || null);

      toast.success("Presbitero salvo", "O cadastro foi atualizado.");
      resetPresbiteroForm();
      await loadAll();
      setPresbiteroModalOpen(false);
    } catch (err: any) {
      toast.error("Nao foi possivel salvar", err?.message || String(err));
    } finally {
      setPresbiteroSaving(false);
    }
  };

  const handleLeaderSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!leaderForm.member_id || !leaderForm.ministry) {
      toast.warning("Informe os dados", "Selecione o membro e o ministerio.");
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

      toast.success("Lider salvo", "O cadastro foi atualizado.");
      resetLeaderForm();
      await loadAll();
      setLeaderModalOpen(false);
    } catch (err: any) {
      toast.error("Nao foi possivel salvar", err?.message || String(err));
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
      toast.error("Nao foi possivel salvar", err?.message || String(err));
    } finally {
      setHouseSaving(false);
    }
  };

  const selectedMemberHouse = memberForm.house_id ? houseMap.get(memberForm.house_id) : null;
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
            Estruture cadastros, vinculos e acompanhamento da rede. Os presbiteros lideram as casas e os membros compoem a rede.
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
              {connTesting ? "Testando..." : "Testar conexao"}
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
              <div className="stat-title">Presbiteros</div>
              <div className="stat-number">{presbiteros.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon--responses" aria-hidden="true" />
            <div className="stat-content">
              <div className="stat-title">Lideres 5 ministerios</div>
              <div className="stat-number">{leaders.length}</div>
            </div>
          </div>
        </div>
      </section>

      <nav className="rede-tabs" aria-label="Cadastros da rede">
        {[
          { key: "members", label: "Membros", count: members.length, icon: "members" },
          { key: "houses", label: "Igrejas nas casas", count: houses.length, icon: "houses" },
          { key: "presbiteros", label: "Presbiteros", count: presbiteros.length, icon: "presbiteros" },
          { key: "leaders", label: "Lideres 5 ministerios", count: leaders.length, icon: "leaders" },
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
                <p className="rede-subtitle">Filtre por casa e presbitero para acompanhar os membros da rede.</p>
              </div>
            </div>
            <div className="rede-section-actions">
              <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
              <button className="admin-btn admin-btn--outline" onClick={handleGenerateInvite} disabled={inviteCreating}>
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
                  placeholder="Nome, casa ou presbitero"
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
                <label className="admin-field-label" htmlFor="memberPresb">Presbitero</label>
                <select
                  id="memberPresb"
                  className="admin-filter-select"
                  value={memberPresbFilter}
                  onChange={(event) => setMemberPresbFilter(event.target.value)}
                >
                  <option value="__ALL__">Todos os presbiteros</option>
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
                    <th className="admin-th">Presbitero</th>
                    <th className="admin-th">Dom</th>
                    <th className="admin-th">Acoes</th>
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
                <h3>Solicitacoes pendentes</h3>
                <span className="rede-badge">{pendingApplications.length} aguardando</span>
              </div>
              <div className="rede-table-wrap">
                <table className="admin-table rede-table">
                  <thead>
                    <tr className="admin-thead-row">
                      <th className="admin-th">Nome</th>
                      <th className="admin-th">Tipo</th>
                      <th className="admin-th">Casa</th>
                      <th className="admin-th">Status</th>
                      <th className="admin-th">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApplications.map((application) => {
                      const house = application.house_id ? houseMap.get(application.house_id) : null;
                      const typeLabel = MEMBER_TYPE_OPTIONS.find((opt) => opt.value === application.member_type)?.label;
                      return (
                        <tr key={application.id} className="admin-row">
                          <td className="admin-td">
                            <div className="rede-member-name">{application.full_name}</div>
                            <span className="rede-muted">{application.email || application.phone || "-"}</span>
                          </td>
                          <td className="admin-td">{typeLabel || application.member_type || "-"}</td>
                          <td className="admin-td">{house?.name || "-"}</td>
                          <td className="admin-td">{application.status}</td>
                          <td className="admin-td">
                            <div className="rede-actions">
                              <button className="admin-chip admin-chip--ghost" onClick={() => handleApproveApplication(application)}>Aceitar</button>
                              <button className="admin-chip rede-chip-danger" onClick={() => handleRejectApplication(application)}>Rejeitar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!pendingApplications.length && (
                      <tr className="admin-row admin-row-empty">
                        <td className="admin-td admin-empty" colSpan={5}>
                          <div className="admin-empty-state">
                            <span className="admin-empty-title">Nenhuma solicitacao pendente</span>
                            <span className="admin-empty-sub">Quando alguem enviar o cadastro, aparece aqui.</span>
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

      {memberModalOpen && (
        <div className="rede-modal-overlay" role="dialog" aria-modal="true" onClick={() => setMemberModalOpen(false)}>
          <div className="rede-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rede-modal-header">
              <div>
                <h3>{editingMemberId ? "Editar membro" : "Novo cadastro de membro"}</h3>
                <p className="rede-muted">Preencha os dados e salve o cadastro do membro.</p>
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
                <label className="admin-field">Endereco
                  <input
                    className="admin-input"
                    type="text"
                    value={memberForm.address}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder="Rua, numero"
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
                  <label className="admin-field">Presbitero da casa
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
                      <option value="visitante">Visitante</option>
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
                  <summary>Dom ministerial</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
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
                  <summary>Chamados e disponibilidade</summary>
                  <div className="rede-accordion-body">
                    <div className="rede-checkbox-grid">
                      {MEMBER_QUESTIONS.map((question) => (
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
                  <summary>Areas de servico</summary>
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

                <label className="admin-field">Observacoes
                  <textarea
                    className="admin-input rede-textarea"
                    rows={3}
                    value={memberForm.notes}
                    onChange={(event) => setMemberForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Informacoes adicionais"
                  />
                </label>

                <div className="rede-form-actions">
                  <button className="admin-btn admin-btn--outline" type="button" onClick={resetMemberForm}>
                    {editingMemberId ? "Cancelar edicao" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={memberSaving}>
                    {memberSaving ? "Salvando..." : editingMemberId ? "Salvar alteracoes" : "Salvar cadastro"}
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

      {activeTab === "presbiteros" && (
        <section className="admin-section rede-section rede-block">
          <div className="rede-block-header">
            <div className="rede-title">
              <span className="rede-title-icon rede-title-icon--presbiteros" aria-hidden="true" />
              <div>
                <div className="rede-title-row">
                  <h2 className="admin-h2">Cadastro de Presbiteros</h2>
                  <span className="rede-title-count">{presbiteros.length} presbiteros</span>
                </div>
                <p className="rede-subtitle">Presbiteros sao membros que lideram as casas.</p>
              </div>
            </div>
          <div className="rede-section-actions">
            <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
            <button className="admin-btn admin-btn--primary" onClick={openPresbiteroModal}>+ Novo presbitero</button>
          </div>
        </div>

        <div className="rede-grid">
          <article className="rede-card rede-card--wide">
            <div className="rede-card-head">
              <h3>Presbiteros ativos</h3>
              <span className="rede-badge">{presbiteros.length} registros</span>
            </div>
            <div className="rede-table-wrap">
              <table className="admin-table rede-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="admin-th">Presbitero</th>
                    <th className="admin-th">Casa</th>
                    <th className="admin-th">Contato</th>
                    <th className="admin-th">Acoes</th>
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
                          <span className="admin-empty-title">Nenhum presbitero encontrado</span>
                          <span className="admin-empty-sub">Cadastre um presbitero para continuar.</span>
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
                  <h2 className="admin-h2">Cadastro de Lideres 5 Ministerios</h2>
                  <span className="rede-title-count">{leaders.length} lideres</span>
                </div>
                <p className="rede-subtitle">Lideres ligados a um dos cinco dons ministeriais.</p>
              </div>
            </div>
          <div className="rede-section-actions">
            <button className="admin-btn admin-btn--outline" onClick={loadAll}>Atualizar</button>
            <button className="admin-btn admin-btn--primary" onClick={openLeaderModal}>+ Novo lider</button>
          </div>
        </div>

        <div className="rede-grid">
          <article className="rede-card rede-card--wide">
            <div className="rede-card-head">
              <h3>Lideres cadastrados</h3>
              <span className="rede-badge">{leaders.length} registros</span>
            </div>
            <div className="rede-table-wrap">
              <table className="admin-table rede-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="admin-th">Lider</th>
                    <th className="admin-th">Ministerio</th>
                    <th className="admin-th">Regiao</th>
                    <th className="admin-th">Acoes</th>
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
                          <span className="admin-empty-title">Nenhum lider encontrado</span>
                          <span className="admin-empty-sub">Cadastre um lider para continuar.</span>
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
                <h3>{editingPresbiteroId ? "Editar presbitero" : "Novo presbitero"}</h3>
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
                  <label className="admin-field">Data de consagracao
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
                <label className="admin-field">Observacoes
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
                    {editingPresbiteroId ? "Cancelar edicao" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={presbiteroSaving}>
                    {presbiteroSaving ? "Salvando..." : editingPresbiteroId ? "Salvar alteracoes" : "Salvar presbitero"}
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
                <p className="rede-subtitle">Cada casa esta vinculada a um presbitero e aos membros que participam.</p>
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
                    <th className="admin-th">Presbitero</th>
                    <th className="admin-th">Membros</th>
                    <th className="admin-th">Acoes</th>
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
                  <label className="admin-field">Endereco
                    <input
                      className="admin-input"
                      type="text"
                      value={houseForm.address}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, address: event.target.value }))}
                      placeholder="Rua / numero"
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
                      <option>Terca</option>
                      <option>Quarta</option>
                      <option>Quinta</option>
                      <option>Sexta</option>
                      <option>Sabado</option>
                    </select>
                  </label>
                  <label className="admin-field">Horario
                    <input
                      className="admin-input"
                      type="time"
                      value={houseForm.meeting_time}
                      onChange={(event) => setHouseForm((prev) => ({ ...prev, meeting_time: event.target.value }))}
                    />
                  </label>
                  <label className="admin-field">Presbitero
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
                      <option value="em_formacao">Em formacao</option>
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

                <label className="admin-field">Observacoes
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
                    {editingHouseId ? "Cancelar edicao" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={houseSaving}>
                    {houseSaving ? "Salvando..." : editingHouseId ? "Salvar alteracoes" : "Salvar casa"}
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
                <h3>{editingLeaderId ? "Editar lider 5 ministerios" : "Novo lider 5 ministerios"}</h3>
                <p className="rede-muted">Selecione o membro e o ministerio.</p>
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
                  <label className="admin-field">Ministerio
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
                  <label className="admin-field">Regiao
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
                <label className="admin-field">Observacoes
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
                    {editingLeaderId ? "Cancelar edicao" : "Limpar"}
                  </button>
                  <button className="admin-btn admin-btn--primary" type="submit" disabled={leaderSaving}>
                    {leaderSaving ? "Salvando..." : editingLeaderId ? "Salvar alteracoes" : "Salvar lider"}
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
