import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db, ensureSeeded } from '@/db/db';
import type { AppSettings, Language, UserProfile } from '@/types';

interface AppStateContextValue {
  loading: boolean;
  profile: UserProfile | null;
  settings: AppSettings | null;
  language: Language;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const refreshProfile = useCallback(async () => {
    const p = await db.userProfile.get('singleton');
    setProfile(p ?? null);
  }, []);

  const refreshSettings = useCallback(async () => {
    const s = await db.appSettings.get('singleton');
    setSettings(s ?? null);
  }, []);

  useEffect(() => {
    (async () => {
      await ensureSeeded();
      await refreshProfile();
      await refreshSettings();
      setLoading(false);
    })();
  }, [refreshProfile, refreshSettings]);

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    await db.userProfile.update('singleton', patch);
    await refreshProfile();
  }, [refreshProfile]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    await db.appSettings.update('singleton', patch);
    await refreshSettings();
  }, [refreshSettings]);

  // Apply theme to <html> element
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    const apply = (mode: 'light' | 'dark') => root.classList.toggle('dark', mode === 'dark');
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
    apply(settings.theme);
  }, [settings]);

  // Apply font size
  useEffect(() => {
    if (!settings) return;
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      loading,
      profile,
      settings,
      language: profile?.language ?? 'bilingual',
      refreshProfile,
      refreshSettings,
      updateProfile,
      updateSettings
    }),
    [loading, profile, settings, refreshProfile, refreshSettings, updateProfile, updateSettings]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
