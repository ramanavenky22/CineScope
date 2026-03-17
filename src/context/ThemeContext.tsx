import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider, PaletteMode, CssBaseline } from '@mui/material';

type ThemeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeContextValue | undefined>(undefined);

type AppThemeProviderProps = {
  children: React.ReactNode;
};

const STORAGE_KEY = 'cinescope-theme-mode';

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as PaletteMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#ff6b81'
          },
          secondary: {
            main: '#3f51b5'
          },
          background: {
            default: mode === 'dark' ? '#050815' : '#f5f7ff',
            paper: mode === 'dark' ? '#0c1024' : '#ffffff'
          }
        },
        shape: {
          borderRadius: 14
        }
      }),
    [mode]
  );

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return ctx;
};

