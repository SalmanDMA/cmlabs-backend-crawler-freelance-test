import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logDir = process.env.LOG_DIR ? path.resolve(process.env.LOG_DIR) : path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.json(),
);

const createLogger = (service: string) => {
	return winston.createLogger({
		level: 'debug',
		format: baseFormat,
		transports: [
			new DailyRotateFile({
				dirname: logDir,
				filename: `${service}-%DATE%.log`,
				datePattern: 'YYYY-MM-DD',
				maxFiles: '365d',
				zippedArchive: false,
			}),
			new winston.transports.Console(),
		],
	});
};

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
	category: string;
	event: string;
	message: string;
	metadata?: Record<string, any>;
}

const buildLog = (service: string, level: LogLevel, payload: LogPayload) => ({
	service,
	category: payload.category,
	event: payload.event,
	message: payload.message,
	metadata: payload.metadata || {},
});

const appLogger = createLogger('app');
const mqttLogger = createLogger('mqtt');
const jobLogger = createLogger('job');
const integrationLogger = createLogger('integration');
const botLogger = createLogger('bot');
const websocketLogger = createLogger('websocket');

export const logger = {
	app: {
		info: (p: LogPayload) => appLogger.info(buildLog('app', 'info', p)),
		warn: (p: LogPayload) => appLogger.warn(buildLog('app', 'warn', p)),
		error: (p: LogPayload) => appLogger.error(buildLog('app', 'error', p)),
		debug: (p: LogPayload) => appLogger.debug(buildLog('app', 'debug', p)),
	},
	mqtt: {
		info: (p: LogPayload) => mqttLogger.info(buildLog('mqtt', 'info', p)),
		warn: (p: LogPayload) => mqttLogger.warn(buildLog('mqtt', 'warn', p)),
		error: (p: LogPayload) => mqttLogger.error(buildLog('mqtt', 'error', p)),
		debug: (p: LogPayload) => mqttLogger.debug(buildLog('mqtt', 'debug', p)),
	},
	job: {
		info: (p: LogPayload) => jobLogger.info(buildLog('job', 'info', p)),
		warn: (p: LogPayload) => jobLogger.warn(buildLog('job', 'warn', p)),
		error: (p: LogPayload) => jobLogger.error(buildLog('job', 'error', p)),
		debug: (p: LogPayload) => jobLogger.debug(buildLog('job', 'debug', p)),
	},
	integration: {
		info: (p: LogPayload) => integrationLogger.info(buildLog('integration', 'info', p)),
		warn: (p: LogPayload) => integrationLogger.warn(buildLog('integration', 'warn', p)),
		error: (p: LogPayload) => integrationLogger.error(buildLog('integration', 'error', p)),
		debug: (p: LogPayload) => integrationLogger.debug(buildLog('integration', 'debug', p)),
	},
	bot: {
		info: (p: LogPayload) => botLogger.info(buildLog('bot', 'info', p)),
		warn: (p: LogPayload) => botLogger.warn(buildLog('bot', 'warn', p)),
		error: (p: LogPayload) => botLogger.error(buildLog('bot', 'error', p)),
		debug: (p: LogPayload) => botLogger.debug(buildLog('bot', 'debug', p)),
	},
	websocket: {
		info: (p: LogPayload) => websocketLogger.info(buildLog('websocket', 'info', p)),
		warn: (p: LogPayload) => websocketLogger.warn(buildLog('websocket', 'warn', p)),
		error: (p: LogPayload) => websocketLogger.error(buildLog('websocket', 'error', p)),
		debug: (p: LogPayload) => websocketLogger.debug(buildLog('websocket', 'debug', p)),
	},
};
