import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import SearchSection from "@/components/search-section";
import ResultsTable from "@/components/results-table";
import UserDetails from "@/components/user-details";
import SearchHistoryTable from "@/components/search-history-table";
import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";
import { User, SearchResult, SearchHistoryResult } from "@/lib/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [location] = useLocation();

  // Check URL for search params and trigger search automatically
  useEffect(() => {
    const url = new URL(window.location.href);
    const queryParam = url.searchParams.get('query');
    const filterParam = url.searchParams.get('filter');

    if (queryParam) {
      setSearchQuery(queryParam);
      if (filterParam) {
        setSearchFilter(filterParam);
      }

      // Trigger search with a slight delay to allow state updates
      const timer = setTimeout(() => {
        refetchSearch();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location]);

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch
  } = useQuery<SearchResult>({
    queryKey: ['/api/users/search', searchQuery, searchFilter],
    queryFn: async () => {
      if (!searchQuery) return { data: [], totalCount: 0 };
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}&filter=${searchFilter}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: !!searchQuery,
  });

  const {
    data: searchHistory,
    isLoading: isHistoryLoading
  } = useQuery<SearchHistoryResult>({
    queryKey: ['/api/search-history'],
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await refetchSearch();
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleRetry = () => {
    refetchSearch();
  };

  return (
    <main className="flex-1 overflow-y-auto bg-surface p-4">
      <SearchSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onSearch={handleSearch}
      />

      {isSearchError && (
        <ErrorState 
          message="Đã xảy ra lỗi khi đọc dữ liệu từ tệp Excel. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ." 
          onRetry={handleRetry}
        />
      )}

      {searchQuery && !isSearchLoading && !isSearchError && searchResults?.data?.length === 0 && (
        <EmptyState 
          message="Không tìm thấy người dùng nào phù hợp với tiêu chí tìm kiếm của bạn." 
          onClear={() => setSearchQuery("")}
        />
      )}

      {(!isSearchLoading && searchResults && searchResults.data && searchResults.data.length > 0) && (
        <div className="flex flex-col xl:flex-row gap-6">
          <ResultsTable 
            data={searchResults.data} 
            isLoading={isSearchLoading}
            totalResults={searchResults.totalCount}
            selectedUserId={selectedUser?.id}
            onUserSelect={handleUserSelect}
          />

          {selectedUser && (
            <UserDetails user={selectedUser} />
          )}
        </div>
      )}
    </main>
  );
}