export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const validateEnv = () => {
  if (!BACKEND_URL) {
    throw new Error("REACT_APP_BACKEND_URL is not defined in .env");
  }
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not defined in .env");
  }
};
