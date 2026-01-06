import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordEntry, PasswordInsert } from "@/lib/types/models";
import { FormMode } from '@/hooks/use-form-state';
import { passwordEntrySchema, PasswordEntryFormData, generateSecurePassword, validatePasswordStrength } from "@/lib/validation/password-validation";
import { logger } from "@/lib/utils/logger";

interface PasswordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: PasswordInsert) => void;
  editEntry?: PasswordEntry;
  formMode?: FormMode; // Optional để backward compatibility
}

export const PasswordForm = ({ isOpen, onClose, onSave, editEntry, formMode }: PasswordFormProps) => {
  // Determine form mode - use prop if provided, fallback to editEntry check
  const currentFormMode = formMode || (editEntry ? FormMode.EDIT : FormMode.ADD);
  const isEditMode = currentFormMode === FormMode.EDIT;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PasswordEntryFormData>({
    resolver: zodResolver(passwordEntrySchema),
    defaultValues: {
      service: "",
      username: "",
      password: "",
    }
  });

  const watchedPassword = watch("password");
  const passwordStrength = watchedPassword ? validatePasswordStrength(watchedPassword) : null;

  // Reset form khi dialog mở/đóng hoặc editEntry thay đổi
  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        reset({
          service: editEntry.service,
          username: editEntry.username,
          password: editEntry.password,
        });
        logger.debug("Form reset with edit data", { entryId: editEntry.id });
      } else {
        reset({
          service: "",
          username: "",
          password: "",
        });
        logger.debug("Form reset for new entry");
      }
    }
  }, [editEntry, isOpen, reset]);

  const onSubmit = async (data: PasswordEntryFormData) => {
    try {
      logger.info("Submitting password form", { 
        service: data.service, 
        isEdit: isEditMode 
      });
      
      await onSave(data);
      onClose();
      
      logger.info("Password form submitted successfully");
    } catch (error) {
      logger.error("Failed to submit password form", error as Error);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    setValue("password", newPassword);
    logger.debug("Generated new secure password");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa mật khẩu" : "Thêm mật khẩu mới"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Dịch vụ</Label>
            <Input
              id="service"
              {...register("service")}
              placeholder="Tên dịch vụ hoặc website"
              className={errors.service ? "border-red-500" : ""}
            />
            {errors.service && (
              <p className="text-sm text-red-500">{errors.service.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Email hoặc tên đăng nhập"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Mật khẩu"
                className={`flex-1 ${errors.password ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                className="whitespace-nowrap"
              >
                Tạo ngẫu nhiên
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            
            {/* Password strength indicator */}
            {passwordStrength && watchedPassword && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Độ mạnh:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-4 rounded ${
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 2
                              ? "bg-red-500"
                              : passwordStrength.score <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {passwordStrength.feedback.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="security" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};