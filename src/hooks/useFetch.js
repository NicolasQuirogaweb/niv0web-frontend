export const useFetch = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const customFetch = async (url) => {
    return await fetch(`${BACKEND_URL}${url}`);
  };
  return {
    customFetch,
  };
};
