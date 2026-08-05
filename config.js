/* =============================================================================
   CONFIG.JS  —  ARQUIVO DE CONFIGURAÇÃO CENTRAL
   -----------------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR NO DIA A DIA.
   Aqui ficam: convidados, dados do evento, links, redes sociais e a lista
   de presentes físicos.

   Índice do que editar e onde:
     1) GUESTS ............... cadastro de convidados (nome, saudação, texto)
     2) CONFIG.event ......... data, horário, local, endereço e textos
     3) CONFIG.links ......... links de RSVP, lista online e mapa
     4) CONFIG.social ........ WhatsApp e Instagram (opcionais)
     5) CONFIG.physicalGifts . lista dos presentes físicos (nome, descrição, link)
     6) CONFIG.couple ........ nome do casal
   ========================================================================== */


/* -----------------------------------------------------------------------------
   1) CONVIDADOS
   -----------------------------------------------------------------------------
   O convite é personalizado pela URL usando um identificador (id):

       index.html?id=adriana
       index.html?id=joao-e-luna

   >>> COMO ADICIONAR UM NOVO CONVIDADO:
       Basta copiar uma linha abaixo e trocar a "chave" (ex.: "adriana") e os
       campos. A chave é o valor que vai na URL depois de ?id=

   Campos de cada convidado:
     greeting -> "Querida", "Querido", "Queridos"...
     name     -> nome que aparece em destaque rosé metálico
     text     -> texto do convite (singular para 1 pessoa, plural para casal)

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
  "cleude-e-gilson":    { greeting: "Queridos", name: "Cleude e Gilson",            text: TEXT_PLURAL },
  "conchita-e-roberto": { greeting: "Queridos", name: "Conchita e Roberto",         text: TEXT_PLURAL },
  daiane:               { greeting: "Querida",  name: "Daiane",                     text: TEXT_SINGULAR },
  "daniele-e-josimar":  { greeting: "Queridos", name: "Daniele e Josimar",          text: TEXT_PLURAL },
  "deize-e-matheus":    { greeting: "Queridos", name: "Deize e Matheus",            text: TEXT_PLURAL },
  "denise-e-ze":        { greeting: "Queridos", name: "Denise e Zé",                text: TEXT_PLURAL },
  "uedson-e-dilri":     { greeting: "Queridos", name: "Uedson e Dilri",             text: TEXT_PLURAL },
  elena:                { greeting: "Querida",  name: "Elena",                      text: TEXT_SINGULAR },
  eliane:               { greeting: "Querida",  name: "Eliane",                     text: TEXT_SINGULAR },
  "enzo-e-ingrid":      { greeting: "Queridos", name: "Enzo e Ingrid",              text: TEXT_PLURAL },
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
  "patricia-e-renato":  { greeting: "Queridos", name: "Patricia e Renato",          text: TEXT_PLURAL },
  ramiro:               { greeting: "Querido",  name: "Ramiro",                     text: TEXT_SINGULAR },
  reinaldo:             { greeting: "Querido",  name: "Reinaldo",                   text: TEXT_SINGULAR },
  renato:               { greeting: "Querido",  name: "Renato",                     text: TEXT_SINGULAR },
  roberto:              { greeting: "Querido",  name: "Roberto",                    text: TEXT_SINGULAR },
  sofia:                { greeting: "Querida",  name: "Sofia",                      text: TEXT_SINGULAR },
  vanessa:              { greeting: "Querida",  name: "Vanessa",                    text: TEXT_SINGULAR }
};


/* -----------------------------------------------------------------------------
   2 a 6) CONFIGURAÇÃO GERAL DO CASAMENTO
--------------------------------------------------------------------------- */
const CONFIG = {

  /* Nome do casal — usado na frase de abertura e na folha final. */
  couple: "Rodrigo & Talia",

  /* ---------------------------------------------------------------------------
     2) EVENTO — data, horário e local (exibidos na Folha 2 — Welcome).
     >>> Edite livremente. Se "address" ficar vazio (""), a linha some do site.
  --------------------------------------------------------------------------- */
  event: {
    dateLine:  "30 de Setembro de 2026",
    timeLine:  "às 16h30",
    venue:     "Espaço Aliança Casa Ribeira",
    address:   "Av. Beira Mar, 419 - 1º andar - Ribeira, Salvador - BA, 41415-055",

    /* A mesma data em formato de máquina, para a contagem regressiva.
       Formato: AAAA-MM-DDTHH:MM:SS-03:00  (o -03:00 é o fuso de Salvador) */
    datetime:  "2026-09-30T16:30:00-03:00",

    /* Linha da data desmembrada, no estilo do convite impresso:
       SÁBADO | 30 | SETEMBRO  ·  2026 · */
    weekday:   "Quarta-feira",
    day:       "30",
    month:     "Setembro",
    year:      "2026"
  },

  /* ---------------------------------------------------------------------------
     3) LINKS
     >>> Deixe vazio ("") o que ainda não tiver — o botão avisa com delicadeza.
        Todos os links abrem em uma nova aba.
  --------------------------------------------------------------------------- */
  links: {
    rsvp: "https://sites.icasei.com.br/taliaerodrigo/pages/37942651",            // Confirmar Presença
    onlineGiftList: "https://sites.icasei.com.br/taliaerodrigo/pages/37942854",  // Lista de presentes online
    maps: "https://maps.app.goo.gl/bgPbcH4h9LQqzB7X6"                            // Como Chegar (Google Maps)
  },

  /* ---------------------------------------------------------------------------
     4) WHATSAPP E INSTAGRAM
     >>> whatsapp.phone: usado no "Reservar" dos presentes físicos.
        Formato internacional, apenas dígitos. Ex.: "5571999999999"
     >>> instagram: URL completa do perfil, aparece na folha final
        (vazio "" = botão não aparece)
  --------------------------------------------------------------------------- */
  social: {
    whatsapp: {
      phone: "5571981298738"
    },
    instagram: ""   // ex.: "https://instagram.com/rodrigoetalia"
  },

  /* ---------------------------------------------------------------------------
     5) PRESENTES FÍSICOS
     >>> Cada item tem:
         - name  : nome exibido no cartão
         - brand : SUGESTÃO de marca, para orientar quem for comprar. São marcas
                   populares de bom custo-benefício no Brasil, não uma exigência
                   — quem presenteia escolhe o que preferir. Deixe "" para ocultar.
         - qty   : quantidade desejada. Só aparece no cartão quando for maior
                   que 1, como a etiqueta "Quantidade 2". O item continua sendo
                   UM presente só: a mesma pessoa leva as duas unidades.
         - image : FOTO DO ITEM. Está vazia ("") de propósito — assim o cartão
                   mostra um selo neutro elegante até você colocar a sua foto.
                   Para trocar, cole o link da imagem, por exemplo:
                     image: "assets/air-fryer.jpg"        (arquivo seu em /assets)
                     image: "https://site.com/foto.jpg"   (link direto da web)
         - reservationMessage : mensagem enviada no WhatsApp ao reservar.
                   Se ficar vazio, é montada automaticamente com o nome e,
                   quando houver, a quantidade.

     Para adicionar um presente novo, basta copiar uma linha { ... } abaixo.
  --------------------------------------------------------------------------- */
  physicalGifts: [
    { name: "Liquidificador",                  brand: "Oster",            qty: 1, image: "", reservationMessage: "" },
    { name: "Conjunto de Cama Casal",          brand: "Santista",         qty: 2, image: "", reservationMessage: "" },
    { name: "Batedeira",                       brand: "Mondial",          qty: 1, image: "", reservationMessage: "" },
    { name: "Conjunto de Toalhas de Banho",    brand: "Karsten",          qty: 2, image: "", reservationMessage: "" },
    { name: "Aspirador de Pó Robô",            brand: "Multilaser",       qty: 1, image: "", reservationMessage: "" },
    { name: "Jogo de Panelas",                 brand: "Tramontina",       qty: 1, image: "", reservationMessage: "" },
    { name: "Jogo de Taças",                   brand: "Nadir Figueiredo", qty: 1, image: "", reservationMessage: "" },
    { name: "Air Fryer",                       brand: "Philco",           qty: 1, image: "", reservationMessage: "" },
    { name: "Conjunto de Assadeiras",          brand: "Marinex",          qty: 1, image: "", reservationMessage: "" },
    { name: "Edredom",                         brand: "Buddemeyer",       qty: 2, image: "", reservationMessage: "" },
    { name: "Potes de Armazenamento de Vidro", brand: "Invicta",          qty: 1, image: "", reservationMessage: "" }
  ]
};
