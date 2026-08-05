/* =============================================================================
   SCRIPT.JS  —  Lógica do convite-livreto (Vanilla JS, sem frameworks)
   -----------------------------------------------------------------------------
   Responsabilidades:
     1) Preencher todos os textos a partir de config.js (data-config + convidado)
     2) Gerar os cartões de presentes físicos
     3) INTRO — linha do tempo cinematográfica da abertura do envelope (~3,5s)
     4) BOOK — virada de folha física (clique, deslize com pré-visualização,
        teclado), sombreado sincronizado e indicadores laterais
     5) Memória de posição (sessionStorage) — ao voltar de um link externo
        o convidado permanece na folha em que estava

   Nada aqui precisa ser editado no dia a dia — mexa no config.js.
   ========================================================================== */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORAGE_KEY = "rt-sheet";

  /* --------------------------------------------------------------------------
     1) TEXTOS — convidado (?id=) e campos data-config="caminho.no.CONFIG"
  -------------------------------------------------------------------------- */
  function resolveGuest() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (id && GUESTS[id]) return GUESTS[id];

    // Fallback rápido pela URL: ?greeting=Querida&name=Fulana
    var greeting = params.get("greeting");
    var name = params.get("name");
    if (greeting || name) {
      return {
        greeting: greeting || GUESTS.default.greeting,
        name: name || GUESTS.default.name,
        text: GUESTS.default.text
      };
    }
    return GUESTS.default;
  }

  /* Lê "event.dateLine" dentro de CONFIG de forma segura. */
  function configPath(path) {
    return path.split(".").reduce(function (obj, key) {
      return (obj && obj[key] !== undefined) ? obj[key] : "";
    }, CONFIG);
  }

  function fillTexts() {
    // Campos genéricos ligados ao CONFIG
    document.querySelectorAll("[data-config]").forEach(function (el) {
      var key = el.getAttribute("data-config");
      if (key === "couple-e") {
        // "Rodrigo & Talia" -> "Rodrigo e Talia" (para dentro de frase corrida)
        el.textContent = CONFIG.couple.replace("&", "e");
      } else {
        el.textContent = configPath(key);
      }
    });

    // Endereço é opcional: sem valor, a linha desaparece
    var addressEl = document.getElementById("event-address");
    if (addressEl && !CONFIG.event.address) addressEl.remove();

    // Convidado personalizado (Folha 2)
    var guest = resolveGuest();
    document.getElementById("welcome-greeting").textContent = guest.greeting + " ";
    document.getElementById("welcome-name").textContent = guest.name + ",";
    document.getElementById("welcome-invite").textContent = guest.text;
  }

  /* --------------------------------------------------------------------------
     2) PRESENTES FÍSICOS — cartões gerados a partir de CONFIG.physicalGifts.
        "Reservar" abre o WhatsApp dos noivos com a mensagem pronta.
  -------------------------------------------------------------------------- */

  /* Monta a URL do WhatsApp com a mensagem de reserva já codificada. */
  function buildWhatsAppLink(gift) {
    var phone = (CONFIG.social && CONFIG.social.whatsapp && CONFIG.social.whatsapp.phone)
      ? CONFIG.social.whatsapp.phone.replace(/\D/g, "") : "";

    // Itens com mais de uma unidade são UM presente só: a mensagem avisa
    // a quantidade para não haver dúvida de quem leva o quê.
    var quantas = (gift.qty && gift.qty > 1) ? " (" + gift.qty + " unidades)" : "";

    var message = (gift.reservationMessage && gift.reservationMessage.trim())
      ? gift.reservationMessage.trim()
      : 'Olá Rodrigo e Talia! Gostaria de reservar o presente "' + gift.name + '"' +
        quantas + ' da lista de casamento. ❤️';

    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  }

  function renderGifts() {
    var grid = document.getElementById("gift-grid");
    if (!grid || !Array.isArray(CONFIG.physicalGifts)) return;

    CONFIG.physicalGifts.forEach(function (gift, index) {
      // A linha inteira é tocável e abre a ficha do presente
      var card = document.createElement("button");
      card.className = "gift-card";
      card.type = "button";
      card.style.setProperty("--i", index);   // atraso da entrada em cascata

      // Foto do item (com selo neutro elegante caso o link falte ou falhe)
      var media = document.createElement("span");
      media.className = "gift-card__media";
      if (gift.image && gift.image.trim()) {
        var img = document.createElement("img");
        img.className = "gift-card__img";
        img.loading = "lazy";
        img.alt = "";
        img.src = gift.image.trim();
        img.addEventListener("error", function () { img.remove(); });
        media.appendChild(img);
      }

      var num = document.createElement("span");
      num.className = "gift-card__num";
      num.setAttribute("aria-hidden", "true");
      num.textContent = (index < 9 ? "0" : "") + (index + 1) + ".";

      var corpo = document.createElement("span");
      corpo.className = "gift-card__body";

      if (gift.brand && gift.brand.trim()) {
        var brand = document.createElement("span");
        brand.className = "gift-card__brand";
        brand.textContent = gift.brand.trim();
        corpo.appendChild(brand);
      }

      var name = document.createElement("span");
      name.className = "gift-card__name";
      name.textContent = gift.name;
      corpo.appendChild(name);

      // Etiqueta de quantidade, no espírito da etiqueta do envelope
      if (gift.qty && gift.qty > 1) {
        var qty = document.createElement("span");
        qty.className = "gift-tag";
        qty.textContent = "Quantidade " + gift.qty;
        corpo.appendChild(qty);
      }

      var pista = document.createElement("span");
      pista.className = "gift-card__cta";
      pista.appendChild(document.createTextNode("Reservar"));
      pista.appendChild(criarSeta());
      corpo.appendChild(pista);

      card.addEventListener("click", function () { abrirFichaPresente(gift); });

      card.appendChild(media);
      card.appendChild(num);
      card.appendChild(corpo);
      grid.appendChild(card);
    });
  }

  /* Ficha do presente: mostra o item e leva ao WhatsApp com a mensagem pronta */
  function abrirFichaPresente(gift) {
    var ficha = document.getElementById("gift-card-modal");
    if (!ficha) return;

    var media = document.getElementById("gift-modal-media");
    media.innerHTML = "";
    if (gift.image && gift.image.trim()) {
      var img = document.createElement("img");
      img.alt = "";
      img.src = gift.image.trim();
      img.addEventListener("error", function () { img.remove(); });
      media.appendChild(img);
    }

    var marca = document.getElementById("gift-modal-brand");
    marca.textContent = (gift.brand || "").trim();
    marca.hidden = !marca.textContent;

    document.getElementById("gift-modal-name").textContent = gift.name;

    var qty = document.getElementById("gift-modal-qty");
    if (gift.qty && gift.qty > 1) {
      qty.textContent = "Quantidade " + gift.qty;
      qty.hidden = false;
    } else {
      qty.hidden = true;
    }

    var botao = document.getElementById("gift-modal-reserve");
    botao.onclick = function () {
      var phone = (CONFIG.social && CONFIG.social.whatsapp && CONFIG.social.whatsapp.phone) || "";
      if (!phone.trim()) {
        alert("O número de WhatsApp ainda não foi configurado. 🙂");
        return;
      }
      window.open(buildWhatsAppLink(gift), "_blank", "noopener");
    };

    abrirFicha(ficha);
  }

  /* Setinha fina que desliza no hover — usada nos botões impressos. */
  function criarSeta() {
    var seta = document.createElement("span");
    seta.className = "btn-arrow";
    seta.setAttribute("aria-hidden", "true");
    return seta;
  }

  /* Abre link externo em nova aba (o livreto permanece na mesma folha). */
  function openExternal(url) {
    url = (url || "").trim();
    if (!url) {
      alert("Este link ainda não foi configurado. 🙂");
      return;
    }
    window.open(url, "_blank", "noopener");
  }

  /* --------------------------------------------------------------------------
     3) BOOK — estado e virada de folha
  -------------------------------------------------------------------------- */
  var book = document.getElementById("book");
  var SHEETS = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var current = 0;
  var busy = false;          // bloqueia gestos durante uma virada
  var navLocked = true;      // liberado apenas quando a intro termina
  var history = [];          // folhas já visitadas, para o caminho de volta

  /* Índice de cada folha pelo nome em data-sheet */
  function indexOf(name) {
    for (var i = 0; i < SHEETS.length; i++) {
      if (SHEETS[i].dataset.sheet === name) return i;
    }
    return -1;
  }

  /* --------------------------------------------------------------------------
     CAMINHO DA FOLHA (avançar)
     A folha "presente" pula a lista física: quem só vira a página vai direto
     ao agradecimento. A lista só é aberta por quem toca em "Presente Físico"
     — e de lá a virada segue para o agradecimento.

       capa → welcome → manual → interações → presente ─┬─(virar)────→ final
                                                        └─(botão)→ lista → final
  -------------------------------------------------------------------------- */
  var FLOW_NEXT = {};
  (function buildFlow() {
    var capa       = indexOf("capa");
    var welcome    = indexOf("welcome");
    var manual     = indexOf("manual");
    var interacoes = indexOf("interacoes");
    var presente   = indexOf("presente");
    var lista      = indexOf("lista");
    var final      = indexOf("final");

    FLOW_NEXT[capa]       = welcome;
    FLOW_NEXT[welcome]    = manual;
    FLOW_NEXT[manual]     = interacoes;
    FLOW_NEXT[interacoes] = presente;
    FLOW_NEXT[presente]   = final;   // a virada pula a lista
    FLOW_NEXT[lista]      = final;
    // "final" não tem próxima: fica fora do mapa
  })();

  /* Para onde a seta/gesto leva: dir +1 usa o fluxo, dir -1 usa o histórico. */
  function targetFor(dir) {
    if (dir > 0) {
      var n = FLOW_NEXT[current];
      return (n === undefined) ? -1 : n;
    }
    return history.length ? history[history.length - 1] : -1;
  }

  /* --------------------------------------------------------------------------
     A VIRADA DA FOLHA
     A folha não gira como uma porta: ela é DOBRADA pelo canto de baixo à
     direita, como papel de verdade. A mecânica é uma só, com um número:

        p = 0  ->  a orelhinha em repouso, esperando ser puxada
        p = 1  ->  a dobra atravessou a folha inteira e a página virou

     Desse número saem três coisas em sincronia:
       · o recorte diagonal da folha (clip-path), que vai comendo a página
         de baixo-direita para cima-esquerda e revelando a próxima;
       · a aba dobrada (.peel-flap), o triângulo de papel virado do avesso;
       · a sombra que a aba projeta sobre a página de baixo.
  -------------------------------------------------------------------------- */
  var TURN_MS = 760;
  var PEEL_REST = 56;        // tamanho da orelhinha em repouso (px)
  var SHADE_MAX = 0.4;       // opacidade máxima da sombra da dobra
  var peelFlap = null;

  function shadeOf(sheet) { return sheet.querySelector(".sheet-shade"); }

  /* Quanto a dobra precisa crescer para comer a folha toda: a diagonal do
     corte tem inclinação de 45°, então some largura + altura. */
  function peelMax() {
    var b = book.getBoundingClientRect();
    return b.width + b.height + 40;
  }

  var peelCast = null;

  function ensureFlap() {
    if (peelFlap) return peelFlap;
    peelFlap = document.createElement("div");
    peelFlap.className = "peel-flap";
    peelFlap.setAttribute("aria-hidden", "true");
    book.appendChild(peelFlap);

    // A sombra que a aba levantada projeta sobre a página revelada. Vive do
    // outro lado do vinco e dura mais que a aba: é ela que sustenta a leitura
    // de "papel erguido" depois que a aba já se dissolveu.
    peelCast = document.createElement("div");
    peelCast.className = "peel-cast";
    peelCast.setAttribute("aria-hidden", "true");
    book.appendChild(peelCast);
    return peelFlap;
  }

  /* Põe a folha num ponto da dobra. p vai de 0 (repouso) a 1 (virada). */
  function applyPeel(sheet, p) {
    /* O crescimento não é linear de propósito. Para engolir a folha inteira a
       dobra precisa medir largura + altura; num avanço linear ela viraria um
       triângulo gigante logo no começo do gesto. Com a curva, o trecho bonito
       — a orelha pequena, com vinco e sombra — dura a maior parte do caminho,
       e a varredura final acontece rápido. */
    var px = PEEL_REST + Math.pow(p, 1.55) * (peelMax() - PEEL_REST);
    sheet.style.setProperty("--peel", px + "px");

    var f = ensureFlap();
    f.style.display = "block";
    f.style.width = px + "px";
    f.style.height = px + "px";
    // a aba se desfaz cedo: crescida demais, vira um vazio chapado
    f.style.opacity = String(p > 0.18 ? Math.max(0, 1 - (p - 0.18) / 0.3) : 1);

    peelCast.style.display = "block";
    peelCast.style.width = px + "px";
    peelCast.style.height = px + "px";
    peelCast.style.opacity = String(p > 0.5 ? Math.max(0, 1 - (p - 0.5) / 0.35) : 1);

    var sh = shadeOf(sheet);
    if (sh) sh.style.opacity = String(Math.min(p * 1.5, 1) * SHADE_MAX);
  }

  /* Devolve a folha em cena ao repouso — só quem tem próxima ganha orelha. */
  function restPeel() {
    var s = SHEETS[current];
    if (!s) return;
    if (FLOW_NEXT[current] === undefined || REDUCED) {
      s.style.setProperty("--peel", "0px");
      if (peelFlap) peelFlap.style.display = "none";
      if (peelCast) peelCast.style.display = "none";
      return;
    }
    applyPeel(s, 0);
  }

  /* Deixa apenas a folha "i" visível e limpa qualquer resíduo de animação.
     "dir" atualiza o histórico: +1 empilha a folha de origem, -1 desempilha,
     0 é um gesto cancelado (nada muda). */
  function settle(i, dir) {
    if (dir > 0 && i !== current) history.push(current);
    else if (dir < 0 && history.length) history.pop();

    SHEETS.forEach(function (s, k) {
      s.style.visibility = (k === i) ? "visible" : "hidden";
      s.style.zIndex = (k === i) ? "2" : "1";
      s.style.removeProperty("--peel");
      // marca a folha em cena: o CSS usa isso para as entradas em cascata
      s.classList.toggle("is-current", k === i);
      var sh = shadeOf(s);
      if (sh) sh.style.opacity = "0";
    });
    current = i;
    busy = false;
    restPeel();
    syncCues();
    saveState();
  }

  /* Guarda folha atual + caminho de volta (sobrevive a recarregar a página) */
  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ i: current, h: history }));
    } catch (e) { /* modo privado */ }
  }

  /* Leva a dobra de um ponto a outro. Desacelera no fim, como papel que
     assenta — nunca para de repente. */
  function animatePeel(sheet, from, to, done) {
    var dur = Math.max(240, TURN_MS * Math.abs(to - from));
    var t0 = performance.now();
    (function tick(now) {
      var t = Math.min((now - t0) / dur, 1);
      var e = 1 - Math.pow(1 - t, 3);          // easeOutCubic
      applyPeel(sheet, from + (to - from) * e);
      if (t < 1) requestAnimationFrame(tick);
      else done();
    })(t0);
  }

  /* Vira até uma folha específica. dir = +1 (avançar) | -1 (voltar). */
  function turnTo(target, dir) {
    if (busy || navLocked || target < 0 || target >= SHEETS.length || target === current) return;
    busy = true;

    var cur = SHEETS[current];
    var tgt = SHEETS[target];

    if (REDUCED) {                       // sem cinemática: troca direta
      settle(target, dir);
      return;
    }

    tgt.style.visibility = "visible";

    if (dir > 0) {
      // A folha atual é dobrada pelo canto até desaparecer, revelando a próxima
      cur.style.zIndex = "3";
      tgt.style.zIndex = "2";
      animatePeel(cur, 0, 1, function () { settle(target, dir); });
    } else {
      // A folha anterior volta a se desdobrar por cima da atual
      tgt.style.zIndex = "3";
      cur.style.zIndex = "2";
      applyPeel(tgt, 1);
      animatePeel(tgt, 1, 0, function () { settle(target, dir); });
    }
  }

  /* Vira seguindo o fluxo: dir = +1 (avançar) | -1 (voltar). */
  function turn(dir) {
    turnTo(targetFor(dir), dir);
  }

  /* Abre uma folha pelo nome (data-sheet), sempre como avanço.
     Usado por "Levar um Presente Físico", que sai do caminho da seta. */
  function goToSheet(name) {
    turnTo(indexOf(name), 1);
  }

  /* --------------------------------------------------------------------------
     3.1) INDICADORES LATERAIS + SOMBREADO — injetados em cada folha
  -------------------------------------------------------------------------- */
  function buildSheetChrome() {
    SHEETS.forEach(function (sheet, i) {
      var shade = document.createElement("div");
      shade.className = "sheet-shade";
      sheet.appendChild(shade);

      // O canto: área para pegar a dobra + o convite discreto "PUXE".
      // Só existe onde o fluxo tem uma próxima folha.
      if (FLOW_NEXT[i] !== undefined) {
        var grab = document.createElement("button");
        grab.className = "peel-grab";
        grab.type = "button";
        grab.setAttribute("aria-label", "Virar a folha");
        grab.addEventListener("click", function () { turn(1); });
        sheet.appendChild(grab);

        var label = document.createElement("span");
        label.className = "peel-label";
        label.setAttribute("aria-hidden", "true");
        label.innerHTML = 'Puxe <span class="peel-label-arrow"></span>';
        sheet.appendChild(label);
      }

      // Voltar: um filete discreto na lateral esquerda. syncCues decide se
      // aparece (depende de haver caminho de volta no histórico).
      if (i > 0) {
        var prev = document.createElement("button");
        prev.className = "cue cue--prev";
        prev.type = "button";
        prev.setAttribute("aria-label", "Folha anterior");
        prev.addEventListener("click", function () { turn(-1); });
        sheet.appendChild(prev);
      }
    });
  }

  /* Mostra o retorno apenas quando existe folha anterior no histórico. */
  function syncCues() {
    var sheet = SHEETS[current];
    if (!sheet) return;
    var prev = sheet.querySelector(".cue--prev");
    if (prev) prev.hidden = (history.length === 0);
  }

  /* --------------------------------------------------------------------------
     3.2) GESTO — deslizar horizontalmente com pré-visualização física.
          Vertical continua livre para a rolagem interna (touch-action: pan-y).
  -------------------------------------------------------------------------- */
  var suppressClick = false;

  function setupGestures() {
    var drag = null;

    book.addEventListener("pointerdown", function (e) {
      if (busy || navLocked || REDUCED) return;
      drag = {
        x0: e.clientX, y0: e.clientY,
        dx: 0, dy: 0, p: null, active: false, dir: 0, sheet: null,
        canto: !!(e.target.closest && e.target.closest(".peel-grab")),
        lastX: e.clientX, lastT: performance.now(), vx: 0,
        raf: 0
      };
      // Pegar pela orelha já é intenção declarada: começa a dobrar na hora.
      if (drag.canto) ativar(1, e);
    });

    /* Prepara as duas folhas envolvidas e passa a comandar a dobra. */
    function ativar(dir, e) {
      var target = targetFor(dir);
      if (target < 0) { drag = null; return false; }

      drag.active = true;
      drag.dir = dir;
      drag.target = target;

      if (dir > 0) {
        drag.sheet = SHEETS[current];             // a atual é quem dobra
        SHEETS[current].style.zIndex = "3";
        SHEETS[target].style.visibility = "visible";
        SHEETS[target].style.zIndex = "2";
      } else {
        drag.sheet = SHEETS[target];              // a anterior se desdobra
        SHEETS[target].style.visibility = "visible";
        SHEETS[target].style.zIndex = "3";
        applyPeel(drag.sheet, 1);
      }
      try { book.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
      return true;
    }

    book.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      var dy = e.clientY - drag.y0;

      // Sem ser pelo canto: horizontal vira a folha, vertical deixa rolar
      if (!drag.active) {
        if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        if (!ativar(dx < 0 ? 1 : -1, e)) return;
      }

      var now = performance.now();
      drag.vx = (e.clientX - drag.lastX) / Math.max(now - drag.lastT, 1);
      drag.lastX = e.clientX;
      drag.lastT = now;
      drag.dx = dx;
      drag.dy = dy;

      if (!drag.raf) {
        drag.raf = requestAnimationFrame(function () {
          if (!drag || !drag.sheet) return;
          drag.raf = 0;
          var w = book.clientWidth;
          var p;
          if (drag.dir > 0) {
            // Puxando pelo canto, o movimento é diagonal: esquerda E para
            // cima somam. No deslize comum, só a horizontal conta.
            var avanco = drag.canto ? (-drag.dx - drag.dy * 0.6) : -drag.dx;
            p = Math.max(0, Math.min(avanco / (w * 0.85), 1));
          } else {
            p = 1 - Math.max(0, Math.min(drag.dx / (w * 0.7), 1));
          }
          applyPeel(drag.sheet, p);
          drag.p = p;
        });
      }
    });

    function endDrag() {
      if (!drag) return;
      var d = drag;
      drag = null;
      if (!d.active || !d.sheet) return;

      busy = true;
      var target = d.target;
      var p = (d.p !== null) ? d.p : (d.dir > 0 ? 0 : 1);
      var flick = (d.dir > 0 && d.vx < -0.45) || (d.dir < 0 && d.vx > 0.45);
      // basta passar de um terço da folha: o papel completa o resto sozinho
      var complete = p > 0.33 || flick;

      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 320);

      if (d.dir > 0) {
        animatePeel(d.sheet, p, complete ? 1 : 0, function () {
          settle(complete ? target : current, complete ? d.dir : 0);
        });
      } else {
        animatePeel(d.sheet, p, complete ? 0 : 1, function () {
          settle(complete ? target : current, complete ? d.dir : 0);
        });
      }
    }

    book.addEventListener("pointerup", endDrag);
    book.addEventListener("pointercancel", endDrag);

    // A dobra em repouso depende do tamanho do livreto
    window.addEventListener("resize", function () { if (!busy) restPeel(); });
  }

  document.addEventListener("click", function (e) {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* --------------------------------------------------------------------------
     3.3) AÇÕES DOS BOTÕES (delegação por data-action)
  -------------------------------------------------------------------------- */
  function setupActions() {
    document.body.addEventListener("click", function (e) {
      var el = e.target.closest("[data-action]");
      if (!el) return;
      switch (el.dataset.action) {
        case "next": turn(1); break;
        case "prev": turn(-1); break;
        case "goto": goToSheet(el.dataset.target); break;
        case "link": openExternal((CONFIG.links || {})[el.dataset.link]); break;
        case "countdown": abrirFicha(document.getElementById("countdown-card")); break;
        case "card-close": fecharFicha(); break;
        case "instagram":
          openExternal(CONFIG.social && CONFIG.social.instagram);
          break;
      }
    });

    // Botão de Instagram é opcional: sem configuração, não aparece
    var ig = document.getElementById("btn-instagram");
    if (ig && !(CONFIG.social && CONFIG.social.instagram)) ig.remove();

    // Teclado (desktop): setas viram as folhas
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && fichaAberta) { fecharFicha(); return; }
      if (fichaAberta) return;
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    });
  }

  /* --------------------------------------------------------------------------
     3.4) FICHAS — o cartão que pousa sobre a folha
     Serve tanto para a contagem regressiva quanto para a reserva do presente.
  -------------------------------------------------------------------------- */
  var fichaAberta = null;

  function abrirFicha(el) {
    if (!el) return;
    fichaAberta = el;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    if (el.id === "countdown-card") atualizarContagem();
  }

  function fecharFicha() {
    if (!fichaAberta) return;
    fichaAberta.classList.remove("is-open");
    fichaAberta.setAttribute("aria-hidden", "true");
    fichaAberta = null;
  }

  /* Fecha ao tocar fora do cartão */
  function setupFichas() {
    document.querySelectorAll(".card-overlay").forEach(function (ov) {
      ov.addEventListener("click", function (e) {
        if (e.target === ov) fecharFicha();
      });
    });
  }

  /* --------------------------------------------------------------------------
     3.5) CONTAGEM REGRESSIVA
     Lê CONFIG.event.datetime e atualiza de minuto em minuto enquanto a
     ficha estiver aberta.
  -------------------------------------------------------------------------- */
  function atualizarContagem() {
    var alvo = new Date((CONFIG.event && CONFIG.event.datetime) || "");
    var linha = document.getElementById("count-row");
    if (!linha || isNaN(alvo.getTime())) return;

    var falta = alvo.getTime() - Date.now();
    var passou = falta <= 0;
    if (passou) falta = 0;

    var minutosTotais = Math.floor(falta / 60000);
    var dias = Math.floor(minutosTotais / 1440);
    var horas = Math.floor((minutosTotais % 1440) / 60);
    var minutos = minutosTotais % 60;

    var valores = { dias: dias, horas: horas, minutos: minutos };
    linha.querySelectorAll("[data-count]").forEach(function (el) {
      var v = valores[el.getAttribute("data-count")];
      el.textContent = (v < 10 ? "0" : "") + v;
    });

    var titulo = document.getElementById("countdown-title");
    if (titulo) titulo.textContent = passou ? "Chegou o grande dia" : "Faltam";
  }

  setInterval(function () {
    if (fichaAberta && fichaAberta.id === "countdown-card") atualizarContagem();
  }, 30000);

  /* --------------------------------------------------------------------------
     4) INTRO — linha do tempo da abertura do envelope (~3,5s)
        O visitante já clicou em "Clique para abrir" no PDF; portanto a
        animação começa sozinha ~500ms após o carregamento.
  -------------------------------------------------------------------------- */
  function runIntro() {
    var intro = document.getElementById("intro");

    if (REDUCED) { finishIntro(true); return; }

    /* Cada etapa entra numa marca de tempo; o CSS cuida do movimento.
       Os 600ms iniciais são de propósito: só a respiração do convite. */
    /* A cascata é encadeada: cada peça começa a cair enquanto a anterior
       ainda está caindo, sem pausas entre as etapas. Os atrasos finos
       entre fita, laço e flores ficam no próprio CSS — são curtos, para as
       três caírem quase juntas sem parecerem sincronizadas. */
    var timeline = [
      [600,  function () { intro.classList.add("p-crack"); }],   // 1: lacre trinca
      [940,  function () { intro.classList.add("p-split"); }],   // 1: parte, levanta e cai
      [1250, function () { intro.classList.add("p-untie"); }],   // 2 e 3: fita, laço, flores
      [2350, function () { intro.classList.add("p-open"); }],    // 4 e 5: papel abre do meio
      [3950, function () { intro.classList.add("p-reveal"); }],  // 6: foto ganha cor plena
      [4600, function () { intro.classList.add("p-done"); }],    // a cena se apaga
      [5050, function () { finishIntro(false); }]                // 7: a folha assume e o
                                                                 //    zoom começa junto
    ];

    timeline.forEach(function (step) { setTimeout(step[1], step[0]); });
  }

  function finishIntro(skipped) {
    var intro = document.getElementById("intro");
    if (intro) intro.remove();
    document.body.classList.add("reveal");
    navLocked = false;

    // ETAPA 7: ~700ms depois de a fotografia estar inteira, vêm as frases
    setTimeout(function () {
      document.body.classList.add("phrase");
    }, skipped ? 150 : 700);
  }

  /* --------------------------------------------------------------------------
     INICIALIZAÇÃO
  -------------------------------------------------------------------------- */
  function init() {
    fillTexts();
    renderGifts();
    buildSheetChrome();
    setupGestures();
    setupActions();
    setupFichas();

    // Restaura folha e caminho de volta (ex.: recarregou depois de um link)
    var saved = 0;
    try {
      var raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (raw && typeof raw.i === "number") {
        saved = raw.i;
        if (Array.isArray(raw.h)) history = raw.h.slice();
      }
    } catch (e) { saved = 0; history = []; }
    saved = Math.min(Math.max(saved, 0), SHEETS.length - 1);

    if (saved > 0) {
      // Já viu a abertura nesta visita: vai direto para onde estava
      settle(saved, 0);
      finishIntro(true);
    } else {
      history = [];
      settle(0, 0);
      runIntro();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
