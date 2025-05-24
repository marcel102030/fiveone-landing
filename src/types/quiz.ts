export enum CategoryEnum {
  APOSTOLO = "apostolo",
  PROFETA = "profeta",
  EVANGELISTA = "evangelista",
  PASTOR = "pastor",
  MESTRE = "mestre",
}

export interface Statement {
  id: number;
  category: CategoryEnum;
  text: string;
}

export interface ComparisonQuestion {
  id: number;
  statement1: Statement;
  statement2: Statement;
}

export interface CategoryMetadata {
  id: CategoryEnum;
  name: string;
  icon: string;
  description: string;
}

export interface CategoryScore {
  categoryEnum: CategoryEnum;
  score: number;
}

export interface SendPdfPayload {
  name: string;
  email: string;
  pdfBase64: string;
}

export type ChoiceCategory = CategoryEnum | "ambas" | "nenhuma";

export function getProfileTextForDom(dom: CategoryEnum): string[] {
  switch (dom) {
    case CategoryEnum.APOSTOLO:
      return [
        "O dom Apostólico tem como principal função a expansão do Reino, a plantação de igrejas e a inovação no ministério. Os apóstolos são pioneiros, visionários e catalisadores da obra missionária.",
        "A pessoa com dom apostólico possui uma forte inclinação para iniciar novas obras, conectar pessoas e estabelecer fundamentos duradouros no Reino de Deus. Ele sente um chamado para desenvolver e mobilizar outros para a missão, assumindo riscos para ampliar a obra de Deus.",
        "Os apóstolos têm um papel vital na estrutura da Igreja, pois trabalham para fortalecer e expandir a obra de Cristo. Eles operam frequentemente na transição entre culturas, promovem a contextualização da mensagem do Evangelho e mantêm o DNA do Reino de Deus.",
        "CARACTERÍSTICAS DO APOSTÓLICO:\n- Pensamento visionário e estratégico\n- Disposição para assumir riscos e iniciar novos projetos\n- Capacidade de liderar e influenciar outros\n- Forte senso de missão e envio\n- Habilidade de conectar diferentes grupos e ministérios\n- Inconformismo com o status quo\n- Facilidade para trabalhar com redes e expansão",
        "FUNÇÕES PRINCIPAIS DO APOSTÓLICO:\n- Semeador do DNA da Igreja\n- Plantador de igrejas e comunidades\n- Mobilizador de líderes\n- Conector translocal\n- Provedor de inovação ministerial\n- Garantidor da fidelidade à visão e missão",
        "REFERÊNCIAS BÍBLICAS:\n- Lucas 10:1-3\n- 1 Coríntios 3:5-9,11",
        "PONTOS CEGOS E DESAFIOS:\n- Autocracia e domínio excessivo\n- Falta de empatia\n- Impaciência\n- Falta de compromisso com detalhes\n- Desgaste e esgotamento",
        "IMPACTO DO DOM APOSTÓLICO NA IGREJA:\n- Extensão do Reino de Deus para novas regiões e culturas\n- Fortalecimento da missão e envio de novos líderes\n- Inovação e adaptação do ministério para desafios contemporâneos\n- Manutenção da fidelidade ao DNA do Reino de Deus\n- Criação de redes ministeriais para colaboração",
        "CONCLUSÃO:\nO dom Apostólico é essencial para a vitalidade da Igreja. Ele impulsiona a missão, inovação e expansão do Reino de Deus, capacitando líderes e estabelecendo bases para um crescimento sustentável. Quando equilibrado com os outros dons ministeriais, o apostólico ajuda a criar uma Igreja saudável, missionária e contextualizada para impactar o mundo de forma transformadora."
      ];
    default:
      return ["Perfil não encontrado para o dom informado."];
  }
}