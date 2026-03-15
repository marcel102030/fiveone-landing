import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./RedeCadastroMembro.css";
import {
  RedeHouseChurch,
  RedeMemberInvite,
  createRedeMemberApplication,
  getRedePresbiteroById,
  getRedeMemberInviteByToken,
  listRedeHouseChurches,
} from "../services/redeIgrejas";
import { normalizePhone } from "../../../shared/utils/phone";

const MINISTRY_OPTIONS = [
  { value: "apostolo", label: "Tenho identificação com o dom Apostólico" },
  { value: "profeta", label: "Tenho identificação com o dom Profético" },
  { value: "evangelista", label: "Tenho identificação com o dom Evangelístico" },
  { value: "pastor", label: "Tenho identificação com o dom Pastoral" },
  { value: "mestre", label: "Tenho identificação com o dom de Mestre" },
];

type QuestionnaireForm = {
  wants_preach_house: boolean;
  wants_preach_network: boolean;
  wants_bible_study: boolean;
  wants_open_house: boolean;
  wants_be_presbitero: boolean;
  wants_be_ministry_leader: boolean;
  wants_discipleship: boolean;
  wants_serve_worship: boolean;
  wants_serve_intercession: boolean;
  wants_serve_children: boolean;
  wants_serve_media: boolean;
  wants_serve_hospitality: boolean;
  wants_serve_teaching: boolean;
  wants_serve_pastoral_care: boolean;
  wants_serve_practical_support: boolean;
  routine_bible_reading: boolean;
  routine_prayer: boolean;
  routine_fasting: boolean;
  routine_in_development: boolean;
  ministry_discernment: boolean;
  discipleship_current: boolean;
  discipleship_leads: boolean;
  available_for_training: boolean;
  available_for_missions: boolean;
};

type VisitorFormState = {
  full_name: string;
  phone: string;
  gender: string;
  city: string;
  house_id: string;
  invited_by: string;
  notes: string;
};

type VisitorOption = {
  id: string;
  label: string;
};

const VISIT_EXPERIENCE: VisitorOption[] = [
  { id: "encontro_casa", label: "Participei de um encontro da Igreja na Casa" },
  { id: "estudo_biblico", label: "Participei de um estudo bíblico" },
  { id: "nao_participei", label: "Ainda não participei, mas gostaria" },
  { id: "redes_sociais", label: "Conheci a igreja pelas redes sociais" },
  { id: "nao_sei", label: "Não sei / prefiro não responder" },
];

const CARE_NEEDS: VisitorOption[] = [
  { id: "discipulado", label: "Gostaria de caminhar com alguém no discipulado" },
  { id: "conversar_lideranca", label: "Gostaria de conversar com um líder" },
  { id: "oracao", label: "Gostaria de receber oração" },
  { id: "momento_dificil", label: "Estou passando por um momento difícil" },
  { id: "apenas_conhecendo", label: "Apenas conhecendo por enquanto" },
  { id: "nao_sei", label: "Não sei / prefiro não responder" },
];

const FAITH_JOURNEY: VisitorOption[] = [
  { id: "novo_na_fe", label: "Sou novo(a) na fé cristã" },
  { id: "quero_aprender", label: "Já sigo a Cristo, mas quero aprender mais" },
  { id: "caminho_ha_tempo", label: "Já caminho com Jesus há algum tempo" },
  { id: "retomando", label: "Estou retomando minha fé" },
  { id: "tenho_duvidas", label: "Ainda tenho dúvidas sobre a fé cristã" },
  { id: "prefiro_nao_informar", label: "Prefiro não informar agora" },
];

// Próximos passos na fé — substitui as antigas "dúvidas bíblicas/teológicas"
const DOUBTS_INTERESTS: VisitorOption[] = [
  { id: "conhecer_jesus", label: "Quero conhecer mais sobre Jesus" },
  { id: "aprender_biblia", label: "Quero aprender a ler a Bíblia" },
  { id: "aprender_orar", label: "Quero aprender a orar" },
  { id: "batismo", label: "Gostaria de ser batizado(a)" },
  { id: "participar_discipulado", label: "Gostaria de participar de um discipulado" },
  { id: "sobre_igreja_casas", label: "Quero entender melhor a Igreja nas Casas" },
  { id: "apenas_conhecer", label: "Quero apenas conhecer por enquanto" },
];

const CONTACT_PREFERENCES: VisitorOption[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "ligacao", label: "Ligação" },
  { id: "participar", label: "Prefiro apenas participar por enquanto" },
  { id: "sem_contato", label: "Ainda não desejo contato" },
  { id: "nao_sei", label: "Não sei / prefiro não responder" },
];

const LOCAL_CALLINGS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_preach_house", label: "Sente-se chamado a compartilhar a Palavra na Igreja na Casa" },
  { id: "wants_bible_study", label: "Deseja conduzir estudo bíblico nas casas" },
  { id: "wants_open_house", label: "Tem desejo de abrir sua casa para uma Igreja na Casa" },
  { id: "wants_be_presbitero", label: "Sente-se chamado a caminhar para o presbitério" },
  { id: "wants_discipleship", label: "Deseja caminhar e cuidar de pessoas no discipulado local" },
];

const NETWORK_CALLINGS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_preach_network", label: "Sente-se chamado a pregar para a rede" },
  { id: "wants_be_ministry_leader", label: "Sente-se chamado a servir na liderança dos 5 dons" },
  { id: "available_for_training", label: "Disponível para treinamento e capacitação na rede" },
  { id: "available_for_missions", label: "Disponível para missões e envios" },
];

const SERVICE_AREAS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_serve_worship", label: "Louvor e adoração" },
  { id: "wants_serve_intercession", label: "Intercessão" },
  { id: "wants_serve_children", label: "Ministério com crianças" },
  { id: "wants_serve_media", label: "Mídia e comunicação" },
  { id: "wants_serve_hospitality", label: "Hospitalidade e acolhimento" },
  { id: "wants_serve_teaching", label: "Ensino" },
  { id: "wants_serve_pastoral_care", label: "Cuidado pastoral" },
  { id: "wants_serve_practical_support", label: "Apoio prático" },
];

const SPIRITUAL_ROUTINE: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "routine_bible_reading", label: "Tenho rotina de leitura bíblica" },
  { id: "routine_prayer", label: "Tenho rotina de oração" },
  { id: "routine_fasting", label: "Pratico jejum regularmente" },
  { id: "routine_in_development", label: "Minha rotina espiritual está em desenvolvimento" },
];

const DISCIPLESHIP_STATUS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "discipleship_current", label: "Já caminho em discipulado" },
  { id: "wants_discipleship", label: "Desejo caminhar em discipulado" },
  { id: "discipleship_leads", label: "Acompanho outras pessoas no discipulado" },
];

const emptyQuestionnaire: QuestionnaireForm = {
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
};

export default function RedeCadastroMembro() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [invite, setInvite] = useState<RedeMemberInvite | null>(null);
  const [houses, setHouses] = useState<RedeHouseChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invitePresbiteroMemberId, setInvitePresbiteroMemberId] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    city: "",
    state: "",
    address: "",
    house_id: "",
    notes: "",
  });
  const [gifts, setGifts] = useState<string[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireForm>(emptyQuestionnaire);
  const [memberUnknowns, setMemberUnknowns] = useState({
    ministry: false,
    local_callings: false,
    network_callings: false,
    service_areas: false,
    spiritual_routine: false,
    discipleship: false,
  });
  const [visitorForm, setVisitorForm] = useState<VisitorFormState>({
    full_name: "",
    phone: "",
    gender: "",
    city: "",
    house_id: "",
    invited_by: "",
    notes: "",
  });
  const [visitExperience, setVisitExperience] = useState<string[]>([]);
  const [careNeeds, setCareNeeds] = useState<string[]>([]);
  const [faithJourney, setFaithJourney] = useState<string[]>([]);
  const [doubtsInterests, setDoubtsInterests] = useState<string[]>([]);
  const [contactPreferences, setContactPreferences] = useState<string[]>([]);
  const [visitorStep, setVisitorStep] = useState(1);

  const houseOptions = useMemo(() => houses, [houses]);
  const cardRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const [cameWithSomeone, setCameWithSomeone] = useState<"sim" | "nao" | "">("");
  const [meetingHighlight, setMeetingHighlight] = useState("");
  const [wantToReturn, setWantToReturn] = useState("");

  const isVisitor = invite?.member_type === "visitante";
  const headerTitle = isVisitor ? "Cadastro de visitante" : "Cadastro de membro";
  const headerSubtitle = isVisitor
    ? "Ficamos muito felizes com a sua visita! Queremos caminhar com você e cuidar de cada pessoa que Deus traz até nós. Compartilhe um pouco sobre sua experiência."
    : "Preencha seus dados para solicitar seu cadastro na rede.";

  useEffect(() => {
    if (isVisitor) setVisitorStep(1);
  }, [isVisitor]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Link inválido. Solicite um novo link de cadastro.");
        setLoading(false);
        return;
      }
      const [inviteData, housesData] = await Promise.all([
        getRedeMemberInviteByToken(token),
        listRedeHouseChurches(),
      ]);
      if (!inviteData) {
        setError("Link inválido ou expirado.");
        setLoading(false);
        return;
      }
      if (inviteData.status !== "ativo") {
        setError("Este link não está ativo.");
        setLoading(false);
        return;
      }
      setInvite(inviteData);
      setHouses(housesData);
      if (inviteData.presbitero_id) {
        const presb = await getRedePresbiteroById(inviteData.presbitero_id);
        setInvitePresbiteroMemberId(presb?.member_id || null);
      } else {
        setInvitePresbiteroMemberId(null);
      }
      if (inviteData.house_id) {
        setForm((prev) => ({ ...prev, house_id: inviteData.house_id || "" }));
        setVisitorForm((prev) => ({ ...prev, house_id: inviteData.house_id || "" }));
      }
      setLoading(false);
    };
    load().catch((err) => {
      setError(err?.message || String(err));
      setLoading(false);
    });
  }, [token]);

  const toggleGift = (gift: string) => {
    setGifts((prev) => (prev.includes(gift) ? prev.filter((item) => item !== gift) : [...prev, gift]));
  };

  const toggleQuestion = (field: keyof QuestionnaireForm) => {
    setQuestionnaire((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleMemberUnknown = (field: keyof typeof memberUnknowns) => {
    setMemberUnknowns((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleVisitorOption = (setter: Dispatch<SetStateAction<string[]>>, value: string) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const hasAnySelection = (items: { id: keyof QuestionnaireForm }[]) =>
    items.some((item) => questionnaire[item.id]);

  const validateMemberSections = () => {
    if (!questionnaire.ministry_discernment && gifts.length === 0 && !memberUnknowns.ministry) {
      setError("Selecione ao menos uma opção em \"Chamado ministerial (em discernimento)\".");
      return false;
    }
    if (!hasAnySelection(LOCAL_CALLINGS) && !memberUnknowns.local_callings) {
      setError("Selecione ao menos uma opção em \"Serviço e liderança local na Igreja na Casa\".");
      return false;
    }
    if (!hasAnySelection(NETWORK_CALLINGS) && !memberUnknowns.network_callings) {
      setError("Selecione ao menos uma opção em \"Serviço e envio para a Rede\".");
      return false;
    }
    if (!hasAnySelection(SERVICE_AREAS) && !memberUnknowns.service_areas) {
      setError("Selecione ao menos uma opção em \"Áreas de serviço\".");
      return false;
    }
    if (!hasAnySelection(SPIRITUAL_ROUTINE) && !memberUnknowns.spiritual_routine) {
      setError("Selecione ao menos uma opção em \"Rotina espiritual\".");
      return false;
    }
    if (!hasAnySelection(DISCIPLESHIP_STATUS) && !memberUnknowns.discipleship) {
      setError("Selecione ao menos uma opção em \"Situação de discipulado\".");
      return false;
    }
    setError(null);
    return true;
  };

  const validateVisitorStep = (step: number) => {
    if (step === 1) {
      if (!visitorForm.full_name.trim()) {
        setError("Informe seu nome.");
        return false;
      }
      if (!normalizePhone(visitorForm.phone)) {
        setError("Informe seu WhatsApp/telefone.");
        return false;
      }
    }
    if (step === 2) {
      if (!visitExperience.length) {
        setError("Selecione ao menos uma opção em \"Sua experiência\".");
        return false;
      }
      if (!careNeeds.length) {
        setError("Selecione ao menos uma opção em \"Como podemos cuidar de você?\".");
        return false;
      }
      if (!faithJourney.length) {
        setError("Selecione ao menos uma opção em \"Caminhada com Deus\".");
        return false;
      }
    }
    if (step === 3) {
      if (!doubtsInterests.length) {
        setError("Selecione ao menos uma opção em \"Próximos passos na fé\".");
        return false;
      }
      if (!contactPreferences.length) {
        setError("Selecione ao menos uma opção em \"Como podemos falar com você?\".");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const scrollToTop = () => {
    // Rola para o topo do card (mobile: ainda pode estar na metade do form)
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToError = () => {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const nextVisitorStep = () => {
    if (!validateVisitorStep(visitorStep)) {
      // Pequeno delay para o estado de erro ser aplicado antes do scroll
      setTimeout(scrollToError, 50);
      return;
    }
    setVisitorStep((prev) => Math.min(prev + 1, 3));
    setTimeout(scrollToTop, 50);
  };

  const prevVisitorStep = () => {
    setError(null);
    setVisitorStep((prev) => Math.max(prev - 1, 1));
    setTimeout(scrollToTop, 50);
  };

  const submitVisitor = async () => {
    const normalizedPhone = normalizePhone(visitorForm.phone);
    if (!validateVisitorStep(1)) return;
    if (!validateVisitorStep(2)) return;
    if (!validateVisitorStep(3)) return;
    setSaving(true);
    setError(null);
    try {
      const allowContact = !contactPreferences.includes("sem_contato");
      const preferredContactChannel = contactPreferences.includes("whatsapp")
        ? "whatsapp"
        : contactPreferences.includes("ligacao")
          ? "ligacao"
          : null;
      // Se veio com alguém, adiciona à lista de experiências
      const finalVisitExperience = cameWithSomeone === "sim"
        ? [...visitExperience, "convidado_alguem"]
        : visitExperience;

      await createRedeMemberApplication({
        invite_token: token,
        full_name: visitorForm.full_name.trim(),
        phone: normalizedPhone,
        email: null,
        gender: visitorForm.gender || null,
        city: visitorForm.city || null,
        state: null,
        address: null,
        member_type: "visitante",
        house_id: visitorForm.house_id && visitorForm.house_id !== "__none__" ? visitorForm.house_id : null,
        gifts: [],
        visit_experience: finalVisitExperience,
        invited_by_member_id: null,
        invited_by_name: cameWithSomeone === "sim" ? visitorForm.invited_by || null : null,
        care_needs: careNeeds,
        faith_journey: faithJourney,
        doubts_interests: doubtsInterests,
        contact_preferences: contactPreferences,
        allow_contact: allowContact,
        preferred_contact_channel: preferredContactChannel,
        meeting_highlight: meetingHighlight.trim() || null,
        wants_to_return: wantToReturn || null,
        followup_assigned_member_id: invitePresbiteroMemberId || null,
        followup_status: invitePresbiteroMemberId ? "em_acompanhamento" : "pendente",
        followup_started_at: invitePresbiteroMemberId ? new Date().toISOString() : null,
        next_contact_at: invitePresbiteroMemberId ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
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
        notes: visitorForm.notes || null,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isVisitor) {
      if (visitorStep < 3) return;
      await submitVisitor();
      return;
    }
    if (!form.full_name.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!validateMemberSections()) return;
    setSaving(true);
    setError(null);
    try {
      const normalizedPhone = normalizePhone(form.phone);
      await createRedeMemberApplication({
        invite_token: token,
        full_name: form.full_name.trim(),
        email: form.email || null,
        phone: normalizedPhone || null,
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        city: form.city || null,
        state: form.state || null,
        address: form.address || null,
        member_type: invite?.member_type || "membro",
        house_id: form.house_id || invite?.house_id || null,
        gifts,
        wants_preach_house: questionnaire.wants_preach_house,
        wants_preach_network: questionnaire.wants_preach_network,
        wants_bible_study: questionnaire.wants_bible_study,
        wants_open_house: questionnaire.wants_open_house,
        wants_be_presbitero: questionnaire.wants_be_presbitero,
        wants_be_ministry_leader: questionnaire.wants_be_ministry_leader,
        wants_discipleship: questionnaire.wants_discipleship,
        wants_serve_worship: questionnaire.wants_serve_worship,
        wants_serve_intercession: questionnaire.wants_serve_intercession,
        wants_serve_children: questionnaire.wants_serve_children,
        wants_serve_media: questionnaire.wants_serve_media,
        wants_serve_hospitality: questionnaire.wants_serve_hospitality,
        wants_serve_teaching: questionnaire.wants_serve_teaching,
        wants_serve_pastoral_care: questionnaire.wants_serve_pastoral_care,
        wants_serve_practical_support: questionnaire.wants_serve_practical_support,
        routine_bible_reading: questionnaire.routine_bible_reading,
        routine_prayer: questionnaire.routine_prayer,
        routine_fasting: questionnaire.routine_fasting,
        routine_in_development: questionnaire.routine_in_development,
        ministry_discernment: questionnaire.ministry_discernment,
        discipleship_current: questionnaire.discipleship_current,
        discipleship_leads: questionnaire.discipleship_leads,
        available_for_training: questionnaire.available_for_training,
        available_for_missions: questionnaire.available_for_missions,
        notes: form.notes || null,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rede-signup-wrap">
      <div className="rede-signup-card" ref={cardRef}>
        <header>
          <span className="rede-signup-pill">{headerTitle}</span>
          <h1>Rede de Igrejas nas Casas</h1>
          <p>{headerSubtitle}</p>
        </header>

        {loading && <p className="rede-signup-msg">Carregando...</p>}
        {!loading && error && <p className="rede-signup-error" ref={errorRef}>{error}</p>}

        {!loading && !error && success && (
          <div className="rede-signup-success">
            {isVisitor ? (
              <>
                <div className="rede-signup-success-icon">🙏</div>
                <h2>Obrigado por compartilhar conosco!</h2>
                <p>
                  Ficamos felizes em ter você aqui. Um líder da Igreja na Casa pode entrar em contato para caminhar com você — que Deus te abençoe!
                </p>
                {(() => {
                  const house = houseOptions.find(
                    (h) => h.id === (visitorForm.house_id && visitorForm.house_id !== "__none__" ? visitorForm.house_id : "")
                  );
                  if (house?.whatsapp_group_url) {
                    return (
                      <a
                        href={house.whatsapp_group_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rede-signup-wa-btn"
                      >
                        💬 Entrar no grupo de WhatsApp da casa
                      </a>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <>
                <h2>Cadastro enviado!</h2>
                <p>Seu cadastro foi enviado e será analisado pela equipe. Você receberá o retorno em breve.</p>
              </>
            )}
          </div>
        )}

        {!loading && !error && !success && (
          <form className="rede-signup-form" onSubmit={handleSubmit}>
            {isVisitor ? (
              <>
                <div className="rede-signup-stepper">
                  <span className={`rede-signup-step ${visitorStep >= 1 ? "is-active" : ""}`}>1. Quem é você</span>
                  <span className={`rede-signup-step ${visitorStep >= 2 ? "is-active" : ""}`}>2. Sua experiência</span>
                  <span className={`rede-signup-step ${visitorStep >= 3 ? "is-active" : ""}`}>3. Caminho espiritual</span>
                </div>

                {visitorStep === 1 && (
                  <>
                    <div className="rede-signup-grid">
                      <label>
                        Nome <span className="rede-signup-required">*</span>
                        <input
                          type="text"
                          value={visitorForm.full_name}
                          onChange={(event) => setVisitorForm((prev) => ({ ...prev, full_name: event.target.value }))}
                          placeholder="Seu nome"
                        />
                      </label>
                      <label>
                        WhatsApp/Telefone <span className="rede-signup-required">*</span>
                        <input
                          type="tel"
                          value={visitorForm.phone}
                          onChange={(event) => setVisitorForm((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="(83) 9 9999-9999"
                        />
                      </label>
                      <label>
                        Gênero
                        <select
                          value={visitorForm.gender}
                          onChange={(event) => setVisitorForm((prev) => ({ ...prev, gender: event.target.value }))}
                        >
                          <option value="">Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                      </label>
                      <label>
                        Cidade
                        <input
                          type="text"
                          value={visitorForm.city}
                          onChange={(event) => setVisitorForm((prev) => ({ ...prev, city: event.target.value }))}
                          placeholder="Sua cidade"
                        />
                      </label>
                      <label>
                        Igreja na Casa que visitou
                        <select
                          value={visitorForm.house_id}
                          onChange={(event) => setVisitorForm((prev) => ({ ...prev, house_id: event.target.value }))}
                          disabled={Boolean(invite?.house_id)}
                        >
                          <option value="">Selecione</option>
                          <option value="__none__">Ainda não participei</option>
                          {houseOptions.map((house) => (
                            <option key={house.id} value={house.id}>
                              {house.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>Você veio com alguém?</h3>
                      </div>
                      <div className="rede-signup-checks rede-signup-checks--radio">
                        {[
                          { value: "sim", label: "Sim, fui convidado(a)" },
                          { value: "nao", label: "Não, vim por conta própria" },
                        ].map((opt) => (
                          <label key={opt.value}>
                            <input
                              type="radio"
                              name="came_with_someone"
                              value={opt.value}
                              checked={cameWithSomeone === opt.value}
                              onChange={() => setCameWithSomeone(opt.value as "sim" | "nao")}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                      {cameWithSomeone === "sim" && (
                        <label className="rede-signup-inline" style={{ marginTop: 8 }}>
                          Quem te convidou? <span style={{ color: "#64748b", fontWeight: 400 }}>(opcional)</span>
                          <input
                            type="text"
                            value={visitorForm.invited_by}
                            onChange={(event) => setVisitorForm((prev) => ({ ...prev, invited_by: event.target.value }))}
                            placeholder="Nome da pessoa"
                          />
                        </label>
                      )}
                    </div>

                    <p className="rede-signup-hint">Campos com * são obrigatórios.</p>
                  </>
                )}

                {visitorStep === 2 && (
                  <>
                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>O que você vivenciou?</h3>
                        <span className="rede-signup-required-label">Obrigatório</span>
                      </div>
                      <div className="rede-signup-checks">
                        {VISIT_EXPERIENCE.map((item) => (
                          <label key={item.id}>
                            <input
                              type="checkbox"
                              checked={visitExperience.includes(item.id)}
                              onChange={() => toggleVisitorOption(setVisitExperience, item.id)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="rede-signup-notes">
                      O que mais marcou você? <span className="rede-signup-hint-inline">(opcional)</span>
                      <textarea
                        rows={2}
                        value={meetingHighlight}
                        onChange={(e) => setMeetingHighlight(e.target.value)}
                        placeholder="Compartilhe o que foi mais especial para você…"
                      />
                    </label>

                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>Você gostaria de participar novamente?</h3>
                      </div>
                      <div className="rede-signup-checks rede-signup-checks--radio">
                        {[
                          { value: "sim", label: "Sim, com certeza!" },
                          { value: "talvez", label: "Talvez, preciso pensar" },
                          { value: "ainda_nao_sei", label: "Ainda não sei" },
                        ].map((opt) => (
                          <label key={opt.value}>
                            <input
                              type="radio"
                              name="want_to_return"
                              value={opt.value}
                              checked={wantToReturn === opt.value}
                              onChange={() => setWantToReturn(opt.value)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>Como podemos cuidar de você?</h3>
                        <span className="rede-signup-required-label">Obrigatório</span>
                      </div>
                      <div className="rede-signup-checks">
                        {CARE_NEEDS.map((item) => (
                          <label key={item.id}>
                            <input
                              type="checkbox"
                              checked={careNeeds.includes(item.id)}
                              onChange={() => toggleVisitorOption(setCareNeeds, item.id)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>Caminhada com Deus</h3>
                        <span className="rede-signup-required-label">Obrigatório</span>
                      </div>
                      <div className="rede-signup-checks">
                        {FAITH_JOURNEY.map((item) => (
                          <label key={item.id}>
                            <input
                              type="checkbox"
                              checked={faithJourney.includes(item.id)}
                              onChange={() => toggleVisitorOption(setFaithJourney, item.id)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {visitorStep === 3 && (
                  <>
                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>Próximos passos na fé</h3>
                        <span className="rede-signup-required-label">Obrigatório</span>
                      </div>
                      <p className="rede-signup-hint" style={{ marginBottom: 10 }}>
                        O que você gostaria de vivenciar na sua caminhada com Deus?
                      </p>
                      <div className="rede-signup-checks">
                        {DOUBTS_INTERESTS.map((item) => (
                          <label key={item.id}>
                            <input
                              type="checkbox"
                              checked={doubtsInterests.includes(item.id)}
                              onChange={() => toggleVisitorOption(setDoubtsInterests, item.id)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="rede-signup-section">
                      <div className="rede-signup-section-header">
                        <h3>Como podemos falar com você?</h3>
                        <span className="rede-signup-required-label">Obrigatório</span>
                      </div>
                      <div className="rede-signup-checks">
                        {CONTACT_PREFERENCES.map((item) => (
                          <label key={item.id}>
                            <input
                              type="checkbox"
                              checked={contactPreferences.includes(item.id)}
                              onChange={() => toggleVisitorOption(setContactPreferences, item.id)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="rede-signup-notes">
                      Gostaria que orássemos por algo específico? <span className="rede-signup-hint-inline">(opcional)</span>
                      <textarea
                        rows={3}
                        value={visitorForm.notes}
                        onChange={(event) => setVisitorForm((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder="Compartilhe um pedido de oração ou algo que você gostaria que a gente soubesse…"
                      />
                    </label>

                    <p className="rede-signup-hint">
                      Essas informações nos ajudam a caminhar com você com cuidado, respeito e amor.
                    </p>
                  </>
                )}

                <div className={`rede-signup-actions ${visitorStep > 1 ? "rede-signup-actions--split" : ""}`}>
                  {visitorStep > 1 && (
                    <button type="button" className="rede-signup-btn--ghost" onClick={prevVisitorStep}>
                      Voltar
                    </button>
                  )}
                  {visitorStep < 3 ? (
                    <button type="button" onClick={nextVisitorStep}>
                      Continuar
                    </button>
                  ) : (
                    <button type="button" disabled={saving} onClick={submitVisitor}>
                      {saving ? "Enviando..." : "Enviar cadastro"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="rede-signup-grid">
                  <label>
                    Nome completo
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                      placeholder="Seu nome"
                    />
                  </label>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="email@domínio.com"
                    />
                  </label>
                  <label>
                    Telefone
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="(83) 9 9999-9999"
                    />
                  </label>
                  <label>
                    Data de nascimento
                    <input
                      type="date"
                      value={form.birthdate}
                      onChange={(event) => setForm((prev) => ({ ...prev, birthdate: event.target.value }))}
                    />
                  </label>
                  <label>
                    Gênero
                    <select
                      value={form.gender}
                      onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </label>
                  <label>
                    Cidade
                    <input
                      type="text"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="Sua cidade"
                    />
                  </label>
                  <label>
                    Estado
                    <input
                      type="text"
                      value={form.state}
                      onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                      placeholder="UF"
                    />
                  </label>
                  <label>
                    Endereço
                    <input
                      type="text"
                      value={form.address}
                      onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                      placeholder="Rua, número"
                    />
                  </label>
                  <label>
                    Igreja na Casa
                    <select
                      value={form.house_id}
                      onChange={(event) => setForm((prev) => ({ ...prev, house_id: event.target.value }))}
                      disabled={Boolean(invite?.house_id)}
                    >
                      <option value="">Selecione</option>
                      {houseOptions.map((house) => (
                        <option key={house.id} value={house.id}>
                          {house.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="rede-signup-section">
                  <div className="rede-signup-section-header">
                    <h3>Chamado ministerial (em discernimento)</h3>
                    <span className="rede-signup-required-label">Obrigatório</span>
                  </div>
                  <div className="rede-signup-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={questionnaire.ministry_discernment}
                        onChange={() => toggleQuestion("ministry_discernment")}
                      />
                      Ainda estou em processo de discernimento
                    </label>
                    {MINISTRY_OPTIONS.map((option) => (
                      <label key={option.value}>
                        <input
                          type="checkbox"
                          checked={gifts.includes(option.value)}
                          onChange={() => toggleGift(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                    <label>
                      <input
                        type="checkbox"
                        checked={memberUnknowns.ministry}
                        onChange={() => toggleMemberUnknown("ministry")}
                      />
                      Não tenho certeza no momento
                    </label>
                  </div>
                </div>

                <div className="rede-signup-section">
                  <div className="rede-signup-section-header">
                    <h3>Serviço e liderança local na Igreja na Casa</h3>
                    <span className="rede-signup-required-label">Obrigatório</span>
                  </div>
                  <div className="rede-signup-checks">
                    {LOCAL_CALLINGS.map((question) => (
                      <label key={question.id}>
                        <input
                          type="checkbox"
                          checked={questionnaire[question.id]}
                          onChange={() => toggleQuestion(question.id)}
                        />
                        {question.label}
                      </label>
                    ))}
                    <label>
                      <input
                        type="checkbox"
                        checked={memberUnknowns.local_callings}
                        onChange={() => toggleMemberUnknown("local_callings")}
                      />
                      Não tenho certeza no momento
                    </label>
                  </div>
                </div>

                <div className="rede-signup-section">
                  <div className="rede-signup-section-header">
                    <h3>Serviço e envio para a Rede</h3>
                    <span className="rede-signup-required-label">Obrigatório</span>
                  </div>
                  <div className="rede-signup-checks">
                    {NETWORK_CALLINGS.map((question) => (
                      <label key={question.id}>
                        <input
                          type="checkbox"
                          checked={questionnaire[question.id]}
                          onChange={() => toggleQuestion(question.id)}
                        />
                        {question.label}
                      </label>
                    ))}
                    <label>
                      <input
                        type="checkbox"
                        checked={memberUnknowns.network_callings}
                        onChange={() => toggleMemberUnknown("network_callings")}
                      />
                      Não tenho certeza no momento
                    </label>
                  </div>
                </div>

                <div className="rede-signup-section">
                  <div className="rede-signup-section-header">
                    <h3>Áreas de serviço</h3>
                    <span className="rede-signup-required-label">Obrigatório</span>
                  </div>
                  <div className="rede-signup-checks">
                    {SERVICE_AREAS.map((area) => (
                      <label key={area.id}>
                        <input
                          type="checkbox"
                          checked={questionnaire[area.id]}
                          onChange={() => toggleQuestion(area.id)}
                        />
                        {area.label}
                      </label>
                    ))}
                    <label>
                      <input
                        type="checkbox"
                        checked={memberUnknowns.service_areas}
                        onChange={() => toggleMemberUnknown("service_areas")}
                      />
                      Não tenho certeza no momento
                    </label>
                  </div>
                </div>

                <div className="rede-signup-section">
                  <div className="rede-signup-section-header">
                    <h3>Rotina espiritual</h3>
                    <span className="rede-signup-required-label">Obrigatório</span>
                  </div>
                  <div className="rede-signup-checks">
                    {SPIRITUAL_ROUTINE.map((item) => (
                      <label key={item.id}>
                        <input
                          type="checkbox"
                          checked={questionnaire[item.id]}
                          onChange={() => toggleQuestion(item.id)}
                        />
                        {item.label}
                      </label>
                    ))}
                    <label>
                      <input
                        type="checkbox"
                        checked={memberUnknowns.spiritual_routine}
                        onChange={() => toggleMemberUnknown("spiritual_routine")}
                      />
                      Não tenho certeza no momento
                    </label>
                  </div>
                </div>

                <div className="rede-signup-section">
                  <div className="rede-signup-section-header">
                    <h3>Situação de discipulado</h3>
                    <span className="rede-signup-required-label">Obrigatório</span>
                  </div>
                  <div className="rede-signup-checks">
                    {DISCIPLESHIP_STATUS.map((item) => (
                      <label key={item.id}>
                        <input
                          type="checkbox"
                          checked={questionnaire[item.id]}
                          onChange={() => toggleQuestion(item.id)}
                        />
                        {item.label}
                      </label>
                    ))}
                    <label>
                      <input
                        type="checkbox"
                        checked={memberUnknowns.discipleship}
                        onChange={() => toggleMemberUnknown("discipleship")}
                      />
                      Não tenho certeza no momento
                    </label>
                  </div>
                </div>

                <label className="rede-signup-notes">
                  Partilha pastoral
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Conte sobre sua caminhada, dons em discernimento ou necessidades"
                  />
                </label>

                <div className="rede-signup-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Enviando..." : "Enviar cadastro"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
