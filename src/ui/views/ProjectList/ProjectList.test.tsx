import { describe, expect, it, vi } from 'vitest'
import { ProjectProvider } from '../../../hooks/useProject'
import { render, screen, userEvent, waitFor } from '../../../test/utils'
import { ProjectList } from './ProjectList'

// Mock the db module
vi.mock('../../../utils/db', () => ({
	listProjects: vi.fn(() =>
		Promise.resolve([
			{
				id: '1',
				name: 'Test Project 1',
				createdAt: Date.now() - 86400000, // 1 day ago
				updatedAt: Date.now() - 3600000, // 1 hour ago
			},
			{
				id: '2',
				name: 'Test Project 2',
				createdAt: Date.now() - 172800000, // 2 days ago
				updatedAt: Date.now() - 7200000, // 2 hours ago
			},
		])
	),
	loadProject: vi.fn((id: string) =>
		Promise.resolve({
			metadata: {
				id,
				name: `Project ${id}`,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
			data: {},
		})
	),
	saveProject: vi.fn(() => Promise.resolve()),
	createNewProject: vi.fn((name: string) => ({
		metadata: {
			id: 'new-id',
			name,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		},
		data: {},
	})),
}))

function renderProjectList() {
	return render(
		<ProjectProvider>
			<ProjectList />
		</ProjectProvider>,
	)
}

describe('ProjectList', () => {
	it('should render the app title and description', async () => {
		renderProjectList()

		await waitFor(() => {
			expect(screen.getByText('Warna')).toBeInTheDocument()
			expect(screen.getByText('Color Palette Utility')).toBeInTheDocument()
		})
	})

	it('should show loading state initially', () => {
		renderProjectList()

		expect(screen.getByText('Loading projects...')).toBeInTheDocument()
	})

	it('should display list of projects after loading', async () => {
		renderProjectList()

		await waitFor(() => {
			expect(screen.getByText('Test Project 1')).toBeInTheDocument()
			expect(screen.getByText('Test Project 2')).toBeInTheDocument()
		})
	})

	it('should show create new project button', async () => {
		renderProjectList()

		await waitFor(() => {
			expect(screen.getByText('+ New Project')).toBeInTheDocument()
		})
	})

	it('should show input field when create button is clicked', async () => {
		const user = userEvent.setup()
		renderProjectList()

		await waitFor(() => {
			expect(screen.getByText('+ New Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('+ New Project'))

		expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument()
		expect(screen.getByText('Create')).toBeInTheDocument()
		expect(screen.getByText('Cancel')).toBeInTheDocument()
	})

	it('should hide input field when cancel is clicked', async () => {
		const user = userEvent.setup()
		renderProjectList()

		await waitFor(() => {
			expect(screen.getByText('+ New Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('+ New Project'))
		expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument()

		await user.click(screen.getByText('Cancel'))
		expect(screen.queryByPlaceholderText('Project name')).not.toBeInTheDocument()
	})

	it('should show "no projects" message when list is empty', async () => {
		const { listProjects } = await import('../../../utils/db')
		vi.mocked(listProjects).mockResolvedValueOnce([])

		renderProjectList()

		await waitFor(() => {
			expect(screen.getByText(/No projects yet/i)).toBeInTheDocument()
		})
	})
})
