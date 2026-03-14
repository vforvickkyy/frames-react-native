export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function isGif(url: string): boolean {
  return url.toLowerCase().endsWith('.gif')
}

export function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(url)
}

export function isImage(url: string): boolean {
  return !isGif(url) && !isVideo(url)
}

export function getMediaType(url: string): 'gif' | 'video' | 'image' {
  if (isGif(url)) return 'gif'
  if (isVideo(url)) return 'video'
  return 'image'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fileSizeInMB(bytes: number): number {
  return bytes / (1024 * 1024)
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-')
}
