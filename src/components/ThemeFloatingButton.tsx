import { useState, useEffect } from 'react';
import { Moon, Sun, Palette, Monitor, X, Check, Save, Trash2, BookMarked, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const presetThemes: SavedTheme[] = [
  { id: 'preset-material', name: 'Material', mode: 'light', accentColor: { name: 'Material Blue', hue: 210, saturation: 79, lightness: 46, preview: 'bg-[hsl(210,79%,46%)]' }, isPreset: true },
  { id: 'preset-material-dark', name: 'Material Dark', mode: 'dark', accentColor: { name: 'Material Teal', hue: 174, saturation: 100, lightness: 29, preview: 'bg-[hsl(174,100%,29%)]' }, isPreset: true },
  { id: 'preset-nord', name: 'Nord', mode: 'dark', accentColor: { name: 'Nord Frost', hue: 193, saturation: 43, lightness: 67, preview: 'bg-[hsl(193,43%,67%)]' }, isPreset: true },
  { id: 'preset-dracula', name: 'Dracula', mode: 'dark', accentColor: { name: 'Dracula Purple', hue: 265, saturation: 89, lightness: 78, preview: 'bg-[hsl(265,89%,78%)]' }, isPreset: true },
  { id: 'preset-solarized', name: 'Solarized', mode: 'light', accentColor: { name: 'Solarized Blue', hue: 205, saturation: 69, lightness: 49, preview: 'bg-[hsl(205,69%,49%)]' }, isPreset: true },
  { id: 'preset-github', name: 'GitHub', mode: 'light', accentColor: { name: 'GitHub Blue', hue: 215, saturation: 50, lightness: 50, preview: 'bg-[hsl(215,50%,50%)]' }, isPreset: true },
];

export const ThemeFloatingButton = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme-mode') as ThemeMode) || 'auto';
    }
    return 'auto';
  });
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accent-color');
      if (saved) { try { return JSON.parse(saved); } catch { return accentColors[0]; } }
    }
    return accentColors[0];
  });
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved-themes');
      if (saved) { try { return JSON.parse(saved); } catch { return []; } }
    }
    return [];
  });
  const [newThemeName, setNewThemeName] = useState('');

  const applyTheme = (mode: ThemeMode) => {
    let isDark = mode === 'auto' ? window.matchMedia('(prefers-color-scheme: dark)').matches : mode === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  };

  const applyAccentColor = (color: AccentColor) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const lightness = isDark ? color.lightness + 7 : color.lightness;
    root.style.setProperty('--primary', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--ring', `${color.hue} ${color.saturation}% ${lightness}%`);
    const accentHue = (color.hue + 24) % 360;
    root.style.setProperty('--accent', `${accentHue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--sidebar-primary', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--sidebar-ring', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--chart-1', `${color.hue} ${color.saturation}% ${lightness}%`);
    root.style.setProperty('--chart-5', `${accentHue} ${color.saturation}% ${lightness}%`);
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme-mode', theme);
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => { applyTheme('auto'); applyAccentColor(accentColor); };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme, accentColor]);

  useEffect(() => {
    applyAccentColor(accentColor);
    localStorage.setItem('accent-color', JSON.stringify(accentColor));
  }, [accentColor]);

  const handleSaveTheme = () => {
    if (!newThemeName.trim()) return;
    const newT: SavedTheme = { id: Date.now().toString(), name: newThemeName.trim(), mode: theme, accentColor };
    const updated = [...savedThemes, newT];
    setSavedThemes(updated);
    localStorage.setItem('saved-themes', JSON.stringify(updated));
    setNewThemeName('');
  };

  const handleDeleteTheme = (id: string) => {
    const updated = savedThemes.filter(t => t.id !== id);
    setSavedThemes(updated);
    localStorage.setItem('saved-themes', JSON.stringify(updated));
  };

  const handleApplyTheme = (t: SavedTheme) => {
    setTheme(t.mode);
    setAccentColor(t.accentColor);
  };

  const themeIcons = { light: Sun, dark: Moon, auto: Monitor };
  const CurrentIcon = themeIcons[theme];

  return (
    <div className="fixed bottom-20 right-4 z-30 lg:bottom-6 lg:right-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="w-10 h-10 rounded-full shadow-md bg-card/90 backdrop-blur-sm border-border/50 hover:bg-muted"
          >
            <CurrentIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-72 p-0 mb-2">
          <Tabs defaultValue="mode" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-b-none">
              <TabsTrigger value="mode" className="text-xs">Mode</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">Couleurs</TabsTrigger>
              <TabsTrigger value="presets" className="text-xs">Présets</TabsTrigger>
            </TabsList>

            <TabsContent value="mode" className="p-3 space-y-2 mt-0">
              {(['light', 'dark', 'auto'] as ThemeMode[]).map(m => {
                const Icon = themeIcons[m];
                const labels = { light: 'Clair', dark: 'Sombre', auto: 'Auto' };
                return (
                  <button
                    key={m}
                    onClick={() => setTheme(m)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      theme === m ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{labels[m]}</span>
                    {theme === m && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent value="colors" className="p-3 mt-0">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {accentColors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setAccentColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-xl transition-all", c.preview,
                      "flex items-center justify-center",
                      accentColor.name === c.name ? "ring-2 ring-offset-2 ring-offset-card ring-foreground/50 scale-110" : "hover:scale-105"
                    )}
                    title={c.name}
                  >
                    {accentColor.name === c.name && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={cn("w-3 h-3 rounded-full", accentColor.preview)} />
                <span>{accentColor.name}</span>
              </div>
            </TabsContent>

            <TabsContent value="presets" className="mt-0">
              <ScrollArea className="h-56 p-3">
                <div className="space-y-1.5">
                  {presetThemes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyTheme(t)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
                    >
                      <div className={cn("w-5 h-5 rounded-full", t.accentColor.preview)} />
                      <span className="flex-1 text-left">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground">{t.mode === 'dark' ? '🌙' : '☀️'}</span>
                    </button>
                  ))}
                  {savedThemes.length > 0 && (
                    <>
                      <div className="text-xs font-medium text-muted-foreground pt-2 pb-1">Mes thèmes</div>
                      {savedThemes.map(t => (
                        <div key={t.id} className="flex items-center gap-1">
                          <button
                            onClick={() => handleApplyTheme(t)}
                            className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
                          >
                            <div className={cn("w-5 h-5 rounded-full", t.accentColor.preview)} />
                            <span className="flex-1 text-left">{t.name}</span>
                          </button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteTheme(t.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Input
                    value={newThemeName}
                    onChange={e => setNewThemeName(e.target.value)}
                    placeholder="Nom du thème"
                    className="h-8 text-xs"
                    onKeyDown={e => e.key === 'Enter' && handleSaveTheme()}
                  />
                  <Button size="sm" className="h-8 text-xs" onClick={handleSaveTheme} disabled={!newThemeName.trim()}>
                    <Save className="w-3 h-3 mr-1" /> Sauver
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
};
