// Simple in-memory rate limiter.
// On Vercel serverless each cold start gets a fresh store, so this gives
// best-effort protection per function instance. For strict production limits,
// replace the store with Upstash Redis (@upstash/ratelimit).

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  ip: string,
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now()
  const storeKey = `${key}:${ip}`
  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false }
  }

  entry.count++
  return { allowed: true }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}
