import { AnimatePresence } from 'motion/react'
import type { WindowInstance } from '../../types'
import { DebugWindow } from './DebugWindow'
import { FullscreenWindowManager } from './FullscreenWindowManager'

interface WindowRendererProps {
	windows: WindowInstance[]
	focusedFullscreenWindowId?: string
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onAddWindow: (window: WindowInstance) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onReorderWindows: (windows: WindowInstance[]) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string) => void
	onFocusWindow: (id: string) => void
}

export function WindowRenderer({
	windows,
	focusedFullscreenWindowId,
	onPositionChange,
	onResize,
	onAddWindow,
	onUpdateWindow,
	onReorderWindows,
	onClose,
	onToggleFullscreen,
	onFocusWindow,
}: WindowRendererProps) {
	const floatingWindows = windows.filter((w) => !w.isFullscreen)
	const fullscreenWindows = windows.filter((w) => w.isFullscreen)

	function renderWindowContent(window: WindowInstance, isFullscreen: boolean) {
		switch (window.type) {
			case 'debug':
				return (
					<DebugWindow
						key={window.id}
						id={window.id}
						title={window.title}
						x={window.x}
						y={window.y}
						width={window.width}
						height={window.height}
						isFullscreen={isFullscreen}
						onPositionChange={onPositionChange}
						onResize={onResize}
						onAddWindow={onAddWindow}
						onUpdateWindow={onUpdateWindow}
						onClose={onClose}
						onToggleFullscreen={onToggleFullscreen}
					/>
				)
			default:
				return null
		}
	}

	return (
		<>
			{/* Floating windows */}
			<AnimatePresence>
				{floatingWindows.map((window) => renderWindowContent(window, false))}
			</AnimatePresence>

			{/* Fullscreen windows */}
			{fullscreenWindows.length > 0 && (
				<FullscreenWindowManager
					windows={fullscreenWindows}
					focusedWindowId={focusedFullscreenWindowId}
					onFocusWindow={onFocusWindow}
					onReorderWindows={onReorderWindows}
					onClose={onClose}
					onToggleFullscreen={onToggleFullscreen}
				>
					{(window) => renderWindowContent(window, true)}
				</FullscreenWindowManager>
			)}
		</>
	)
}
