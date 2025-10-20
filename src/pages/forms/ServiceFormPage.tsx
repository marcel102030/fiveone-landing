import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/serviceForms.css";

type FieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "number"
  | "date"
  | "month"
  | "select";

export type ServiceFormField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  options?: { value: string; label: string }[];
};

type SubmissionPayload = {
  contact: { name: string; email: string; phone: string };
  church: {
    name: string;
    leaderName?: string | null;
    city?: string | null;
    expectedMembers?: number | null;
    notes?: string | null;
  };
  answers: Record<string, any>;
};

type ServiceFormPageProps = {
  badge: string;
  title: string;
  subtitle?: string;
  description: string;
  fields: ServiceFormField[];
  ctaLabel?: string;
  successMessage?: string;
  backUrl?: string;
  serviceType: string;
  serviceLabel: string;
  buildSubmission?: (values: Record<string, string>) => SubmissionPayload;
  videoUrl?: string;
};

type SuccessData = {
  serviceType: string;
  serviceLabel: string;
  slug: string;
  churchName: string;
  quizUrl: string;
  reportUrl: string;
  contactEmail: string;
};

const DEFAULT_SUCCESS =
  "Recebemos suas informações! Em breve nossa equipe entrará em contato para continuar o atendimento.";

const DEFAULT_VIDEO = "https://www.youtube.com/watch?v=o8qKV7OlUTw";

function toEmbedUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.startsWith("/embed/")) return parsed.toString();
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

const ServiceFormPage: React.FC<ServiceFormPageProps> = ({
  badge,
  title,
  subtitle,
  description,
  fields,
  ctaLabel = "Enviar formulário",
  successMessage = DEFAULT_SUCCESS,
  backUrl = "/teste-dons",
  serviceType,
  serviceLabel,
  buildSubmission,
  videoUrl = DEFAULT_VIDEO,
}) => {
  const initialValues = useMemo(() => {
    const base: Record<string, string> = {};
    fields.forEach((field) => {
      base[field.name] = "";
    });
    return base;
  }, [fields]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !values[field.name]?.trim()) {
        errs[field.name] = "Campo obrigatório.";
      }
      if (field.type === "email" && values[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values[field.name])) {
          errs[field.name] = "Informe um e-mail válido.";
        }
      }
      if (field.type === "tel" && values[field.name]) {
        const digits = values[field.name].replace(/\D/g, "");
        if (digits.length < 10) {
          errs[field.name] = "Informe um telefone com DDD.";
        }
      }
    });
    return errs;
  }, [fields, values]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setTouched({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(
      fields.reduce((acc, field) => {
        acc[field.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const prepared =
        buildSubmission?.(values) ??
        ({
          contact: {
            name: values.name || values.responsibleName || "",
            email: values.email || "",
            phone: values.phone || "",
          },
          church: {
            name: values.church || values.churchName || "",
            city: values.city || "",
            leaderName: values.leader_name || "",
          },
          answers: values,
        } as SubmissionPayload);

      if (!prepared?.contact?.name?.trim() || !prepared?.contact?.email?.trim() || !prepared?.contact?.phone?.trim()) {
        throw new Error("Preencha nome, e-mail e telefone do responsável.");
      }
      if (!prepared?.church?.name?.trim()) {
        throw new Error("Informe o nome da igreja.");
      }

      const body = {
        serviceType,
        serviceLabel,
        contact: prepared.contact,
        church: prepared.church,
        answers: prepared.answers,
        context: {
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
          submittedAt: new Date().toISOString(),
        },
      };

      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || `Erro ${response.status}. Tente novamente mais tarde.`);
      }

      const quizUrl =
        json?.church?.quiz_url ||
        `${window.location.origin}/#/teste-dons?churchSlug=${encodeURIComponent(json?.church?.slug || "")}`;
      const reportUrl =
        json?.church?.report_url || `${window.location.origin}/#/relatorio/${encodeURIComponent(json?.church?.slug || "")}`;

      const success: SuccessData = {
        serviceType,
        serviceLabel,
        slug: json?.church?.slug || "",
        churchName: json?.church?.name || prepared.church.name,
        quizUrl,
        reportUrl,
        contactEmail: prepared.contact.email,
      };

      setSuccessData(success);
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setErrorMessage(error?.message || "Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const embedUrl = toEmbedUrl(videoUrl);

  return (
    <section className="service-form-page">
      <div className="service-form-container">
        <header className="service-form-header">
          <span className="service-form-badge">{badge}</span>
          <h1>{title}</h1>
          {subtitle && <p className="service-form-subtitle">{subtitle}</p>}
          <p className="service-form-description">{description}</p>
        </header>

        {errorMessage && (
          <div className="service-form-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {successData ? (
          <div className="service-form-success-panel" role="status">
            <div className="service-form-success-header">
              <strong>Solicitação recebida!</strong>
              <p>{successMessage}</p>
              <p>
                Enviamos os próximos passos para <strong>{successData.contactEmail}</strong> e para{" "}
                <strong>escolafiveone@gmail.com</strong>.
              </p>
            </div>

            {embedUrl && (
              <div className="service-form-video">
                <iframe
                  src={embedUrl}
                  title="Mensagem Five One"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="service-form-success-links">
              <div className="service-form-link-card">
                <div>
                  <h3>Compartilhar teste Five One</h3>
                  <p>Envie este link para que a igreja responda o teste.</p>
                </div>
                <div className="service-form-link-actions">
                  <a className="btn primary" href={successData.quizUrl} target="_blank" rel="noreferrer">
                    Abrir link do teste
                  </a>
                  <button
                    className="btn ghost"
                    onClick={() => navigator.clipboard?.writeText(successData.quizUrl)}
                    type="button"
                  >
                    Copiar link
                  </button>
                </div>
              </div>
              <div className="service-form-link-card">
                <div>
                  <h3>Acompanhar relatórios</h3>
                  <p>Acesse o painel com as respostas e porcentagens dos dons.</p>
                </div>
                <div className="service-form-link-actions">
                  <Link className="btn ghost" to={`/relatorio/${successData.slug}`}>
                    Abrir relatório
                  </Link>
                </div>
              </div>
            </div>

            <div className="service-form-success-footer">
              <button className="btn primary" type="button" onClick={() => setSuccessData(null)}>
                Enviar outra solicitação
              </button>
              <Link className="btn ghost" to={backUrl}>
                Voltar para formatos
              </Link>
            </div>
          </div>
        ) : (
          <form className="service-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="service-form-grid">
              {fields.map((field) => {
                const value = values[field.name] ?? "";
                const error = touched[field.name] ? errors[field.name] : undefined;

                return (
                  <label key={field.name} className="service-form-field">
                    <span className="service-form-label">
                      {field.label}
                      {field.required && <span aria-hidden="true">*</span>}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        onBlur={() => handleBlur(field.name)}
                        rows={5}
                        aria-invalid={Boolean(error)}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={value}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        onBlur={() => handleBlur(field.name)}
                        aria-invalid={Boolean(error)}
                      >
                        <option value="">Selecione uma opção</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        onBlur={() => handleBlur(field.name)}
                        aria-invalid={Boolean(error)}
                      />
                    )}
                    {field.helperText && !error && (
                      <small className="service-form-helper">{field.helperText}</small>
                    )}
                    {error && (
                      <small className="service-form-error" role="alert">
                        {error}
                      </small>
                    )}
                  </label>
                );
              })}
            </fieldset>

            <div className="service-form-actions">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "Enviando..." : ctaLabel}
              </button>
              <Link className="btn ghost" to={backUrl}>
                Voltar para formatos
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ServiceFormPage;
