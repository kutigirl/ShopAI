// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LIGHT_COLORS, DARK_COLORS, SIZES, FONTS } from '@constants/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof LIGHT_COLORS;
  sizes: typeof SIZES;
  fonts: typeof FONTS;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: LIGHT_COLORS,
  sizes: SIZES,
  fonts: FONTS,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
        sizes: SIZES,
        fonts: FONTS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
