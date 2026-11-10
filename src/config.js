export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Opcional: sin esto no se manda nada a Sentry (local, previews sin la variable).
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const validateEnv = () => {
  if (!BACKEND_URL) {
    throw new Error("VITE_BACKEND_URL is not defined in .env");
  }
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not defined in .env");
  }
};
