import type { RequestStatus } from '@/lib/types';

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function differenceInDays(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  const rawDifference = toDate.getTime() - fromDate.getTime();

  return Math.ceil(rawDifference / 86_400_000);
}

export function daysUntil(value: string) {
  return differenceInDays(new Date().toISOString(), value);
}

export function relativeSlaText(value: string) {
  const remainingDays = daysUntil(value);

  if (remainingDays < 0) {
    return `${Math.abs(remainingDays)}d em atraso`;
  }

  if (remainingDays === 0) {
    return 'vence hoje';
  }

  if (remainingDays === 1) {
    return '1d restante';
  }

  return `${remainingDays}d restantes`;
}

export function isOpenRequest(status: RequestStatus) {
  return status !== 'Concluida';
}

export function isCriticalDeadline(value: string) {
  return daysUntil(value) <= 2;
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((chunk) => chunk[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
