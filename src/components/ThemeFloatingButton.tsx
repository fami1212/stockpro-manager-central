import { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Monitor, X, Check, Save, Trash2, BookMarked, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'auto';

interface AccentColor {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
  preview: string;
}

interface SavedTheme {
  id: string;
  name: string;
  mode: ThemeMode;
  accentColor: AccentColor;
  isPreset?: boolean;
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

// Thèmes prédéfinis populaires
const presetThemes: SavedTheme[] = [
  {
    id: 'preset-material',
    name: 'Material',
    mode: 'light',
    accentColor: { name: 'Material Blue', hue: 210, saturation: 79, lightness: 46, preview: 'bg-[hsl(210,79%,46%)]' },
    isPreset: true,
  },
  {
    id: 'preset-material-dark',
    name: 'Material Dark',
    mode: 'dark',
    accentColor: { name: 'Material Teal', hue: 174, saturation: 100, lightness: 29, preview: 'bg-[hsl(174,100%,29%)]' },
    isPreset: true,
  },
  {
    id: 'preset-nord',
    name: 'Nord',
    mode: 'dark',
    accentColor: { name: 'Nord Frost', hue: 193, saturation: 43, lightness: 67, preview: 'bg-[hsl(193,43%,67%)]' },
    isPreset: true,
  },
  {
    id: 'preset-dracula',
    name: 'Dracula',
    mode: 'dark',
    accentColor: { name: 'Dracula Purple', hue: 265, saturation: 89, lightness: 78, preview: 'bg-[hsl(265,89%,78%)]' },
    isPreset: true,
  },
  {
    id: 'preset-solarized',
    name: 'Solarized',
    mode: 'light',
    accentColor: { name: 'Solarized Blue', hue: 205, saturation: 69, lightness: 49, preview: 'bg-[hsl(205,69%,49%)]' },
    isPreset: true,
  },
  {
    id: 'preset-monokai',
    name: 'Monokai',
    mode: 'dark',
    accentColor: { name: 'Monokai Yellow', hue: 54, saturation: 70, lightness: 68, preview: 'bg-[hsl(54,70%,68%)]' },
    isPreset: true,
  },
  {
    id: 'preset-github',
    name: 'GitHub',
    mode: 'light',
    accentColor: { name: 'GitHub Blue', hue: 215, saturation: 50, lightness: 50, preview: 'bg-[hsl(215,50%,50%)]' },
    isPreset: true,
  },
  {
    id: 'preset-catppuccin',
    name: 'Catppuccin',
    mode: 'dark',
    accentColor: { name: 'Catppuccin Mauve', hue: 267, saturation: 84, lightness: 81, preview: 'bg-[hsl(267,84%,81%)]' },
    isPreset: true,
  },
];

export const ThemeFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showSavedThemes, setShowSavedThemes] = useState(false);
  const [showPresetThemes, setShowPresetThemes] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
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
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved-themes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
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

  const handleSaveTheme = () => {
    if (!newThemeName.trim()) return;
    
    const newTheme: SavedTheme = {
      id: Date.now().toString(),
      name: newThemeName.trim(),
      mode: theme,
      accentColor: accentColor,
    };
    
    const updated = [...savedThemes, newTheme];
    setSavedThemes(updated);
    localStorage.setItem('saved-themes', JSON.stringify(updated));
    setNewThemeName('');
    setShowSaveForm(false);
  };

  const handleDeleteTheme = (id: string) => {
    const updated = savedThemes.filter(t => t.id !== id);
    setSavedThemes(updated);
    localStorage.setItem('saved-themes', JSON.stringify(updated));
  };

  const handleApplyTheme = (savedTheme: SavedTheme) => {
    setTheme(savedTheme.mode);
    setAccentColor(savedTheme.accentColor);
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
    <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 max-w-[calc(100vw-1rem)]">
      {/* Color palette panel - positioned above the buttons */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out",
        showColors && isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      )}>
        <div className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-4 sm:p-5 animate-scale-in w-[200px] sm:w-[240px] max-w-[calc(100vw-2rem)] overflow-hidden">
          {/* Decorative gradient orb */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Couleur d'accent</p>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {accentColors.map((color, index) => (
                <button
                  key={color.name}
                  className={cn(
                    "group relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center",
                    color.preview,
                    "shadow-lg hover:shadow-xl",
                    accentColor.name === color.name 
                      ? "ring-2 ring-offset-2 ring-offset-card ring-white dark:ring-white/80 scale-110" 
                      : "ring-1 ring-white/20"
                  )}
                  onClick={() => handleColorChange(color)}
                  title={color.name}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {accentColor.name === color.name && (
                    <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                  )}
                  {accentColor.name === color.name && (
                    <Check className="w-5 h-5 text-white drop-shadow-lg relative z-10" />
                  )}
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
                <div className={cn("w-3 h-3 rounded-full", accentColor.preview)} />
                <p className="text-xs font-medium text-foreground">{accentColor.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme options panel */}
      <div className={cn(
        "flex flex-col gap-2.5 mb-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
      )}>
        {themeOptions.map((option, index) => (
          <div 
            key={option.mode}
            className="flex items-center gap-2.5 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="backdrop-blur-xl bg-card/90 text-foreground text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10 dark:border-white/5 whitespace-nowrap">
              {option.label}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-xl",
                "border border-white/10 dark:border-white/5",
                option.color,
                theme === option.mode && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/25 shadow-xl"
              )}
              onClick={() => handleThemeChange(option.mode)}
            >
              <option.icon className="w-5 h-5" />
            </Button>
          </div>
        ))}
        
        {/* Color picker toggle */}
        <div 
          className="flex items-center gap-2.5 animate-scale-in"
          style={{ animationDelay: '150ms' }}
        >
          <span className="backdrop-blur-xl bg-card/90 text-foreground text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10 dark:border-white/5 whitespace-nowrap">
            Couleurs
          </span>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-xl",
              "border border-white/10 dark:border-white/5",
              showColors 
                ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/25 shadow-xl" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
            onClick={() => {
              setShowColors(!showColors);
              setShowSavedThemes(false);
              setShowPresetThemes(false);
              setShowSaveForm(false);
            }}
          >
            <Palette className="w-5 h-5" />
          </Button>
        </div>

        {/* Preset themes toggle */}
        <div 
          className="flex items-center gap-2.5 animate-scale-in"
          style={{ animationDelay: '200ms' }}
        >
          <span className="backdrop-blur-xl bg-card/90 text-foreground text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10 dark:border-white/5 whitespace-nowrap">
            Présets
          </span>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-xl",
              "border border-white/10 dark:border-white/5",
              showPresetThemes 
                ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/25 shadow-xl" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
            onClick={() => {
              setShowPresetThemes(!showPresetThemes);
              setShowColors(false);
              setShowSavedThemes(false);
              setShowSaveForm(false);
            }}
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>

        {/* Saved themes toggle */}
        <div 
          className="flex items-center gap-2.5 animate-scale-in"
          style={{ animationDelay: '250ms' }}
        >
          <span className="backdrop-blur-xl bg-card/90 text-foreground text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10 dark:border-white/5 whitespace-nowrap">
            Mes thèmes
          </span>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-xl",
              "border border-white/10 dark:border-white/5",
              showSavedThemes 
                ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/25 shadow-xl" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
            onClick={() => {
              setShowSavedThemes(!showSavedThemes);
              setShowColors(false);
              setShowPresetThemes(false);
              setShowSaveForm(false);
            }}
          >
            <BookMarked className="w-5 h-5" />
          </Button>
        </div>

        {/* Save current theme button */}
        <div 
          className="flex items-center gap-2.5 animate-scale-in"
          style={{ animationDelay: '300ms' }}
        >
          <span className="backdrop-blur-xl bg-card/90 text-foreground text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10 dark:border-white/5 whitespace-nowrap">
            Sauver
          </span>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-xl",
              "border border-white/10 dark:border-white/5",
              showSaveForm 
                ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/25 shadow-xl" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
            onClick={() => {
              setShowSaveForm(!showSaveForm);
              setShowColors(false);
              setShowSavedThemes(false);
              setShowPresetThemes(false);
            }}
          >
            <Save className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Preset themes panel */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out",
        showPresetThemes && isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      )}>
        <div className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-4 sm:p-5 animate-scale-in w-[220px] sm:w-[280px] max-w-[calc(100vw-2rem)] max-h-[320px] sm:max-h-[380px] overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Thèmes prédéfinis</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-[240px] sm:max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {presetThemes.map((preset, index) => (
                <button
                  key={preset.id}
                  className={cn(
                    "group relative flex items-center gap-2 p-3 rounded-2xl",
                    "bg-gradient-to-br from-muted/60 to-muted/30 hover:from-muted hover:to-muted/60",
                    "border border-white/5 hover:border-white/10",
                    "transition-all duration-300 hover:scale-[1.03] hover:shadow-lg text-left",
                    "overflow-hidden"
                  )}
                  onClick={() => handleApplyTheme(preset)}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Hover glow effect */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    preset.accentColor.preview,
                    "blur-xl"
                  )} style={{ opacity: 0.1 }} />
                  
                  <div
                    className={cn(
                      "relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 shadow-lg",
                      "ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300",
                      "flex items-center justify-center",
                      preset.accentColor.preview
                    )}
                  >
                    <span className="text-white text-xs font-bold drop-shadow">
                      {preset.mode === 'light' ? '☀️' : '🌙'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {preset.mode === 'light' ? 'Clair' : 'Sombre'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved themes panel */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out",
        showSavedThemes && isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      )}>
        <div className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-4 sm:p-5 animate-scale-in w-[220px] sm:w-[280px] max-w-[calc(100vw-2rem)] max-h-[280px] sm:max-h-[340px] overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BookMarked className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Mes thèmes</p>
            </div>
            
            {savedThemes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <BookMarked className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Aucun thème sauvegardé</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Créez votre premier thème !</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] sm:max-h-[240px] overflow-y-auto pr-1">
                {savedThemes.map((savedTheme, index) => (
                  <div
                    key={savedTheme.id}
                    className={cn(
                      "group relative flex items-center gap-3 p-3 rounded-2xl",
                      "bg-gradient-to-br from-muted/60 to-muted/30 hover:from-muted hover:to-muted/60",
                      "border border-white/5 hover:border-white/10",
                      "transition-all duration-300 hover:scale-[1.02]"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex-shrink-0 shadow-lg flex items-center justify-center",
                        "ring-2 ring-white/20",
                        savedTheme.accentColor.preview
                      )}
                    >
                      <span className="text-white text-xs drop-shadow">
                        {savedTheme.mode === 'light' ? '☀️' : savedTheme.mode === 'dark' ? '🌙' : '🖥️'}
                      </span>
                    </div>
                    <button
                      className="flex-1 text-left text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                      onClick={() => handleApplyTheme(savedTheme)}
                    >
                      {savedTheme.name}
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={() => handleDeleteTheme(savedTheme.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save theme form panel */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out",
        showSaveForm && isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      )}>
        <div className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-4 sm:p-5 animate-scale-in w-[240px] sm:w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Save className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Sauvegarder le thème</p>
            </div>
            
            {/* Current theme preview */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-white/5 mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex-shrink-0 shadow-lg ring-2 ring-white/20 flex items-center justify-center",
                  accentColor.preview
                )}
              >
                <span className="text-white text-sm drop-shadow">
                  {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🖥️'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{accentColor.name}</p>
                <p className="text-xs text-muted-foreground">
                  {theme === 'light' ? 'Mode clair' : theme === 'dark' ? 'Mode sombre' : 'Mode auto'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Nom du thème..."
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                className="h-10 text-sm bg-muted/50 border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTheme()}
              />
              <Button
                size="icon"
                className={cn(
                  "h-10 w-10 flex-shrink-0 rounded-xl transition-all duration-300",
                  "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25",
                  !newThemeName.trim() && "opacity-50"
                )}
                onClick={handleSaveTheme}
                disabled={!newThemeName.trim()}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className={cn(
          "w-14 h-14 rounded-2xl shadow-xl transition-all duration-500",
          "border border-white/10 dark:border-white/5",
          isOpen 
            ? "bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 rotate-180 scale-95" 
            : "bg-gradient-to-br from-card to-card/80 hover:from-card/90 hover:to-card/70 text-foreground hover:scale-105"
        )}
        style={{ 
          boxShadow: isOpen 
            ? '0 10px 40px -10px hsl(var(--destructive) / 0.5)' 
            : '0 10px 40px -10px hsl(var(--primary) / 0.4)' 
        }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setShowColors(false);
            setShowSavedThemes(false);
            setShowPresetThemes(false);
            setShowSaveForm(false);
          }
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-destructive-foreground" />
        ) : (
          <CurrentIcon className="w-6 h-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-md -z-10 transition-all duration-500"
          onClick={() => {
            setIsOpen(false);
            setShowColors(false);
            setShowSavedThemes(false);
            setShowPresetThemes(false);
            setShowSaveForm(false);
          }}
        />
      )}
    </div>
  );
};