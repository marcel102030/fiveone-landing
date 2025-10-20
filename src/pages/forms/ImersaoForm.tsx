import React from "react";
import ServiceFormPage, { ServiceFormField } from "./ServiceFormPage";

const fields: ServiceFormField[] = [
  {
    name: "leaderName",
    label: "Nome do pastor ou líder principal",
    type: "text",
    required: true,
  },
  {
    name: "role",
    label: "Função na igreja",
    type: "text",
    placeholder: "Ex.: Pastor titular, Coordenador de ministérios",
    required: true,
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    required: true,
  },
  {
    name: "phone",
    label: "Telefone / WhatsApp",
    type: "tel",
    required: true,
  },
  {
    name: "church",
    label: "Nome da igreja",
    type: "text",
    required: true,
  },
  {
    name: "city",
    label: "Cidade / Estado",
    type: "text",
  },
  {
    name: "membersCount",
    label: "Quantidade aproximada de membros",
    type: "number",
    helperText: "Use apenas números.",
  },
  {
    name: "desiredStart",
    label: "Previsão de início da imersão",
    type: "date",
  },
  {
    name: "desiredDuration",
    label: "Duração desejada",
    type: "select",
    options: [
      { value: "1semana", label: "1 semana" },
      { value: "2semanas", label: "2 semanas" },
      { value: "1mes", label: "1 mês" },
      { value: "3meses", label: "3 meses" },
      { value: "personalizado", label: "Outro formato" },
    ],
  },
  {
    name: "goals",
    label: "Quais objetivos vocês desejam alcançar com a imersão?",
    type: "textarea",
    placeholder: "Compartilhe o cenário atual da igreja, metas e resultados esperados.",
    required: true,
  },
  {
    name: "initiatives",
    label: "Já possuem iniciativas relacionadas aos dons?",
    type: "textarea",
    placeholder: "Conte sobre projetos, treinamentos ou desafios que já estão acontecendo (opcional).",
  },
];

const ImersaoForm: React.FC = () => (
  <ServiceFormPage
    badge="Imersão ministerial"
    title="Solicitar Proposta de Imersão Ministerial"
    subtitle="Programa personalizado de 1 semana a 3 meses"
    description="Queremos ouvir sobre a realidade da sua igreja para desenhar uma jornada completa de diagnóstico, capacitação e acompanhamento. Preencha o formulário e retornaremos com proposta e cronograma sugerido."
    fields={fields}
    ctaLabel="Solicitar proposta"
    successMessage="Recebemos sua solicitação de Imersão Ministerial. Nossa equipe entrará em contato com proposta personalizada, abrangendo cronograma, investimento e próximos passos."
    serviceType="imersao"
    serviceLabel="Imersão Ministerial"
    videoUrl="https://www.youtube.com/watch?v=o8qKV7OlUTw"
    buildSubmission={(values) => {
      const name = values.leaderName?.trim() || "";
      const email = values.email?.trim() || "";
      const phone = values.phone?.trim() || "";
      const churchName = values.church?.trim() || `Igreja de ${name}`;
      const members = Number(values.membersCount || 0) || null;
      const durationMap: Record<string, string> = {
        "1semana": "1 semana",
        "2semanas": "2 semanas",
        "1mes": "1 mês",
        "3meses": "3 meses",
        personalizado: "Formato personalizado",
      };
      const duration = values.desiredDuration ? durationMap[values.desiredDuration] || values.desiredDuration : null;

      const notesParts = [
        "Solicitação: Imersão Ministerial",
        `Função do responsável: ${values.role?.trim() || "(não informado)"}`,
        duration ? `Duração desejada: ${duration}` : null,
        values.desiredStart ? `Início pretendido: ${values.desiredStart}` : null,
      ].filter(Boolean);

      const initiatives = values.initiatives?.trim()
        ? `Iniciativas atuais: ${values.initiatives.trim()}`
        : null;

      return {
        contact: { name, email, phone },
        church: {
          name: churchName,
          leaderName: name,
          city: values.city?.trim() || null,
          expectedMembers: members,
          notes: [
            notesParts.length ? notesParts.join(" | ") : null,
            `Objetivos: ${values.goals?.trim() || "(não informado)"}`,
            initiatives,
          ]
            .filter(Boolean)
            .join(" | ") || "Solicitação via formulário do site – Imersão Ministerial",
        },
        answers: values,
      };
    }}
  />
);

export default ImersaoForm;
