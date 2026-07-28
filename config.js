/* =============================================================================
   CONFIG.JS  —  ARQUIVO DE CONFIGURAÇÃO CENTRAL
   -----------------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR NO DIA A DIA.
   Aqui ficam: convidados, links, WhatsApp e a lista de presentes físicos.

   Índice do que editar e onde:
     1) GUESTS ............. cadastro de convidados (nome, saudação, texto)
     2) CONFIG.links ....... links de RSVP, lista online e Uber
     3) CONFIG.whatsapp .... número do WhatsApp para reserva de presentes
     4) CONFIG.physicalGifts lista dos presentes físicos (imagem, nome, msg)
     5) CONFIG.couple ...... nome do casal (usado na tela de agradecimento)
   ========================================================================== */


/* -----------------------------------------------------------------------------
   1) CONVIDADOS
   -----------------------------------------------------------------------------
   O convite é personalizado pela URL usando um identificador (id):

       index.html?id=adriana
       index.html?id=joao-e-luna

   >>> COMO ADICIONAR UM NOVO CONVIDADO:
       Basta copiar um bloco abaixo e trocar a "chave" (ex.: "adriana") e os
       campos. A chave é o valor que vai na URL depois de ?id=

   Campos de cada convidado:
     greeting -> "Querida", "Queridos", "Querida Família", etc.
     name     -> nome que aparece em destaque dourado
     text     -> texto do convite (opcional; se vazio, usa o texto padrão)

   Dica: prefira chaves sem espaços e sem acento (ex.: "ana-lucia").
--------------------------------------------------------------------------- */
// Textos padrão (singular = 1 pessoa, plural = casal/duas pessoas)
const TEXT_SINGULAR = "É com muita alegria que convidamos você para celebrar conosco um dos dias mais especiais das nossas vidas: o nosso casamento.";
const TEXT_PLURAL = "É com muita alegria que convidamos vocês para celebrar conosco um dos dias mais especiais das nossas vidas: o nosso casamento.";

const GUESTS = {
  // Convidado padrão (usado quando a URL não traz nenhum ?id= válido)
  default: {
    greeting: "Querida",
    name: "Adriana",
    text: TEXT_SINGULAR
  },

  adriana:              { greeting: "Querida",  name: "Adriana",                    text: TEXT_SINGULAR },
  "ana-lucia":          { greeting: "Querida",  name: "Ana Lucia",                  text: TEXT_SINGULAR },
  "ana-vitoria":        { greeting: "Querida",  name: "Ana Vitória",                text: TEXT_SINGULAR },
  andre:                { greeting: "Querido",  name: "André",                      text: TEXT_SINGULAR },
  "batista-e-erita":    { greeting: "Queridos", name: "Batista e Erita",            text: TEXT_PLURAL },
  "beatriz-e-bruno":    { greeting: "Queridos", name: "Beatriz e Bruno",            text: TEXT_PLURAL },
  cleude:               { greeting: "Querida",  name: "Cleude",                     text: TEXT_SINGULAR },
  "conchita-e-roberto": { greeting: "Queridos", name: "Conchita e Roberto",         text: TEXT_PLURAL },
  daiane:               { greeting: "Querida",  name: "Daiane",                     text: TEXT_SINGULAR },
  "daniele-e-josimar":  { greeting: "Queridos", name: "Daniele e Josimar",          text: TEXT_PLURAL },
  "deize-e-matheus":    { greeting: "Queridos", name: "Deize e Matheus",            text: TEXT_PLURAL },
  "denise-e-ze":        { greeting: "Queridos", name: "Denise e Zé",                text: TEXT_PLURAL },
  "uedson-e-dilri":      { greeting: "Queridos", name: "Uedson e Dilri",              text: TEXT_PLURAL },
  elena:                { greeting: "Querida",  name: "Elena",                      text: TEXT_SINGULAR },
  eliane:               { greeting: "Querida",  name: "Eliane",                     text: TEXT_SINGULAR },
  "enzo-e-ingrid":     { greeting: "Queridos", name: "Enzo e Ingrid",             text: TEXT_PLURAL },
  "pastor-e-esposa":    { greeting: "Queridos", name: "Esposa do Pastor e Pastor",  text: TEXT_PLURAL },
  "fernando-e-idene":   { greeting: "Queridos", name: "Fernando e Idene",           text: TEXT_PLURAL },
  gabriel:              { greeting: "Querido",  name: "Gabriel",                    text: TEXT_SINGULAR },
  ilana:                { greeting: "Querida",  name: "Ilana",                      text: TEXT_SINGULAR },
  jean:                 { greeting: "Querido",  name: "Jean",                       text: TEXT_SINGULAR },
  "joao-e-luna":        { greeting: "Queridos", name: "João e Luna",                text: TEXT_PLURAL },
  keila:                { greeting: "Querida",  name: "Keila",                      text: TEXT_SINGULAR },
  lana:                 { greeting: "Querida",  name: "Lana",                       text: TEXT_SINGULAR },
  "lavinia-e-thiago":   { greeting: "Queridos", name: "Lavinia e Thiago",           text: TEXT_PLURAL },
  lilia:                { greeting: "Querida",  name: "Lilia",                      text: TEXT_SINGULAR },
  mariane:              { greeting: "Querida",  name: "Mariane",                    text: TEXT_SINGULAR },
  matheus:              { greeting: "Querido",  name: "Matheus",                    text: TEXT_SINGULAR },
  "monica-e-osvaldo":   { greeting: "Queridos", name: "Monica e Osvaldo",           text: TEXT_PLURAL },
  nanda:                { greeting: "Querida",  name: "Nanda",                      text: TEXT_SINGULAR },
  patricia:             { greeting: "Querida",  name: "Patricia",                   text: TEXT_SINGULAR },
  ramiro:               { greeting: "Querido",  name: "Ramiro",                     text: TEXT_SINGULAR },
  reinaldo:             { greeting: "Querido",  name: "Reinaldo",                   text: TEXT_SINGULAR },
  renato:               { greeting: "Querido",  name: "Renato",                     text: TEXT_SINGULAR },
  roberto:              { greeting: "Querido",  name: "Roberto",                    text: TEXT_SINGULAR },
  sofia:                { greeting: "Querida",  name: "Sofia",                      text: TEXT_SINGULAR },
  vanessa:              { greeting: "Querida",  name: "Vanessa",                     text: TEXT_SINGULAR }
};


/* -----------------------------------------------------------------------------
   2 a 5) CONFIGURAÇÃO GERAL DO CASAMENTO
--------------------------------------------------------------------------- */
const CONFIG = {

  /* Nome do casal — aparece na tela final "Obrigado". */
  couple: "Rodrigo & Talia",

  /* Saudação/nome/texto padrão (fallback caso não haja convidado nem URL). */
  guestGreeting: GUESTS.default.greeting,
  guestName: GUESTS.default.name,
  guestText: GUESTS.default.text,

  /* ---------------------------------------------------------------------------
     2) LINKS
     ------------------------------------------------------------------------
     >>> COLE AQUI OS LINKS. Deixe vazio ("") o que ainda não tiver.
        Botões com link vazio avisam que o link ainda não foi configurado.
  --------------------------------------------------------------------------- */
  links: {
    rsvp: "https://sites.icasei.com.br/taliaerodrigo/pages/37942651",            // Confirmar Presença
    onlineGiftList: "https://sites.icasei.com.br/taliaerodrigo/pages/37942854",  // Lista de presentes online
    uber: "https://maps.app.goo.gl/bgPbcH4h9LQqzB7X6"             // Como Chegar (Uber / Google Maps)
  },

  /* ---------------------------------------------------------------------------
     3) WHATSAPP
     ------------------------------------------------------------------------
     >>> Número no formato internacional, apenas dígitos.
        Ex.: Brasil (71) 99999-9999  ->  "5571999999999"
  --------------------------------------------------------------------------- */
  whatsapp: {
    phone: "5571981298738"
  },

  /* ---------------------------------------------------------------------------
     4) PRESENTES FÍSICOS
     ------------------------------------------------------------------------
     >>> COMO ADICIONAR / TROCAR UM PRESENTE:
         - name  : nome exibido no card
         - image : caminho da imagem (troque pelos seus arquivos em /assets)
                   As imagens abaixo são ilustrativas (placeholder online).
         - reservationMessage : mensagem enviada no WhatsApp ao reservar.
                   Se ficar vazio, uma mensagem padrão é montada com o nome.

     Para adicionar um presente novo, basta copiar um objeto { ... } abaixo.
  --------------------------------------------------------------------------- */
  physicalGifts: [
    {
      name: "Jogo de Taças",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Cama Queen (1)",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Cama Queen (2)",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Cama Queen (3)",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Banho (1)",
      image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Banho (2)",
      image: "https://images.unsplash.com/photo-1616627981431-6e0ba0c8bbce?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Banho (3)",
      image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Jogo de Panelas",
      image: "https://images.unsplash.com/photo-1584990347449-a2d4c2c9b3f8?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Faqueiro + Pratos + Copos",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Travessas de Porcelana",
      image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Conjunto de Assadeiras",
      image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Liquidificador",
      image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80",
      reservationMessage: ""
    },
    {
      name: "Air Fryer",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?w=600&q=80",
      reservationMessage: ""
    }
  ]
};
