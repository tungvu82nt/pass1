import React from "react";
import { Lock, Shield, Plus } from "lucide-react";

// TypeScript interfaces cho type safety
interface StatsData {
  total: number;
  // Note: Có thể mở rộng thêm các thống kê khác như:
  // weak: number;
  // strong: number;
  // duplicates: number;
}

interface StatConfig {
  icon: React.ComponentType<{ className?: string }>;
  value: (stats: StatsData) => string | number;
  label: string;
  gradient: string;
}

const STATS_CONFIG: StatConfig[] = [
  { 
    icon: Lock, 
    value: (stats) => stats.total, 
    label: "Mật khẩu đã lưu",
    gradient: "bg-gradient-primary"
  },
  { 
    icon: Shield, 
    value: () => "100%", 
    label: "Bảo mật tuyệt đối",
    gradient: "bg-gradient-accent"
  },
  { 
    icon: Plus, 
    value: () => "∞", 
    label: "Không giới hạn",
    gradient: "bg-security/20 border border-security/30"
  }
];

interface StatsSectionProps {
  stats: StatsData;
}

/**
 * Component hiển thị thống kê ứng dụng
 * Memoized để tránh re-render không cần thiết khi stats không thay đổi
 */
export const StatsSection = React.memo(({ stats }: StatsSectionProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {STATS_CONFIG.map((stat, index) => {
      const IconComponent = stat.icon;
      return (
        <div key={index} className="glass-effect rounded-xl p-6 text-center hover-lift group">
          <div className={`p-3 rounded-lg ${stat.gradient} w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-3xl font-bold mb-1">{stat.value(stats)}</div>
          <div className="text-muted-foreground font-medium">{stat.label}</div>
        </div>
      );
    })}
  </div>
));

StatsSection.displayName = "StatsSection";

// Export types để sử dụng ở nơi khác
export type { StatsData };