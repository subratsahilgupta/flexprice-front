type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
	enabledEnvironments: string[];
	showTimestamp?: boolean;
	showLogLevel?: boolean;
}

class Logger {
	private static instance: Logger;
	private config: LoggerConfig;
	private isEnabled: boolean;

	private constructor(
		config: LoggerConfig = {
			enabledEnvironments: ['development'],
			showTimestamp: true,
			showLogLevel: true,
		},
	) {
		this.config = config;
		this.isEnabled = this.checkIfEnabled();
	}

	public static getInstance(config?: LoggerConfig): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger(config);
		}
		return Logger.instance;
	}

	private checkIfEnabled(): boolean {
		const currentEnv = process.env.NODE_ENV || 'development';
		return this.config.enabledEnvironments.includes(currentEnv);
	}

	private formatMessage(level: LogLevel, ...args: any[]): string {
		const parts: string[] = [];

		if (this.config.showTimestamp) {
			parts.push(`[${new Date().toISOString()}]`);
		}

		if (this.config.showLogLevel) {
			parts.push(`[${level.toUpperCase()}]`);
		}

		parts.push(...args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))));

		return parts.join(' ');
	}

	public info(...args: any[]): void {
		if (this.isEnabled) {
			console.info(this.formatMessage('info', ...args));
		}
	}

	public warn(...args: any[]): void {
		if (this.isEnabled) {
			console.warn(this.formatMessage('warn', ...args));
		}
	}

	public error(...args: any[]): void {
		if (this.isEnabled) {
			console.error(this.formatMessage('error', ...args));
		}
	}

	public debug(...args: any[]): void {
		if (this.isEnabled) {
			console.debug(this.formatMessage('debug', ...args));
		}
	}

	public setConfig(newConfig: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...newConfig };
		this.isEnabled = this.checkIfEnabled();
	}
}

// Export a singleton instance with default configuration
export const logger = Logger.getInstance();

// Export the Logger class for custom instances if needed
export { Logger };
