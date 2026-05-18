import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDueDate(timestamp: number): string {
  const date = new Date(timestamp)

  if (isToday(date)) {
    return `今天 ${format(date, 'HH:mm')}`
  }

  if (isTomorrow(date)) {
    return `明天 ${format(date, 'HH:mm')}`
  }

  return format(date, 'MM/dd HH:mm', { locale: zhCN })
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(timestamp, { addSuffix: true, locale: zhCN })
}

export function isOverdue(timestamp: number): boolean {
  return isPast(new Date(timestamp))
}

export function getOverdueText(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `逾期 ${days} 天`
  }
  if (hours > 0) {
    return `逾期 ${hours} 小时`
  }
  return '逾期'
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatCreationTime(timestamp: number): string {
  const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60)
  if (diffHours > 24) {
    return format(new Date(timestamp), 'MM/dd HH:mm', { locale: zhCN })
  }
  return formatDistanceToNow(timestamp, { addSuffix: true, locale: zhCN })
}