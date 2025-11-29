import { Menubar } from 'radix-ui'
import { useEffect, useRef, useState } from 'react'
import { useAtomValue, useAtom } from 'jotai'
import { projectMetadataAtom, windowConfigAtom, preferencesAtom } from '../../../atoms/project'
import { visionTypeAtom, type VisionType } from '../../../atoms/ui'
import { useFullProject, useUpdateWindowConfig, useUpdatePreferences, useUpdateMetadata } from '../../../hooks/useProjectAtoms'
import { useTheme } from '../../../hooks/useTheme'
import type { WindowInstance } from '../../../types'
import { createNewProject, saveProject } from '../../../utils/db'
import { Input } from '../../Input'
import { Prompt } from '../../Prompt'
import { WindowRenderer } from '../../windows/WindowRenderer'

export function ProjectEditor() {
	const currentMetadata = useAtomValue(projectMetadataAtom)
	const windowConfig = useAtomValue(windowConfigAtom)
	const preferences = useAtomValue(preferencesAtom)
	const { currentProject, setCurrentProject } = useFullProject()
	const updateWindowConfig = useUpdateWindowConfig()
	const updatePreferences = useUpdatePreferences()
	const updateMetadata = useUpdateMetadata()
	const { theme, setTheme } = useTheme()
	const [visionType, setVisionType] = useAtom(visionTypeAtom)
	const [isEditingName, setIsEditingName] = useState(false)
	const [isCreatingProject, setIsCreatingProject] = useState(false)
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

	// Initialize windows if not present (for backward compatibility with old projects)
	useEffect(() => {
		if (currentProject && !currentProject.data.windowConfig?.windows) {
			const overviewWindowId = crypto.randomUUID()
			const initialWindows: WindowInstance[] = [
				{
					id: overviewWindowId,
					type: 'overview',
					title: 'Overview',
					x: 100,
					y: 100,
					width: 800,
					height: 600,
					isFullscreen: true,
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
						focusedFullscreenWindowId: overviewWindowId,
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

	async function handleCreateProject(data: { name: string }) {
		if (!data.name.trim()) { return }

		try {
			setSaving(true)
			const newProject = createNewProject(data.name.trim())
			await saveProject(newProject)
			setCurrentProject(newProject)
			setIsCreatingProject(false)
		} catch (error) {
			console.error('Failed to create project:', error)
		} finally {
			setSaving(false)
		}
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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
			{/* Menu bar - always visible */}
			<div
				ref={menuBarRef}
				className="bg-gray-800 dark:bg-gray-950 text-white px-4 py-2 flex items-center justify-between sticky top-0"
				style={{ zIndex: 100 }}
			>
				<div className="flex items-center gap-4">
					<button
						onClick={handleCloseProject}
						className="hover:bg-gray-700 dark:hover:bg-gray-900 px-2 py-1 rounded text-sm transition-colors"
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
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 dark:hover:bg-gray-900 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700 dark:data-[state=open]:bg-gray-900">
								Project
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									<Menubar.Item
										className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										onSelect={() => setIsCreatingProject(true)}
									>
										New Project...
									</Menubar.Item>
									<Menubar.Item
										className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										onSelect={() => setIsEditingName(true)}
									>
										Rename Project...
									</Menubar.Item>
									<Menubar.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
									<Menubar.Item
										className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										onSelect={handleCloseProject}
									>
										Return to Index
									</Menubar.Item>
								</Menubar.Content>
							</Menubar.Portal>
						</Menubar.Menu>

						<Menubar.Menu>
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 dark:hover:bg-gray-900 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700 dark:data-[state=open]:bg-gray-900">
								Edit
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									{/* Edit menu items will go here */}
								</Menubar.Content>
							</Menubar.Portal>
						</Menubar.Menu>

						<Menubar.Menu>
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 dark:hover:bg-gray-900 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700 dark:data-[state=open]:bg-gray-900">
								View
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									<Menubar.RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
										<Menubar.RadioItem
											value="light"
											className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
										>
											<span>Light</span>
											<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
										</Menubar.RadioItem>
										<Menubar.RadioItem
											value="dark"
											className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
										>
											<span>Dark</span>
											<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
										</Menubar.RadioItem>
									</Menubar.RadioGroup>

									<Menubar.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

									<Menubar.Sub>
										<Menubar.SubTrigger className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between">
											Overview
											<span className="ml-2">›</span>
										</Menubar.SubTrigger>
										<Menubar.Portal>
											<Menubar.SubContent
												className="min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[150]"
												sideOffset={8}
											>
												<Menubar.Label className="text-xs px-3 py-1 text-gray-500 dark:text-gray-400">
													Gridlines
												</Menubar.Label>
												<Menubar.RadioGroup
													value={preferences?.overview?.gridlines ?? 'none'}
													onValueChange={async (value) => {
														await updatePreferences((prefs) => ({
															...prefs,
															overview: {
																...prefs.overview,
																gridlines: value as 'black' | 'white' | 'none',
															},
														}))
													}}
												>
													<Menubar.RadioItem
														value="black"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Black</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="white"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>White</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="none"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>None</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
												</Menubar.RadioGroup>

												<Menubar.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

												<Menubar.Label className="text-xs px-3 py-1 text-gray-500 dark:text-gray-400">
													Vision Simulation
												</Menubar.Label>
												<Menubar.RadioGroup
													value={visionType}
													onValueChange={(value) => setVisionType(value as VisionType)}
												>
													<Menubar.RadioItem
														value="normal"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Normal Vision</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="protanopia"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Protanopia (Red-blind)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="deuteranopia"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Deuteranopia (Green-blind)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="tritanopia"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Tritanopia (Blue-blind)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="protanomaly"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Protanomaly (Red-weak)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="deuteranomaly"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Deuteranomaly (Green-weak)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="tritanomaly"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Tritanomaly (Blue-weak)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="achromatopsia"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Achromatopsia (Monochrome)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
													<Menubar.RadioItem
														value="achromatomaly"
														className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
													>
														<span>Achromatomaly (Near-monochrome)</span>
														<Menubar.ItemIndicator className="ml-2">✓</Menubar.ItemIndicator>
													</Menubar.RadioItem>
												</Menubar.RadioGroup>
											</Menubar.SubContent>
										</Menubar.Portal>
									</Menubar.Sub>
								</Menubar.Content>
							</Menubar.Portal>
						</Menubar.Menu>

						<Menubar.Menu>
							<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 dark:hover:bg-gray-900 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700 dark:data-[state=open]:bg-gray-900">
								Window
							</Menubar.Trigger>
							<Menubar.Portal>
								<Menubar.Content
									className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[150]"
									align="start"
									sideOffset={5}
								>
									<Menubar.Item
										className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										onSelect={() => {
											const newWindow: WindowInstance = {
												id: crypto.randomUUID(),
												type: 'overview',
												title: 'Overview',
												x: 100,
												y: 100,
												width: 800,
												height: 600,
												isFullscreen: false,
											}
											handleAddWindow(newWindow)
										}}
									>
										Overview
									</Menubar.Item>
									<Menubar.Item
										className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										onSelect={() => {
											const newWindow: WindowInstance = {
												id: crypto.randomUUID(),
												type: 'output',
												title: 'Output',
												x: 150,
												y: 150,
												width: 500,
												height: 400,
												isFullscreen: false,
											}
											handleAddWindow(newWindow)
										}}
									>
										Output
									</Menubar.Item>
									<Menubar.Item
										className="text-sm px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										onSelect={() => {
											const newWindow: WindowInstance = {
												id: crypto.randomUUID(),
												type: 'debug',
												title: 'Debug Window',
												x: 200,
												y: 200,
												width: 300,
												height: 200,
												isFullscreen: false,
											}
											handleAddWindow(newWindow)
										}}
									>
										Debug
									</Menubar.Item>
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
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
						<div className="text-center text-gray-500 dark:text-gray-400">
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

			{/* Prompt modal for creating new project */}
			<Prompt<{ name: string }>
				isOpen={isCreatingProject}
				title="Create New Project"
				onSubmit={handleCreateProject}
				onCancel={() => setIsCreatingProject(false)}
				isSubmitting={saving}
			>
				<div>
					<label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-2">
						Project Name
					</label>
					<Input
						id="newName"
						name="name"
						type="text"
						placeholder="Enter project name"
						autoFocus
						required
						className="w-full"
					/>
				</div>
			</Prompt>
		</div>
	)
}
