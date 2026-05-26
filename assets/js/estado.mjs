export const errosPorLetra = {};
let maxCombo = 0;

export function registrarErro(letra) {
  errosPorLetra[letra] = (errosPorLetra[letra] || 0) + 1;
}

export function atualizarMaxCombo(combo) {
  if (combo > maxCombo) maxCombo = combo;
}

export function getMaxCombo() {
  return maxCombo;
}

export function resetarEstado() {
  Object.keys(errosPorLetra).forEach((k) => delete errosPorLetra[k]);
  maxCombo = 0;
}

export function getTopErros(n = 5) {
  return Object.entries(errosPorLetra)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
}
