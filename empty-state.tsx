import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  onClear: () => void;
  buttonText?: string;
}

export default function EmptyState({ 
  message, 
  onClear, 
  buttonText = "Xóa bộ lọc" 
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center mt-6">
      <div className="flex flex-col items-center">
        <FileSearch className="text-gray-400 h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy kết quả</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <Button
          variant="default"
          onClick={onClear}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
