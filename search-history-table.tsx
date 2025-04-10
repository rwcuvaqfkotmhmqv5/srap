import { Link } from "wouter";
import { SearchCheck } from "lucide-react";
import { SearchHistory } from "@/lib/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Function to convert filter code to display name
function getFilterDisplayName(filter: string): string {
  switch (filter) {
    case 'all':
      return 'Tất cả';
    case 'cccd':
      return 'CCCD';
    case 'name':
      return 'Họ tên';
    case 'phone':
      return 'Điện thoại';
    case 'address':
      return 'Địa chỉ';
    case 'workplace':
      return 'Nơi làm việc';
    case 'recruitment':
      return 'Tuyển dụng';
    default:
      return filter;
  }
}

interface SearchHistoryTableProps {
  data: SearchHistory[];
  isLoading: boolean;
  isPreview: boolean;
}

export default function SearchHistoryTable({ 
  data, 
  isLoading,
  isPreview 
}: SearchHistoryTableProps) {
  if (isLoading) {
    return <LoadingState isPreview={isPreview} />;
  }
  
  if (data.length === 0 && isPreview) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm mt-6">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="font-medium">{isPreview ? 'Lịch Sử Tìm Kiếm Gần Đây' : 'Lịch Sử Tìm Kiếm'}</h3>
        {isPreview && (
          <Link href="/search-history">
            <a className="text-primary text-sm">Xem tất cả</a>
          </Link>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">STT</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Thời gian</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Tìm kiếm</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Bộ lọc</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">CCCD</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Họ và tên</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Ngày sinh</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Quận/Huyện</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Điện thoại</TableHead>
              <TableHead className="px-6 py-3 text-left font-medium text-gray-600">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">{new Date(item.searchTime).toLocaleString()}</TableCell>
                <TableCell className="px-6 py-3">{item.searchQuery}</TableCell>
                <TableCell className="px-6 py-3">{getFilterDisplayName(item.searchFilter)}</TableCell>
                <TableCell className="px-6 py-3">{item.citizenId}</TableCell>
                <TableCell className="px-6 py-3">{item.fullName}</TableCell>
                <TableCell className="px-6 py-3">{item.dateOfBirth}</TableCell>
                <TableCell className="px-6 py-3">{item.district}</TableCell>
                <TableCell className="px-6 py-3">{item.phoneNumber}</TableCell>
                <TableCell className="px-6 py-3">
                  <div className="flex space-x-2">
                    <Link href={`/?query=${item.searchQuery}&filter=${item.searchFilter}`}>
                      <a className="text-primary hover:text-primary-dark" title="Tìm kiếm lại">
                        <SearchCheck className="w-4 h-4" />
                      </a>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function LoadingState({ isPreview }: { isPreview: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm mt-6">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="font-medium">{isPreview ? 'Lịch Sử Tìm Kiếm Gần Đây' : 'Lịch Sử Tìm Kiếm'}</h3>
        {isPreview && (
          <span className="text-primary text-sm">Xem tất cả</span>
        )}
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: isPreview ? 3 : 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
