import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsTableProps {
  data: User[];
  isLoading: boolean;
  totalResults: number;
  selectedUserId?: number;
  onUserSelect: (user: User) => void;
}

export default function ResultsTable({
  data,
  isLoading,
  totalResults,
  selectedUserId,
  onUserSelect,
}: ResultsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(totalResults / pageSize);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm flex-1">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="font-medium">Kết Quả Tìm Kiếm</h3>
        <div className="text-sm text-gray-600">
          Tìm thấy {totalResults} kết quả
        </div>
      </div>
      
      <div className="data-table-container overflow-x-auto">
        <Table className="data-table w-full text-sm">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">STT</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Thời gian</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">CCCD</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Họ và tên</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Ngày sinh</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Số điện thoại</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Địa chỉ</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Nơi làm việc</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Trạng thái</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Mã tỉnh/TP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow 
                key={user.id}
                className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  user.id === selectedUserId ? 'bg-blue-50' : ''
                }`}
                onClick={() => onUserSelect(user)}
              >
                <TableCell className="px-6 py-4">{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="px-6 py-4">{user.createdAt}</TableCell>
                <TableCell className="px-6 py-4">{user.citizenId}</TableCell>
                <TableCell className="px-6 py-4 font-medium">
                  <button 
                    className="hover:text-primary hover:underline text-left focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserSelect(user);
                    }}
                  >
                    {user.fullName}
                  </button>
                </TableCell>
                <TableCell className="px-6 py-4">{user.dateOfBirth}</TableCell>
                <TableCell className="px-6 py-4">{user.phoneNumber}</TableCell>
                <TableCell className="px-6 py-4 max-w-[200px] truncate">{user.address}</TableCell>
                <TableCell className="px-6 py-4 max-w-[200px] truncate">{user.departmentName}</TableCell>
                <TableCell className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="px-6 py-4">{user.provinceCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-3 sm:mb-0">
          Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalResults)}</span> của <span className="font-medium">{totalResults}</span> kết quả
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'pending':
        return 'Đang xử lý';
      default:
        return status;
    }
  };
  
  return (
    <span className={`px-2 py-1 ${getStatusColor()} rounded-full text-xs`}>
      {getStatusText()}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-lg shadow-sm flex-1">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="font-medium">Kết Quả Tìm Kiếm</h3>
        <div className="text-sm text-gray-600">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
