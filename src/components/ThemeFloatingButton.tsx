import { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'auto';

export const ThemeFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme-mode') as ThemeMode) || 'auto';
    }
    return 'auto';
  });

  const applyTheme = (mode: ThemeMode) => {
    let isDark = false;
    
    if (mode === 'auto') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = mode === 'dark';
    }
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme-mode', theme);
    
    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const themeOptions = [
    { 
      mode: 'light' as ThemeMode, 
      icon: Sun, 
      label: 'Clair',
      color: 'bg-warning/20 hover:bg-warning/30 text-warning'
    },
    { 
      mode: 'dark' as ThemeMode, 
      icon: Moon, 
      label: 'Sombre',
      color: 'bg-primary/20 hover:bg-primary/30 text-primary'
    },
    { 
      mode: 'auto' as ThemeMode, 
      icon: Monitor, 
      label: 'Auto',
      color: 'bg-accent/20 hover:bg-accent/30 text-accent'
    },
  ];

  const currentTheme = themeOptions.find(t => t.mode === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      {/* Theme options panel */}
      <div className={cn(
        "flex flex-col gap-2 mb-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
      )}>
        {themeOptions.map((option, index) => (
          <div 
            key={option.mode}
            className="flex items-center gap-2 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border border-border/50 whitespace-nowrap">
              {option.label}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-11 h-11 rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-border/50",
                option.color,
                theme === option.mode && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              onClick={() => handleThemeChange(option.mode)}
            >
              <option.icon className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className={cn(
          "w-12 h-12 rounded-full shadow-xl transition-all duration-300 border-2 border-border/30",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90 rotate-180" 
            : "bg-card hover:bg-card/90 text-foreground"
        )}
        style={{ 
          boxShadow: isOpen 
            ? undefined 
            : '0 4px 20px hsl(var(--primary) / 0.3)' 
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-destructive-foreground" />
        ) : (
          <CurrentIcon className="w-5 h-5" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/40 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
