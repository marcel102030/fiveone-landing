// Fonte única de verdade para redes sociais e contato do Five One.
// Evita divergência entre Footer, Contato, Home, etc. (já tivemos o handle do
// YouTube errado em um lugar — centralizar previne isso).

export const SOCIAL = {
  instagram: {
    handle: "@fiveone.oficial",
    url: "https://www.instagram.com/fiveone.oficial/",
  },
  youtube: {
    handle: "@Five_One_Movement",
    url: "https://www.youtube.com/@Five_One_Movement",
  },
  tiktok: {
    handle: "@escola.five.one",
    url: "https://www.tiktok.com/@escola.five.one",
  },
  whatsapp: {
    // Atendimento principal
    phone: "5583989004764",
    display: "(83) 98900-4764",
    url: "https://wa.me/5583989004764",
  },
  email: "escolafiveone@gmail.com",
} as const;
