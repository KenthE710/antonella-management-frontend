import { format, formatDistanceToNow } from 'date-fns';

export function relativeDateToNowFromString(date: string, locale?: any): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
}

export function formatDateFromString(date: string): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
}

export function formatJustDateFromString(date: string): string {
  return format(new Date(date), 'dd/MM/yyyy');
}
