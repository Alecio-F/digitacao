export function formatPercent(value: number): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0%';
  return `${Math.round(number)}%`;
}

export function formatDate(date: Date | string = new Date()): string {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('pt-BR');
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number(value) || 0));
}
