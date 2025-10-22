import { rateLimit } from "express-rate-limit";
import createError from "http-errors";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next, options) => {
    const retryAfterSeconds = Math.ceil(options.windowMs / 1000);

    next(
      createError(429, {
        message: `Too many requests, please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
      })
    );
  },
});

export default limiter;
