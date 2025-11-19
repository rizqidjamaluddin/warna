import { describe, expect, it } from 'vitest'
import App from './App'
import { render, screen } from './test/utils'

describe('App', () => {
	it('should render the app title', () => {
		render(<App />)

		expect(screen.getByText('Warna')).toBeInTheDocument()
	})

	it('should render the subtitle', () => {
		render(<App />)

		expect(screen.getByText('Color Palette Utility')).toBeInTheDocument()
	})

	it('should render the welcome message', () => {
		render(<App />)

		expect(screen.getByText(/Welcome to Warna/i)).toBeInTheDocument()
	})
})
