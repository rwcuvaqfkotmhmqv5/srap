import { useState } from "react";
import { Menu, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        toast({
          title: 'Error',
          description: 'Could not log out. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during logout.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={onSidebarToggle}
          className="md:hidden text-gray-600 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-gray-700 focus:outline-none">
              <User className="w-5 h-5 mr-1" />
              <span className="mr-1">Admin</span>
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings size={14} />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-600"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut size={14} />
                <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
