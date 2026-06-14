import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { AuthPayload } from '../middleware/auth';

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: { id: string; username: string; fullName: string | null; role: string };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { username: input.username } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new Error('Invalid credentials');
  }

  const payload: AuthPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

  return {
    token,
    user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
  };
}
