import { useEffect, useMemo, useState } from "react";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import {
  RedeNotice,
  RedeEvent,
  createEvent,
  createNotice,
  getRedeHouseById,
  getRedePrimaryHouseMember,
  listEvents,
  listNotices,
} from "../../services/redeIgrejas";
import "./memberPages.css";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
};

export default function MemberNotices() {
  const { profile } = usePlatformUserProfile();
  const memberId = profile?.memberId || null;
  const isAdmin = profile?.role === "ADMIN";
  const [houseId, setHouseId] = useState<string | null>(null);
  const [houseName, setHouseName] = useState<string | null>(null);
  const [isHouseLeader, setIsHouseLeader] = useState(false);
  const [notices, setNotices] = useState<RedeNotice[]>([]);
  const [events, setEvents] = useState<RedeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", audience: "rede" });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    start_at: "",
    end_at: "",
    location: "",
    audience: "rede",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const primary = await getRedePrimaryHouseMember(memberId);
        const house = primary?.house_id ? await getRedeHouseById(primary.house_id) : null;
        setHouseId(primary?.house_id || null);
        setHouseName(house?.name || null);
        const role = (primary?.role || "").toLowerCase();
        setIsHouseLeader(role === "lider" || role === "presbitero");
        const [noticeRows, eventRows] = await Promise.all([
          listNotices(primary?.house_id || null),
          listEvents(primary?.house_id || null),
        ]);
        setNotices(noticeRows);
        setEvents(eventRows);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId]);

  const canCreate = useMemo(() => isAdmin || isHouseLeader, [isAdmin, isHouseLeader]);

  const handleCreateNotice = async () => {
    if (!memberId) return;
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    setSaving(true);
    try {
      await createNotice({
        title: noticeForm.title.trim(),
        content: noticeForm.content.trim(),
        audience: noticeForm.audience,
        house_id: noticeForm.audience === "casa" ? houseId : null,
        created_by_member_id: memberId,
      });
      const refreshed = await listNotices(houseId);
      setNotices(refreshed);
      setNoticeForm({ title: "", content: "", audience: "rede" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!memberId) return;
    if (!eventForm.title.trim() || !eventForm.start_at) return;
    setSaving(true);
    try {
      await createEvent({
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        start_at: eventForm.start_at,
        end_at: eventForm.end_at || null,
        location: eventForm.location.trim() || null,
        audience: eventForm.audience,
        house_id: eventForm.audience === "casa" ? houseId : null,
        created_by_member_id: memberId,
      });
      const refreshed = await listEvents(houseId);
      setEvents(refreshed);
      setEventForm({ title: "", description: "", start_at: "", end_at: "", location: "", audience: "rede" });
    } finally {
      setSaving(false);
    }
  };

  if (!memberId) {
    return (
      <div className="member-page">
        <div className="member-card">Vincule seu perfil a um membro para acessar avisos e agenda.</div>
      </div>
    );
  }

  return (
    <div className="member-page">
      <div className="member-page-header">
        <h1>Avisos & Calendario</h1>
        <p>Comunicados da rede e agenda da sua casa.</p>
      </div>

      {loading && <div className="member-card">Carregando avisos...</div>}

      {!loading && (
        <>
          <div className="member-card member-card--wide">
            <h3>Feed de avisos</h3>
            <div className="member-list">
              {notices.map((notice) => (
                <div key={notice.id} className="member-list-item">
                  <div>
                    <strong>{notice.title}</strong>
                    <p>{notice.content}</p>
                  </div>
                  <span className="member-card-muted">
                    {notice.house_id ? `Casa: ${houseName || "-"}` : "Rede"}
                  </span>
                </div>
              ))}
              {!notices.length && <p className="member-card-muted">Nenhum aviso publicado ainda.</p>}
            </div>
          </div>

          <div className="member-card member-card--wide">
            <h3>Eventos e agenda</h3>
            <div className="member-list">
              {events.map((event) => (
                <div key={event.id} className="member-list-item">
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.description || "Evento da rede"}</p>
                    <p>Inicio: {formatDateTime(event.start_at)}</p>
                    {event.end_at && <p>Fim: {formatDateTime(event.end_at)}</p>}
                  </div>
                  <span className="member-card-muted">{event.location || "Local a definir"}</span>
                </div>
              ))}
              {!events.length && <p className="member-card-muted">Nenhum evento agendado ainda.</p>}
            </div>
          </div>

          {canCreate && (
            <div className="member-cards">
              <div className="member-card">
                <h3>Novo aviso</h3>
                <div className="member-form-grid">
                  <label className="member-form-wide">
                    Titulo
                    <input
                      type="text"
                      value={noticeForm.title}
                      onChange={(event) => setNoticeForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </label>
                  <label className="member-form-wide">
                    Mensagem
                    <textarea
                      rows={3}
                      value={noticeForm.content}
                      onChange={(event) => setNoticeForm((prev) => ({ ...prev, content: event.target.value }))}
                    />
                  </label>
                  <label>
                    Publico
                    <select
                      value={noticeForm.audience}
                      onChange={(event) => setNoticeForm((prev) => ({ ...prev, audience: event.target.value }))}
                    >
                      <option value="rede">Rede</option>
                      <option value="casa">Minha casa</option>
                    </select>
                  </label>
                  <button className="member-btn" onClick={handleCreateNotice} disabled={saving}>
                    {saving ? "Salvando..." : "Publicar aviso"}
                  </button>
                </div>
              </div>

              <div className="member-card">
                <h3>Novo evento</h3>
                <div className="member-form-grid">
                  <label className="member-form-wide">
                    Titulo
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </label>
                  <label className="member-form-wide">
                    Descricao
                    <textarea
                      rows={3}
                      value={eventForm.description}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </label>
                  <label>
                    Inicio
                    <input
                      type="datetime-local"
                      value={eventForm.start_at}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, start_at: event.target.value }))}
                    />
                  </label>
                  <label>
                    Fim
                    <input
                      type="datetime-local"
                      value={eventForm.end_at}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, end_at: event.target.value }))}
                    />
                  </label>
                  <label className="member-form-wide">
                    Local
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
                    />
                  </label>
                  <label>
                    Publico
                    <select
                      value={eventForm.audience}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, audience: event.target.value }))}
                    >
                      <option value="rede">Rede</option>
                      <option value="casa">Minha casa</option>
                    </select>
                  </label>
                  <button className="member-btn" onClick={handleCreateEvent} disabled={saving}>
                    {saving ? "Salvando..." : "Criar evento"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
