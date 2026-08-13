import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { Request } from "express";
import config from "../core/config/config";


export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: Number(config.limit.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: Number(config.limit.RATE_LIMIT_MAX) || 100,
});


export const emailVerificationLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,

  keyGenerator: (req: Request): string => {
    return req.body.email ?? req.ip;
  },

  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: "Too many requests, please try again later.",
    });
  },
});