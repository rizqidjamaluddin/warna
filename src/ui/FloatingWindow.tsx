import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, useDragControls } from 'motion/react'
import type { ReactNode } from 'react'
import { useState } from 'react'

interface FloatingWindowProps {
	id: string
	x: number
	y: number
	width: number
	height: number
	title: string
	menuBarHeight: number
	children: ReactNode
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
}

export function FloatingWindow({
	id,
	x,
	y,
	width,
	height,
	title,
	menuBarHeight,
	children,
	onPositionChange,
	onResize,
	onClose,
	onToggleFullscreen,
}: FloatingWindowProps) {
	const dragControls = useDragControls()
	const [currentWidth, setCurrentWidth] = useState(width)
	const [currentHeight, setCurrentHeight] = useState(height)
	const [resizeStartWidth, setResizeStartWidth] = useState(width)
	const [resizeStartHeight, setResizeStartHeight] = useState(height)
	const [isResizing, setIsResizing] = useState(false)

	// Calculate max dimensions (80% of viewport)
	const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1000
	const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 800

	// Calculate drag constraints to prevent dragging off-screen or behind menu bar
	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

	const dragConstraints = {
		top: menuBarHeight - y, // Can't go above menu bar
		left: -x, // Can't go past left edge
		right: viewportWidth - x - currentWidth, // Can't go past right edge
		bottom: viewportHeight - y - currentHeight, // Can't go past bottom edge
	}

	return (
		<motion.div
			drag
			dragControls={dragControls}
			dragConstraints={dragConstraints}
			dragMomentum={false}
			dragElastic={0}
			dragListener={false}
			initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
			animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
			exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
			transition={{ duration: 0.2 }}
			style={{
				x,
				y,
				width: currentWidth,
				height: currentHeight,
				position: 'fixed',
				zIndex: 60,
			}}
			onDragEnd={(_event, info) => {
				const newX = x + info.offset.x
				const newY = Math.max(menuBarHeight, y + info.offset.y)
				onPositionChange(id, newX, newY)
			}}
			className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col"
		>
			<div className="px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg select-none flex items-center justify-between">
				<h3
					onPointerDown={(e) => dragControls.start(e)}
					className="text-sm font-medium text-gray-900 cursor-move flex-1"
				>
					{title || 'Untitled Window'}
				</h3>
				<div className="flex items-center gap-1">
					<button
						onClick={() => onToggleFullscreen(id)}
						className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
						title="Fullscreen"
					>
						<ArrowsPointingOutIcon className="w-4 h-4" />
					</button>
					<button
						onClick={() => onClose(id)}
						className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
						title="Close"
					>
						<XMarkIcon className="w-4 h-4" />
					</button>
				</div>
			</div>
			<div
				className="p-4 flex-1 overflow-auto"
				style={{ userSelect: isResizing ? 'none' : 'auto' }}
			>
				{children}
			</div>

			{/* Resize handle */}
			<motion.div
				className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
				onPanStart={() => {
					setIsResizing(true)
					document.body.style.userSelect = 'none'
					setResizeStartWidth(currentWidth)
					setResizeStartHeight(currentHeight)
				}}
				onPan={(_event, info) => {
					const newWidth = Math.max(200, Math.min(maxWidth, resizeStartWidth + info.offset.x))
					const newHeight = Math.max(150, Math.min(maxHeight, resizeStartHeight + info.offset.y))
					setCurrentWidth(newWidth)
					setCurrentHeight(newHeight)
				}}
				onPanEnd={() => {
					setIsResizing(false)
					document.body.style.userSelect = ''
					onResize(id, currentWidth, currentHeight)
				}}
			>
				<svg
					className="absolute bottom-1 right-1 w-3 h-3 text-gray-400"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path d="M14 0v2h-2V0h2zm0 4v2h-2V4h2zm0 4v2h-2V8h2zm0 4v2h-2v-2h2zM10 14v2H8v-2h2zm-4 0v2H4v-2h2z" />
				</svg>
			</motion.div>
		</motion.div>
	)
}
