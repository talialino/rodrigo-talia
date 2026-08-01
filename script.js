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

    // Mensagem: usa a do presente ou monta uma padrão com o nome.
    var message = (gift.reservationMessage && gift.reservationMessage.trim())
      ? gift.reservationMessage.trim()
      : 'Olá Rodrigo e Talia! Gostaria de reservar o presente "' + gift.name + '" da lista de casamento. ❤️';

    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  }

  function renderGifts() {
    var grid = document.getElementById("gift-grid");
    if (!grid || !Array.isArray(CONFIG.physicalGifts)) return;

    CONFIG.physicalGifts.forEach(function (gift) {
      var card = document.createElement("article");
      card.className = "gift-card";

      // Foto do item (com reserva elegante caso o link falte ou falhe)
      var media = document.createElement("div");
      media.className = "gift-card__media";
      if (gift.image && gift.image.trim()) {
        var img = document.createElement("img");
        img.className = "gift-card__img";
        img.loading = "lazy";
        img.alt = gift.name;
        img.src = gift.image.trim();
        img.addEventListener("error", function () { img.remove(); });
        media.appendChild(img);
      }

      var name = document.createElement("h3");
      name.className = "gift-card__name";
      name.textContent = gift.name;

      var btn = document.createElement("button");
      btn.className = "btn btn--card";
      btn.type = "button";
      btn.textContent = "Reservar";
      btn.addEventListener("click", function () {
        var phone = (CONFIG.social && CONFIG.social.whatsapp && CONFIG.social.whatsapp.phone) || "";
        if (!phone.trim()) {
          alert("O número de WhatsApp ainda não foi configurado. 🙂");
          return;
        }
        window.open(buildWhatsAppLink(gift), "_blank", "noopener");
      });

      card.appendChild(media);
      card.appendChild(name);
      card.appendChild(btn);
      grid.appendChild(card);
    });
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
     CAMINHO DA SETA (avançar)
     A folha "presente" pula a lista física: quem só passa a página vai
     direto ao agradecimento. A lista física só é aberta por quem toca em
     "Levar um Presente Físico" — e de lá a seta segue para o agradecimento.

         capa → welcome → manual → presente ─┬─(seta)──────────→ final
                                             └─(botão)→ lista ─→ final
  -------------------------------------------------------------------------- */
  var FLOW_NEXT = {};
  (function buildFlow() {
    var capa     = indexOf("capa");
    var welcome  = indexOf("welcome");
    var manual   = indexOf("manual");
    var presente = indexOf("presente");
    var lista    = indexOf("lista");
    var final    = indexOf("final");

    FLOW_NEXT[capa]     = welcome;
    FLOW_NEXT[welcome]  = manual;
    FLOW_NEXT[manual]   = presente;
    FLOW_NEXT[presente] = final;   // a seta pula a lista
    FLOW_NEXT[lista]    = final;
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

  var TURN_MS = 720;
  var TURN_EASE = "cubic-bezier(0.62, 0.02, 0.34, 1)";
  var TURN_ANGLE = -105;     // ângulo final da folha que sai (graus)
  var SHADE_MAX = 0.55;      // opacidade máxima do sombreado na virada

  function rotY(deg) { return "rotateY(" + deg + "deg)"; }

  function shadeOf(sheet) { return sheet.querySelector(".sheet-shade"); }

  function setShade(sheet, angle) {
    var el = shadeOf(sheet);
    if (el) el.style.opacity = String(Math.min(Math.abs(angle) / 90, 1) * SHADE_MAX);
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
      s.style.transform = "";
      var sh = shadeOf(s);
      if (sh) sh.style.opacity = "0";
    });
    current = i;
    busy = false;
    syncCues();
    saveState();
  }

  /* Guarda folha atual + caminho de volta (sobrevive a recarregar a página) */
  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ i: current, h: history }));
    } catch (e) { /* modo privado */ }
  }

  /* Anima uma folha entre dois ângulos (Web Animations API). */
  function animateTurn(sheet, fromDeg, toDeg, done) {
    var duration = TURN_MS * (Math.abs(toDeg - fromDeg) / Math.abs(TURN_ANGLE));
    duration = Math.max(180, duration);

    var anim = sheet.animate(
      [{ transform: rotY(fromDeg) }, { transform: rotY(toDeg) }],
      { duration: duration, easing: TURN_EASE, fill: "forwards" }
    );

    // Sombreado acompanha o ângulo durante a animação
    var start = performance.now();
    var running = true;
    (function tick(now) {
      if (!running) return;
      var t = Math.min((now - start) / duration, 1);
      setShade(sheet, fromDeg + (toDeg - fromDeg) * t);
      if (t < 1) requestAnimationFrame(tick);
    })(start);

    anim.onfinish = function () {
      running = false;
      anim.cancel();       // remove o "fill" — settle() assume o estado final
      done();
    };
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
      // A folha atual gira para fora, revelando a próxima por baixo
      cur.style.zIndex = "3";
      tgt.style.zIndex = "2";
      animateTurn(cur, 0, TURN_ANGLE, function () { settle(target, dir); });
    } else {
      // A folha anterior retorna girando por cima da atual
      tgt.style.zIndex = "3";
      cur.style.zIndex = "2";
      tgt.style.transform = rotY(TURN_ANGLE);
      animateTurn(tgt, TURN_ANGLE, 0, function () { settle(target, dir); });
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

      // Seta de avançar: só onde o fluxo tem uma próxima folha
      if (FLOW_NEXT[i] !== undefined) {
        var next = document.createElement("button");
        next.className = "cue cue--next";
        next.type = "button";
        next.setAttribute("aria-label", "Próxima folha");
        next.addEventListener("click", function () { turn(1); });

        // Na folha da fotografia (primeira interação) a seta vai para a
        // base com uma instrução de como navegar. O CSS cuida da posição.
        if (sheet.classList.contains("sheet--photo")) {
          var label = document.createElement("span");
          label.className = "cue-label";
          label.textContent = "Deslize ou toque para continuar";
          next.appendChild(label);
        }

        sheet.appendChild(next);
      }

      // Seta de voltar: existe em todas menos a capa; syncCues decide se
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

  /* Mostra a seta de voltar apenas quando existe folha anterior no histórico. */
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
    var book = document.getElementById("book");
    var drag = null;

    book.addEventListener("pointerdown", function (e) {
      if (busy || navLocked || REDUCED) return;
      drag = {
        x0: e.clientX, y0: e.clientY,
        dx: 0, angle: null, active: false, dir: 0, sheet: null,
        lastX: e.clientX, lastT: performance.now(), vx: 0,
        raf: 0
      };
    });

    book.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      var dy = e.clientY - drag.y0;

      // Define a intenção: horizontal vira a folha, vertical deixa rolar
      if (!drag.active) {
        if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        var dir = dx < 0 ? 1 : -1;
        var target = targetFor(dir);
        if (target < 0) { drag = null; return; }

        drag.active = true;
        drag.dir = dir;
        drag.target = target;
        if (dir > 0) {
          drag.sheet = SHEETS[current];
          SHEETS[current].style.zIndex = "3";
          SHEETS[target].style.visibility = "visible";
          SHEETS[target].style.zIndex = "2";
        } else {
          drag.sheet = SHEETS[target];
          SHEETS[target].style.visibility = "visible";
          SHEETS[target].style.zIndex = "3";
        }
        try { book.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
      }

      // Velocidade (para completar a virada num "flick" rápido)
      var now = performance.now();
      drag.vx = (e.clientX - drag.lastX) / Math.max(now - drag.lastT, 1);
      drag.lastX = e.clientX;
      drag.lastT = now;
      drag.dx = dx;

      // Pré-visualização física via requestAnimationFrame (sem sobrecarga)
      if (!drag.raf) {
        drag.raf = requestAnimationFrame(function () {
          if (!drag || !drag.sheet) return;
          drag.raf = 0;
          var w = book.clientWidth;
          var angle;
          if (drag.dir > 0) {
            // avançar: 0 -> -95 conforme arrasta para a esquerda
            angle = Math.max(Math.min(drag.dx / w, 0) * 95, -95);
          } else {
            // voltar: -105 -> 0 conforme arrasta para a direita
            angle = TURN_ANGLE + Math.min(Math.max(drag.dx / w, 0) * 105, 105);
          }
          drag.sheet.style.transform = rotY(angle);
          setShade(drag.sheet, angle);
          drag.angle = angle;
        });
      }
    });

    function endDrag() {
      if (!drag) return;
      var d = drag;
      drag = null;
      if (!d.active || !d.sheet) return;

      busy = true;
      var w = book.clientWidth;
      var target = d.target;
      var arrastou = Math.abs(d.dx) > w * 0.24;
      var flick = (d.dir > 0 && d.vx < -0.45) || (d.dir < 0 && d.vx > 0.45);
      var complete = arrastou || flick;
      var from = (d.angle !== null) ? d.angle : (d.dir > 0 ? 0 : TURN_ANGLE);

      // Suprime o clique fantasma logo após o arrasto
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 320);

      if (d.dir > 0) {
        animateTurn(d.sheet, from, complete ? TURN_ANGLE : 0, function () {
          settle(complete ? target : current, complete ? d.dir : 0);
        });
      } else {
        animateTurn(d.sheet, from, complete ? 0 : TURN_ANGLE, function () {
          settle(complete ? target : current, complete ? d.dir : 0);
        });
      }
    }

    book.addEventListener("pointerup", endDrag);
    book.addEventListener("pointercancel", endDrag);
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
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    });
  }

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
    var timeline = [
      [600,  function () { intro.classList.add("p-crack"); }],   // 1: lacre trinca
      [980,  function () { intro.classList.add("p-split"); }],   // 1: parte, levanta e cai
      [1240, function () { intro.classList.add("p-untie"); }],   // 2 e 3: fita, laço, flores
      [2600, function () { intro.classList.add("p-open"); }],    // 4 e 5: papel abre do meio
      [3850, function () { intro.classList.add("p-reveal"); }],  // 6: foto ganha cor plena
      [4450, function () { intro.classList.add("p-done"); }],    // a cena se apaga
      [4900, function () { finishIntro(false); }]                // 7: a folha assume e o
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
