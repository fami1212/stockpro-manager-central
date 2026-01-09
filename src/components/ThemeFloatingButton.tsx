import { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Monitor, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'auto';

interface AccentColor {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
  preview: string;
}

const accentColors: AccentColor[] = [
  { name: 'Indigo', hue: 238, saturation: 75, lightness: 58, preview: 'bg-[hsl(238,75%,58%)]' },
  { name: 'Violet', hue: 262, saturation: 83, lightness: 58, preview: 'bg-[hsl(262,83%,58%)]' },
  { name: 'Rose', hue: 350, saturation: 89, lightness: 60, preview: 'bg-[hsl(350,89%,60%)]' },
  { name: 'Orange', hue: 25, saturation: 95, lightness: 53, preview: 'bg-[hsl(25,95%,53%)]' },
  { name: 'Emerald', hue: 158, saturation: 64, lightness: 42, preview: 'bg-[hsl(158,64%,42%)]' },
  { name: 'Cyan', hue: 190, saturation: 95, lightness: 45, preview: 'bg-[hsl(190,95%,45%)]' },
  { name: 'Bleu', hue: 217, saturation: 91, lightness: 60, preview: 'bg-[hsl(217,91%,60%)]' },
  { name: 'Ambre', hue: 38, saturation: 92, lightness: 50, preview: 'bg-[hsl(38,92%,50%)]' },
];

export const ThemeFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme-mode') as ThemeMode) || 'auto';
    }
    return 'auto';
  });
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accent-color');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return accentColors[0];
        }
      }
    }
    return accentColors[0];
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

  const applyAccentColor = (color: AccentColor) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    // Apply primary color
    const lightness = isDark ? color.lightness + 7 : color.lightness;
    root.style.setProperty('--primary', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--ring', `${color.hue} ${color.saturation}% ${lightness}%`);
    
    // Apply accent color (slightly shifted hue)
    const accentHue = (color.hue + 24) % 360;
    root.style.setProperty('--accent', `${accentHue} ${color.saturation}% ${lightness}%`);
    
    // Update sidebar colors
    root.style.setProperty('--sidebar-primary', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--sidebar-ring', `${color.hue} ${color.saturation}% ${lightness}%`);
    
    // Update chart color
    root.style.setProperty('--chart-1', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--chart-5', `${accentHue} ${color.saturation}% ${lightness}%`);
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme-mode', theme);
    
    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('auto');
        applyAccentColor(accentColor);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, accentColor]);

  useEffect(() => {
    applyAccentColor(accentColor);
    localStorage.setItem('accent-color', JSON.stringify(accentColor));
  }, [accentColor]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleColorChange = (color: AccentColor) => {
    setAccentColor(color);
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
      color: 'bg-muted hover:bg-muted/80 text-muted-foreground'
    },
  ];

  const currentTheme = themeOptions.find(t => t.mode === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      {/* Color palette panel - positioned above the buttons */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 transition-all duration-300",
        showColors && isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 animate-scale-in min-w-[200px]">
          <p className="text-sm font-semibold text-foreground mb-3 text-center">Couleur d'accent</p>
          <div className="grid grid-cols-4 gap-3">
            {accentColors.map((color) => (
              <button
                key={color.name}
                className={cn(
                  "w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center shadow-md",
                  color.preview,
                  accentColor.name === color.name && "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110"
                )}
                onClick={() => handleColorChange(color)}
                title={color.name}
              >
                {accentColor.name === color.name && (
                  <Check className="w-5 h-5 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">{accentColor.name}</p>
        </div>
      </div>

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
        
        {/* Color picker toggle */}
        <div 
          className="flex items-center gap-2 animate-scale-in"
          style={{ animationDelay: '150ms' }}
        >
          <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border border-border/50 whitespace-nowrap">
            Couleurs
          </span>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-11 h-11 rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-border/50",
              showColors 
                ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
            onClick={() => setShowColors(!showColors)}
          >
            <Palette className="w-5 h-5" />
          </Button>
        </div>
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
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setShowColors(false);
        }}
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
          onClick={() => {
            setIsOpen(false);
            setShowColors(false);
          }}
        />
      )}
    </div>
  );
};
