import { useEffect, useState } from 'react'
import { useProject } from '../../../hooks/useProject'
import type { WindowInstance } from '../../../types'
import { saveProject } from '../../../utils/db'
import { Button } from '../../Button'
import { Input } from '../../Input'
import { WindowRenderer } from '../../windows/WindowRenderer'

export function ProjectEditor() {
	const { currentProject, setCurrentProject } = useProject()
	const [isEditingName, setIsEditingName] = useState(false)
	const [editedName, setEditedName] = useState(currentProject?.metadata.name ?? '')
	const [saving, setSaving] = useState(false)

	// Initialize windows if not present
	useEffect(() => {
		if (currentProject && !currentProject.data.windowConfig?.windows) {
			const initialWindows: WindowInstance[] = [
				{
					id: crypto.randomUUID(),
					type: 'debug',
					x: 100,
					y: 100,
				},
			]

			const updatedProject = {
				...currentProject,
				metadata: {
					...currentProject.metadata,
					updatedAt: Date.now(),
				},
				data: {
					...currentProject.data,
					windowConfig: {
						windows: initialWindows,
					},
				},
			}

			setCurrentProject(updatedProject)
			void saveProject(updatedProject)
		}
	}, [currentProject, setCurrentProject])

	if (!currentProject) {
		return null
	}

	const windows: WindowInstance[] = currentProject.data.windowConfig?.windows ?? []

	async function handleSaveName() {
		if (!editedName.trim() || !currentProject) { return }

		try {
			setSaving(true)
			const updatedProject = {
				...currentProject,
				metadata: {
					...currentProject.metadata,
					name: editedName.trim(),
					updatedAt: Date.now(),
				},
			}
			await saveProject(updatedProject)
			setCurrentProject(updatedProject)
			setIsEditingName(false)
		} catch (error) {
			console.error('Failed to save project name:', error)
		} finally {
			setSaving(false)
		}
	}

	function handleCloseProject() {
		setCurrentProject(null)
	}

	function handleWindowPositionChange(id: string, x: number, y: number) {
		const updatedWindows = windows.map((window) => window.id === id ? { ...window, x, y } : window)

		const updatedProject = {
			...currentProject,
			metadata: {
				...currentProject.metadata,
				updatedAt: Date.now(),
			},
			data: {
				...currentProject.data,
				windowConfig: {
					windows: updatedWindows,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleAddWindow(newWindow: WindowInstance) {
		const updatedWindows = [...windows, newWindow]

		const updatedProject = {
			...currentProject,
			metadata: {
				...currentProject.metadata,
				updatedAt: Date.now(),
			},
			data: {
				...currentProject.data,
				windowConfig: {
					windows: updatedWindows,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" onClick={handleCloseProject}>
							← Back
						</Button>
						{!isEditingName
							? (
								<button
									onClick={() => {
										setIsEditingName(true)
										setEditedName(currentProject.metadata.name)
									}}
									className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
								>
									{currentProject.metadata.name}
								</button>
							)
							: (
								<div className="flex items-center gap-2">
									<Input
										value={editedName}
										onChange={e => setEditedName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												void handleSaveName()
											} else if (e.key === 'Escape') {
												setIsEditingName(false)
												setEditedName(currentProject.metadata.name)
											}
										}}
										autoFocus
										disabled={saving}
									/>
									<Button
										onClick={() => void handleSaveName()}
										disabled={!editedName.trim() || saving}
										size="sm"
									>
										{saving ? 'Saving...' : 'Save'}
									</Button>
									<Button
										variant="ghost"
										onClick={() => {
											setIsEditingName(false)
											setEditedName(currentProject.metadata.name)
										}}
										disabled={saving}
										size="sm"
									>
										Cancel
									</Button>
								</div>
							)}
					</div>
					<div className="text-sm text-gray-500">
						Last updated: {new Date(currentProject.metadata.updatedAt).toLocaleString()}
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-sm p-8">
					<div className="text-center text-gray-500">
						<p className="text-lg mb-2">Project Editor</p>
						<p className="text-sm">
							Color editing interface will be implemented here.
						</p>
					</div>
				</div>
			</main>

			<WindowRenderer
				windows={windows}
				onPositionChange={handleWindowPositionChange}
				onAddWindow={handleAddWindow}
			/>
		</div>
	)
}
