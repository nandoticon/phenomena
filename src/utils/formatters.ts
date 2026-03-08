import { SessionResultado } from '../types';
import { outcomeOptions } from '../constants';

export function outcomeLabel(outcome: SessionResultado): string {
  return outcomeOptions.find((option) => option.value === outcome)?.label ?? 'Drafted Text';
}

export function getTimeBucket(timeOfDay: string): string {
  const hour = Number(timeOfDay.split(':')[0]);
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Night';
}
