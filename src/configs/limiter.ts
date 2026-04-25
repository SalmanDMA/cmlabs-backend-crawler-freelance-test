import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
	max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
	message: 'Too many requests from this IP, please try again after 1 minutes',
	headers: true,
});
