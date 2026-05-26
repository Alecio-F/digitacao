export const LEVEL_TITLES: Record<number, string> = {
  1: 'Filhote de Panda',
  5: 'Aprendiz do Dojo',
  10: 'Panda Ágil',
  20: 'Mestre das Teclas',
  30: 'Guardião do Teclado',
  50: 'Lenda do Dojo',
} as const;

export function getTitleForLevel(level: number): string {
  const milestones = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  const milestone = milestones.find((m) => level >= m);
  return milestone ? LEVEL_TITLES[milestone] : LEVEL_TITLES[1];
}
