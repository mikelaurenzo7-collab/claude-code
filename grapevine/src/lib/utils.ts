import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-400'
  if (grade.startsWith('B')) return 'text-blue-400'
  if (grade.startsWith('C')) return 'text-yellow-400'
  if (grade.startsWith('D')) return 'text-orange-400'
  return 'text-red-400'
}

export function getSentimentColor(sentiment: string): string {
  if (sentiment === 'positive') return 'text-emerald-400'
  if (sentiment === 'negative') return 'text-red-400'
  return 'text-muted-foreground'
}

export function percentile(arr: number[], val: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = sorted.findIndex((v) => v >= val)
  if (idx === -1) return 100
  return Math.round((idx / sorted.length) * 100)
}

export function cagr(startVal: number, endVal: number, years: number): number {
  if (startVal <= 0 || years <= 0) return 0
  return Math.pow(endVal / startVal, 1 / years) - 1
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
