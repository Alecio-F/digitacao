import { Badge } from '@/components/ui';
import type { LessonMedal, LessonStatus } from '@/features/lessons/types';

const STATUS_LABEL: Record<LessonStatus, string> = {
  locked: 'Bloqueada',
  unlocked: 'Disponível',
  current: 'Atual',
  recommended: 'Recomendada',
  completed: 'Concluída',
};

const STATUS_VARIANT: Record<LessonStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'special'> = {
  locked: 'danger',
  unlocked: 'info',
  current: 'special',
  recommended: 'warning',
  completed: 'success',
};

const MEDAL_LABEL: Record<LessonMedal, string> = {
  none: '',
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
};

interface Props {
  status: LessonStatus;
  medal: LessonMedal;
}

export function LessonStatusBadge({ status, medal }: Props) {
  return (
    <>
      <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      {medal !== 'none' && <Badge variant="warning">{MEDAL_LABEL[medal]}</Badge>}
    </>
  );
}
