import { useQuery } from "@tanstack/react-query";
import SearchHistoryTable from "@/components/search-history-table";
import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";
import { useLocation } from "wouter";
import { SearchHistoryResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function SearchHistory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  
  const {
    data: searchHistory,
    isLoading,
    isError,
    refetch
  } = useQuery<SearchHistoryResult>({
    queryKey: ['/api/search-history'],
  });

  const handleRetry = () => {
    refetch();
  };
  
  const handleClearHistory = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm?')) {
      setIsClearing(true);
      try {
        const result = await apiRequest({
          url: '/api/search-history',
          method: 'DELETE'
        });
        
        if (result && result.success) {
          toast({
            title: 'Đã xóa lịch sử tìm kiếm',
            description: 'Lịch sử tìm kiếm đã được xóa thành công.',
          });
          refetch();
        } else {
          toast({
            title: 'Lỗi',
            description: 'Không thể xóa lịch sử tìm kiếm. Vui lòng thử lại sau.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Clear history error:', error);
        toast({
          title: 'Lỗi',
          description: 'Đã xảy ra lỗi khi xóa lịch sử tìm kiếm.',
          variant: 'destructive',
        });
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-surface p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium">Lịch Sử Tìm Kiếm</h2>
            <p className="text-gray-600 text-sm mt-2">
              Xem tất cả lịch sử tìm kiếm trước đây và truy cập nhanh thông tin người dùng.
            </p>
          </div>
          {searchHistory?.data && searchHistory.data.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleClearHistory}
              disabled={isClearing}
              className="flex items-center gap-1"
            >
              <Trash size={14} />
              {isClearing ? 'Đang xóa...' : 'Xóa lịch sử'}
            </Button>
          )}
        </div>
      </div>
      
      {isError && (
        <ErrorState 
          message="Đã xảy ra lỗi khi tải lịch sử tìm kiếm. Vui lòng thử lại." 
          onRetry={handleRetry}
        />
      )}
      
      {!isLoading && !isError && (!searchHistory?.data || searchHistory.data.length === 0) && (
        <EmptyState 
          message="Không tìm thấy lịch sử tìm kiếm. Hãy thử tìm kiếm người dùng trước." 
          onClear={() => setLocation("/")}
          buttonText="Đi đến tìm kiếm"
        />
      )}
      
      {!isError && searchHistory?.data && searchHistory.data.length > 0 && (
        <SearchHistoryTable 
          data={searchHistory.data} 
          isLoading={isLoading}
          isPreview={false}
        />
      )}
    </main>
  );
}
