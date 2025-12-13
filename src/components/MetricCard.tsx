import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
  className?: string;
}

const colorVariants = {
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    glow: 'group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)]',
    border: 'border-primary/20',
  },
  success: {
    bg: 'bg-success/10',
    icon: 'text-success',
    glow: 'group-hover:shadow-[0_0_20px_hsl(var(--success)/0.25)]',
    border: 'border-success/20',
  },
  warning: {
    bg: 'bg-warning/10',
    icon: 'text-warning',
    glow: 'group-hover:shadow-[0_0_20px_hsl(var(--warning)/0.25)]',
    border: 'border-warning/20',
  },
  info: {
    bg: 'bg-info/10',
    icon: 'text-info',
    glow: 'group-hover:shadow-[0_0_20px_hsl(var(--info)/0.25)]',
    border: 'border-info/20',
  },
  destructive: {
    bg: 'bg-destructive/10',
    icon: 'text-destructive',
    glow: 'group-hover:shadow-[0_0_20px_hsl(var(--destructive)/0.25)]',
    border: 'border-destructive/20',
  },
};

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  change, 
  changeType, 
  description,
  className 
}: MetricCardProps) => {
  const colors = colorVariants[color];
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300",
      "hover:shadow-lg hover:-translate-y-1",
      colors.border,
      colors.glow,
      className
    )}>
      {/* Background decoration */}
      <div className={cn(
        "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-50 blur-2xl transition-all duration-300 group-hover:opacity-70",
        colors.bg
      )} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          
          {(change || description) && (
            <div className="flex items-center gap-2 pt-1">
              {change && changeType && (
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  changeType === 'positive' 
                    ? "bg-success/15 text-success" 
                    : "bg-destructive/15 text-destructive"
                )}>
                  {change}
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
            "group-hover:scale-110",
            colors.bg
          )}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
        )}
      </div>
    </div>
  );
};