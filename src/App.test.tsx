import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { render, screen, waitFor } from './test/utils'

// Mock the db module to return empty projects
vi.mock('./utils/db', () => ({
	listProjects: vi.fn(() => Promise.resolve([])),
	loadProject: vi.fn(() => Promise.resolve(undefined)),
	saveProject: vi.fn(() => Promise.resolve()),
	createNewProject: vi.fn((name: string) => ({
		metadata: {
			id: 'test-id',
			name,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		},
		data: {
			swatches: {},
		},
	})),
}))

describe('App', () => {
	it('should render ProjectList view when no project is loaded', async () => {
		render(<App />)

		// Should show loading first
		expect(screen.getByText('Loading projects...')).toBeInTheDocument()

		// Then show the project list view
		await waitFor(() => {
			expect(screen.getByText('Warna')).toBeInTheDocument()
			expect(screen.getByText('Create New Project')).toBeInTheDocument()
		})
	})
})
