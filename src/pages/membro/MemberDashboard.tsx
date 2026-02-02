import { useEffect, useMemo, useState } from "react";
import { getCurrentUserId } from "../../utils/user";
import { getUserByEmail, updateUserMemberLink, updateUserRole } from "../../services/userAccount";
import {
  RedeMemberWeeklyGoal,
  RedeMemberPrayerRequest,
  createPrayerRequest,
  deletePrayerRequest,
  getRedeHouseById,
  getRedeMemberByEmail,
  getRedeMemberById,
  getRedeMemberJourney,
  getRedePrimaryHouseMember,
  getWeeklyGoal,
  listPrayerRequestsForMember,
  updatePrayerRequest,
  upsertRedeMemberJourney,
  upsertWeeklyGoal,
} from "../../services/redeIgrejas";
import { usePlatformUserProfile, storePlatformProfile } from "../../hooks/usePlatformUserProfile";
import "./memberPages.css";

const WEEK_GOALS = [
  { id: "word", label: "Palavra" },
  { id: "prayer", label: "Oracao" },
  { id: "fellowship", label: "Comunhao" },
  { id: "service", label: "Servico" },
  { id: "mission", label: "Missao" },
];

const CLOSE_RECOMMENDATIONS = [
  { id: "baptism", label: "Conversar sobre batismo" },
  { id: "discipleship", label: "Iniciar discipulado 1-1" },
  { id: "serve", label: "Escolher uma area para servir" },
  { id: "track", label: "Definir trilha atual" },
];

const weekStartISO = () => {
  const now = new Date();
  const day = now.getDay(); // 0-6
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
};

export default function MemberDashboard() {
  const { profile } = usePlatformUserProfile();
  const [loading, setLoading] = useState(true);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [memberStatus, setMemberStatus] = useState<string | null>(null);
  const [houseName, setHouseName] = useState<string | null>(null);
  const [houseId, setHouseId] = useState<string | null>(null);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [journeyForm, setJourneyForm] = useState({
    baptism_done: false,
    baptism_date: "",
    discipleship_status: "",
    serve_area: "",
    current_track: "",
    notes: "",
  });
  const [journeySaving, setJourneySaving] = useState(false);
  const [weeklyGoal, setWeeklyGoalState] = useState<RedeMemberWeeklyGoal | null>(null);
  const [weeklySaving, setWeeklySaving] = useState(false);
  const [prayerRequests, setPrayerRequests] = useState<RedeMemberPrayerRequest[]>([]);
  const [prayerForm, setPrayerForm] = useState({ title: "", content: "", is_private: false });
  const [prayerSaving, setPrayerSaving] = useState(false);
  const [editingPrayerId, setEditingPrayerId] = useState<string | null>(null);

  const memberId = profile?.memberId || null;
  const email = useMemo(() => getCurrentUserId(), []);
  const weekStart = useMemo(() => weekStartISO(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!memberId) {
        setLoading(false);
        return;
      }
      try {
        const member = await getRedeMemberById(memberId);
        setMemberName(member?.full_name || null);
        setMemberStatus(member?.status || null);
        const primary = await getRedePrimaryHouseMember(memberId);
        if (primary?.house_id) {
          const house = await getRedeHouseById(primary.house_id);
          setHouseName(house?.name || null);
          setHouseId(primary.house_id);
        }
        const [journeyRow, weeklyRow, prayers] = await Promise.all([
          getRedeMemberJourney(memberId),
          getWeeklyGoal(memberId, weekStart),
          listPrayerRequestsForMember(memberId),
        ]);
        setJourneyForm({
          baptism_done: journeyRow?.baptism_done || false,
          baptism_date: journeyRow?.baptism_date || "",
          discipleship_status: journeyRow?.discipleship_status || "",
          serve_area: journeyRow?.serve_area || "",
          current_track: journeyRow?.current_track || "",
          notes: journeyRow?.notes || "",
        });
        setWeeklyGoalState(weeklyRow);
        setPrayerRequests(prayers);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId]);

  const nextStep = useMemo(() => {
    if (!journeyForm.baptism_done) return CLOSE_RECOMMENDATIONS[0].label;
    if (!journeyForm.discipleship_status) return CLOSE_RECOMMENDATIONS[1].label;
    if (!journeyForm.serve_area) return CLOSE_RECOMMENDATIONS[2].label;
    if (!journeyForm.current_track) return CLOSE_RECOMMENDATIONS[3].label;
    return "Continue firme na caminhada com sua casa.";
  }, [journeyForm]);

  const handleLinkByEmail = async () => {
    if (!email) {
      setLinkMessage("Email nao encontrado. Faca login novamente.");
      return;
    }
    setLinking(true);
    setLinkMessage(null);
    try {
      const matched = await getRedeMemberByEmail(email);
      if (!matched?.id) {
        setLinkMessage("Nao encontramos um membro com este email. Fale com a lideranca para vincular.");
        return;
      }
      await updateUserMemberLink(email, matched.id);
      await updateUserRole(email, "MEMBER");
      const row = await getUserByEmail(email);
      storePlatformProfile({
        email,
        name: row?.name || null,
        formation: (row as any)?.formation || null,
        role: (row as any)?.role || "MEMBER",
        memberId: matched.id,
      });
      setLinkMessage("Vinculo realizado com sucesso. Recarregue a pagina.");
    } catch {
      setLinkMessage("Nao foi possivel vincular agora. Tente novamente.");
    } finally {
      setLinking(false);
    }
  };

  const saveJourney = async () => {
    if (!memberId) return;
    setJourneySaving(true);
    try {
      await upsertRedeMemberJourney({
        member_id: memberId,
        baptism_done: journeyForm.baptism_done,
        baptism_date: journeyForm.baptism_date || null,
        discipleship_status: journeyForm.discipleship_status || null,
        serve_area: journeyForm.serve_area || null,
        current_track: journeyForm.current_track || null,
        notes: journeyForm.notes || null,
      });
    } finally {
      setJourneySaving(false);
    }
  };

  const saveWeeklyGoal = async (updates?: Partial<RedeMemberWeeklyGoal>) => {
    if (!memberId) return;
    const payload = {
      member_id: memberId,
      week_start: weekStart,
      word: updates?.word ?? weeklyGoal?.word ?? false,
      prayer: updates?.prayer ?? weeklyGoal?.prayer ?? false,
      fellowship: updates?.fellowship ?? weeklyGoal?.fellowship ?? false,
      service: updates?.service ?? weeklyGoal?.service ?? false,
      mission: updates?.mission ?? weeklyGoal?.mission ?? false,
      notes: updates?.notes ?? weeklyGoal?.notes ?? null,
    };
    setWeeklySaving(true);
    try {
      await upsertWeeklyGoal(payload);
      setWeeklyGoalState({ ...(weeklyGoal || {}), ...payload, id: weeklyGoal?.id || "" } as RedeMemberWeeklyGoal);
    } finally {
      setWeeklySaving(false);
    }
  };

  const handlePrayerSubmit = async () => {
    if (!memberId) return;
    if (!prayerForm.content.trim()) return;
    setPrayerSaving(true);
    try {
      if (editingPrayerId) {
        await updatePrayerRequest(editingPrayerId, {
          title: prayerForm.title || null,
          content: prayerForm.content.trim(),
          is_private: prayerForm.is_private,
        });
      } else {
        await createPrayerRequest({
          member_id: memberId,
          house_id: houseId,
          title: prayerForm.title || null,
          content: prayerForm.content.trim(),
          is_private: prayerForm.is_private,
          status: "aberto",
        });
      }
      const refreshed = await listPrayerRequestsForMember(memberId);
      setPrayerRequests(refreshed);
      setPrayerForm({ title: "", content: "", is_private: false });
      setEditingPrayerId(null);
    } finally {
      setPrayerSaving(false);
    }
  };

  const startEditPrayer = (item: RedeMemberPrayerRequest) => {
    setEditingPrayerId(item.id);
    setPrayerForm({
      title: item.title || "",
      content: item.content,
      is_private: item.is_private,
    });
  };

  const handleDeletePrayer = async (item: RedeMemberPrayerRequest) => {
    if (!window.confirm("Remover este pedido?")) return;
    setPrayerSaving(true);
    try {
      await deletePrayerRequest(item.id);
      const refreshed = await listPrayerRequestsForMember(memberId || "");
      setPrayerRequests(refreshed);
    } finally {
      setPrayerSaving(false);
    }
  };

  return (
    <section className="member-page">
      <header className="member-page-header">
        <h1>Minha Jornada</h1>
        <p>Acompanhe sua caminhada e os passos da sua Igreja na Casa.</p>
      </header>

      {!memberId && (
        <div className="member-alert">
          <strong>Status do vinculo:</strong> ainda nao vinculado.
          <button type="button" className="member-btn" onClick={handleLinkByEmail} disabled={linking}>
            {linking ? "Vinculando..." : "Vincular por email"}
          </button>
          {linkMessage && <span className="member-alert-msg">{linkMessage}</span>}
        </div>
      )}

      {memberId && (
        <>
          <div className="member-cards">
            <article className="member-card">
              <h3>Membro</h3>
              <p className="member-card-value">{memberName || "Carregando..."}</p>
              <span className="member-card-muted">Status: {memberStatus || "ativo"}</span>
            </article>
            <article className="member-card">
              <h3>Igreja na Casa</h3>
              <p className="member-card-value">{houseName || (loading ? "Carregando..." : "Nao vinculada")}</p>
              <span className="member-card-muted">Acompanhe sua casa e encontros.</span>
            </article>
            <article className="member-card">
              <h3>Proximo passo recomendado</h3>
              <p className="member-card-value">{nextStep}</p>
              <span className="member-card-muted">Baseado na sua jornada atual.</span>
            </article>
          </div>

          <div className="member-card member-card--wide">
            <h3>Minha Jornada</h3>
            <div className="member-form-grid">
              <label>
                Batismo realizado?
                <select
                  value={journeyForm.baptism_done ? "sim" : "nao"}
                  onChange={(e) => setJourneyForm((prev) => ({ ...prev, baptism_done: e.target.value === "sim" }))}
                >
                  <option value="nao">Nao</option>
                  <option value="sim">Sim</option>
                </select>
              </label>
              <label>
                Data do batismo
                <input
                  type="date"
                  value={journeyForm.baptism_date}
                  onChange={(e) => setJourneyForm((prev) => ({ ...prev, baptism_date: e.target.value }))}
                />
              </label>
              <label>
                Discipulado (em andamento)
                <input
                  type="text"
                  value={journeyForm.discipleship_status}
                  onChange={(e) => setJourneyForm((prev) => ({ ...prev, discipleship_status: e.target.value }))}
                  placeholder="Ex: com Joao"
                />
              </label>
              <label>
                Servir (area)
                <input
                  type="text"
                  value={journeyForm.serve_area}
                  onChange={(e) => setJourneyForm((prev) => ({ ...prev, serve_area: e.target.value }))}
                  placeholder="Ex: hospitalidade"
                />
              </label>
              <label>
                Trilha atual
                <input
                  type="text"
                  value={journeyForm.current_track}
                  onChange={(e) => setJourneyForm((prev) => ({ ...prev, current_track: e.target.value }))}
                  placeholder="Ex: discipulado basico"
                />
              </label>
              <label className="member-form-wide">
                Observacoes
                <textarea
                  rows={3}
                  value={journeyForm.notes}
                  onChange={(e) => setJourneyForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </label>
            </div>
            <div className="member-actions">
              <button type="button" className="member-btn" onClick={saveJourney} disabled={journeySaving}>
                {journeySaving ? "Salvando..." : "Salvar jornada"}
              </button>
            </div>
          </div>

          <div className="member-card member-card--wide">
            <h3>Metas da semana</h3>
            <div className="member-checklist">
              {WEEK_GOALS.map((goal) => (
                <label key={goal.id} className="member-check">
                  <input
                    type="checkbox"
                    checked={(weeklyGoal as any)?.[goal.id] || false}
                    onChange={(e) => saveWeeklyGoal({ [goal.id]: e.target.checked } as any)}
                  />
                  {goal.label}
                </label>
              ))}
            </div>
            {weeklySaving && <span className="member-card-muted">Salvando...</span>}
          </div>

          <div className="member-card member-card--wide">
            <h3>Pedidos de oracao</h3>
            <div className="member-form-grid">
              <label>
                Titulo (opcional)
                <input
                  type="text"
                  value={prayerForm.title}
                  onChange={(e) => setPrayerForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </label>
              <label className="member-form-wide">
                Pedido
                <textarea
                  rows={3}
                  value={prayerForm.content}
                  onChange={(e) => setPrayerForm((prev) => ({ ...prev, content: e.target.value }))}
                />
              </label>
              <label className="member-check">
                <input
                  type="checkbox"
                  checked={prayerForm.is_private}
                  onChange={(e) => setPrayerForm((prev) => ({ ...prev, is_private: e.target.checked }))}
                />
                Privado (lideranca)
              </label>
            </div>
            <div className="member-actions">
              <button type="button" className="member-btn" onClick={handlePrayerSubmit} disabled={prayerSaving}>
                {prayerSaving ? "Salvando..." : editingPrayerId ? "Atualizar pedido" : "Adicionar pedido"}
              </button>
              {editingPrayerId && (
                <button type="button" className="member-btn member-btn--ghost" onClick={() => {
                  setEditingPrayerId(null);
                  setPrayerForm({ title: "", content: "", is_private: false });
                }}>
                  Cancelar
                </button>
              )}
            </div>
            <div className="member-list">
              {prayerRequests.map((item) => (
                <div key={item.id} className="member-list-item">
                  <div>
                    <strong>{item.title || "Pedido de oracao"}</strong>
                    <p>{item.content}</p>
                    <span className="member-card-muted">{item.is_private ? "Privado" : "Publico"}</span>
                  </div>
                  {item.member_id === memberId && (
                    <div className="member-actions">
                      <button type="button" className="member-btn member-btn--ghost" onClick={() => startEditPrayer(item)}>Editar</button>
                      <button type="button" className="member-btn member-btn--ghost" onClick={() => handleDeletePrayer(item)}>Remover</button>
                    </div>
                  )}
                </div>
              ))}
              {!prayerRequests.length && (
                <span className="member-card-muted">Nenhum pedido ainda.</span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
