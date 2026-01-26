import { useEffect, useMemo, useState } from "react";
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
  { value: "apostolo", label: "Apostolo" },
  { value: "profeta", label: "Profeta" },
  { value: "evangelista", label: "Evangelista" },
  { value: "pastor", label: "Pastor" },
  { value: "mestre", label: "Mestre" },
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
  available_for_training: boolean;
  available_for_missions: boolean;
};

const MEMBER_QUESTIONS: { id: keyof QuestionnaireForm; label: string }[] = [
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

const SERVICE_AREAS: { id: keyof QuestionnaireForm; label: string }[] = [
  { id: "wants_serve_worship", label: "Louvor e adoracao" },
  { id: "wants_serve_intercession", label: "Intercessao" },
  { id: "wants_serve_children", label: "Ministerio com criancas" },
  { id: "wants_serve_media", label: "Midia e comunicacao" },
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

  const houseOptions = useMemo(() => houses, [houses]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
          <span className="rede-signup-pill">Cadastro de membro</span>
          <h1>Rede de Igrejas nas Casas</h1>
          <p>Preencha seus dados para solicitar seu cadastro na rede.</p>
        </header>

        {loading && <p className="rede-signup-msg">Carregando...</p>}
        {!loading && error && <p className="rede-signup-error">{error}</p>}

        {!loading && !error && success && (
          <div className="rede-signup-success">
            <h2>Cadastro enviado!</h2>
            <p>Seu cadastro foi enviado e sera analisado pela equipe. Voce recebera o retorno em breve.</p>
          </div>
        )}

        {!loading && !error && !success && (
          <form className="rede-signup-form" onSubmit={handleSubmit}>
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
              <h3>Dom ministerial</h3>
              <div className="rede-signup-checks">
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
              <h3>Chamados e disponibilidade</h3>
              <div className="rede-signup-checks">
                {MEMBER_QUESTIONS.map((question) => (
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

            <label className="rede-signup-notes">
              Observacoes
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Informacoes adicionais"
              />
            </label>

            <div className="rede-signup-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Enviando..." : "Enviar cadastro"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
