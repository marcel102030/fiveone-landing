import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import PlatformUserProfile from "../../components/PlatformUserProfile/PlatformUserProfile";
import "./perfilAluno.css";
import { getCurrentUserId } from "../../utils/user";
import { usePlatformUserProfile, storePlatformProfile } from "../../hooks/usePlatformUserProfile";
import { getUserByEmail, updateUserName } from "../../services/userAccount";
import { FormationKey } from "../../services/userAccount";
import { getUserProfileDetails, upsertUserProfileDetails } from "../../services/userProfile";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  cpf: string;
  phone: string;
  gender: string;
  birthdate: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
};

const initialForm: ProfileFormState = {
  firstName: "",
  lastName: "",
  displayName: "",
  bio: "",
  cpf: "",
  phone: "",
  gender: "",
  birthdate: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  tiktok: "",
};

const genders = [
  { value: "", label: "Selecione" },
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao_informar", label: "Prefiro não informar" },
  { value: "outro", label: "Outro" },
];

const PerfilAluno = () => {
  const navigate = useNavigate();
  const { profile } = usePlatformUserProfile();
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const email = useMemo(() => getCurrentUserId(), []);

  useEffect(() => {
    if (!email) {
      navigate("/login-aluno", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const normalized = email.trim().toLowerCase();
        const [userRow, details] = await Promise.all([
          getUserByEmail(normalized).catch(() => null),
          getUserProfileDetails(normalized).catch(() => null),
        ]);
        if (cancelled) return;
        setForm({
          firstName: details?.first_name || "",
          lastName: details?.last_name || "",
          displayName: details?.display_name || "",
          bio: details?.bio || "",
          cpf: details?.cpf || "",
          phone: details?.phone || "",
          gender: details?.gender || "",
          birthdate: details?.birthdate ? details.birthdate.slice(0, 10) : "",
          address: details?.address || "",
          city: details?.city || "",
          state: details?.state || "",
          country: details?.country || "",
          zipCode: details?.zip_code || "",
          facebook: details?.facebook || "",
          instagram: details?.instagram || "",
          linkedin: details?.linkedin || "",
          tiktok: details?.tiktok || "",
        });

        // Ajuste inicial do nome quando não houver detalhes cadastrados
        if (!details && userRow?.name && userRow.name.includes(" ")) {
          const [first, ...rest] = userRow.name.split(" ");
          const last = rest.join(" ");
          setForm((prev) => ({
            ...prev,
            firstName: prev.firstName || first,
            lastName: prev.lastName || last,
            displayName: prev.displayName || userRow.name || "",
          }));
        }
      } catch (error) {
        if (cancelled) return;
        setFeedback({ type: "error", text: "Não foi possível carregar seus dados. Tente novamente em instantes." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, navigate]);

  const handleField = (key: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const currentFormation: FormationKey | null = useMemo(() => {
    if (profile?.formation) return profile.formation;
    const stored = (typeof window !== "undefined" ? localStorage.getItem("platform_user_formation") : null) as FormationKey | null;
    return stored || null;
  }, [profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) {
      navigate("/login-aluno", { replace: true });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        display_name: form.displayName,
        bio: form.bio,
        cpf: form.cpf,
        phone: form.phone,
        gender: form.gender,
        birthdate: form.birthdate || null,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        zip_code: form.zipCode,
        facebook: form.facebook,
        instagram: form.instagram,
        linkedin: form.linkedin,
        tiktok: form.tiktok,
      } as const;

      const saved = await upsertUserProfileDetails(email, payload);
      setForm({
        firstName: saved.first_name || "",
        lastName: saved.last_name || "",
        displayName: saved.display_name || "",
        bio: saved.bio || "",
        cpf: saved.cpf || "",
        phone: saved.phone || "",
        gender: saved.gender || "",
        birthdate: saved.birthdate ? saved.birthdate.slice(0, 10) : "",
        address: saved.address || "",
        city: saved.city || "",
        state: saved.state || "",
        country: saved.country || "",
        zipCode: saved.zip_code || "",
        facebook: saved.facebook || "",
        instagram: saved.instagram || "",
        linkedin: saved.linkedin || "",
        tiktok: saved.tiktok || "",
      });
      const composedName = (saved.display_name && saved.display_name.trim())
        || [saved.first_name, saved.last_name].filter(Boolean).join(" ")
        || form.displayName
        || `${form.firstName} ${form.lastName}`
        || null;

      if (composedName && composedName.trim().length) {
        await updateUserName(email, composedName.trim());
      }

      storePlatformProfile({
        email: email.trim().toLowerCase(),
        name: composedName ? composedName.trim() : null,
        formation: currentFormation,
        firstName: saved.first_name ?? null,
        lastName: saved.last_name ?? null,
        displayName: saved.display_name ?? null,
      });

      setFeedback({ type: "success", text: "Perfil atualizado com sucesso." });
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: error?.message || "Não foi possível salvar os dados agora. Por favor, tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="profile-header">
          <h1>Meu perfil</h1>
          <p>Complete seu cadastro para personalizar sua experiência na plataforma.</p>
        </div>
        <div className="profile-summary">
          <PlatformUserProfile />
          {profile?.formationLabel && (
            <span className="profile-summary__formation">Formação: {profile.formationLabel}</span>
          )}
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <fieldset disabled={loading || saving} aria-busy={loading || saving}>
            <section className="profile-section">
              <h2>Dados pessoais</h2>
              <div className="profile-grid">
                <label className="profile-field">
                  <span>Nome</span>
                  <input
                    value={form.firstName}
                    onChange={(e) => handleField("firstName", e.target.value)}
                    placeholder="Digite seu primeiro nome"
                  />
                </label>
                <label className="profile-field">
                  <span>Sobrenome</span>
                  <input
                    value={form.lastName}
                    onChange={(e) => handleField("lastName", e.target.value)}
                    placeholder="Digite seu sobrenome"
                  />
                </label>
                <label className="profile-field">
                  <span>Como quer ser chamado?</span>
                  <input
                    value={form.displayName}
                    onChange={(e) => handleField("displayName", e.target.value)}
                    placeholder="Ex.: Pastor João, Missionária Ana"
                  />
                </label>
                <label className="profile-field">
                  <span>CPF</span>
                  <input
                    value={form.cpf}
                    onChange={(e) => handleField("cpf", e.target.value.replace(/[^0-9.\-]/g, ""))}
                    placeholder="Apenas números"
                    inputMode="numeric"
                  />
                </label>
                <label className="profile-field">
                  <span>Celular</span>
                  <input
                    value={form.phone}
                    onChange={(e) => handleField("phone", e.target.value)}
                    placeholder="(00) 90000-0000"
                  />
                </label>
                <label className="profile-field">
                  <span>Gênero</span>
                  <select value={form.gender} onChange={(e) => handleField("gender", e.target.value)}>
                    {genders.map((option) => (
                      <option key={option.value || "blank"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="profile-field">
                  <span>Data de nascimento</span>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => handleField("birthdate", e.target.value)}
                  />
                </label>
                <label className="profile-field profile-field--textarea">
                  <span>Descrição</span>
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleField("bio", e.target.value)}
                    maxLength={300}
                    placeholder="Compartilhe um pouco sobre sua jornada ministerial. (máx. 300 caracteres)"
                  />
                  <small>{form.bio.length}/300</small>
                </label>
              </div>
            </section>

            <section className="profile-section">
              <h2>Endereço</h2>
              <div className="profile-grid">
                <label className="profile-field profile-field--wide">
                  <span>Endereço</span>
                  <input
                    value={form.address}
                    onChange={(e) => handleField("address", e.target.value)}
                    placeholder="Rua, número e complemento"
                  />
                </label>
                <label className="profile-field">
                  <span>Cidade</span>
                  <input value={form.city} onChange={(e) => handleField("city", e.target.value)} />
                </label>
                <label className="profile-field">
                  <span>Estado</span>
                  <input value={form.state} onChange={(e) => handleField("state", e.target.value)} />
                </label>
                <label className="profile-field">
                  <span>País</span>
                  <input value={form.country} onChange={(e) => handleField("country", e.target.value)} />
                </label>
                <label className="profile-field">
                  <span>CEP</span>
                  <input value={form.zipCode} onChange={(e) => handleField("zipCode", e.target.value)} placeholder="00000-000" />
                </label>
              </div>
            </section>

            <section className="profile-section">
              <h2>Redes sociais</h2>
              <div className="profile-grid">
                <label className="profile-field profile-field--wide">
                  <span>Instagram</span>
                  <input value={form.instagram} onChange={(e) => handleField("instagram", e.target.value)} placeholder="https://instagram.com/usuario" />
                </label>
                <label className="profile-field profile-field--wide">
                  <span>Facebook</span>
                  <input value={form.facebook} onChange={(e) => handleField("facebook", e.target.value)} placeholder="https://facebook.com/usuario" />
                </label>
                <label className="profile-field profile-field--wide">
                  <span>LinkedIn</span>
                  <input value={form.linkedin} onChange={(e) => handleField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/usuario" />
                </label>
                <label className="profile-field profile-field--wide">
                  <span>TikTok</span>
                  <input value={form.tiktok} onChange={(e) => handleField("tiktok", e.target.value)} placeholder="https://tiktok.com/@usuario" />
                </label>
              </div>
            </section>
          </fieldset>

          {feedback && (
            <div className={`profile-feedback profile-feedback--${feedback.type}`} role="status">
              {feedback.text}
            </div>
          )}

          <div className="profile-actions">
            <button type="button" className="profile-button ghost" onClick={() => navigate(-1)}>
              Voltar
            </button>
            <button type="submit" className="profile-button primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
        {loading && (
          <div className="profile-loading" role="status">Carregando dados...</div>
        )}
      </main>
    </div>
  );
};

export default PerfilAluno;
