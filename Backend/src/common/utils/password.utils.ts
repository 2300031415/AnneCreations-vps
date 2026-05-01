import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

function sha1(str: string): string {
  return createHash('sha1').update(str).digest('hex');
}

export function hashOpenCartPassword(password: string, salt: string): string {
  const first = sha1(password);
  const second = sha1(salt + first);
  const third = sha1(salt + second);
  return third;
}

export async function hashPassword(
  password: string,
  salt?: string
): Promise<{ hashedPassword: string; salt: string }> {
  if (salt) {
    const hashedPassword = hashOpenCartPassword(password, salt);
    return { hashedPassword, salt };
  } else {
    const newSalt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, newSalt);
    return { hashedPassword, salt: newSalt };
  }
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
  salt?: string
): Promise<boolean> {
  if (salt && salt.length < 20) {
    const newHashedPassword = hashOpenCartPassword(password, salt);
    return newHashedPassword === hashedPassword;
  } else {
    return await bcrypt.compare(password, hashedPassword);
  }
}

export async function hashAdminPassword(
  password: string
): Promise<{ hashedPassword: string; salt: string }> {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { hashedPassword, salt };
}

export async function compareAdminPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
