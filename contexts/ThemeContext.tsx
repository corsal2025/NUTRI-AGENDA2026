// Theme context for managing light/dark mode
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors } from '../constants/theme';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
    setDarkMode: (value: boolean) => void;
    colors: typeof LightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@nutriagenda_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const saveTheme = async (isDark: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        saveTheme(newValue);
    };

    const setDarkMode = (value: boolean) => {
        setIsDarkMode(value);
        saveTheme(value);
    };

    const colors = isDarkMode ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setDarkMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
