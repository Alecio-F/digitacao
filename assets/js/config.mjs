export function config() {
  renderDojoHeader();
  setupConfigDrawer();
  setupPracticeTime();
  setupHeaderScroll();
  applySavedTheme();
  setupThemeToggle();
  setupConfigKeyboard();

  $("body").css("display", "block");
}

function setupPracticeTime() {
  const tempoPraticaSalvo = localStorage.getItem("tempoPratica") || "1";
  $("#tempoPratica").val(tempoPraticaSalvo);
  updateVisibleTimer(tempoPraticaSalvo);

  $("#tempoPratica").on("change", function() {
    const value = $(this).val();
    localStorage.setItem("tempoPratica", value);
    updateVisibleTimer(value);
  });
}

function updateVisibleTimer(value) {
  const segundos = Math.round(parseFloat(value || "1") * 60);
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const texto = `${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
  $("#tempoS").text(texto);
  $("[data-live-time]").text(texto);
  $(".tempo-desempenho .numeros").text(texto);
}

function renderDojoHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  const isPage = location.pathname.includes("/page/");
  const root = isPage ? "../" : "./";
  const pageRoot = isPage ? "" : "page/";
  const currentFile = location.pathname.split("/").pop() || "index.html";
  const player = getPlayerProgress();

  const navItems = [
    { file: "index.html", label: "Início", href: isPage ? "../index.html" : "index.html" },
    { file: "digitando.html", label: "Arena", href: `${pageRoot}digitando.html` },
    { file: "aprenda.html", label: "Aprenda", href: `${pageRoot}aprenda.html` },
    { file: "pratique.html", label: "Mapa", href: `${pageRoot}pratique.html` },
    { file: "game.html", label: "Arcade", href: `${pageRoot}game.html` },
    { file: "progresso", label: "Ranking", href: isPage ? "../index.html#progresso" : "#progresso" },
  ];

  const mobileItems = [
    { file: "index.html", label: "Início", icon: "home", href: isPage ? "../index.html" : "index.html" },
    { file: "digitando.html", label: "Arena", icon: "keyboard", href: `${pageRoot}digitando.html` },
    { file: "pratique.html", label: "Mapa", icon: "map", href: `${pageRoot}pratique.html` },
    { file: "game.html", label: "Arcade", icon: "stadia_controller", href: `${pageRoot}game.html` },
    { file: "entrarCriarConta.html", label: "Conta", icon: "person", href: `${pageRoot}entrarCriarConta.html` },
  ];

  const nav = navItems
    .map((item) => {
      const active = currentFile === item.file || (item.file === "index.html" && currentFile === "");
      return `<li><a href="${item.href}" class="dojo-nav-key ${active ? "dojo-nav-key-active selecionado" : ""}" aria-current="${active ? "page" : "false"}">${item.label}</a></li>`;
    })
    .join("");

  const mobileNav = mobileItems
    .map((item) => {
      const active = currentFile === item.file || (item.file === "index.html" && currentFile === "");
      return `
        <a href="${item.href}" class="dojo-mobile-nav-item ${active ? "dojo-mobile-nav-active" : ""}" aria-current="${active ? "page" : "false"}">
          <span class="material-symbols-outlined" aria-hidden="true">${item.icon}</span>
          <strong>${item.label}</strong>
        </a>`;
    })
    .join("");

  header.className = "dojo-header";
  header.innerHTML = `
    <div class="center dojo-header-inner">
      <a class="dojo-brand" href="${isPage ? "../index.html" : "index.html"}" aria-label="PandaDigitações, página inicial">
        <span class="dojo-brand-mark">
          <img src="${root}img/PandaDigitacoes-logo.png" alt="PandaDigitações" width="50" height="60">
        </span>
        <span class="dojo-brand-text">PandaDigitações<small>DOJO ARCADE</small></span>
      </a>

      <nav class="menu dojo-nav" aria-label="Navegação principal">
        <ul>${nav}</ul>
      </nav>

      <div class="dojo-header-actions">
        <div class="dojo-player-status" aria-label="Status do jogador">
          <span>${player.levelLabel}</span>
          <strong>${player.xp} XP</strong>
          <div class="dojo-xp-bar" aria-hidden="true"><i class="dojo-xp-fill" style="width: ${player.xpPercent}%"></i></div>
        </div>
        <a class="dojo-button primary dojo-cta" href="${pageRoot}digitando.html">Começar treino</a>
        <a class="dojo-login-link ${currentFile === "entrarCriarConta.html" ? "selecionado" : ""}" href="${pageRoot}entrarCriarConta.html">Entrar</a>

        <div class="contaeConfig">
          <div>
            <input type="checkbox" id="inputConfig" class="dojo-config-checkbox">
            <label for="inputConfig" class="dojo-icon-button dojo-settings-button" aria-label="Abrir configurações">
              <span class="material-symbols-outlined" id="config" aria-hidden="true">settings</span>
            </label>

            <div class="dojo-drawer-backdrop" data-dojo-close></div>
            <aside class="menu-engrenagem dojo-drawer dojo-settings-drawer" aria-label="Configurações do Dojo">
              <div class="dojo-drawer-header">
                <div>
                  <span class="dojo-kicker">Configurações</span>
                  <h2>Preferências do treino</h2>
                </div>
                <button class="dojo-icon-button" type="button" data-dojo-close aria-label="Fechar configurações">
                  <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>

              <div class="menuConfig dojo-drawer-content">
                <section class="dojo-setting-row dojo-settings-option">
                  <div>
                    <strong>Tema claro/escuro</strong>
                    <span>Alterna a aparência do Dojo.</span>
                  </div>
                  <div id="btn" class="dojo-theme-toggle" role="button" tabindex="0" aria-label="Alternar tema claro e escuro">
                    <span class="material-symbols-outlined" aria-hidden="true">dark_mode</span>
                    <span class="material-symbols-outlined" aria-hidden="true">light_mode</span>
                  </div>
                </section>

                <section class="dojo-setting-row dojo-settings-option stacked">
                  <label for="tempoPratica">
                    <strong>Tempo de prática</strong>
                    <span>Duração padrão da Type Arena.</span>
                  </label>
                  <select id="tempoPratica">
                    <option value="0.25">15 seg</option>
                    <option value="0.50">30 seg</option>
                    <option value="1">1 min</option>
                    <option value="2">2 min</option>
                    <option value="3">3 min</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                  </select>
                </section>

                <section class="dojo-setting-row dojo-settings-option">
                  <div>
                    <strong>Sons do jogo</strong>
                    <span>Preparado para os minigames.</span>
                  </div>
                  <input class="dojo-switch" type="checkbox" aria-label="Ativar sons do jogo" checked>
                </section>

                <section class="dojo-setting-row dojo-settings-option">
                  <div>
                    <strong>Animações</strong>
                    <span>Transições leves da interface.</span>
                  </div>
                  <input class="dojo-switch" type="checkbox" aria-label="Ativar animações" checked>
                </section>

                <section class="dojo-setting-row dojo-settings-option">
                  <div>
                    <strong>Reduzir efeitos visuais</strong>
                    <span>Use junto da preferência do sistema.</span>
                  </div>
                  <input class="dojo-switch" type="checkbox" aria-label="Reduzir efeitos visuais">
                </section>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
    <nav class="dojo-mobile-nav" aria-label="Navegação mobile">${mobileNav}</nav>`;
}

function getPlayerProgress() {
  const xp = Math.max(0, Number(localStorage.getItem("pandaXp") || 0));
  const storedLevel = Number(localStorage.getItem("pandaLevel"));
  const level = storedLevel > 0 ? storedLevel : Math.max(1, Math.floor(xp / 220) + 1);
  const xpPercent = Math.min(100, Math.round(((xp % 220) / 220) * 100));

  return {
    xp,
    level,
    levelLabel: `Nível ${level}`,
    xpPercent,
  };
}

function setupHeaderScroll() {
  const header = document.querySelector(".dojo-header");
  if (!header) return;

  const update = () => {
    header.classList.toggle("dojo-header-scrolled", window.scrollY > 18);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupConfigDrawer() {
  const checkbox = $("#inputConfig");

  checkbox.on("change", function() {
    const aberto = $(this).is(":checked");
    $(".menu-engrenagem").toggleClass("show", aberto).toggleClass("hide", !aberto);
    $("body").toggleClass("dojo-drawer-open", aberto);
  });

  $("[data-dojo-close]").on("click", closeDrawer);
}

function setupConfigKeyboard() {
  $("#btn").attr({ role: "button", tabindex: "0", "aria-label": "Alternar tema claro e escuro" });

  $("#btn").on("keydown", function(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      $(this).trigger("click");
    }
  });

  $(document).on("keydown", function(event) {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });
}

function closeDrawer() {
  $("#inputConfig").prop("checked", false).trigger("change");
}

function applySavedTheme() {
  var ativo = localStorage.getItem("ativo");
  if (ativo !== null) {
    $("#btn").addClass("ativo");
    $("body").addClass("darkTheme");
    $(".inputD").addClass("inputDDark");
    $(".testeDigita").addClass("testeDigitaDarktheme");
    $(".resumo").addClass("resumoDark");
    $(".pratique").addClass("pratiqueDark");
    $(".conPratique").addClass("conPratiqueDark");
    $(".aprendaS").addClass("aprendaSDark");
    $(".conta").addClass("contaDark");
    $(".game-page").addClass("game-page-dark");
  }
}

function setupThemeToggle() {
  $("#btn").on("click", function() {
    $(this).toggleClass("ativo");

    if ($(this).hasClass("ativo")) {
      localStorage.setItem("ativo", "true");
      $("body").addClass("darkTheme");
      $(".inputD").addClass("inputDDark");
      $(".testeDigita").addClass("testeDigitaDarktheme");
      $(".resumo").addClass("resumoDark");
      $(".pratique").addClass("pratiqueDark");
      $(".conPratique").addClass("conPratiqueDark");
      $(".aprendaS").addClass("aprendaSDark");
      $(".conta").addClass("contaDark");
      $(".game-page").addClass("game-page-dark");
    } else {
      localStorage.removeItem("ativo");
      $("body").removeClass("darkTheme");
      $(".inputD").removeClass("inputDDark");
      $(".testeDigita").removeClass("testeDigitaDarktheme");
      $(".resumo").removeClass("resumoDark");
      $(".pratique").removeClass("pratiqueDark");
      $(".conPratique").removeClass("conPratiqueDark");
      $(".aprendaS").removeClass("aprendaSDark");
      $(".conta").removeClass("contaDark");
      $(".game-page").removeClass("game-page-dark");
    }
  });
}
