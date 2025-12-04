// hooks/useApi.js
import axiosInstance from "@/lib/axiosInstance";
import { useCallback, useEffect, useRef, useState } from "react";

export const useApi = (initialUrl = "", method = "GET") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  const fetchData = useCallback(
    async (data = null, config = {}, dynamicPath = "") => {
      abortController.current?.abort();
      abortController.current = new AbortController();

      const finalUrl = initialUrl + (dynamicPath || "");

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance({
          url: finalUrl,
          method,
          params: config.params,
          data: data || undefined,
          signal: abortController.current.signal,
          ...config,
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
    [initialUrl, method]
  );

  useEffect(() => {
    return () => abortController.current?.abort();
  }, []);

  return { loading, error, fetchData };
};
