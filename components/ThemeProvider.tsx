'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = {
    name: string;
    primary: string; // 600
    dark: string;    // 700
    light: string;   // 50
};

export const THEMES: Record<string, ThemeColor> = {
    blue: { name: 'Blue', primary: '#2563eb', dark: '#1d4ed8', light: '#eff6ff' },
    indigo: { name: 'Indigo', primary: '#4f46e5', dark: '#4338ca', light: '#eef2ff' },
    purple: { name: 'Purple', primary: '#7c3aed', dark: '#6d28d9', light: '#f5f3ff' },
    pink: { name: 'Pink', primary: '#db2777', dark: '#be185d', light: '#fdf2f8' },
    red: { name: 'Red', primary: '#dc2626', dark: '#b91c1c', light: '#fef2f2' },
    orange: { name: 'Orange', primary: '#ea580c', dark: '#c2410c', light: '#fff7ed' },
    green: { name: 'Green', primary: '#16a34a', dark: '#15803d', light: '#f0fdf4' },
    cyan: { name: 'Cyan', primary: '#0891b2', dark: '#0e7490', light: '#ecfeff' },
    slate: { name: 'Dark', primary: '#18181b', dark: '#09090b', light: '#f8fafc' },
};

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    availableThemes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState('blue');

    useEffect(() => {
        const savedTheme = localStorage.getItem('formcraft_global_theme');
        if (savedTheme && THEMES[savedTheme]) {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        } else {
            applyTheme('blue');
        }
    }, []);

    const applyTheme = (themeName: string) => {
        const root = document.documentElement;
        const selectedTheme = THEMES[themeName];

        root.style.setProperty('--primary-600', selectedTheme.primary);
        root.style.setProperty('--primary-700', selectedTheme.dark);
        root.style.setProperty('--primary-50', selectedTheme.light);
    };

    const setTheme = (newTheme: string) => {
        if (THEMES[newTheme]) {
            setThemeState(newTheme);
            localStorage.setItem('formcraft_global_theme', newTheme);
            applyTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
