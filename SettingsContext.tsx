import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, ChatWallpaper, ThemeMode } from '../types/chat';

interface SettingsContextType {
  settings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  setWallpaper: (wallpaper: ChatWallpaper) => void;
  setEnterToSend: (val: boolean) => void;
  setSoundNotifications: (val: boolean) => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  wallpaper: 'pattern',
  enterToSend: true,
  soundNotifications: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('chatflow_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chatflow_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }

    // Apply dark / light class to root
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const setTheme = (theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setWallpaper = (wallpaper: ChatWallpaper) => {
    setSettings((prev) => ({ ...prev, wallpaper }));
  };

  const setEnterToSend = (enterToSend: boolean) => {
    setSettings((prev) => ({ ...prev, enterToSend }));
  };

  const setSoundNotifications = (soundNotifications: boolean) => {
    setSettings((prev) => ({ ...prev, soundNotifications }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setTheme,
        setWallpaper,
        setEnterToSend,
        setSoundNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
