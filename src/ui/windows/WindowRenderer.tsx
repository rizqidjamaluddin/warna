import { AnimatePresence } from 'motion/react'
import React from 'react'
import type { WindowInstance } from '../../types'
import { DebugWindow } from './DebugWindow'
import { FullscreenWindowManager } from './FullscreenWindowManager'

interface WindowRendererProps {
	windows: WindowInstance[]
	focusedFullscreenWindowId?: string
	activeFloatingWindowId: string | null
	menuBarHeight: number
	tabPositionsRef: React.RefObject<{ id: string; left: number; right: number }[]>
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onAddWindow: (window: WindowInstance) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onReorderWindows: (windows: WindowInstance[]) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
	onFocusWindow: (id: string) => void
	onSetActiveWindow: (id: string | null) => void
}

export function WindowRenderer({
	windows,
	focusedFullscreenWindowId,
	activeFloatingWindowId,
	menuBarHeight,
	tabPositionsRef,
	onPositionChange,
	onResize,
	onAddWindow,
	onUpdateWindow,
	onReorderWindows,
	onClose,
	onToggleFullscreen,
	onFocusWindow,
	onSetActiveWindow,
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
						isActive={!isFullscreen && activeFloatingWindowId === window.id}
						menuBarHeight={menuBarHeight}
						onPositionChange={onPositionChange}
						onResize={onResize}
						onAddWindow={onAddWindow}
						onUpdateWindow={onUpdateWindow}
						onClose={onClose}
						onToggleFullscreen={onToggleFullscreen}
						onSetActive={() => onSetActiveWindow(window.id)}
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
					menuBarHeight={menuBarHeight}
					tabPositionsRef={tabPositionsRef}
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
