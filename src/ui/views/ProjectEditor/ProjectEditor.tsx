import { useEffect, useState } from 'react'
import { useProject } from '../../../hooks/useProject'
import type { WindowInstance } from '../../../types'
import { saveProject } from '../../../utils/db'
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
					isFullscreen: false,
					name: 'Debug Window',
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
	const focusedFullscreenWindowId = currentProject.data.windowConfig?.focusedFullscreenWindowId

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
					focusedFullscreenWindowId,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleUpdateWindow(id: string, updates: Partial<WindowInstance>) {
		const updatedWindows = windows.map((w) => (w.id === id ? { ...w, ...updates } : w))

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
					focusedFullscreenWindowId,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleCloseWindow(id: string) {
		const updatedWindows = windows.filter((w) => w.id !== id)
		let newFocusedId = focusedFullscreenWindowId

		// If closing the focused fullscreen window, focus the next one
		if (focusedFullscreenWindowId === id) {
			const remainingFullscreen = updatedWindows.filter((w) => w.isFullscreen)
			newFocusedId = remainingFullscreen.length > 0 ? remainingFullscreen[0].id : undefined
		}

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
					focusedFullscreenWindowId: newFocusedId,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleToggleFullscreen(id: string) {
		const window = windows.find((w) => w.id === id)
		if (!window) { return }

		const isGoingFullscreen = !window.isFullscreen

		let updatedWindows: WindowInstance[]
		let newFocusedId: string | undefined

		if (isGoingFullscreen) {
			// Remove from current position and add to end with fullscreen=true
			const otherWindows = windows.filter((w) => w.id !== id)
			const fullscreenWindow = { ...window, isFullscreen: true }
			updatedWindows = [...otherWindows, fullscreenWindow]
			newFocusedId = id // Focus the newly fullscreened window
		} else {
			// Just toggle fullscreen off, maintain position
			updatedWindows = windows.map((w) => w.id === id ? { ...w, isFullscreen: false } : w)
			// Clear focus if this was the focused window
			newFocusedId = focusedFullscreenWindowId === id ? undefined : focusedFullscreenWindowId
		}

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
					focusedFullscreenWindowId: newFocusedId,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleFocusWindow(id: string) {
		const updatedProject = {
			...currentProject,
			metadata: {
				...currentProject.metadata,
				updatedAt: Date.now(),
			},
			data: {
				...currentProject.data,
				windowConfig: {
					windows,
					focusedFullscreenWindowId: id,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleReorderWindows(reorderedFullscreenWindows: WindowInstance[]) {
		// Merge reordered fullscreen windows with unchanged floating windows
		const floatingWindows = windows.filter((w) => !w.isFullscreen)
		const updatedWindows = [...floatingWindows, ...reorderedFullscreenWindows]

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
					focusedFullscreenWindowId,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	const hasFullscreenWindows = windows.some((w) => w.isFullscreen)

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Menu bar - always visible */}
			<div
				className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between sticky top-0"
				style={{ zIndex: 100 }}
			>
				<div className="flex items-center gap-4">
					<button
						onClick={handleCloseProject}
						className="hover:bg-gray-700 px-2 py-1 rounded text-sm transition-colors"
					>
						← Back
					</button>
					<span className="text-gray-400">|</span>
					{!isEditingName
						? (
							<button
								onClick={() => {
									setIsEditingName(true)
									setEditedName(currentProject.metadata.name)
								}}
								className="font-semibold hover:text-gray-300 transition-colors"
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
									className="bg-gray-700 text-white border-gray-600"
								/>
								<button
									onClick={() => void handleSaveName()}
									disabled={!editedName.trim() || saving}
									className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
								>
									{saving ? 'Saving...' : 'Save'}
								</button>
								<button
									onClick={() => {
										setIsEditingName(false)
										setEditedName(currentProject.metadata.name)
									}}
									disabled={saving}
									className="px-2 py-1 hover:bg-gray-700 rounded text-sm"
								>
									Cancel
								</button>
							</div>
						)}
					<span className="text-gray-400">|</span>
					<div className="flex gap-2 text-sm">
						<button className="hover:bg-gray-700 px-2 py-1 rounded">File</button>
						<button className="hover:bg-gray-700 px-2 py-1 rounded">Edit</button>
						<button className="hover:bg-gray-700 px-2 py-1 rounded">View</button>
					</div>
				</div>
				<div className="text-sm text-gray-400">
					{new Date(currentProject.metadata.updatedAt).toLocaleString()}
				</div>
			</div>

			<main className={`${hasFullscreenWindows ? '' : 'max-w-7xl mx-auto px-4 py-8'} flex-1`}>
				{!hasFullscreenWindows && (
					<div className="bg-white rounded-lg shadow-sm p-8">
						<div className="text-center text-gray-500">
							<p className="text-lg mb-2">Project Editor</p>
							<p className="text-sm">
								Color editing interface will be implemented here.
							</p>
						</div>
					</div>
				)}
			</main>

			{/* Render windows outside of main to maintain consistent coordinate space */}
			<WindowRenderer
				windows={windows}
				focusedFullscreenWindowId={focusedFullscreenWindowId}
				onPositionChange={handleWindowPositionChange}
				onAddWindow={handleAddWindow}
				onUpdateWindow={handleUpdateWindow}
				onReorderWindows={handleReorderWindows}
				onClose={handleCloseWindow}
				onToggleFullscreen={handleToggleFullscreen}
				onFocusWindow={handleFocusWindow}
			/>
		</div>
	)
}
