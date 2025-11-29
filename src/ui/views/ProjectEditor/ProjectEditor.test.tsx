import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fullProjectAtom } from '../../../atoms/project'
import { ThemeProvider } from '../../../hooks/useTheme'
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

function HydrateAtoms({
	children,
	initialValues,
}: {
	children: React.ReactNode
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initialValues: [any, any][]
}) {
	useHydrateAtoms(initialValues)
	return <>{children}</>
}

function renderProjectEditor(project: SavedProject) {
	return render(
		<Provider>
			<HydrateAtoms initialValues={[[fullProjectAtom, project]]}>
				<ThemeProvider>
					<ProjectEditor />
				</ThemeProvider>
			</HydrateAtoms>
		</Provider>,
	)
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
		// Use a regex pattern to match date format (flexible for different locales)
		expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument()
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

	it('should show overview window by default', () => {
		renderProjectEditor(mockProject)

		// The default full-screen overview window should be rendered
		expect(screen.getByText('Overview')).toBeInTheDocument()
	})
})
