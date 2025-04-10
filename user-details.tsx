import { X } from "lucide-react";
import { User } from "@/lib/types";

interface UserDetailsProps {
  user: User;
}

export default function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm w-full xl:w-80 xl:max-w-md h-fit">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="font-medium">Thông Tin Chi Tiết</h3>
        <button className="text-gray-500 hover:text-gray-700 xl:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="font-medium text-lg">{user.fullName}</h3>
            <p className="text-gray-600">CCCD: {user.citizenId}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">THÔNG TIN CÁ NHÂN</h4>
              <div className="grid grid-cols-1 gap-3">
                <DetailItem label="Họ và tên" value={user.fullName} />
                <DetailItem label="Ngày sinh" value={user.dateOfBirth} />
                <DetailItem label="Số CCCD" value={user.citizenId} />
                <DetailItem label="Mã kiểm tra" value={user.checkCode} />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">THÔNG TIN LIÊN HỆ</h4>
              <div className="grid grid-cols-1 gap-3">
                <DetailItem label="Điện thoại" value={user.phoneNumber} />
                <DetailItem label="Email" value={user.email} />
                <DetailItem label="Địa chỉ" value={user.address} />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">THÔNG TIN CÔNG VIỆC</h4>
              <div className="grid grid-cols-1 gap-3">
                <DetailItem label="Chức vụ" value={user.position} />
                <DetailItem label="Nơi làm việc" value={user.departmentName} />
                <DetailItem label="Địa chỉ làm việc" value={user.workplace} />
                <div>
                  <p className="text-xs text-gray-500">Trạng thái</p>
                  <p className="text-sm">
                    <StatusBadge status={user.status} />
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">MÃ KHU VỰC</h4>
              <div className="grid grid-cols-1 gap-3">
                <DetailItem label="Mã tỉnh/TP" value={user.provinceCode} />
                <DetailItem label="Mã quận/huyện" value={user.districtCode} />
              </div>
            </div>
            
            {user.notes && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">GHI CHÚ</h4>
                <p className="text-sm">{user.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm">{value || 'N/A'}</p>
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
    <span className={`px-2 py-0.5 ${getStatusColor()} rounded-full text-xs`}>
      {getStatusText()}
    </span>
  );
}
