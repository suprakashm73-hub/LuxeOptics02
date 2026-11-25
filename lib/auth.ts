import 'server-only';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE = 'lx_session';
const isProd = process.env.NODE_ENV === 'production';

export type Session = { role: 'customer'; mobile: string } | { role: 'admin' };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters.');
  return new TextEncoder().encode(s);
}

// ---------- passwords ----------

const scryptAsync = (pw: string, salt: string) =>
  new Promise<Buffer>((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k))));

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: (await scryptAsync(password, salt)).toString('hex') };
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  const a = await scryptAsync(password, salt);
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminPasswordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(input), h(expected));
}

// ---------- sessions ----------

export async function startSession(session: Session) {
  const ttl = session.role === 'admin' ? 60 * 60 * 12 : 60 * 60 * 24 * 14;
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: ttl });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    if (payload.role === 'admin') return { role: 'admin' };
    if (payload.role === 'customer' && typeof payload.mobile === 'string') return { role: 'customer', mobile: payload.mobile };
  } catch {
    /* expired or tampered */
  }
  return null;
}

export async function requireCustomer(next = '/account') {
  const s = await getSession();
  if (s?.role !== 'customer') redirect(`/account?next=${encodeURIComponent(next)}`);
  return s;
}

export async function requireAdmin() {
  const s = await getSession();
  if (s?.role !== 'admin') redirect('/admin/login');
}

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback = '/account') {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : fallback;
}

// ---------- login throttling (best effort, per server instance) ----------

const failures = new Map<string, { n: number; reset: number }>();

/** Counts only FAILED attempts per client IP; call fail() on a bad credential and ok() on success. */
export async function throttle(bucket: string, max = 8, windowMs = 15 * 60_000) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  if (failures.size > 5000) for (const [k, v] of failures) if (v.reset < now) failures.delete(k);
  const cur = failures.get(key);
  const live = cur && cur.reset > now ? cur : undefined;
  return {
    blocked: !!live && live.n >= max,
    fail() {
      if (live) live.n++;
      else failures.set(key, { n: 1, reset: now + windowMs });
    },
    ok() {
      failures.delete(key);
    },
  };
}
