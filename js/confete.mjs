const CORES = ["#087ca7", "#0b3954", "#bfd7ea", "#f0c040", "#ff6060", "#48d068", "#c97bea"];

export function dispararConfetes() {
  for (let i = 0; i < 120; i++) {
    const el = document.createElement("div");
    el.className = "confete";

    const delay = Math.random() * 0.6;
    const duracao = 1.4 + Math.random() * 1.4;
    const tamanho = 5 + Math.random() * 8;

    el.style.cssText = `
      left: ${Math.random() * 100}%;
      background-color: ${CORES[Math.floor(Math.random() * CORES.length)]};
      animation-delay: ${delay}s;
      animation-duration: ${duracao}s;
      width: ${tamanho}px;
      height: ${tamanho}px;
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), (delay + duracao) * 1000 + 100);
  }
}
