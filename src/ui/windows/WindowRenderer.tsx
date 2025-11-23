import { AnimatePresence } from 'motion/react'
import React from 'react'
import type { WindowInstance } from '../../types'
import { DebugWindow } from './DebugWindow'
import { OutputWindow } from './OutputWindow'
import { OverviewWindow } from './OverviewWindow'
import { FullscreenWindowManager } from './FullscreenWindowManager'

interface WindowRendererProps {
	windows: WindowInstance[]
	focusedFullscreenWindowId?: string
	floatingWindowZOrder: string[]
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
	onBringToFront: (id: string) => void
}

export function WindowRenderer({
	windows,
	focusedFullscreenWindowId,
	floatingWindowZOrder,
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
	onBringToFront,
}: WindowRendererProps) {
	const floatingWindows = windows.filter((w) => !w.isFullscreen)
	const fullscreenWindows = windows.filter((w) => w.isFullscreen)

	// Calculate z-index for each floating window based on z-order
	function getWindowZIndex(windowId: string): number {
		const baseZIndex = 60
		const index = floatingWindowZOrder.indexOf(windowId)
		return index >= 0 ? baseZIndex + index : baseZIndex
	}

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
						zIndex={!isFullscreen ? getWindowZIndex(window.id) : undefined}
						menuBarHeight={menuBarHeight}
						onPositionChange={onPositionChange}
						onResize={onResize}
						onAddWindow={onAddWindow}
						onUpdateWindow={onUpdateWindow}
						onClose={onClose}
						onToggleFullscreen={onToggleFullscreen}
						onBringToFront={() => onBringToFront(window.id)}
					/>
				)
			case 'output':
				return (
					<OutputWindow
						key={window.id}
						id={window.id}
						title={window.title}
						x={window.x}
						y={window.y}
						width={window.width}
						height={window.height}
						isFullscreen={isFullscreen}
						zIndex={!isFullscreen ? getWindowZIndex(window.id) : undefined}
						menuBarHeight={menuBarHeight}
						onPositionChange={onPositionChange}
						onResize={onResize}
						onUpdateWindow={onUpdateWindow}
						onClose={onClose}
						onToggleFullscreen={onToggleFullscreen}
						onBringToFront={() => onBringToFront(window.id)}
					/>
				)
			case 'overview':
				return (
					<OverviewWindow
						key={window.id}
						id={window.id}
						title={window.title}
						x={window.x}
						y={window.y}
						width={window.width}
						height={window.height}
						isFullscreen={isFullscreen}
						zIndex={!isFullscreen ? getWindowZIndex(window.id) : undefined}
						menuBarHeight={menuBarHeight}
						onPositionChange={onPositionChange}
						onResize={onResize}
						onUpdateWindow={onUpdateWindow}
						onClose={onClose}
						onToggleFullscreen={onToggleFullscreen}
						onBringToFront={() => onBringToFront(window.id)}
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
