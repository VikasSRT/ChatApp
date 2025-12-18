// hooks/useUserSearch.js
import { useState, useRef, useEffect } from "react";
import { useApi } from "@/hooks/useApi";

export const useUserSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const debounceRef = useRef(null);

  const {
    loading: isUsersLoading,
    error: isUserLoadingError,
    fetchData: fetchUsers,
  } = useApi("/users/search");

  const searchHandler = async (text) => {
    setSearchText(text);
    clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setUserSearchResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetchUsers(null, {
          params: { q: text },
        });
        setUserSearchResults(response?.data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      }
      setHasSearched(true);
    }, 500);
  };

  const resetSearch = () => {
    setSearchText("");
    setUserSearchResults([]);
    setHasSearched(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return {
    searchText,
    hasSearched,
    userSearchResults,
    isUsersLoading,
    isUserLoadingError,
    searchHandler,
    setUserSearchResults,
    setSearchText,
    setHasSearched,
    resetSearch,
  };
};
