import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';

// Search for .env in this order:
// 1. Monorepo root (../../.. from this file in dev or prod)
// 2. Current working directory
// 3. apps/api-server local
const rootEnv = path.resolve(__dirname, '../../../.env');
const localEnv = path.resolve(process.cwd(), '.env');
const apiLocalEnv = path.resolve(__dirname, '../../.env');

dotenv.config({ path: rootEnv });
dotenv.config({ path: localEnv });
dotenv.config({ path: apiLocalEnv });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  console.error('\n💡 Tip: copy .env.example to .env in the project root:');
  console.error('   cp .env.example .env\n');
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
