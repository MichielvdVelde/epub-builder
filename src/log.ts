/** The log level. */
export enum LogLevel {
  /** Informational log level. */
  Info = "info",
  /** Warning log level. */
  Warn = "warn",
  /** Error log level. */
  Error = "error",
}

/** A log item. */
export interface LogItem {
  /** The level of the log item. */
  level: LogLevel;
  /** The timestamp of the log item. */
  timestamp: number;
  /** The message of the log item. */
  message: string;
  /** The metadata of the log item. */
  meta?: Record<string, unknown>;
}

/** The metadata of a log item. */
export type LogMeta = Record<string, unknown>;

/**
 * A log. This is an array of log items with additional methods for logging.
 */
export interface Log extends Array<LogItem> {
  /**
   * Log a message with the given level.
   * @param level The level of the log message.
   * @param message The message to log.
   * @param meta The metadata of the log message.
   */
  log(
    level: LogLevel,
    message: string,
    meta?: LogMeta,
  ): void;
  /** Log an informational message. */
  info(message: string, meta?: LogMeta): void;
  /** Log a warning message. */
  warn(message: string, meta?: LogMeta): void;
  /** Log an error message. */
  error(message: string, meta?: LogMeta): void;
  /** Add an event listener for log events. */
  addEventListener(
    type: "log",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  /** Remove an event listener for log events. */
  removeEventListener(
    type: "log",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  /** Add an event listener for info log events. */
  addEventListener(
    type: "info",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  /** Remove an event listener for info log events. */
  removeEventListener(
    type: "info",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  /** Add an event listener for warn log events. */
  addEventListener(
    type: "warn",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  /** Remove an event listener for warn log events. */
  removeEventListener(
    type: "warn",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  /** Add an event listener for error log events. */
  addEventListener(
    type: "error",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  /** Remove an event listener for error log events. */
  removeEventListener(
    type: "error",
    listener: (event: CustomEvent<LogItem>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  /**
   * Iterate over all log items, optionally filtered by level.
   * @param level The level or levels to filter by (optional, default is all levels).
   */
  items(level?: LogLevel | LogLevel[]): IterableIterator<LogItem>;
}

/** Options for creating a log. */
export interface CreateLogOptions {
  /** Do not emit log events. */
  noEmit?: boolean;
}

/**
 * Create a log.
 */
export function createLog(options?: CreateLogOptions): Log {
  const emit = !options?.noEmit;
  const log: Log = [] as any;
  const target = emit ? new EventTarget() : null; // Only create an event target when emitting is enabled

  const logFn: Log["log"] = (level, message, meta) => {
    const timestamp = Date.now();
    log.push({ level, message, meta, timestamp });

    if (target) {
      const detail = { level, message, meta, timestamp };
      target.dispatchEvent(new CustomEvent(level, { detail }));
      target.dispatchEvent(new CustomEvent("log", { detail }));
    }
  };

  log.log = logFn;
  log.info = (message, meta) => logFn(LogLevel.Info, message, meta);
  log.warn = (message, meta) => logFn(LogLevel.Warn, message, meta);
  log.error = (message, meta) => logFn(LogLevel.Error, message, meta);

  const noop = () => {}; // noop when emitting is disabled

  log.addEventListener = target?.addEventListener
    .bind(target) as Log["addEventListener"] ?? noop;

  log.removeEventListener = target?.removeEventListener
    .bind(target) as Log["removeEventListener"] ?? noop;

  log.items = function* (level?: LogLevel | LogLevel[]) {
    for (const item of log) {
      if (
        level === undefined ||
        (Array.isArray(level)
          ? level.includes(item.level)
          : item.level === level)
      ) {
        yield item;
      }
    }
  };

  return log;
}
