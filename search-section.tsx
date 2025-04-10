import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
  onSearch: () => void;
}

export default function SearchSection({ 
  searchQuery, 
  setSearchQuery, 
  searchFilter, 
  setSearchFilter, 
  onSearch 
}: SearchSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">Tìm Kiếm Người Dùng</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Search className="w-5 h-5" />
            </span>
            <Input
              type="text"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg"
              placeholder="Nhập CCCD, tên, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        
        {/* Filter Dropdown */}
        <div className="w-full md:w-48">
          <Select value={searchFilter} onValueChange={setSearchFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tìm theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các trường</SelectItem>
              <SelectItem value="cccd">CCCD</SelectItem>
              <SelectItem value="phone">Số điện thoại</SelectItem>
              <SelectItem value="name">Họ và tên</SelectItem>
              <SelectItem value="address">Địa chỉ</SelectItem>
              <SelectItem value="workplace">Nơi làm việc</SelectItem>
              <SelectItem value="recruitment">Thông tin công việc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search Button */}
        <Button 
          className="bg-primary hover:bg-primary-dark text-white font-medium"
          onClick={onSearch}
        >
          <Search className="w-4 h-4 mr-1" />
          Tìm Kiếm
        </Button>
      </div>
      
      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="text-sm text-gray-600 flex items-center">
          <Filter className="w-4 h-4 mr-1" />
          Bộ lọc nâng cao:
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center">
            Tỉnh/TP: Tất cả
            <button className="ml-1 text-gray-500 hover:text-gray-700">
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center">
            Trạng thái: Đang hoạt động
            <button className="ml-1 text-gray-500 hover:text-gray-700">
              <X className="w-3 h-3" />
            </button>
          </span>
          <button className="text-primary text-sm flex items-center">
            <Plus className="w-3 h-3 mr-1" />
            Thêm bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}

function Filter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
