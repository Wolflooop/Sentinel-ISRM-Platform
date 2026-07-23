import rateLimit from "express-rate-limit";
import { env } from "../config/env";


export const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.RATE_LIMIT_ENABLED,
  message: {
    error: "Demasiados intentos. Intenta de nuevo más tarde.",
  },
});

export const apiLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  limit: env.API_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.RATE_LIMIT_ENABLED,
});


export const refreshLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX_REQUESTS * 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.RATE_LIMIT_ENABLED,
});