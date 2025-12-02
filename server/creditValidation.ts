import crypto from 'crypto';

// In production, use a proper secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'thumbgen-secret-key-change-in-production';

export interface UserSession {
  userId: string;
  credits: number;
  plan: 'free' | 'creator' | 'agency';
  totalGenerations: number;
  createdAt: number;
  expiresAt: number;
}

export interface CreditOperation {
  type: 'thumbnail_standard' | 'thumbnail_high' | 'thumbnail_ultra' | 'video' | 'audit' | 'metadata';
  cost: number;
}

export const CREDIT_COSTS: Record<CreditOperation['type'], number> = {
  thumbnail_standard: 10,
  thumbnail_high: 15,
  thumbnail_ultra: 25,
  video: 50,
  audit: 5,
  metadata: 5,
};

// Simple in-memory store (replace with Redis/database in production)
const sessions = new Map<string, UserSession>();

/**
 * Generate a simple JWT-like token
 */
export function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

    // Check expiration
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    return payload as UserSession;
  } catch {
    return null;
  }
}

/**
 * Create a new user session
 */
export function createSession(initialCredits: number = 10): { token: string; session: UserSession } {
  const session: UserSession = {
    userId: crypto.randomUUID(),
    credits: initialCredits,
    plan: 'free',
    totalGenerations: 0,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  sessions.set(session.userId, session);
  const token = generateToken(session);

  return { token, session };
}

/**
 * Get session from token
 */
export function getSession(token: string): UserSession | null {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Check in-memory store for latest state
  const stored = sessions.get(decoded.userId);
  return stored || decoded;
}

/**
 * Update session credits
 */
export function updateSessionCredits(userId: string, newCredits: number): boolean {
  const session = sessions.get(userId);
  if (!session) return false;

  session.credits = newCredits;
  sessions.set(userId, session);
  return true;
}

/**
 * Deduct credits from a session
 */
export function deductCredits(
  userId: string,
  operation: CreditOperation['type']
): { success: boolean; remainingCredits: number; error?: string } {
  const session = sessions.get(userId);

  if (!session) {
    return { success: false, remainingCredits: 0, error: 'Session not found' };
  }

  const cost = CREDIT_COSTS[operation];

  if (session.credits < cost) {
    return {
      success: false,
      remainingCredits: session.credits,
      error: `Insufficient credits. Required: ${cost}, Available: ${session.credits}`
    };
  }

  session.credits -= cost;
  session.totalGenerations += 1;
  sessions.set(userId, session);

  return { success: true, remainingCredits: session.credits };
}

/**
 * Refund credits to a session (for failed operations)
 */
export function refundCredits(userId: string, operation: CreditOperation['type']): boolean {
  const session = sessions.get(userId);
  if (!session) return false;

  const cost = CREDIT_COSTS[operation];
  session.credits += cost;
  session.totalGenerations = Math.max(0, session.totalGenerations - 1);
  sessions.set(userId, session);

  return true;
}

/**
 * Add credits to a session (for purchases)
 */
export function addCredits(userId: string, amount: number, newPlan?: UserSession['plan']): boolean {
  const session = sessions.get(userId);
  if (!session) return false;

  session.credits += amount;
  if (newPlan) {
    session.plan = newPlan;
  }
  sessions.set(userId, session);

  return true;
}

/**
 * Validate that a request has sufficient credits
 */
export function validateCredits(
  token: string,
  operation: CreditOperation['type']
): { valid: boolean; session?: UserSession; error?: string } {
  const session = getSession(token);

  if (!session) {
    return { valid: false, error: 'Invalid or expired session' };
  }

  const cost = CREDIT_COSTS[operation];

  if (session.credits < cost) {
    return {
      valid: false,
      session,
      error: `Insufficient credits. Required: ${cost}, Available: ${session.credits}`
    };
  }

  return { valid: true, session };
}

export default {
  generateToken,
  verifyToken,
  createSession,
  getSession,
  updateSessionCredits,
  deductCredits,
  refundCredits,
  addCredits,
  validateCredits,
  CREDIT_COSTS,
};
