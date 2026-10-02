import { createContext, useContext, useLayoutEffect, useState } from 'react';
import { APP_CONFIG } from '@/config/app.config';

const ThemeContext = createContext();
function readStoredTheme() { try { return localStorage.getItem('app-theme'); } catch { return null; } }
function writeStoredTheme(theme) { try { localStorage.setItem('app-theme', theme); } catch {} }
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStoredTheme() || APP_CONFIG.defaultTheme || 'system');
  useLayoutEffect(() => {
    writeStoredTheme(theme);
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    apply();
    if (theme === 'system') { const mq = window.matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', apply); return () => mq.removeEventListener('change', apply); }
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
