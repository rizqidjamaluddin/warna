import { ArrowsPointingInIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Reorder } from 'motion/react'
import type { ReactNode } from 'react'
import type { WindowInstance } from '../../types'

interface FullscreenWindowManagerProps {
	windows: WindowInstance[]
	focusedWindowId?: string
	onFocusWindow: (id: string) => void
	onReorderWindows: (windows: WindowInstance[]) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string) => void
	children: (window: WindowInstance) => ReactNode
}

export function FullscreenWindowManager({
	windows,
	focusedWindowId,
	onFocusWindow,
	onReorderWindows,
	onClose,
	onToggleFullscreen,
	children,
}: FullscreenWindowManagerProps) {
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
						className={`
							flex items-center gap-2 px-4 py-2 border-r border-gray-200 cursor-pointer
							${window.id === activeWindowId ? 'bg-white' : 'hover:bg-gray-50'}
						`}
						onClick={() => onFocusWindow(window.id)}
					>
						<span className="text-sm font-medium text-gray-900">
							{window.type === 'debug' ? window.name : 'Window'}
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
