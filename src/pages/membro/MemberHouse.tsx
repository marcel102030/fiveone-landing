import { useEffect, useMemo, useState } from "react";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import {
  RedeHouseAttendance,
  RedeHouseMeeting,
  RedeHouseServiceSchedule,
  RedeHouseMemberDetail,
  RedeHouseChurch,
  createAttendance,
  createHouseMeeting,
  getNextHouseMeeting,
  getRedeHouseById,
  getRedePrimaryHouseMember,
  listAttendanceForMember,
  listHouseMeetings,
  listHouseMembersDetailed,
  listRedePresbiteros,
  listServiceSchedule,
  updateHouseMeeting,
  updateServiceSchedule,
  upsertServiceSchedule,
} from "../../services/redeIgrejas";
import "./memberPages.css";

const DEFAULT_SLOTS = ["Conducao", "Recepcao", "Criancas", "Louvor", "Lanche", "Intercessao"];

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  return value.slice(0, 5);
};

export default function MemberHouse() {
  const { profile } = usePlatformUserProfile();
  const memberId = profile?.memberId || null;
  const isAdmin = profile?.role === "ADMIN";
  const [loading, setLoading] = useState(true);
  const [house, setHouse] = useState<RedeHouseChurch | null>(null);
  const [houseMembers, setHouseMembers] = useState<RedeHouseMemberDetail[]>([]);
  const [presbiteroName, setPresbiteroName] = useState<string | null>(null);
  const [primaryHouseRole, setPrimaryHouseRole] = useState<string | null>(null);
  const [nextMeeting, setNextMeeting] = useState<RedeHouseMeeting | null>(null);
  const [meetingHistory, setMeetingHistory] = useState<RedeHouseMeeting[]>([]);
  const [attendance, setAttendance] = useState<RedeHouseAttendance[]>([]);
  const [schedule, setSchedule] = useState<RedeHouseServiceSchedule[]>([]);
  const [scheduleEdits, setScheduleEdits] = useState<Record<string, string | null>>({});
  const [meetingForm, setMeetingForm] = useState({
    meeting_date: "",
    meeting_time: "",
    liturgy_text: "",
    discussion_questions: "",
    content_link: "",
  });
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const isHouseLeader = useMemo(() => {
    const role = (primaryHouseRole || "").toLowerCase();
    return role === "lider" || role === "presbitero" || isAdmin;
  }, [primaryHouseRole, isAdmin]);

  const houseId = house?.id || null;

  useEffect(() => {
    const load = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const primary = await getRedePrimaryHouseMember(memberId);
        if (!primary?.house_id) {
          setHouse(null);
          setLoading(false);
          return;
        }
        setPrimaryHouseRole(primary.role || null);
        const [houseRow, members, presbiteros] = await Promise.all([
          getRedeHouseById(primary.house_id),
          listHouseMembersDetailed(primary.house_id),
          listRedePresbiteros(),
        ]);
        setHouse(houseRow);
        setHouseMembers(members);
        const presbName = houseRow?.presbitero_id
          ? presbiteros.find((p) => p.id === houseRow.presbitero_id)?.member?.full_name || null
          : null;
        setPresbiteroName(presbName);
        const today = new Date().toISOString().slice(0, 10);
        const [next, history, attendanceRows] = await Promise.all([
          getNextHouseMeeting(primary.house_id, today),
          listHouseMeetings(primary.house_id, 6),
          listAttendanceForMember(memberId, 8),
        ]);
        setNextMeeting(next);
        setMeetingHistory(history);
        setAttendance(attendanceRows);
        if (next?.id) {
          const scheduleRows = await listServiceSchedule(next.id);
          setSchedule(scheduleRows);
          setScheduleEdits(
            scheduleRows.reduce((acc, item) => {
              acc[item.id] = item.member_id;
              return acc;
            }, {} as Record<string, string | null>)
          );
        } else {
          setSchedule([]);
          setScheduleEdits({});
        }
        if (next) {
          setMeetingForm({
            meeting_date: next.meeting_date,
            meeting_time: next.meeting_time || "",
            liturgy_text: next.liturgy_text || "",
            discussion_questions: next.discussion_questions || "",
            content_link: next.content_link || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId]);

  const memberOptions = useMemo(
    () =>
      houseMembers
        .map((item) => ({
          id: item.member_id,
          label: item.member?.full_name || "Membro",
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [houseMembers]
  );

  const hasCheckedIn = useMemo(() => {
    if (!nextMeeting?.id) return false;
    return attendance.some((entry) => entry.meeting_id === nextMeeting.id);
  }, [attendance, nextMeeting]);

  const saveMeeting = async () => {
    if (!memberId || !houseId) return;
    if (!meetingForm.meeting_date) return;
    setSavingMeeting(true);
    try {
      if (nextMeeting?.id) {
        await updateHouseMeeting(nextMeeting.id, {
          meeting_date: meetingForm.meeting_date,
          meeting_time: meetingForm.meeting_time || null,
          liturgy_text: meetingForm.liturgy_text || null,
          discussion_questions: meetingForm.discussion_questions || null,
          content_link: meetingForm.content_link || null,
        });
        setNextMeeting({
          ...nextMeeting,
          meeting_date: meetingForm.meeting_date,
          meeting_time: meetingForm.meeting_time || null,
          liturgy_text: meetingForm.liturgy_text || null,
          discussion_questions: meetingForm.discussion_questions || null,
          content_link: meetingForm.content_link || null,
        });
      } else {
        const created = await createHouseMeeting({
          house_id: houseId,
          meeting_date: meetingForm.meeting_date,
          meeting_time: meetingForm.meeting_time || null,
          host_member_id: memberId,
          liturgy_text: meetingForm.liturgy_text || null,
          discussion_questions: meetingForm.discussion_questions || null,
          content_link: meetingForm.content_link || null,
          status: "planejado",
        });
        setNextMeeting(created);
      }
      const refreshed = await listHouseMeetings(houseId, 6);
      setMeetingHistory(refreshed);
    } finally {
      setSavingMeeting(false);
    }
  };

  const handleCheckIn = async () => {
    if (!memberId || !houseId || !nextMeeting?.id || hasCheckedIn) return;
    setCheckingIn(true);
    try {
      await createAttendance(nextMeeting.id, houseId, memberId, memberId);
      const refreshed = await listAttendanceForMember(memberId, 8);
      setAttendance(refreshed);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!houseId || !nextMeeting?.id) return;
    setSavingSchedule(true);
    try {
      await upsertServiceSchedule(
        DEFAULT_SLOTS.map((slot) => ({
          meeting_id: nextMeeting.id,
          house_id: houseId,
          slot,
          member_id: null,
          status: "pendente",
          notes: null,
        }))
      );
      const refreshed = await listServiceSchedule(nextMeeting.id);
      setSchedule(refreshed);
      setScheduleEdits(
        refreshed.reduce((acc, item) => {
          acc[item.id] = item.member_id;
          return acc;
        }, {} as Record<string, string | null>)
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!schedule.length) return;
    setSavingSchedule(true);
    try {
      await Promise.all(
        schedule.map((item) =>
          updateServiceSchedule(item.id, {
            member_id: scheduleEdits[item.id] || null,
            status: item.status || "pendente",
          })
        )
      );
      if (nextMeeting?.id) {
        const refreshed = await listServiceSchedule(nextMeeting.id);
        setSchedule(refreshed);
      }
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleConfirmSlot = async (item: RedeHouseServiceSchedule) => {
    await updateServiceSchedule(item.id, { status: "confirmado" });
    if (nextMeeting?.id) {
      const refreshed = await listServiceSchedule(nextMeeting.id);
      setSchedule(refreshed);
    }
  };

  if (!memberId) {
    return (
      <div className="member-page">
        <div className="member-card">
          <h3>Vinculo pendente</h3>
          <p className="member-card-muted">Seu usuario ainda nao esta vinculado a um membro. Fale com a lideranca.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="member-page">
        <div className="member-card">Carregando informacoes da sua casa...</div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="member-page">
        <div className="member-card">
          <h3>Sem casa vinculada</h3>
          <p className="member-card-muted">
            No momento voce nao esta vinculado a uma Igreja na Casa. Fale com a lideranca para atualizar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-page">
      <div className="member-page-header">
        <h1>Minha Igreja na Casa</h1>
        <p>Informacoes do seu grupo, proximos encontros e escala de servico.</p>
      </div>

      <div className="member-cards">
        <div className="member-card">
          <h3>{house.name}</h3>
          <p className="member-card-value">
            {house.meeting_day ? `${house.meeting_day} • ${formatTime(house.meeting_time)}` : "Horario a combinar"}
          </p>
          <p className="member-card-muted">
            {house.neighborhood ? `${house.neighborhood} • ` : ""}
            {house.city || "-"}
          </p>
        </div>
        <div className="member-card">
          <h3>Lideranca</h3>
          <p className="member-card-value">{presbiteroName || "Em discernimento"}</p>
          <p className="member-card-muted">{primaryHouseRole ? `Seu papel: ${primaryHouseRole}` : ""}</p>
        </div>
        <div className="member-card">
          <h3>Membros</h3>
          <p className="member-card-value">{houseMembers.length}</p>
          <p className="member-card-muted">Participantes cadastrados nesta casa.</p>
        </div>
      </div>

      <div className="member-card member-card--wide">
        <h3>Membros da casa</h3>
        <div className="member-list">
          {houseMembers.map((item) => (
            <div key={item.id} className="member-list-item">
              <div>
                <strong>{item.member?.full_name || "Membro"}</strong>
                <p>{item.role || "participante"}</p>
              </div>
              <span className="member-card-muted">{item.member?.phone || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="member-cards">
        <div className="member-card">
          <h3>Proximo encontro</h3>
          {nextMeeting ? (
            <>
              <p className="member-card-value">{formatDate(nextMeeting.meeting_date)}</p>
              <p className="member-card-muted">Horario: {formatTime(nextMeeting.meeting_time)}</p>
              <div className="member-actions">
                <button className="member-btn" onClick={handleCheckIn} disabled={checkingIn || hasCheckedIn}>
                  {hasCheckedIn ? "Presenca registrada" : "Registrar minha presenca"}
                </button>
              </div>
            </>
          ) : (
            <p className="member-card-muted">Nenhum encontro agendado ainda.</p>
          )}
        </div>
        <div className="member-card">
          <h3>Ultimas presencas</h3>
          <div className="member-list">
            {attendance.map((entry) => (
              <div key={entry.id} className="member-list-item">
                <div>
                  <strong>{formatDate(entry.checked_at)}</strong>
                  <p>Confirmado</p>
                </div>
              </div>
            ))}
            {!attendance.length && <p className="member-card-muted">Nenhuma presenca registrada.</p>}
          </div>
        </div>
      </div>

      <div className="member-card member-card--wide">
        <h3>Roteiro do encontro</h3>
        {nextMeeting ? (
          <div className="member-list">
            <div className="member-list-item">
              <div>
                <strong>Liturgia</strong>
                <p>{nextMeeting.liturgy_text || "Nao informado"}</p>
              </div>
            </div>
            <div className="member-list-item">
              <div>
                <strong>Perguntas para discussao</strong>
                <p>{nextMeeting.discussion_questions || "Nao informado"}</p>
              </div>
            </div>
            <div className="member-list-item">
              <div>
                <strong>Conteudo</strong>
                <p>{nextMeeting.content_link || "Sem link anexado"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="member-card-muted">Sem roteiro disponivel ainda.</p>
        )}
        {isHouseLeader && (
          <div className="member-form-grid" style={{ marginTop: 16 }}>
            <label>
              Data do encontro
              <input
                type="date"
                value={meetingForm.meeting_date}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, meeting_date: event.target.value }))}
              />
            </label>
            <label>
              Horario
              <input
                type="time"
                value={meetingForm.meeting_time}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, meeting_time: event.target.value }))}
              />
            </label>
            <label className="member-form-wide">
              Liturgia / roteiro
              <textarea
                rows={3}
                value={meetingForm.liturgy_text}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, liturgy_text: event.target.value }))}
              />
            </label>
            <label className="member-form-wide">
              Perguntas para discussao
              <textarea
                rows={3}
                value={meetingForm.discussion_questions}
                onChange={(event) =>
                  setMeetingForm((prev) => ({ ...prev, discussion_questions: event.target.value }))
                }
              />
            </label>
            <label className="member-form-wide">
              Link de conteudo (opcional)
              <input
                type="text"
                value={meetingForm.content_link}
                onChange={(event) => setMeetingForm((prev) => ({ ...prev, content_link: event.target.value }))}
              />
            </label>
            <button className="member-btn" onClick={saveMeeting} disabled={savingMeeting}>
              {savingMeeting ? "Salvando..." : "Salvar encontro"}
            </button>
          </div>
        )}
      </div>

      <div className="member-card member-card--wide">
        <h3>Escala de servico</h3>
        {!nextMeeting && <p className="member-card-muted">Agende um encontro para montar a escala.</p>}
        {nextMeeting && !schedule.length && isHouseLeader && (
          <button className="member-btn" onClick={handleGenerateSchedule} disabled={savingSchedule}>
            {savingSchedule ? "Gerando..." : "Gerar escala padrao"}
          </button>
        )}
        {nextMeeting && schedule.length > 0 && (
          <div className="member-list">
            {schedule.map((item) => {
              const assigned = item.member_id ? memberOptions.find((m) => m.id === item.member_id)?.label : null;
              const isMine = item.member_id && item.member_id === memberId;
              return (
                <div key={item.id} className="member-list-item">
                  <div>
                    <strong>{item.slot}</strong>
                    <p>{assigned || "Nao atribuido"}</p>
                  </div>
                  {isHouseLeader ? (
                    <select
                      value={scheduleEdits[item.id] || ""}
                      onChange={(event) =>
                        setScheduleEdits((prev) => ({ ...prev, [item.id]: event.target.value || null }))
                      }
                    >
                      <option value="">Nao atribuir</option>
                      {memberOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : isMine && item.status !== "confirmado" ? (
                    <button className="member-btn member-btn--ghost" onClick={() => handleConfirmSlot(item)}>
                      Confirmar
                    </button>
                  ) : (
                    <span className="member-card-muted">{item.status || "pendente"}</span>
                  )}
                </div>
              );
            })}
            {isHouseLeader && (
              <div className="member-actions">
                <button className="member-btn" onClick={handleSaveSchedule} disabled={savingSchedule}>
                  {savingSchedule ? "Salvando..." : "Salvar escala"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="member-card member-card--wide">
        <h3>Historico de encontros</h3>
        <div className="member-list">
          {meetingHistory.map((meeting) => (
            <div key={meeting.id} className="member-list-item">
              <div>
                <strong>{formatDate(meeting.meeting_date)}</strong>
                <p>{meeting.status || "planejado"}</p>
              </div>
              <span className="member-card-muted">{meeting.content_link || "-"}</span>
            </div>
          ))}
          {!meetingHistory.length && <p className="member-card-muted">Nenhum encontro registrado ainda.</p>}
        </div>
      </div>
    </div>
  );
}
