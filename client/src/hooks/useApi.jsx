import { useState, useRef, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

export const useApi = (url, method) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  const fetchData = useCallback(
    async (data = null) => {
      abortController.current?.abort();
      abortController.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance({
          url,
          method,
          data: data || undefined,
          signal: abortController.current.signal,
        });

        setLoading(false);
        return response;
      } catch (error) {
        console.log("error", error);
        if (error.name === "AbortError") return;
        setLoading(false);

        setError(error?.response?.data?.message || "Something went wrong");
        throw error;
      }
    },
    [url, method]
  );

  useEffect(() => {
    return () => abortController.current?.abort();
  }, []);

  return { loading, error, fetchData };
};
