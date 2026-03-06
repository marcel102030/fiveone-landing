import React from "react";
import ServiceFormPage, { ServiceFormField } from "./ServiceFormPage";

const fields: ServiceFormField[] = [
  {
    name: "participantName",
    label: "Nome do participante",
    type: "text",
    placeholder: "Como podemos chamar você?",
    required: true,
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "nome@exemplo.com",
    required: true,
  },
  {
    name: "phone",
    label: "Telefone com DDD",
    type: "tel",
    placeholder: "(00) 00000-0000",
    required: true,
  },
  {
    name: "church",
    label: "Igreja / Comunidade",
    type: "text",
    placeholder: "Nome da igreja que você faz parte",
    required: true,
  },
  {
    name: "city",
    label: "Cidade / Estado",
    type: "text",
    placeholder: "Ex.: João Pessoa / PB",
  },
  {
    name: "currentStage",
    label: "Como você tem servido hoje?",
    type: "select",
    options: [
      { value: "inicio", label: "Estou começando a servir / descubro meu dom" },
      { value: "lideranca", label: "Sirvo em liderança e quero alinhar meu dom" },
      { value: "transicao", label: "Estou em transição de ministério" },
      { value: "outro", label: "Outro contexto" },
    ],
  },
  {
    name: "preferredDate",
    label: "Data sugerida para a mentoria",
    type: "date",
    helperText: "Vamos confirmar após analisar a agenda.",
  },
  {
    name: "goals",
    label: "Quais são as principais expectativas para a mentoria?",
    type: "textarea",
    placeholder: "Conte um pouco sobre seus objetivos, dúvidas ou desafios atuais.",
    required: true,
  },
];

const MentoriaForm: React.FC = () => (
  <ServiceFormPage
    badge="Mentoria individual"
    title="Agende sua Mentoria Individual"
    subtitle="Sessão personalizada de 60–90 minutos"
    description="Preencha o formulário abaixo para que possamos entender o contexto do seu chamado e preparar uma sessão personalizada. Utilizamos o teste Five One como base para a conversa e entregamos um plano de ação após o encontro."
    fields={fields}
    ctaLabel="Enviar solicitação"
    successMessage="Recebemos sua solicitação de mentoria. Entraremos em contato por e-mail ou telefone em até 2 dias úteis para alinhar agenda e próximos passos."
    serviceType="mentoria"
    serviceLabel="Mentoria Individual"
    videoUrl="https://www.youtube.com/watch?v=o8qKV7OlUTw"
    buildSubmission={(values) => {
      const name = values.participantName?.trim() || "";
      const email = values.email?.trim() || "";
      const phone = values.phone?.trim() || "";
      const churchName = values.church?.trim() || `Mentoria ${name}`;
      const contextLabel = (() => {
        switch (values.currentStage) {
          case "inicio":
            return "Iniciando no serviço";
          case "lideranca":
            return "Já lidera e busca alinhamento";
          case "transicao":
            return "Em transição ministerial";
          case "outro":
            return "Outro contexto";
          default:
            return null;
        }
      })();
      const notesParts = [
        "Solicitação: Mentoria Individual",
        contextLabel ? `Contexto informado: ${contextLabel}` : null,
        values.preferredDate ? `Preferência de data: ${values.preferredDate}` : null,
      ].filter(Boolean);

      return {
        contact: { name, email, phone },
        church: {
          name: churchName,
          leaderName: name,
          city: values.city?.trim() || null,
          notes: notesParts.length ? notesParts.join(" | ") : "Solicitação via formulário do site – Mentoria Individual",
        },
        answers: values,
      };
    }}
  />
);

export default MentoriaForm;
