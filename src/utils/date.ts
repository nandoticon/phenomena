export function getTodayKey(): string {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

export function getTimeKey(): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function getDayDiff(from: string, to: string): number {
  return Math.floor((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86400000);
}

export function formatCloudTimestamp(timestamp: string | null): string {
  if (!timestamp) {
    return 'Never';
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}
