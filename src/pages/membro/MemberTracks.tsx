import { useEffect, useMemo, useState } from "react";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import {
  RedeTrack,
  RedeTrackModule,
  RedeTrackEnrollment,
  createTrack,
  createTrackModule,
  enrollMemberInTrack,
  listMemberEnrollments,
  listModuleCompletions,
  listTrackModules,
  listTracks,
  setModuleCompletion,
  updateEnrollmentProgress,
} from "../../services/redeIgrejas";
import "./memberPages.css";

const MATURIDADE_TRACKS = [
  { slug: "o-que", title: "O que", description: "Fundamentos da fe cristã." },
  { slug: "por-que", title: "Por que", description: "Conviccoes e motivacoes para caminhar com Jesus." },
  { slug: "como", title: "Como", description: "Vida pratica no Reino e missao." },
];

const DOM_TRACKS = [
  { slug: "apostolico", title: "Dom Apostolico" },
  { slug: "profetico", title: "Dom Profetico" },
  { slug: "evangelistico", title: "Dom Evangelistico" },
  { slug: "pastoral", title: "Dom Pastoral" },
  { slug: "mestre", title: "Dom de Mestre" },
];

export default function MemberTracks() {
  const { profile } = usePlatformUserProfile();
  const memberId = profile?.memberId || null;
  const isAdmin = profile?.role === "ADMIN";
  const [tracks, setTracks] = useState<RedeTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [modules, setModules] = useState<RedeTrackModule[]>([]);
  const [enrollments, setEnrollments] = useState<RedeTrackEnrollment[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trackRows, enrollmentRows] = await Promise.all([
          listTracks(),
          memberId ? listMemberEnrollments(memberId) : Promise.resolve([]),
        ]);
        setTracks(trackRows);
        setEnrollments(enrollmentRows);
        if (trackRows.length && !selectedTrackId) {
          setSelectedTrackId(trackRows[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId]);

  useEffect(() => {
    const loadModules = async () => {
      if (!selectedTrackId) {
        setModules([]);
        return;
      }
      const rows = await listTrackModules(selectedTrackId);
      setModules(rows);
      const enrollment = enrollments.find((item) => item.track_id === selectedTrackId);
      if (enrollment) {
        const completions = await listModuleCompletions(enrollment.id);
        setCompleted(new Set(completions.map((item) => item.module_id)));
      } else {
        setCompleted(new Set());
      }
    };
    loadModules();
  }, [selectedTrackId, enrollments]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) || null,
    [tracks, selectedTrackId]
  );

  const selectedEnrollment = useMemo(
    () => enrollments.find((item) => item.track_id === selectedTrackId) || null,
    [enrollments, selectedTrackId]
  );

  const progress = useMemo(() => {
    if (!modules.length) return 0;
    return Math.round((completed.size / modules.length) * 100);
  }, [modules, completed]);

  const handleEnroll = async () => {
    if (!memberId || !selectedTrackId) return;
    setSaving(true);
    try {
      const enrollment = await enrollMemberInTrack(memberId, selectedTrackId);
      setEnrollments((prev) => [...prev, enrollment]);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleModule = async (moduleId: string) => {
    if (!selectedEnrollment) return;
    const shouldComplete = !completed.has(moduleId);
    await setModuleCompletion(selectedEnrollment.id, moduleId, shouldComplete);
    const next = new Set(completed);
    if (shouldComplete) {
      next.add(moduleId);
    } else {
      next.delete(moduleId);
    }
    setCompleted(next);
    const nextProgress = modules.length ? Math.round((next.size / modules.length) * 100) : 0;
    await updateEnrollmentProgress(selectedEnrollment.id, { progress: nextProgress });
  };

  const handleSeedTracks = async () => {
    if (!isAdmin || tracks.length) return;
    setSaving(true);
    try {
      const createdTracks: RedeTrack[] = [];
      for (const track of MATURIDADE_TRACKS) {
        const created = await createTrack({
          slug: track.slug,
          title: track.title,
          category: "maturidade",
          description: track.description,
        });
        createdTracks.push(created);
        await createTrackModule({
          track_id: created.id,
          title: "Introducao",
          description: "Abertura e fundamentos desta trilha.",
          content_link: "",
          module_order: 1,
        });
      }
      for (const track of DOM_TRACKS) {
        const created = await createTrack({
          slug: track.slug,
          title: track.title,
          category: "dom",
          description: "Caminho de discernimento e pratica do dom.",
        });
        createdTracks.push(created);
        await createTrackModule({
          track_id: created.id,
          title: "Base biblica",
          description: "Textos e reflexoes iniciais.",
          content_link: "",
          module_order: 1,
        });
      }
      setTracks(createdTracks);
      if (createdTracks.length) setSelectedTrackId(createdTracks[0].id);
    } finally {
      setSaving(false);
    }
  };

  const maturidadeTracks = tracks.filter((track) => track.category === "maturidade");
  const domTracks = tracks.filter((track) => track.category === "dom");

  if (!memberId) {
    return (
      <div className="member-page">
        <div className="member-card">Vincule seu perfil a um membro para acessar as trilhas.</div>
      </div>
    );
  }

  return (
    <div className="member-page">
      <div className="member-page-header">
        <h1>Trilhas de formacao</h1>
        <p>Escolha um caminho e avance com passos simples.</p>
      </div>

      <div className="member-card member-card--wide">
        <h3>Trilhas por maturidade</h3>
        <div className="member-tabs">
          {maturidadeTracks.map((track) => (
            <button
              key={track.id}
              className={`member-tab ${track.id === selectedTrackId ? "is-active" : ""}`}
              onClick={() => setSelectedTrackId(track.id)}
            >
              {track.title}
            </button>
          ))}
          {!maturidadeTracks.length && (
            <span className="member-card-muted">Nenhuma trilha de maturidade cadastrada.</span>
          )}
        </div>
      </div>

      <div className="member-card member-card--wide">
        <h3>Trilhas por dom</h3>
        <div className="member-tabs">
          {domTracks.map((track) => (
            <button
              key={track.id}
              className={`member-tab ${track.id === selectedTrackId ? "is-active" : ""}`}
              onClick={() => setSelectedTrackId(track.id)}
            >
              {track.title}
            </button>
          ))}
          {!domTracks.length && <span className="member-card-muted">Nenhuma trilha por dom cadastrada.</span>}
        </div>
      </div>

      {!tracks.length && !loading && (
        <div className="member-card member-card--wide">
          <p className="member-card-muted">Ainda nao existem trilhas cadastradas nesta rede.</p>
          {isAdmin && (
            <button className="member-btn" onClick={handleSeedTracks} disabled={saving}>
              {saving ? "Criando..." : "Criar trilhas iniciais"}
            </button>
          )}
        </div>
      )}

      {selectedTrack && (
        <div className="member-card member-card--wide">
          <h3>{selectedTrack.title}</h3>
          <p className="member-card-muted">{selectedTrack.description || "Trilha em construcao."}</p>
          <div className="member-actions">
            {!selectedEnrollment && (
              <button className="member-btn" onClick={handleEnroll} disabled={saving}>
                {saving ? "Salvando..." : "Iniciar trilha"}
              </button>
            )}
            {selectedEnrollment && <span className="member-tag">Progresso: {progress}%</span>}
          </div>

          <div className="member-list">
            {modules.map((module) => (
              <div key={module.id} className="member-list-item">
                <div>
                  <strong>{module.title}</strong>
                  <p>{module.description || "Sem descricao"}</p>
                  {module.content_link && <p>Conteudo: {module.content_link}</p>}
                </div>
                {selectedEnrollment && (
                  <label className="member-check">
                    <input
                      type="checkbox"
                      checked={completed.has(module.id)}
                      onChange={() => handleToggleModule(module.id)}
                    />
                    Concluido
                  </label>
                )}
              </div>
            ))}
            {!modules.length && <p className="member-card-muted">Nenhum modulo disponivel ainda.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
