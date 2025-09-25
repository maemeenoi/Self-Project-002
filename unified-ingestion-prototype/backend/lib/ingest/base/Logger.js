// src/lib/ingest/base/Logger.js
export class Logger {
  constructor(options = {}) {
    this.context = options.context || {}
    this.level = options.level || "info"
  }

  _log(level, obj) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      ...this.context,
      ...obj,
    }

    if (level === "error") {
      console.error(JSON.stringify(logEntry))
    } else {
      console.log(JSON.stringify(logEntry))
    }

    // In production, you might want to send logs to a service like Azure Application Insights
    // await this.sendToLoggingService(logEntry);
  }

  info(obj) {
    this._log("info", obj)
  }

  warn(obj) {
    this._log("warn", obj)
  }

  error(obj) {
    this._log("error", obj)
  }

  debug(obj) {
    if (this.level === "debug") {
      this._log("debug", obj)
    }
  }

  withContext(context) {
    return new Logger({
      ...this,
      context: { ...this.context, ...context },
    })
  }
}
