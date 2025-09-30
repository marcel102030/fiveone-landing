import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import PlatformUserProfile from "../../components/PlatformUserProfile/PlatformUserProfile";
import "./perfilAluno.css";
import { getCurrentUserId } from "../../utils/user";
import { usePlatformUserProfile, storePlatformProfile } from "../../hooks/usePlatformUserProfile";
import { getUserByEmail, updateUserName, verifyUser, resetUserPassword } from "../../services/userAccount";
import { FormationKey } from "../../services/userAccount";
import { getUserProfileDetails, upsertUserProfileDetails, uploadUserAvatar } from "../../services/userProfile";

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
  instagram: string;
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
  instagram: "",
};

const genders = [
  { value: "", label: "Selecione" },
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
];

const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3 MB

const PerfilAluno = () => {
  const navigate = useNavigate();
  const { profile } = usePlatformUserProfile();
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarCleared, setAvatarCleared] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
          instagram: details?.instagram || "",
        });
        setAvatarPreview(details?.avatar_url || null);
        setAvatarFile(null);
        setAvatarCleared(false);

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

  const handlePasswordField = (key: 'current' | 'next' | 'confirm', value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    if (passwordFeedback) setPasswordFeedback(null);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Envie apenas arquivos de imagem (PNG ou JPG).' });
      event.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setFeedback({ type: 'error', text: 'A imagem deve ter no máximo 3 MB.' });
      event.target.value = '';
      return;
    }
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(avatarPreview); } catch {}
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarCleared(false);
    setFeedback(null);
    event.target.value = '';
  };

  const handleAvatarRemove = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(avatarPreview); } catch {}
    }
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarCleared(true);
  };

  useEffect(() => {
    if (!avatarPreview || !avatarPreview.startsWith('blob:')) return;
    return () => {
      try { URL.revokeObjectURL(avatarPreview); } catch {}
    };
  }, [avatarPreview]);

  const currentFormation: FormationKey | null = useMemo(() => {
    if (profile?.formation) return profile.formation;
    const stored = (typeof window !== "undefined" ? localStorage.getItem("platform_user_formation") : null) as FormationKey | null;
    return stored || null;
  }, [profile]);

  const avatarFallback = useMemo(() => {
    const source =
      form.displayName?.trim() ||
      `${form.firstName} ${form.lastName}`.trim() ||
      email ||
      '';
    const cleaned = source.replace(/@.*/, '').trim();
    if (!cleaned) return 'AL';
    const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
    if (parts.length === 0) return cleaned.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [form.displayName, form.firstName, form.lastName, email]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) {
      navigate("/login-aluno", { replace: true });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        try {
          avatarUrl = await uploadUserAvatar(email, avatarFile);
        } catch (error) {
          throw new Error('Não foi possível enviar a imagem. Verifique o arquivo e tente novamente.');
        }
      }
      if (avatarCleared && !avatarFile) {
        avatarUrl = null;
      }

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
        instagram: form.instagram,
        avatar_url: avatarUrl ?? null,
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
        instagram: saved.instagram || "",
      });
      const persistedAvatar = saved.avatar_url || avatarUrl || null;
      setAvatarPreview(persistedAvatar);
      setAvatarFile(null);
      setAvatarCleared(false);
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
        avatarUrl: persistedAvatar,
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

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;

    const current = passwordForm.current.trim();
    const next = passwordForm.next.trim();
    const confirm = passwordForm.confirm.trim();

    if (!current || !next || !confirm) {
      setPasswordFeedback({ type: 'error', text: 'Informe sua senha atual e a nova senha.' });
      return;
    }

    if (next.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    if (next !== confirm) {
      setPasswordFeedback({ type: 'error', text: 'A confirmação deve ser igual à nova senha.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordFeedback(null);

    try {
      const ok = await verifyUser(email, current);
      if (!ok) {
        throw new Error('Senha atual inválida.');
      }

      await resetUserPassword(email, next);
      setPasswordFeedback({ type: 'success', text: 'Senha atualizada com sucesso.' });
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (error: any) {
      setPasswordFeedback({ type: 'error', text: error?.message || 'Não foi possível atualizar a senha agora.' });
    } finally {
      setPasswordSaving(false);
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

        <div className="profile-top">
          <div className="profile-hero">
            <PlatformUserProfile className="profile-hero__profile" />
            <div className="profile-hero__meta">
              <h2>Resumo da conta</h2>
              <p>Essas informações se refletem em toda a plataforma e ajudam nossa equipe a acompanhar sua jornada.</p>
              <div className="profile-badges">
                {profile?.formationLabel && (
                  <span className="profile-badge">Formação: {profile.formationLabel}</span>
                )}
                <span className="profile-badge">E-mail: {email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-columns">
          <div className="profile-columns__main">
            <form className="profile-form profile-card" onSubmit={handleSubmit}>
              <fieldset disabled={loading || saving} aria-busy={loading || saving}>
                <section className="profile-section profile-section--avatar">
                  <h2>Logo do aluno</h2>
                  <div className="profile-avatar-upload">
                    <div className="profile-avatar-preview">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Logo do aluno" />
                      ) : (
                        <span>{avatarFallback}</span>
                      )}
                    </div>
                    <div className="profile-avatar-actions">
                      <label className="profile-avatar-button">
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                        Enviar logo
                      </label>
                      {avatarPreview && (
                        <button type="button" className="profile-avatar-remove" onClick={handleAvatarRemove}>
                          Remover
                        </button>
                      )}
                      <p className="profile-avatar-hint">PNG ou JPG até 3 MB.</p>
                    </div>
                  </div>
                </section>

                <section className="profile-section">
                  <h2>Dados pessoais</h2>
                  <div className="profile-grid">
                    <label className="profile-field">
                      <span>Nome</span>
                      <input
                        value={form.firstName}
                        onChange={(e) => handleField('firstName', e.target.value)}
                        placeholder="Digite seu primeiro nome"
                      />
                    </label>
                    <label className="profile-field">
                      <span>Sobrenome</span>
                      <input
                        value={form.lastName}
                        onChange={(e) => handleField('lastName', e.target.value)}
                        placeholder="Digite seu sobrenome"
                      />
                    </label>
                    <label className="profile-field">
                      <span>Como quer ser chamado?</span>
                      <input
                        value={form.displayName}
                        onChange={(e) => handleField('displayName', e.target.value)}
                        placeholder="Ex.: Pastor João, Missionária Ana"
                      />
                    </label>
                    <label className="profile-field">
                      <span>CPF</span>
                      <input
                        value={form.cpf}
                        onChange={(e) => handleField('cpf', e.target.value.replace(/[^0-9.\-]/g, ''))}
                        placeholder="Apenas números"
                        inputMode="numeric"
                      />
                    </label>
                    <label className="profile-field">
                      <span>Gênero</span>
                      <select value={form.gender} onChange={(e) => handleField('gender', e.target.value)}>
                        {genders.map((option) => (
                          <option key={option.value || 'blank'} value={option.value}>
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
                        onChange={(e) => handleField('birthdate', e.target.value)}
                      />
                    </label>
                    <label className="profile-field profile-field--textarea">
                      <span>Descrição</span>
                      <textarea
                        value={form.bio}
                        onChange={(e) => handleField('bio', e.target.value)}
                        maxLength={300}
                        placeholder="Compartilhe um pouco sobre sua jornada ministerial. (máx. 300 caracteres)"
                      />
                      <small>{form.bio.length}/300</small>
                    </label>
                  </div>
                </section>

                <section className="profile-section">
                  <h2>Contato</h2>
                  <div className="profile-grid">
                    <label className="profile-field">
                      <span>Celular</span>
                      <input
                        value={form.phone}
                        onChange={(e) => handleField('phone', e.target.value)}
                        placeholder="(00) 90000-0000"
                      />
                    </label>
                    <div className="profile-field profile-field--info">
                      <span>E-mail cadastrado</span>
                      <div className="profile-field__static">{email}</div>
                    </div>
                  </div>
                </section>

                <section className="profile-section">
                  <h2>Endereço</h2>
                  <div className="profile-grid">
                    <label className="profile-field profile-field--wide">
                      <span>Endereço</span>
                      <input
                        value={form.address}
                        onChange={(e) => handleField('address', e.target.value)}
                        placeholder="Rua, número e complemento"
                      />
                    </label>
                    <label className="profile-field">
                      <span>Cidade</span>
                      <input value={form.city} onChange={(e) => handleField('city', e.target.value)} />
                    </label>
                    <label className="profile-field">
                      <span>Estado</span>
                      <input value={form.state} onChange={(e) => handleField('state', e.target.value)} />
                    </label>
                    <label className="profile-field">
                      <span>País</span>
                      <input value={form.country} onChange={(e) => handleField('country', e.target.value)} />
                    </label>
                    <label className="profile-field">
                      <span>CEP</span>
                      <input value={form.zipCode} onChange={(e) => handleField('zipCode', e.target.value)} placeholder="00000-000" />
                    </label>
                  </div>
                </section>

                <section className="profile-section">
                  <h2>Redes sociais</h2>
                  <div className="profile-grid">
                    <label className="profile-field profile-field--wide">
                      <span>Instagram</span>
                      <input
                        value={form.instagram}
                        onChange={(e) => handleField('instagram', e.target.value)}
                        placeholder="https://instagram.com/usuario"
                      />
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
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>

          <aside className="profile-columns__aside">
            <section className="profile-card profile-card--security">
              <h3>Segurança da conta</h3>
              <p>Atualize sua senha sempre que necessário para manter seu acesso protegido.</p>
              {passwordFeedback && (
                <div className={`profile-feedback profile-feedback--${passwordFeedback.type}`} role="status">
                  {passwordFeedback.text}
                </div>
              )}
              <form className="profile-password-grid" onSubmit={handlePasswordSubmit}>
                <label>
                  <span>Senha atual</span>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => handlePasswordField('current', e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </label>
                <label>
                  <span>Nova senha</span>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => handlePasswordField('next', e.target.value)}
                    placeholder="Nova senha (mín. 8 caracteres)"
                  />
                </label>
                <label>
                  <span>Confirmar nova senha</span>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => handlePasswordField('confirm', e.target.value)}
                    placeholder="Repita a nova senha"
                  />
                </label>
                <button type="submit" className="profile-button primary" disabled={passwordSaving}>
                  {passwordSaving ? 'Atualizando...' : 'Atualizar senha'}
                </button>
              </form>
            </section>
          </aside>
        </div>

        {loading && (
          <div className="profile-loading" role="status">Carregando dados...</div>
        )}
      </main>
    </div>
  );
};

export default PerfilAluno;
