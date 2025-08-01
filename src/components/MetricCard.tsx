
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  color?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}

export const MetricCard = ({ title, value, icon: Icon, color, change, changeType, description }: MetricCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="flex items-center gap-4">
          {Icon && (
            <Icon className={cn(
              "w-8 h-8",
              color === 'blue' && "text-blue-600",
              color === 'green' && "text-green-600", 
              color === 'yellow' && "text-yellow-600",
              color === 'red' && "text-red-600"
            )} />
          )}
          {change && changeType && description && (
            <div className="text-right">
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === 'positive' ? "text-green-600" : "text-red-600"
                )}
              >
                {change}
              </span>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
