import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ProjectProvider, useProject } from '../../../hooks/useProject'
import { render, screen, userEvent, waitFor } from '../../../test/utils'
import type { SavedProject } from '../../../types'
import { ProjectEditor } from './ProjectEditor'

// Mock the db module
vi.mock('../../../utils/db', () => ({
	saveProject: vi.fn(() => Promise.resolve()),
}))

const mockProject: SavedProject = {
	metadata: {
		id: 'test-id',
		name: 'Test Project',
		createdAt: Date.now() - 86400000,
		updatedAt: Date.now() - 3600000,
	},
	data: {
		swatches: {},
	},
}

function renderProjectEditor(project: SavedProject) {
	// Custom wrapper that provides the project
	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<ProjectProvider>
				<ProjectEditorWithContext project={project}>
					{children}
				</ProjectEditorWithContext>
			</ProjectProvider>
		)
	}

	return render(<ProjectEditor />, { wrapper: Wrapper })
}

// Helper component to set the current project
function ProjectEditorWithContext({
	project,
	children,
}: {
	project: SavedProject
	children: React.ReactNode
}) {
	const { setCurrentProject } = useProject()

	// Set the project on mount
	React.useEffect(() => {
		setCurrentProject(project)
	}, [setCurrentProject, project])

	return <>{children}</>
}

describe('ProjectEditor', () => {
	it('should render the project name', () => {
		renderProjectEditor(mockProject)

		expect(screen.getByText('Test Project')).toBeInTheDocument()
	})

	it('should render back button', () => {
		renderProjectEditor(mockProject)

		expect(screen.getByText('← Back')).toBeInTheDocument()
	})

	it('should show last updated timestamp', () => {
		renderProjectEditor(mockProject)

		// Check for the formatted timestamp in the top right
		expect(screen.getByText(/11\/20\/2025/)).toBeInTheDocument()
	})

	it('should show input field when project name is clicked', async () => {
		const user = userEvent.setup()
		renderProjectEditor(mockProject)

		const projectNameButton = screen.getByText('Test Project')
		await user.click(projectNameButton)

		expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
		expect(screen.getByText('Save')).toBeInTheDocument()
		expect(screen.getByText('Cancel')).toBeInTheDocument()
	})

	it('should save new project name when save is clicked', async () => {
		const { saveProject } = await import('../../../utils/db')
		const user = userEvent.setup()
		renderProjectEditor(mockProject)

		// Click to edit
		const projectNameButton = screen.getByText('Test Project')
		await user.click(projectNameButton)

		// Change the name
		const input = screen.getByDisplayValue('Test Project')
		await user.clear(input)
		await user.type(input, 'Updated Project')

		// Save
		await user.click(screen.getByText('Save'))

		await waitFor(() => {
			expect(saveProject).toHaveBeenCalled()
		})
	})

	it('should cancel editing when cancel is clicked', async () => {
		const user = userEvent.setup()
		renderProjectEditor(mockProject)

		// Click to edit
		const projectNameButton = screen.getByText('Test Project')
		await user.click(projectNameButton)

		// Change the name
		const input = screen.getByDisplayValue('Test Project')
		await user.clear(input)
		await user.type(input, 'Updated Project')

		// Cancel
		await user.click(screen.getByText('Cancel'))

		// Should show original name
		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})
	})

	it('should show placeholder content', () => {
		renderProjectEditor(mockProject)

		expect(screen.getByText('Project Editor')).toBeInTheDocument()
		expect(screen.getByText(/Color editing interface will be implemented here/)).toBeInTheDocument()
	})
})
