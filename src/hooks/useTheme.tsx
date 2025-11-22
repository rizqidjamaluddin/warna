import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		// Check localStorage first
		const stored = localStorage.getItem('warna-theme')
		if (stored === 'light' || stored === 'dark') {
			return stored
		}
		// Default to light
		return 'light'
	})

	useEffect(() => {
		// Apply theme to document root using Tailwind's dark mode class strategy
		if (theme === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
		// Save to localStorage
		localStorage.setItem('warna-theme', theme)
	}, [theme])

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme)
	}

	const toggleTheme = () => {
		setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
