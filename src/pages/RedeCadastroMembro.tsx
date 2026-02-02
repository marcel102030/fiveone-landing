import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./RedeCadastroMembro.css";
import {
  RedeHouseChurch,
  RedeMemberInvite,
  createRedeMemberApplication,
  getRedeMemberInviteByToken,
  listRedeHouseChurches,
} from "../services/redeIgrejas";

const MINISTRY_OPTIONS = [
  { value: "apostolo", label: "Tenho identificacao com o dom Apostolico" },
  { value: "profeta", label: "Tenho identificacao com o dom Profetico" },
  { value: "evangelista", label: "Tenho identificacao com o dom Evangelistico" },
  { value: "pastor", label: "Tenho identificacao com o dom Pastoral" },
  { value: "mestre", label: "Tenho identificacao com o dom de Mestre" },
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
  { id: "culto_casa", label: "Participei de um culto na casa" },
  { id: "estudo_biblico", label: "Participei de um estudo biblico" },
  { id: "convidado_alguem", label: "Fui convidado(a) por alguem" },
  { id: "nao_participei", label: "Ainda nao participei, mas gostaria" },
  { id: "redes_sociais", label: "Conheci a igreja pelas redes sociais" },
];

const CARE_NEEDS: VisitorOption[] = [
  { id: "caminhar", label: "Gostaria que alguem caminhasse comigo mais de perto" },
  { id: "conversar_lideranca", label: "Gostaria de conversar com alguem da lideranca" },
  { id: "oracao", label: "Gostaria de receber oracao" },
  { id: "momento_dificil", label: "Estou passando por um momento dificil" },
  { id: "apenas_conhecendo", label: "Apenas conhecendo por enquanto" },
];

const FAITH_JOURNEY: VisitorOption[] = [
  { id: "novo_na_fe", label: "Sou novo(a) na fe crista" },
  { id: "quero_aprender", label: "Ja sigo a Cristo, mas quero aprender mais" },
  { id: "caminho_ha_tempo", label: "Ja caminho com Jesus ha algum tempo" },
  { id: "retomando", label: "Estou retomando minha fe" },
  { id: "tenho_duvidas", label: "Ainda tenho duvidas sobre a fe crista" },
];

const DOUBTS_INTERESTS: VisitorOption[] = [
  { id: "duvidas_biblicas", label: "Tenho duvidas biblicas" },
  { id: "duvidas_teologicas", label: "Tenho duvidas teologicas" },
  { id: "duvidas_igreja_casas", label: "Tenho duvidas sobre a Igreja nas Casas" },
  { id: "entender_evangelho", label: "Gostaria de entender melhor o Evangelho" },
  { id: "estudar_biblia", label: "Gostaria de estudar a Biblia" },
];

const CONTACT_PREFERENCES: VisitorOption[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "ligacao", label: "Ligacao" },
  { id: "participar", label: "Prefiro apenas participar por enquanto" },
  { id: "sem_contato", label: "Ainda nao desejo contato" },
];

const LOCAL_CALLINGS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_preach_house", label: "Sente-se chamado a compartilhar a Palavra na Igreja na Casa" },
  { id: "wants_bible_study", label: "Deseja conduzir estudo biblico nas casas" },
  { id: "wants_open_house", label: "Tem desejo de abrir sua casa para uma Igreja na Casa" },
  { id: "wants_be_presbitero", label: "Sente-se chamado a caminhar para o presbiterio" },
  { id: "wants_discipleship", label: "Deseja caminhar e cuidar de pessoas no discipulado local" },
];

const NETWORK_CALLINGS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_preach_network", label: "Sente-se chamado a pregar para a rede" },
  { id: "wants_be_ministry_leader", label: "Sente-se chamado a servir na lideranca dos 5 dons" },
  { id: "available_for_training", label: "Disponivel para treinamento e capacitacao na rede" },
  { id: "available_for_missions", label: "Disponivel para missoes e envios" },
];

const SERVICE_AREAS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_serve_worship", label: "Louvor e adoracao" },
  { id: "wants_serve_intercession", label: "Intercessao" },
  { id: "wants_serve_children", label: "Ministerio com criancas" },
  { id: "wants_serve_media", label: "Midia e comunicacao" },
  { id: "wants_serve_hospitality", label: "Hospitalidade e acolhimento" },
  { id: "wants_serve_teaching", label: "Ensino" },
  { id: "wants_serve_pastoral_care", label: "Cuidado pastoral" },
  { id: "wants_serve_practical_support", label: "Apoio pratico" },
];

const SPIRITUAL_ROUTINE: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "routine_bible_reading", label: "Tenho rotina de leitura biblica" },
  { id: "routine_prayer", label: "Tenho rotina de oracao" },
  { id: "routine_fasting", label: "Pratico jejum regularmente" },
  { id: "routine_in_development", label: "Minha rotina espiritual esta em desenvolvimento" },
];

const DISCIPLESHIP_STATUS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "discipleship_current", label: "Ja caminho em discipulado" },
  { id: "wants_discipleship", label: "Desejo caminhar em discipulado" },
  { id: "discipleship_leads", label: "Acompanho ou discipulo outras pessoas" },
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

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    house_id: "",
    notes: "",
  });
  const [gifts, setGifts] = useState<string[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireForm>(emptyQuestionnaire);
  const [visitorForm, setVisitorForm] = useState<VisitorFormState>({
    full_name: "",
    phone: "",
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

  const houseOptions = useMemo(() => houses, [houses]);
  const isVisitor = invite?.member_type === "visitante";
  const invitedBySelected = visitExperience.includes("convidado_alguem");
  const headerTitle = isVisitor ? "Cadastro de visitante" : "Cadastro de membro";
  const headerSubtitle = isVisitor
    ? "Compartilhe com a gente como foi sua visita para que possamos acolher voce com carinho."
    : "Preencha seus dados para solicitar seu cadastro na rede.";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Link invalido. Solicite um novo link de cadastro.");
        setLoading(false);
        return;
      }
      const [inviteData, housesData] = await Promise.all([
        getRedeMemberInviteByToken(token),
        listRedeHouseChurches(),
      ]);
      if (!inviteData) {
        setError("Link invalido ou expirado.");
        setLoading(false);
        return;
      }
      if (inviteData.status !== "ativo") {
        setError("Este link nao esta ativo.");
        setLoading(false);
        return;
      }
      setInvite(inviteData);
      setHouses(housesData);
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

  const toggleVisitorOption = (setter: Dispatch<SetStateAction<string[]>>, value: string) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isVisitor) {
      if (!visitorForm.full_name.trim()) {
        setError("Informe seu nome.");
        return;
      }
      if (!visitorForm.phone.trim()) {
        setError("Informe seu WhatsApp/telefone.");
        return;
      }
      setSaving(true);
      setError(null);
      try {
        await createRedeMemberApplication({
          invite_token: token,
          full_name: visitorForm.full_name.trim(),
          phone: visitorForm.phone.trim(),
          email: null,
          city: visitorForm.city || null,
          state: null,
          address: null,
          member_type: "visitante",
          house_id: visitorForm.house_id && visitorForm.house_id !== "__none__" ? visitorForm.house_id : null,
          gifts: [],
          visit_experience: visitExperience,
          invited_by: invitedBySelected ? visitorForm.invited_by || null : null,
          care_needs: careNeeds,
          faith_journey: faithJourney,
          doubts_interests: doubtsInterests,
          contact_preferences: contactPreferences,
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
      return;
    }
    if (!form.full_name.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createRedeMemberApplication({
        invite_token: token,
        full_name: form.full_name.trim(),
        email: form.email || null,
        phone: form.phone || null,
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
      <div className="rede-signup-card">
        <header>
          <span className="rede-signup-pill">{headerTitle}</span>
          <h1>Rede de Igrejas nas Casas</h1>
          <p>{headerSubtitle}</p>
        </header>

        {loading && <p className="rede-signup-msg">Carregando...</p>}
        {!loading && error && <p className="rede-signup-error">{error}</p>}

        {!loading && !error && success && (
          <div className="rede-signup-success">
            <h2>Cadastro enviado!</h2>
            <p>
              {isVisitor
                ? "Obrigado por compartilhar. Em breve alguem da equipe entrara em contato, se voce desejar."
                : "Seu cadastro foi enviado e sera analisado pela equipe. Voce recebera o retorno em breve."}
            </p>
          </div>
        )}

        {!loading && !error && !success && (
          <form className="rede-signup-form" onSubmit={handleSubmit}>
            {isVisitor ? (
              <>
                <div className="rede-signup-grid">
                  <label>
                    Nome
                    <input
                      type="text"
                      value={visitorForm.full_name}
                      onChange={(event) => setVisitorForm((prev) => ({ ...prev, full_name: event.target.value }))}
                      placeholder="Seu nome"
                    />
                  </label>
                  <label>
                    WhatsApp/Telefone
                    <input
                      type="tel"
                      value={visitorForm.phone}
                      onChange={(event) => setVisitorForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="(83) 9 9999-9999"
                    />
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
                      <option value="__none__">Ainda nao participei</option>
                      {houseOptions.map((house) => (
                        <option key={house.id} value={house.id}>
                          {house.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="rede-signup-section">
                  <h3>Sua visita a Igreja nas Casas</h3>
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
                  {invitedBySelected && (
                    <label className="rede-signup-inline">
                      Quem te convidou?
                      <input
                        type="text"
                        value={visitorForm.invited_by}
                        onChange={(event) => setVisitorForm((prev) => ({ ...prev, invited_by: event.target.value }))}
                        placeholder="Nome da pessoa (opcional)"
                      />
                    </label>
                  )}
                </div>

                <div className="rede-signup-section">
                  <h3>Acompanhamento e cuidado</h3>
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
                  <h3>Caminhada cristã</h3>
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

                <div className="rede-signup-section">
                  <h3>Duvidas e interesses</h3>
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
                  <h3>Como podemos falar com voce?</h3>
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
                  Quer compartilhar algo conosco?
                  <textarea
                    rows={3}
                    value={visitorForm.notes}
                    onChange={(event) => setVisitorForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Se quiser, conte brevemente sobre sua historia, duvidas ou algo pelo qual possamos orar."
                  />
                </label>

                <p className="rede-signup-hint">
                  Essas informacoes nos ajudam a caminhar com voce com cuidado, respeito e amor.
                </p>

                <div className="rede-signup-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Enviando..." : "Enviar cadastro"}
                  </button>
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
                      placeholder="email@dominio.com"
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
                    Endereco
                    <input
                      type="text"
                      value={form.address}
                      onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                      placeholder="Rua, numero"
                    />
                  </label>
                  <label>
                    Igreja na casa
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
                  <h3>Chamado ministerial (em discernimento)</h3>
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
                  </div>
                </div>

                <div className="rede-signup-section">
                  <h3>Servico e lideranca local na Igreja na Casa</h3>
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
                  </div>
                </div>

                <div className="rede-signup-section">
                  <h3>Servico e envio para a Rede</h3>
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
                  </div>
                </div>

                <div className="rede-signup-section">
                  <h3>Areas de servico</h3>
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
                  </div>
                </div>

                <div className="rede-signup-section">
                  <h3>Rotina espiritual</h3>
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
                  </div>
                </div>

                <div className="rede-signup-section">
                  <h3>Situacao de discipulado</h3>
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
