let mascotElement = null;
let idleTween = null;

export function initPandaMascot() {
  mascotElement = document.querySelector(".panda-mascot") || document.querySelector(".dojo-mentor img") || document.querySelector(".panda img");
  if (!mascotElement) return null;

  mascotElement.classList.add("panda-mascot");
  playMascotState("idle");
  bindTypingEvents();

  return { playMascotState };
}

export function playMascotState(state) {
  if (!mascotElement) return;

  const gsap = window.gsap;
  mascotElement.classList.remove("is-success", "is-error");

  if (state === "idle") {
    if (gsap) {
      idleTween?.kill();
      idleTween = gsap.to(mascotElement, {
        y: -8,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
    return;
  }

  if (state === "success" || state === "record") {
    mascotElement.classList.add("is-success");
    if (gsap) {
      gsap.fromTo(mascotElement, { scale: 1 }, { scale: state === "record" ? 1.06 : 1.03, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
    }
  }

  if (state === "error") {
    mascotElement.classList.add("is-error");
  }
}

function bindTypingEvents() {
  document.addEventListener("dojo:typing-success", () => playMascotState("success"));
  document.addEventListener("dojo:typing-error", () => playMascotState("error"));
  document.addEventListener("dojo:record", () => playMascotState("record"));
}
