import React from "react";
import ServiceFormPage, { ServiceFormField } from "./ServiceFormPage";

const fields: ServiceFormField[] = [
  {
    name: "responsibleName",
    label: "Nome do responsável",
    type: "text",
    placeholder: "Quem está fazendo o pedido?",
    required: true,
  },
  {
    name: "email",
    label: "E-mail para contato",
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
    name: "audienceSize",
    label: "Perfil da igreja",
    type: "select",
    options: [
      { value: "ate50", label: "Até 50 pessoas" },
      { value: "50a150", label: "Entre 50 e 150 pessoas" },
      { value: "150a400", label: "Entre 150 e 400 pessoas" },
      { value: "400plus", label: "Acima de 400 pessoas" },
    ],
    required: true,
  },
  {
    name: "preferredDate",
    label: "Data desejada",
    type: "date",
    helperText: "Use a melhor estimativa. Ajustaremos conforme disponibilidade.",
  },
  {
    name: "context",
    label: "Qual objetivo você deseja alcançar com a palestra?",
    type: "textarea",
    placeholder: "Conte sobre o momento da igreja e o que esperam ao receber a palestra.",
    required: true,
  },
];

const PalestraForm: React.FC = () => (
  <ServiceFormPage
    badge="Palestra introdutória"
    title="Solicitar Palestra Introdutória"
    subtitle="Visão bíblica e prática dos cinco ministérios"
    description="Preencha os dados abaixo para receber um contato da nossa equipe com proposta, disponibilidade e materiais de apoio. Queremos entender o contexto da sua comunidade e oferecer uma apresentação alinhada às necessidades da igreja."
    fields={fields}
    ctaLabel="Solicitar apresentação"
    successMessage="Sua solicitação foi enviada! Em breve nossa equipe retornará com proposta e orientações para agendar a palestra."
    serviceType="palestra"
    serviceLabel="Palestra Introdutória"
    videoUrl="https://www.youtube.com/watch?v=o8qKV7OlUTw"
    buildSubmission={(values) => {
      const name = values.responsibleName?.trim() || "";
      const email = values.email?.trim() || "";
      const phone = values.phone?.trim() || "";
      const churchName = values.church?.trim() || `Comunidade de ${name}`;
      const audienceMap: Record<string, string> = {
        ate50: "Até 50 pessoas",
        "50a150": "Entre 50 e 150 pessoas",
        "150a400": "Entre 150 e 400 pessoas",
        "400plus": "Acima de 400 pessoas",
      };
      const expectedMap: Record<string, number> = {
        ate50: 50,
        "50a150": 150,
        "150a400": 400,
        "400plus": 600,
      };
      const audienceLabel = values.audienceSize ? audienceMap[values.audienceSize] || values.audienceSize : null;
      const expectedMembers = values.audienceSize ? expectedMap[values.audienceSize] || undefined : undefined;

      const notesParts = [
        "Solicitação: Palestra Introdutória",
        audienceLabel ? `Perfil informado: ${audienceLabel}` : null,
        values.preferredDate ? `Data sugerida: ${values.preferredDate}` : null,
      ].filter(Boolean);

      return {
        contact: { name, email, phone },
        church: {
          name: churchName,
          leaderName: name,
          city: values.city?.trim() || null,
          expectedMembers: expectedMembers ?? null,
          notes: notesParts.length
            ? `${notesParts.join(" | ")}\nObjetivo relatado: ${values.context?.trim() || "(não informado)"}`
            : `Solicitação via formulário do site – Palestra Introdutória. Objetivo: ${values.context?.trim() || "(não informado)"}`,
        },
        answers: values,
      };
    }}
  />
);

export default PalestraForm;
