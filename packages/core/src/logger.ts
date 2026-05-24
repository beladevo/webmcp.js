export function createLogger(debug: boolean | undefined) {
  return {
    debug(message: string, details?: unknown) {
      if (!debug) return;
      if (details === undefined) {
        console.log(`[webmcp.js] ${message}`);
      } else {
        console.log(`[webmcp.js] ${message}`, details);
      }
    },
    warn(message: string, details?: unknown) {
      if (details === undefined) {
        console.warn(`[webmcp.js] ${message}`);
      } else {
        console.warn(`[webmcp.js] ${message}`, details);
      }
    }
  };
}
