let seed = 0xc0ffee

export function setSeed(n: number): void {
  seed = n >>> 0 || 1
}

export function resetPrng(): void {
  setSeed(0xc0ffee)
}

export function nextFloat(): number {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function nextInt(min: number, max: number): number {
  return Math.floor(nextFloat() * (max - min + 1)) + min
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(nextFloat() * items.length)]
}

export function maybe(probability: number): boolean {
  return nextFloat() < probability
}

export function pad(value: number, size: number): string {
  return String(value).padStart(size, '0')
}

export function pastDateISO(daysBack: number): string {
  const now = Date.now()
  const offset = nextInt(0, daysBack) * 24 * 60 * 60 * 1000
  return new Date(now - offset).toISOString()
}

export function futureDateISO(daysForward: number): string {
  const now = Date.now()
  const offset = nextInt(1, daysForward) * 24 * 60 * 60 * 1000
  return new Date(now + offset).toISOString()
}

export function uid(prefix = ''): string {
  const rnd = Math.floor(nextFloat() * 1e9).toString(36)
  return `${prefix}${rnd}${Date.now().toString(36).slice(-4)}`
}
