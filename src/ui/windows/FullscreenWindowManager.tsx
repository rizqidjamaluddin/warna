import { ArrowsPointingInIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Reorder } from 'motion/react'
import React, { type ReactNode } from 'react'
import type { WindowInstance } from '../../types'

interface FullscreenWindowManagerProps {
	windows: WindowInstance[]
	focusedWindowId?: string
	menuBarHeight: number
	onFocusWindow: (id: string) => void
	onReorderWindows: (windows: WindowInstance[]) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
	children: (window: WindowInstance) => ReactNode
}

export function FullscreenWindowManager({
	windows,
	focusedWindowId,
	menuBarHeight,
	onFocusWindow,
	onReorderWindows,
	onClose,
	onToggleFullscreen,
	children,
}: FullscreenWindowManagerProps) {
	const [tearingOutId, setTearingOutId] = React.useState<string | null>(null)

	if (windows.length === 0) {
		return null
	}

	const activeWindowId = focusedWindowId ?? windows[0].id
	const activeWindow = windows.find((w) => w.id === activeWindowId) ?? windows[0]

	return (
		<div
			className="fixed inset-0 flex flex-col bg-white"
			style={{ zIndex: 40, paddingTop: '42px', isolation: 'isolate' }}
		>
			{/* Tab bar */}
			<Reorder.Group
				axis="x"
				values={windows}
				onReorder={onReorderWindows}
				className="flex items-center bg-gray-100 border-b border-gray-200 sticky top-[42px]"
			>
				{windows.map((window) => (
					<Reorder.Item
						key={window.id}
						value={window}
						initial={{ width: 0, opacity: 0 }}
						animate={{ width: 'auto', opacity: 1 }}
						exit={{ width: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						style={{ overflow: 'hidden' }}
						className={`
							flex items-center gap-2 px-4 py-2 border-r border-gray-200 cursor-pointer whitespace-nowrap
							${window.id === activeWindowId ? 'bg-white' : 'hover:bg-gray-50'}
						`}
						onClick={() => onFocusWindow(window.id)}
						onDragStart={() => {
							setTearingOutId(null)
						}}
						onDrag={(event, info) => {
							// If dragged down more than 25px, un-fullscreen the window immediately
							// Only trigger once per drag gesture
							if (info.offset.y > 25 && tearingOutId !== window.id) {
								setTearingOutId(window.id)

								// Position window so tab bar is centered under cursor
								const mouseEvent = event as MouseEvent
								const cursorX = mouseEvent.clientX
								const cursorY = mouseEvent.clientY

								// Center window horizontally on cursor, nudge up a bit so cursor isn't on the edge
								// Ensure window doesn't go behind the menu bar
								const windowX = cursorX - window.width / 2
								const windowY = Math.max(menuBarHeight, cursorY - 10)

								onToggleFullscreen(window.id, windowX, windowY)
							}
						}}
					>
						<span className="text-sm font-medium text-gray-900">
							{window.title || 'Untitled Window'}
						</span>
						<div className="flex items-center gap-1">
							<button
								onClick={(e) => {
									e.stopPropagation()
									onToggleFullscreen(window.id)
								}}
								className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
								title="Exit Fullscreen"
							>
								<ArrowsPointingInIcon className="w-3 h-3" />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation()
									onClose(window.id)
								}}
								className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
								title="Close"
							>
								<XMarkIcon className="w-3 h-3" />
							</button>
						</div>
					</Reorder.Item>
				))}
			</Reorder.Group>

			{/* Active window content */}
			<div className="flex-1 overflow-auto p-8">
				{children(activeWindow)}
			</div>
		</div>
	)
}
