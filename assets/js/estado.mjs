export const errosPorLetra = {};

export function registrarErro(letra) {
  errosPorLetra[letra] = (errosPorLetra[letra] || 0) + 1;
}

export function resetarEstado() {
  Object.keys(errosPorLetra).forEach((k) => delete errosPorLetra[k]);
}

export function getTopErros(n = 5) {
  return Object.entries(errosPorLetra)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
}
