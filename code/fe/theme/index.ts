import React, { useContext } from 'react';
import { configStore } from '../store/configStore';
import { AppStyle } from './AppStyle';
import { DarkTheme } from './DarkTheme';
import { LightTheme } from './LightTheme';
export const getTheme = (name: string): typeof AppStyle => {
  return name.toLowerCase() == 'dark' ? DarkTheme : LightTheme;
};
export const ThemeContext = React.createContext(LightTheme);
export const useTheme = (): typeof AppStyle => {
  return useContext(ThemeContext);
};

export const setTheme = (name: string) => {
  configStore.update((s) => {
    s.theme = name;
  });
};



export { AppStyle };
