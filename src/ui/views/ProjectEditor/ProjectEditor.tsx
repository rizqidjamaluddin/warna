import { Menubar } from 'radix-ui'
import { useEffect, useRef, useState } from 'react'
import { useProject } from '../../../hooks/useProject'
import type { WindowInstance } from '../../../types'
import { saveProject } from '../../../utils/db'
import { Input } from '../../Input'
import { Prompt } from '../../Prompt'
import { WindowRenderer } from '../../windows/WindowRenderer'

export function ProjectEditor() {
	const { currentProject, setCurrentProject } = useProject()
	const [isEditingName, setIsEditingName] = useState(false)
	const [saving, setSaving] = useState(false)
	const menuBarRef = useRef<HTMLDivElement>(null)
	const [menuBarHeight, setMenuBarHeight] = useState(42) // Default fallback
	const tabPositionsRef = useRef<{ id: string; left: number; right: number }[]>([])
	const [floatingWindowZOrder, setFloatingWindowZOrder] = useState<string[]>([])

	// Measure menu bar height with ResizeObserver for future-proofing
	useEffect(() => {
		if (!menuBarRef.current) { return }

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setMenuBarHeight(entry.contentRect.height)
			}
		})

		resizeObserver.observe(menuBarRef.current)

		return () => resizeObserver.disconnect()
	}, [])

	// Initialize z-order for floating windows
	useEffect(() => {
		if (!currentProject) { return }

		const allWindows = currentProject.data.windowConfig?.windows ?? []
		const floatingWindows = allWindows.filter((w) => !w.isFullscreen)
		const currentIds = floatingWindows.map((w) => w.id)

		// Only update if the set of floating windows changed
		const currentSet = new Set(currentIds)
		const zOrderSet = new Set(floatingWindowZOrder)
		const hasChanged = currentIds.length !== floatingWindowZOrder.length
			|| currentIds.some((id) => !zOrderSet.has(id))

		if (hasChanged) {
			// Preserve existing order, add new windows to end
			const newZOrder = floatingWindowZOrder.filter((id) => currentSet.has(id))
			currentIds.forEach((id) => {
				if (!zOrderSet.has(id)) {
					newZOrder.push(id)
				}
			})
			setFloatingWindowZOrder(newZOrder)
		}
	}, [currentProject, floatingWindowZOrder])

	// Initialize windows if not present
	useEffect(() => {
		if (currentProject && !currentProject.data.windowConfig?.windows) {
			const initialWindows: WindowInstance[] = [
				{
					id: crypto.randomUUID(),
					type: 'debug',
					title: 'Debug Window',
					x: 100,
					y: 100,
					width: 300,
					height: 200,
					isFullscreen: false,
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

	// Calculate max dimensions (80% of viewport)
	const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1000
	const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 800
	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

	// Ensure all windows have required fields for backwards compatibility and clamp to viewport size
	const windows: WindowInstance[] = (currentProject.data.windowConfig?.windows ?? []).map((win) => {
		const clampedWidth = Math.min(win.width ?? 300, maxWidth)
		const clampedHeight = Math.min(win.height ?? 200, maxHeight)

		return {
			...win,
			title: win.title ?? 'Untitled Window',
			width: clampedWidth,
			height: clampedHeight,
			// Clamp position to keep windows on-screen and below menu bar
			x: Math.max(0, Math.min(win.x, viewportWidth - clampedWidth)),
			y: Math.max(menuBarHeight, Math.min(win.y, viewportHeight - clampedHeight)),
		}
	})
	const focusedFullscreenWindowId = currentProject.data.windowConfig?.focusedFullscreenWindowId

	async function handleSaveName(data: { name: string }) {
		if (!data.name.trim() || !currentProject) { return }

		try {
			setSaving(true)
			const updatedProject = {
				...currentProject,
				metadata: {
					...currentProject.metadata,
					name: data.name.trim(),
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

	function handleBringToFront(id: string) {
		// Move window to end of z-order (lightweight, no database save)
		setFloatingWindowZOrder((prev) => {
			const filtered = prev.filter((wId) => wId !== id)
			return [...filtered, id]
		})
	}

	function handleWindowPositionChange(id: string, x: number, y: number) {
		if (!currentProject) { return }

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
					focusedFullscreenWindowId,
				},
			},
		}

		setCurrentProject(updatedProject)
		void saveProject(updatedProject)
	}

	function handleWindowResize(id: string, width: number, height: number) {
		if (!currentProject) { return }

		const updatedWindows = windows.map((window) => window.id === id ? { ...window, width, height } : window)

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

	function handleAddWindow(newWindow: WindowInstance) {
		if (!currentProject) { return }

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
		if (!currentProject) { return }

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
		if (!currentProject) { return }

		const updatedWindows = windows.filter((w) => w.id !== id)
		let newFocusedId: string | undefined = focusedFullscreenWindowId

		// If closing the focused fullscreen window, focus the next or previous one
		if (focusedFullscreenWindowId === id) {
			const fullscreenWindows = windows.filter((w) => w.isFullscreen)
			const currentIndex = fullscreenWindows.findIndex((w) => w.id === id)
			const remainingFullscreen = updatedWindows.filter((w) => w.isFullscreen)

			if (remainingFullscreen.length > 0) {
				// Try next tab first, then previous tab
				const nextIndex = currentIndex
				const prevIndex = currentIndex - 1

				if (nextIndex < remainingFullscreen.length) {
					newFocusedId = remainingFullscreen[nextIndex].id
				} else if (prevIndex >= 0) {
					newFocusedId = remainingFullscreen[prevIndex].id
				} else {
					// Defensive: should never reach here if length > 0
					newFocusedId = remainingFullscreen[0].id
				}
			} else {
				newFocusedId = undefined
			}
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

	function handleToggleFullscreen(id: string, x?: number, y?: number) {
		if (!currentProject) { return }

		const targetWindow = windows.find((w) => w.id === id)
		if (!targetWindow) { return }

		const isGoingFullscreen = !targetWindow.isFullscreen

		let updatedWindows: WindowInstance[]
		let newFocusedId: string | undefined

		if (isGoingFullscreen) {
			// Remove from current position
			const otherWindows = windows.filter((w) => w.id !== id)
			const fullscreenWindow = { ...targetWindow, isFullscreen: true }

			// If cursor X provided, calculate insertion position based on actual tab positions
			if (x !== undefined) {
				const fullscreenWindows = otherWindows.filter((w) => w.isFullscreen)
				const floatingWindows = otherWindows.filter((w) => !w.isFullscreen)

				let insertIndex = fullscreenWindows.length // Default to end

				// Find which tab the cursor is over
				for (let i = 0; i < tabPositionsRef.current.length; i++) {
					const tabPos = tabPositionsRef.current[i]
					if (x >= tabPos.left && x <= tabPos.right) {
						// Cursor is over this tab
						const tabCenter = (tabPos.left + tabPos.right) / 2
						if (x < tabCenter) {
							// On left side of tab, insert before it
							insertIndex = i
						} else {
							// On right side of tab, insert after it
							insertIndex = i + 1
						}
						break
					}
				}

				// Insert at calculated position
				const updatedFullscreen = [
					...fullscreenWindows.slice(0, insertIndex),
					fullscreenWindow,
					...fullscreenWindows.slice(insertIndex),
				]
				updatedWindows = [...floatingWindows, ...updatedFullscreen]
			} else {
				// No cursor position provided, add to end
				updatedWindows = [...otherWindows, fullscreenWindow]
			}

			newFocusedId = id // Focus the newly fullscreened window
		} else {
			// Toggle fullscreen off, optionally update position
			const updates: Partial<WindowInstance> = { isFullscreen: false }
			if (x !== undefined && y !== undefined) {
				updates.x = x
				updates.y = y
			}
			updatedWindows = windows.map((w) => w.id === id ? { ...w, ...updates } : w)

			// If un-fullscreening the focused window, focus the next or previous one
			if (focusedFullscreenWindowId === id) {
				const fullscreenWindows = windows.filter((w) => w.isFullscreen)
				const currentIndex = fullscreenWindows.findIndex((w) => w.id === id)
				const remainingFullscreen = updatedWindows.filter((w) => w.isFullscreen)

				if (remainingFullscreen.length > 0) {
					// Try next tab first, then previous tab
					const nextIndex = currentIndex
					const prevIndex = currentIndex - 1

					if (nextIndex < remainingFullscreen.length) {
						newFocusedId = remainingFullscreen[nextIndex].id
					} else if (prevIndex >= 0) {
						newFocusedId = remainingFullscreen[prevIndex].id
					} else {
						// Defensive: should never reach here if length > 0
						newFocusedId = remainingFullscreen[0].id
					}
				} else {
					newFocusedId = undefined
				}
			} else {
				newFocusedId = focusedFullscreenWindowId
			}
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
		if (!currentProject) { return }

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
		if (!currentProject) { return }

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
				ref={menuBarRef}
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
					<button
						onClick={() => setIsEditingName(true)}
						className="font-semibold hover:text-gray-300 transition-colors"
					>
						{currentProject.metadata.name}
					</button>
					<span className="text-gray-400">|</span>
					<Menubar.Root className="flex gap-1">
						<Menubar.Menu>
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700">
								File
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									{/* File menu items will go here */}
								</Menubar.Content>
							</Menubar.Portal>
						</Menubar.Menu>

						<Menubar.Menu>
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700">
								Edit
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									{/* Edit menu items will go here */}
								</Menubar.Content>
							</Menubar.Portal>
						</Menubar.Menu>

						<Menubar.Menu>
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700">
								View
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									{/* View menu items will go here */}
								</Menubar.Content>
							</Menubar.Portal>
						</Menubar.Menu>
					</Menubar.Root>
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
				floatingWindowZOrder={floatingWindowZOrder}
				menuBarHeight={menuBarHeight}
				tabPositionsRef={tabPositionsRef}
				onPositionChange={handleWindowPositionChange}
				onResize={handleWindowResize}
				onAddWindow={handleAddWindow}
				onUpdateWindow={handleUpdateWindow}
				onReorderWindows={handleReorderWindows}
				onClose={handleCloseWindow}
				onToggleFullscreen={handleToggleFullscreen}
				onFocusWindow={handleFocusWindow}
				onBringToFront={handleBringToFront}
			/>

			{/* Prompt modal for editing project name */}
			<Prompt<{ name: string }>
				isOpen={isEditingName}
				title="Edit Project Name"
				onSubmit={handleSaveName}
				onCancel={() => setIsEditingName(false)}
				isSubmitting={saving}
			>
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
						Project Name
					</label>
					<Input
						id="name"
						name="name"
						type="text"
						defaultValue={currentProject.metadata.name}
						autoFocus
						required
						className="w-full"
					/>
				</div>
			</Prompt>
		</div>
	)
}
