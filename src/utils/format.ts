export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value)
}

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

export function formatDateTime(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

export function daysUntil(date: string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getDaysBadge(date: string): { text: string; color: string } {
  const days = daysUntil(date)
  if (days < 0) return { text: `逾期 ${Math.abs(days)} 天`, color: 'text-red-600 bg-red-50' }
  if (days === 0) return { text: '今天到期', color: 'text-orange-600 bg-orange-50' }
  if (days <= 7) return { text: `${days} 天后到期`, color: 'text-orange-600 bg-orange-50' }
  return { text: `${days} 天后到期`, color: 'text-blue-600 bg-blue-50' }
}
