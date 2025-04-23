import { z } from "zod";

const appConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  HOST: z.string().nonempty().optional(),
  PORT: z.coerce.number().int().positive(),
  GEMINI_API_KEY: z.string().nonempty(),
  GEN_AI_SYSTEM_INSTRUCTIONS: z.string().nonempty(),
  SPOTIFY_CLIENT_ID: z.string().nonempty(),
  SPOTIFY_CLIENT_SECRET: z.string().nonempty(),
  SPOTIFY_REDIRECT_URL: z.string().url(),
  COOKIE_SECRET: z.string().nonempty(),
  DATABASE_URL: z.string().nonempty(),
});

export type Config = z.infer<typeof appConfigSchema>;

export const appConfig = appConfigSchema.parse(process.env);
