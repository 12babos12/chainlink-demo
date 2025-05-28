import Redis from "ioredis";

export const DEFAULT_CACHE_TTL_SECONDS = 60 * 10;

export const redis = new Redis(process.env.REDIS_URL!);
