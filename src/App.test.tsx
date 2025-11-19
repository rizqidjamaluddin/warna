import { describe, expect, it } from 'vitest'
import App from './App'
import { render, screen, waitFor } from './test/utils'

describe('App', () => {
	it('should render the project list by default', async () => {
		render(<App />)

		// Should show loading first
		expect(screen.getByText('Loading projects...')).toBeInTheDocument()

		// Then show the project list
		await waitFor(() => {
			expect(screen.getByText('Warna')).toBeInTheDocument()
			expect(screen.getByText('Create New Project')).toBeInTheDocument()
			expect(screen.getByText('Your Projects')).toBeInTheDocument()
		})
	})

	it('should show new project button', async () => {
		render(<App />)

		await waitFor(() => {
			expect(screen.getByText('+ New Project')).toBeInTheDocument()
		})
	})
})
