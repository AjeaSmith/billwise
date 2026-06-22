import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? 'th'}`
}

export function daysUntil(dueDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dueDate.split('-').map(Number) as [number, number, number]
  const due = new Date(y, m - 1, d)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

