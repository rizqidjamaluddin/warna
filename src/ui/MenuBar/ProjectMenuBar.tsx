import { Menubar } from 'radix-ui'
import { useTheme } from '../../hooks/useTheme'
import { useClearSelections, useSelectedSwatchesValue } from '../../hooks/useSelection'
import type { WindowInstance } from '../../types'
import { MenuItem } from './MenuItem'

interface ProjectMenuBarProps {
	projectName: string
	lastUpdated: number
	onRenameProject: () => void
	onCreateNewProject: () => void
	onCloseProject: () => void
	onAddWindow: (window: WindowInstance) => void
}

export function ProjectMenuBar({
	projectName,
	lastUpdated,
	onRenameProject,
	onCreateNewProject,
	onCloseProject,
	onAddWindow,
}: ProjectMenuBarProps) {
	const { theme, setTheme } = useTheme()
	const clearSelections = useClearSelections()
	const selectedSwatches = useSelectedSwatchesValue()
	const hasSelections = selectedSwatches.size > 0

	return (
		<div className="bg-gray-800 dark:bg-gray-950 text-white px-4 py-2 flex items-center justify-between sticky top-0">
			<div className="flex items-center gap-4">
				<button
					onClick={onCloseProject}
					className="hover:bg-gray-700 dark:hover:bg-gray-900 px-2 py-1 rounded text-sm transition-colors"
				>
					← Back
				</button>
				<span className="text-gray-400">|</span>
				<button
					onClick={onRenameProject}
					className="font-semibold hover:text-gray-300 transition-colors"
				>
					{projectName}
				</button>
				<span className="text-gray-400">|</span>
				<Menubar.Root className="flex gap-1">
					{/* Project Menu */}
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
								<MenuItem onSelect={onCreateNewProject}>
									New Project...
								</MenuItem>
								<MenuItem onSelect={onRenameProject}>
									Rename Project...
								</MenuItem>
								<Menubar.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
								<MenuItem onSelect={onCloseProject}>
									Return to Index
								</MenuItem>
							</Menubar.Content>
						</Menubar.Portal>
					</Menubar.Menu>

					{/* Edit Menu */}
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

					{/* Selection Menu */}
					<Menubar.Menu>
						<Menubar.Trigger className="text-sm px-2 py-1 hover:bg-gray-700 dark:hover:bg-gray-900 rounded cursor-pointer select-none outline-none data-[state=open]:bg-gray-700 dark:data-[state=open]:bg-gray-900">
							Selection
						</Menubar.Trigger>
						<Menubar.Portal>
							<Menubar.Content
								className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[150]"
								align="start"
								sideOffset={5}
							>
								<MenuItem onSelect={clearSelections} disabled={!hasSelections}>
									Deselect All
								</MenuItem>
							</Menubar.Content>
						</Menubar.Portal>
					</Menubar.Menu>

					{/* View Menu */}
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
							</Menubar.Content>
						</Menubar.Portal>
					</Menubar.Menu>

					{/* Window Menu */}
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
								<MenuItem
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
										onAddWindow(newWindow)
									}}
								>
									Overview
								</MenuItem>
								<MenuItem
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
										onAddWindow(newWindow)
									}}
								>
									Output
								</MenuItem>
								<MenuItem
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
										onAddWindow(newWindow)
									}}
								>
									Debug
								</MenuItem>
							</Menubar.Content>
						</Menubar.Portal>
					</Menubar.Menu>
				</Menubar.Root>
			</div>
			<div className="text-sm text-gray-400">
				{new Date(lastUpdated).toLocaleString()}
			</div>
		</div>
	)
}
