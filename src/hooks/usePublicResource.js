import { useState, useCallback } from "react";

/**
 * Shared loading/data/error bookkeeping for the public read-only pages
 * (Beats, SamplePacks, Samples, Loops). Each page still owns its own
 * useEffect and dependency array — this hook only centralizes the
 * try/catch/finally boilerplate that was duplicated across them.
 */
export const usePublicResource = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback((promise) => {
    setLoading(true);
    setError(null);
    return promise
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, run, setLoading };
};
