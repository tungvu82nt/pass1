import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Lock } from "lucide-react";

/**
 * Component hiển thị loading state
 * Sử dụng animation và skeleton loading
 */
export const LoadingState = React.memo(() => (
  <div className="text-center py-16 animate-fade-in">
    <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-6 animate-pulse">
      <Lock className="w-20 h-20 text-muted-foreground" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-gradient">
      Đang tải dữ liệu...
    </h3>
  </div>
));

LoadingState.displayName = "LoadingState";

/**
 * Component hiển thị error state với thông tin lỗi
 */
interface ErrorStateProps {
  error: string;
}

export const ErrorState = React.memo(({ error }: ErrorStateProps) => (
  <div className="text-center py-16 animate-fade-in">
    <div className="p-4 rounded-full bg-destructive/20 w-fit mx-auto mb-6">
      <Lock className="w-20 h-20 text-destructive" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-gradient">
      Lỗi khi tải dữ liệu
    </h3>
    <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
      {error}
    </p>
  </div>
));

ErrorState.displayName = "ErrorState";

/**
 * Component hiển thị empty state với call-to-action
 */
interface EmptyStateProps {
  searchQuery: string;
  onAddPassword: () => void;
}

export const EmptyState = React.memo(({ searchQuery, onAddPassword }: EmptyStateProps) => (
  <div className="text-center py-16 animate-fade-in">
    <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-6">
      <Lock className="w-20 h-20 text-muted-foreground" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-gradient">
      {searchQuery ? "Không tìm thấy kết quả" : "Chưa có mật khẩu nào"}
    </h3>
    <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
      {searchQuery
        ? "Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả"
        : "Bắt đầu bảo vệ tài khoản của bạn bằng cách thêm mật khẩu đầu tiên"}
    </p>
    {!searchQuery && (
      <Button 
        onClick={onAddPassword} 
        variant="default" 
        className="shadow-button hover:shadow-glow transition-all duration-300 px-8 py-3"
      >
        <Plus className="w-5 h-5 mr-2" />
        Thêm mật khẩu đầu tiên
      </Button>
    )}
  </div>
));

EmptyState.displayName = "EmptyState";