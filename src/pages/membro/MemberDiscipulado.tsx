import { useEffect, useMemo, useState } from "react";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import {
  RedeDiscipleshipPair,
  RedeDiscipleshipSession,
  createDiscipleshipSession,
  deleteDiscipleshipSession,
  listDiscipleshipPairsByMember,
  listDiscipleshipSessions,
} from "../../services/redeIgrejas";
import "./memberPages.css";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

export default function MemberDiscipulado() {
  const { profile } = usePlatformUserProfile();
  const memberId = profile?.memberId || null;
  const isAdmin = profile?.role === "ADMIN";
  const [pairs, setPairs] = useState<RedeDiscipleshipPair[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<RedeDiscipleshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    session_date: new Date().toISOString().slice(0, 10),
    topics: "",
    tasks: "",
    notes: "",
    visibility: "disciple",
  });

  useEffect(() => {
    const load = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await listDiscipleshipPairsByMember(memberId);
        setPairs(data);
        if (data.length && !selectedPairId) {
          setSelectedPairId(data[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId]);

  useEffect(() => {
    const loadSessions = async () => {
      if (!selectedPairId) {
        setSessions([]);
        return;
      }
      const data = await listDiscipleshipSessions(selectedPairId);
      setSessions(data);
    };
    loadSessions();
  }, [selectedPairId]);

  const selectedPair = useMemo(
    () => pairs.find((pair) => pair.id === selectedPairId) || null,
    [pairs, selectedPairId]
  );

  const isDiscipler = useMemo(() => {
    if (!selectedPair || !memberId) return false;
    return selectedPair.discipler_member_id === memberId || isAdmin;
  }, [selectedPair, memberId, isAdmin]);

  const pairLabel = (pair: RedeDiscipleshipPair) => {
    const discipler = pair.discipler?.full_name || "Discipulador";
    const disciple = pair.disciple?.full_name || "Discipulo";
    return `${discipler} ↔ ${disciple}`;
  };

  const handleCreateSession = async () => {
    if (!selectedPairId || !memberId) return;
    if (!sessionForm.topics.trim() && !sessionForm.tasks.trim() && !sessionForm.notes.trim()) return;
    setSaving(true);
    try {
      await createDiscipleshipSession({
        pair_id: selectedPairId,
        session_date: sessionForm.session_date,
        topics: sessionForm.topics || null,
        tasks: sessionForm.tasks || null,
        notes: sessionForm.notes || null,
        visibility: sessionForm.visibility,
        created_by_member_id: memberId,
      });
      const refreshed = await listDiscipleshipSessions(selectedPairId);
      setSessions(refreshed);
      setSessionForm({
        session_date: new Date().toISOString().slice(0, 10),
        topics: "",
        tasks: "",
        notes: "",
        visibility: "disciple",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!selectedPairId) return;
    await deleteDiscipleshipSession(id);
    const refreshed = await listDiscipleshipSessions(selectedPairId);
    setSessions(refreshed);
  };

  if (!memberId) {
    return (
      <div className="member-page">
        <div className="member-card">Vincule seu perfil a um membro para ver o discipulado.</div>
      </div>
    );
  }

  return (
    <div className="member-page">
      <div className="member-page-header">
        <h1>Discipulado 1-1</h1>
        <p>Veja quem caminha com voce e acompanhe as conversas e tarefas.</p>
      </div>

      <div className="member-card member-card--wide">
        <h3>Vinculos ativos</h3>
        {loading && <p className="member-card-muted">Carregando vinculos...</p>}
        {!loading && !pairs.length && (
          <p className="member-card-muted">Nenhum vinculo criado ainda. Fale com a lideranca.</p>
        )}
        {!!pairs.length && (
          <div className="member-tabs">
            {pairs.map((pair) => (
              <button
                key={pair.id}
                className={`member-tab ${pair.id === selectedPairId ? "is-active" : ""}`}
                onClick={() => setSelectedPairId(pair.id)}
              >
                {pairLabel(pair)}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPair && (
        <div className="member-cards">
          <div className="member-card">
            <h3>Seu discipulador</h3>
            <p className="member-card-value">{selectedPair.discipler?.full_name || "Em definicao"}</p>
            <p className="member-card-muted">{selectedPair.discipler?.phone || ""}</p>
          </div>
          <div className="member-card">
            <h3>Seu discipulo</h3>
            <p className="member-card-value">{selectedPair.disciple?.full_name || "Em definicao"}</p>
            <p className="member-card-muted">{selectedPair.disciple?.phone || ""}</p>
          </div>
        </div>
      )}

      <div className="member-card member-card--wide">
        <h3>Sessoes e tarefas</h3>
        <div className="member-list">
          {sessions.map((session) => (
            <div key={session.id} className="member-list-item">
              <div>
                <strong>{formatDate(session.session_date)}</strong>
                <p>{session.topics || "Sem topicos definidos"}</p>
                {session.tasks && <p>Tarefas: {session.tasks}</p>}
                {session.notes && <p>Observacoes: {session.notes}</p>}
              </div>
              {isDiscipler && (
                <button className="member-btn member-btn--ghost" onClick={() => handleDeleteSession(session.id)}>
                  Remover
                </button>
              )}
            </div>
          ))}
          {!sessions.length && <p className="member-card-muted">Nenhuma sessao registrada ainda.</p>}
        </div>

        {isDiscipler && (
          <div className="member-form-grid" style={{ marginTop: 16 }}>
            <label>
              Data
              <input
                type="date"
                value={sessionForm.session_date}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, session_date: event.target.value }))}
              />
            </label>
            <label className="member-form-wide">
              Topicos conversados
              <input
                type="text"
                value={sessionForm.topics}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, topics: event.target.value }))}
              />
            </label>
            <label className="member-form-wide">
              Tarefas combinadas
              <textarea
                rows={3}
                value={sessionForm.tasks}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, tasks: event.target.value }))}
              />
            </label>
            <label className="member-form-wide">
              Observacoes
              <textarea
                rows={3}
                value={sessionForm.notes}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
            <label>
              Visibilidade
              <select
                value={sessionForm.visibility}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, visibility: event.target.value }))}
              >
                <option value="disciple">Visivel para discipulo</option>
                <option value="lideranca">Visivel para lideranca</option>
              </select>
            </label>
            <button className="member-btn" onClick={handleCreateSession} disabled={saving}>
              {saving ? "Salvando..." : "Registrar sessao"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
