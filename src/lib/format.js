/**
 * Format a number as Nigerian Naira
 * @param {number} amount
 * @param {boolean} compact - use 1.2M style for large numbers
 */
export function formatNGN(amount, compact = false) {
  if (compact && amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`
  }
  if (compact && amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`
  }
  return `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

/**
 * Return relative time string (e.g. "3 days ago")
 */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (hours < 1)  return `${mins}m ago`
  if (days  < 1)  return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return formatDate(dateStr)
}
