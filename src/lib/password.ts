/**
 * Password utility functions
 * For frontend password hashing/verification using bcryptjs
 * 
 * Install: npm install bcryptjs
 */

import * as bcrypt from "bcryptjs";

/**
 * Hash a password using bcryptjs
 * This is a synchronous operation (suitable for frontend)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a simple hash for verification (alternative if bcryptjs is not available)
 * NOT recommended for production - use bcryptjs instead
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
