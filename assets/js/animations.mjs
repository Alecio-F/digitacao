import { initDojoBackground } from "./dojoBackground.mjs";
import { initPandaMascot } from "./pandaMascot.mjs";

let reducedMotion = false;
let gsapInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  window.setTimeout(initDojoAnimations, 40);
});

export function initDojoAnimations() {
  reducedMotion = initReducedMotionGuard();
  gsapInstance = window.gsap || null;

  if (gsapInstance && window.ScrollTrigger) {
    gsapInstance.registerPlugin(window.ScrollTrigger);
  }

  document.body.classList.add("dojo-page-ready");
  initVirtualKeyboard();
  markRevealElements();
  initDojoBackground(getBackgroundOptions());
  initPandaMascot();
  initHeaderAnimations();
  initRevealOnScroll();
  initCardInteractions();
  initButtonInteractions();
  initConfigDrawerAnimation();
  initTypingMicroInteractions();
  initAchievementLayer();
}

export function initReducedMotionGuard() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initHeaderAnimations() {
  const links = document.querySelectorAll(".menu a");
  links.forEach((link) => {
    link.classList.add("dojo-nav-link");
    if (link.classList.contains("selecionado")) link.classList.add("dojo-nav-active");
  });

  document.querySelectorAll(".dojo-button.primary").forEach((button) => button.classList.add("dojo-cta"));
  document.querySelectorAll("label[for='inputConfig']").forEach((button) => button.classList.add("dojo-settings-button"));

  if (!gsapInstance || reducedMotion) return;

  gsapInstance.from(".dojo-header", {
    y: -18,
    opacity: 0,
    duration: 0.42,
    ease: "power2.out",
  });
}

export function initRevealOnScroll() {
  const elements = document.querySelectorAll(".js-reveal");
  if (!elements.length) return;

  if (!gsapInstance || reducedMotion || !window.ScrollTrigger) {
    elements.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return;
  }

  elements.forEach((element) => {
    gsapInstance.fromTo(element,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.58,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
          once: true,
        },
      }
    );
  });

  document.querySelectorAll(".dojo-grid, .dojo-phase-grid, .dojo-map-trail, .dojo-challenge-grid, .dojo-learn-grid").forEach((grid) => {
    const cards = grid.querySelectorAll(".dojo-card, .dojo-stage, .dojo-stage-card, .dojo-panel");
    if (!cards.length) return;
    gsapInstance.fromTo(cards,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 84%",
          once: true,
        },
      }
    );
  });
}

export function initCardInteractions() {
  document.querySelectorAll(".dojo-card, .dojo-stage, .dojo-stage-card, .dojo-panel, .stage-option").forEach((card) => {
    card.classList.add("dojo-card-interactive");
    if (card.classList.contains("locked")) card.classList.add("dojo-locked");
    else card.classList.add("dojo-unlocked");

    card.addEventListener("pointerdown", () => {
      if (!gsapInstance || reducedMotion) return;
      gsapInstance.to(card, { scale: 0.985, duration: 0.08, ease: "power2.out" });
    });

    card.addEventListener("pointerup", () => {
      if (!gsapInstance || reducedMotion) return;
      gsapInstance.to(card, { scale: 1, duration: 0.16, ease: "power2.out" });
    });
  });
}

export function initButtonInteractions() {
  document.querySelectorAll(".dojo-button, .dojo-card-button, .game-button, .dojo-icon-button").forEach((button) => {
    button.addEventListener("pointerenter", () => {
      if (!gsapInstance || reducedMotion || button.disabled) return;
      gsapInstance.to(button, { y: -1, duration: 0.14, ease: "power2.out" });
    });
    button.addEventListener("pointerleave", () => {
      if (!gsapInstance || reducedMotion || button.disabled) return;
      gsapInstance.to(button, { y: 0, scale: 1, duration: 0.14, ease: "power2.out" });
    });
  });
}

export function initConfigDrawerAnimation() {
  const checkbox = document.getElementById("inputConfig");
  const drawer = document.querySelector(".dojo-drawer");
  if (!checkbox || !drawer) return;

  checkbox.addEventListener("change", () => {
    if (!gsapInstance || reducedMotion) return;
    const opening = checkbox.checked;
    if (opening) {
      gsapInstance.set(drawer, { x: "105%" });
    }
    gsapInstance.to(drawer, {
      x: opening ? "0%" : "105%",
      duration: 0.26,
      ease: opening ? "power2.out" : "power2.in",
    });
    if (opening) {
      gsapInstance.fromTo(drawer.querySelectorAll(".dojo-setting-row"),
        { autoAlpha: 0, x: 18 },
        { autoAlpha: 1, x: 0, duration: 0.28, stagger: 0.045, ease: "power2.out", delay: 0.08 }
      );
    }
  });
}

export function initTypingMicroInteractions() {
  if (!document.getElementById("digitandoTexto")) return;

  document.addEventListener("dojo:typing-success", (event) => {
    pulseCombo();
    animateKey(event.detail?.key, "dojo-key-correct");
  });

  document.addEventListener("dojo:typing-error", (event) => {
    animateKey(event.detail?.key, "dojo-key-error");
  });

  document.addEventListener("dojo:record", () => {
    showAchievementToast("Novo recorde do Dojo!", "Seu treino entrou para a galeria local.");
    fireConfetti();
  });
}

function initVirtualKeyboard() {
  if (!document.getElementById("digitandoTexto")) return;
  if (document.querySelector(".dojo-keyboard")) return;

  const target = document.querySelector(".conteinerDigita") || document.querySelector(".type-arena-card");
  if (!target) return;

  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
    ["z", "x", "c", "v", "b", "n", "m"],
    [" "],
  ];
  const rowNames = ["top", "home", "bottom", "space"];
  const homeKeys = new Set(["a", "s", "d", "f", "j", "k", "l", "ç", "Ã§"]);

  const keyboard = document.createElement("div");
  keyboard.className = "dojo-keyboard dojo-keyboard-compact js-reveal";
  keyboard.setAttribute("aria-label", "Teclado virtual");
  keyboard.innerHTML = `
    <div class="dojo-keyboard-top">
      <span>Dojo Key Deck</span>
      <span class="dojo-keyboard-lights" aria-hidden="true"><span></span><span></span><span></span></span>
    </div>
    ${rows.map((row, rowIndex) => `
      <div class="dojo-key-row dojo-key-row-${rowNames[rowIndex] || "extra"}">
        ${row.map((key) => {
          const isSpace = key === " ";
          const classes = ["dojo-key"];
          if (isSpace) classes.push("dojo-key-space");
          if (homeKeys.has(key)) classes.push("dojo-key-home");
          return `<span class="${classes.join(" ")}" data-dojo-key="${key}">${isSpace ? "ESPAÇO" : key.toUpperCase()}</span>`;
        }).join("")}
      </div>
    `).join("")}`;

  target.after(keyboard);

  document.addEventListener("keydown", (event) => {
    animateKey(normalizeKey(event.key), "dojo-key-active");
  });

  updateNextKey();
  window.setInterval(updateNextKey, 140);
}

function animateKey(key, className) {
  if (!key) return;
  const element = findKeyboardKey(key);
  if (!element) return;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), 180);
}

function updateNextKey() {
  const keyboard = document.querySelector(".dojo-keyboard");
  const palavras = document.getElementById("palavras");
  if (!keyboard || !palavras) return;

  keyboard.querySelectorAll(".dojo-key-next").forEach((key) => key.classList.remove("dojo-key-next"));

  const current = palavras.querySelector(".letra.atual");
  const key = normalizeExpectedKey(current?.textContent || "");
  findKeyboardKey(key)?.classList.add("dojo-key-next");
}

function findKeyboardKey(key) {
  const normalized = normalizeExpectedKey(key);
  if (!normalized) return null;

  const aliases = normalized === "ç" ? ["ç", "Ã§"] : normalized === "Ã§" ? ["Ã§", "ç"] : [normalized];
  for (const alias of aliases) {
    const element = document.querySelector(`[data-dojo-key="${cssEscape(alias)}"]`);
    if (element) return element;
  }

  return null;
}

function pulseCombo() {
  const combo = document.querySelector(".dojo-combo");
  if (!combo) return;
  combo.classList.add("is-active");
  window.setTimeout(() => combo.classList.remove("is-active"), 260);
}

function initAchievementLayer() {
  if (!document.querySelector(".dojo-achievement-toast")) {
    const toast = document.createElement("div");
    toast.className = "dojo-achievement-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
}

function showAchievementToast(title, message) {
  const toast = document.querySelector(".dojo-achievement-toast");
  if (!toast) return;
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
}

function fireConfetti() {
  if (reducedMotion) return;
  let layer = document.querySelector(".dojo-confetti-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "dojo-confetti-layer";
    document.body.appendChild(layer);
  }

  const colors = ["#00a8cc", "#7c5cff", "#d99a17", "#28a86b"];
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement("span");
    piece.className = "dojo-confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    layer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function markRevealElements() {
  const selectors = [
    ".dojo-hero > *",
    ".dojo-page-hero",
    ".dojo-map-hero",
    ".dojo-card",
    ".dojo-panel",
    ".dojo-stage",
    ".dojo-stage-card",
    ".game-shell",
    ".learn-card img",
  ];

  document.querySelectorAll(selectors.join(",")).forEach((element) => {
    if (!element.closest(".game-ui")) element.classList.add("js-reveal");
  });
}

function getBackgroundOptions() {
  if (document.getElementById("digitandoTexto")) return { density: 24 };
  if (document.querySelector(".game-page")) return { density: 34 };
  return { density: 44 };
}

function normalizeKey(key) {
  if (key === " ") return " ";
  if (key === "Spacebar") return " ";
  return String(key || "").toLowerCase();
}

function normalizeExpectedKey(value) {
  const raw = String(value || "");
  if (raw.charAt(0) === " ") return " ";
  const key = raw.trim().charAt(0).toLowerCase();
  if (!key) return "";
  return key;
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/"/g, '\\"');
}
