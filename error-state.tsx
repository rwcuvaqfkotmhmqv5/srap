import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center mt-6">
      <div className="flex flex-col items-center">
        <AlertCircle className="text-red-500 h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <Button
          variant="default"
          onClick={onRetry}
        >
          Thử lại
        </Button>
      </div>
    </div>
  );
}
