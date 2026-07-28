/* =============================================================================
   SCRIPT.JS  —  Lógica do convite (Vanilla JS, sem frameworks)
   -----------------------------------------------------------------------------
   Responsabilidades:
     1) Roteador de telas (mostrar/esconder .screen)
     2) Ler o convidado a partir da URL (?id=...) e preencher os textos
     3) Ações dos botões (goto / link / modal)
     4) Modal (abrir, fechar, fade + escala, ESC, clique fora)
     5) Gerar a lista de presentes físicos e o link do WhatsApp

   Nada aqui precisa ser editado no dia a dia — mexa no config.js.
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     1) ROTEADOR DE TELAS
     Mapeia um "nome de tela" -> id do elemento <section> no HTML.
     >>> PARA ADICIONAR UMA NOVA PÁGINA: registre-a aqui.
  -------------------------------------------------------------------------- */
  const SCREENS = {
    welcome:    "screen-welcome",
    details:    "screen-details",
    navigation: "screen-navigation",
    gifts:      "screen-gifts",
    thankyou:   "screen-thankyou"
  };

  /* Troca a tela ativa. Rola para o topo para começar bem posicionado. */
  function goTo(screenName) {
    const targetId = SCREENS[screenName];
    if (!targetId) {
      console.warn("Tela desconhecida:", screenName);
      return;
    }
    document.querySelectorAll(".screen").forEach(function (el) {
      el.classList.remove("is-active");
    });
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add("is-active");
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    }
  }

  /* --------------------------------------------------------------------------
     2) CONVIDADO A PARTIR DA URL
     Ordem de prioridade:
       a) ?id=chave           -> busca em GUESTS[chave]
       b) ?greeting=&name=    -> monta um convidado avulso pela URL (fallback)
       c) GUESTS.default      -> convidado padrão do config
  -------------------------------------------------------------------------- */
  function resolveGuest() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // a) por id cadastrado
    if (id && GUESTS[id]) {
      return GUESTS[id];
    }

    // b) por parâmetros avulsos na URL
    const greeting = params.get("greeting");
    const name = params.get("name");
    if (greeting || name) {
      return {
        greeting: greeting || CONFIG.guestGreeting,
        name: name || CONFIG.guestName,
        text: CONFIG.guestText
      };
    }

    // c) padrão
    return GUESTS.default || {
      greeting: CONFIG.guestGreeting,
      name: CONFIG.guestName,
      text: CONFIG.guestText
    };
  }

  /* Preenche os textos dinâmicos da tela Welcome e o nome do casal na final. */
  function fillTexts() {
    const guest = resolveGuest();

    const greetingEl = document.getElementById("welcome-greeting");
    const nameEl = document.getElementById("welcome-name");
    const inviteEl = document.getElementById("welcome-invite");

    if (greetingEl) greetingEl.textContent = guest.greeting + " ";
    // nome com vírgula ao final, em destaque dourado (a cor vem do CSS)
    if (nameEl) nameEl.textContent = guest.name + ",";
    if (inviteEl) inviteEl.textContent = guest.text || CONFIG.guestText;

    const coupleEl = document.getElementById("thankyou-couple");
    if (coupleEl) coupleEl.textContent = CONFIG.couple;
  }

  /* --------------------------------------------------------------------------
     3) AÇÕES DE BOTÕES
     Tudo é resolvido por data-atributos no HTML (delegação de eventos),
     então não é preciso adicionar listeners um a um.
       data-action="goto"       + data-target="navigation"
       data-action="link"       + data-link="rsvp"
       data-action="open-modal"
       data-action="modal-confirm" / "modal-close"
  -------------------------------------------------------------------------- */
  function handleAction(action, el) {
    switch (action) {
      case "goto":
        goTo(el.dataset.target);
        break;

      case "link":
        openConfigLink(el.dataset.link);
        break;

      case "open-modal":
        openModal();
        break;

      case "modal-confirm":
        closeModal();
        goTo("gifts");
        break;

      case "modal-close":
        closeModal();
        break;
    }
  }

  /* Abre um link vindo de CONFIG.links. Avisa se ainda não foi configurado. */
  function openConfigLink(key) {
    const url = (CONFIG.links && CONFIG.links[key]) ? CONFIG.links[key].trim() : "";
    if (!url) {
      alert("Este link ainda não foi configurado. 🙂");
      return;
    }
    window.open(url, "_blank", "noopener");
  }

  /* --------------------------------------------------------------------------
     4) MODAL
  -------------------------------------------------------------------------- */
  const modal = document.getElementById("modal");

  function openModal() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";  // trava rolagem de fundo
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* Fechar ao clicar fora (no overlay, não no cartão). */
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  /* Fechar com ESC. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  /* --------------------------------------------------------------------------
     5) PRESENTES FÍSICOS
     Gera os cards a partir de CONFIG.physicalGifts e monta o link do WhatsApp.
  -------------------------------------------------------------------------- */

  /* Monta a URL do WhatsApp com a mensagem de reserva já codificada. */
  function buildWhatsAppLink(gift) {
    const phone = (CONFIG.whatsapp && CONFIG.whatsapp.phone) ? CONFIG.whatsapp.phone.replace(/\D/g, "") : "";

    // Mensagem: usa a do presente ou monta uma padrão com o nome.
    const message = (gift.reservationMessage && gift.reservationMessage.trim())
      ? gift.reservationMessage.trim()
      : 'Olá! Gostaria de reservar o presente "' + gift.name + '" da lista de casamento. ❤️';

    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  }

  /* Cria e injeta os cards na grade. */
  function renderGifts() {
    const grid = document.getElementById("gift-grid");
    if (!grid || !Array.isArray(CONFIG.physicalGifts)) return;

    grid.innerHTML = "";  // limpa antes de renderizar

    CONFIG.physicalGifts.forEach(function (gift, index) {
      const card = document.createElement("article");
      card.className = "gift-card";
      card.style.setProperty("--i", index);  // atraso escalonado da animação

      // Estrutura do card (componente único reutilizado para todos)
      card.innerHTML =
        '<img class="gift-card__img" loading="lazy" alt="' + escapeHtml(gift.name) + '" src="' + escapeHtml(gift.image) + '">' +
        '<div class="gift-card__body">' +
          '<h3 class="gift-card__name">' + escapeHtml(gift.name) + '</h3>' +
          '<button class="btn btn--primary btn--reserve" type="button">Reservar</button>' +
        '</div>';

      // Ação de reservar -> abre o WhatsApp
      const btn = card.querySelector(".btn--reserve");
      btn.addEventListener("click", function () {
        const phone = (CONFIG.whatsapp && CONFIG.whatsapp.phone) ? CONFIG.whatsapp.phone.trim() : "";
        if (!phone) {
          alert("O número de WhatsApp ainda não foi configurado. 🙂");
          return;
        }
        window.open(buildWhatsAppLink(gift), "_blank", "noopener");
      });

      grid.appendChild(card);
    });
  }

  /* Pequena proteção para textos inseridos via innerHTML. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* --------------------------------------------------------------------------
     INICIALIZAÇÃO
  -------------------------------------------------------------------------- */
  function init() {
    // Delegação de eventos: um único listener cobre todos os botões com data-action.
    document.body.addEventListener("click", function (e) {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      handleAction(el.dataset.action, el);
    });

    fillTexts();
    renderGifts();
  }

  // Garante que o config.js já carregou (ele vem antes no HTML).
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
