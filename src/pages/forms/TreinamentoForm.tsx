import React from "react";
import ServiceFormPage, { ServiceFormField } from "./ServiceFormPage";

const fields: ServiceFormField[] = [
  {
    name: "leaderName",
    label: "Nome do líder responsável",
    type: "text",
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
    name: "role",
    label: "Cargo ou função",
    type: "text",
    placeholder: "Ex.: Pastor de Equipes, Coordenador de Ministérios",
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
    name: "teamSize",
    label: "Quantidade de líderes na equipe",
    type: "number",
    placeholder: "Ex.: 15",
    helperText: "Apenas números",
  },
  {
    name: "ministryAreas",
    label: "Quais áreas precisam de alinhamento?",
    type: "textarea",
    placeholder: "Liste ministérios, departamentos ou desafios que deseja trabalhar.",
    required: true,
  },
  {
    name: "preferredMonth",
    label: "Quando deseja realizar o treinamento?",
    type: "month",
    helperText: "Selecione o mês mais provável. Ajustaremos o dia posteriormente.",
  },
  {
    name: "notes",
    label: "Informações adicionais",
    type: "textarea",
    placeholder: "Compartilhe expectativas, histórico da equipe ou dúvidas específicas.",
  },
];

const TreinamentoForm: React.FC = () => (
  <ServiceFormPage
    badge="Treinamento para liderança"
    title="Solicitar Treinamento para Liderança"
    subtitle="Alinhamento teológico e plano de implementação"
    description="Conte um pouco sobre sua equipe e o estágio atual da igreja. Com base nas informações, enviaremos uma proposta personalizada, com duração, recursos e cronograma sugerido."
    fields={fields}
    ctaLabel="Enviar solicitação"
    successMessage="Recebemos sua solicitação de treinamento. Em até 3 dias úteis vamos retornar com proposta de agenda, investimento e próximos passos."
    serviceType="treinamento"
    serviceLabel="Treinamento para Liderança"
    videoUrl="https://www.youtube.com/watch?v=o8qKV7OlUTw"
    buildSubmission={(values) => {
      const name = values.leaderName?.trim() || "";
      const email = values.email?.trim() || "";
      const phone = values.phone?.trim() || "";
      const churchName = values.church?.trim() || `Equipe de ${name}`;
      const teamSize = Number(values.teamSize || 0) || null;
      const preferredMonth = values.preferredMonth ? `${values.preferredMonth}-01` : null;
      const notesParts = [
        "Solicitação: Treinamento para Liderança",
        values.role ? `Função do líder: ${values.role}` : null,
        teamSize ? `Equipe com ${teamSize} líderes` : null,
        preferredMonth ? `Previsão de realização: ${values.preferredMonth}` : null,
      ].filter(Boolean);

      const extraNotes = values.notes?.trim() ? `Observações adicionais: ${values.notes.trim()}` : null;

      return {
        contact: { name, email, phone },
        church: {
          name: churchName,
          leaderName: name,
          city: values.city?.trim() || null,
          expectedMembers: teamSize,
          notes: [
            notesParts.length ? notesParts.join(" | ") : null,
            values.ministryAreas ? `Áreas citadas: ${values.ministryAreas.trim()}` : null,
            extraNotes,
          ]
            .filter(Boolean)
            .join(" | ") || "Solicitação via formulário do site – Treinamento para Liderança",
        },
        answers: values,
      };
    }}
  />
);

export default TreinamentoForm;
