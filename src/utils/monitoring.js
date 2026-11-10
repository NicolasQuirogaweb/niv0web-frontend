// Sentry guarda los errores que ven los visitantes en producción (ADR 0013).
// Se carga aparte, después del primer render, para no sumar peso a la carga
// inicial. Sin DSN (local, tests) no se carga nada.
let sentry = null;

export const initMonitoring = async ({ dsn, environment }) => {
  if (!dsn) return false;
  const Sentry = await import("@sentry/react");
  Sentry.init({
    dsn,
    environment,
    // Sin IP, cookies ni headers; solo errores, sin trazas de rendimiento.
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
  sentry = Sentry;
  return true;
};

export const reportError = async (error, info) => {
  if (!sentry) return;
  sentry.captureException(error, info?.componentStack ? { contexts: { react: { componentStack: info.componentStack } } } : undefined);
};

export const resetMonitoringForTests = () => {
  sentry = null;
};
