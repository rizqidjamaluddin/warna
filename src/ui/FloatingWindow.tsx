import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useDisableSelection } from '../hooks/useDisableSelection'

interface FloatingWindowProps {
	id: string
	x: number
	y: number
	width: number
	height: number
	title: string
	zIndex?: number
	menuBarHeight: number
	noPadding?: boolean
	children: ReactNode
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
	onBringToFront?: () => void
}

export function FloatingWindow({
	id,
	x,
	y,
	width,
	height,
	title,
	zIndex = 60,
	menuBarHeight,
	noPadding = false,
	children,
	onPositionChange,
	onResize,
	onClose,
	onToggleFullscreen,
	onBringToFront,
}: FloatingWindowProps) {
	const [currentWidth, setCurrentWidth] = useState(width)
	const [currentHeight, setCurrentHeight] = useState(height)
	const [currentX, setCurrentX] = useState(x)
	const [currentY, setCurrentY] = useState(y)
	const [panStartX, setPanStartX] = useState(x)
	const [panStartY, setPanStartY] = useState(y)
	const [resizeStartWidth, setResizeStartWidth] = useState(width)
	const [resizeStartHeight, setResizeStartHeight] = useState(height)
	const [isResizing, setIsResizing] = useState(false)
	const isPanningRef = useRef(false)
	const { disableSelection, enableSelection } = useDisableSelection()

	// Calculate max dimensions (80% of viewport)
	const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1000
	const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 800

	// Sync position from props when not panning
	// Needed for tear-out gesture - guards prevent cascading renders
	useEffect(() => {
		if (!isPanningRef.current && (currentX !== x || currentY !== y)) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCurrentX(x)
			setCurrentY(y)
		}
	}, [x, y, currentX, currentY])

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
			animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
			exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
			transition={{ duration: 0.2 }}
			style={{
				x: currentX,
				y: currentY,
				width: currentWidth,
				height: currentHeight,
				position: 'fixed',
				zIndex,
			}}
			onPointerDown={() => {
				// Bring to front immediately (lightweight z-order update)
				onBringToFront?.()
			}}
			className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
		>
			<div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-600 rounded-t-lg select-none flex items-stretch">
				<motion.div
					className="flex-1 cursor-move px-4 py-2 flex items-center overflow-hidden"
					onPanStart={() => {
						isPanningRef.current = true
						disableSelection()
						// Use props directly to avoid any state sync issues
						setCurrentX(x)
						setCurrentY(y)
						setPanStartX(x)
						setPanStartY(y)
					}}
					onPan={(event, info) => {
						const newX = panStartX + info.offset.x
						const newY = panStartY + info.offset.y

						// If dragged up to tab bar area (within 25px), fullscreen the window
						if (newY < menuBarHeight + 25) {
							const mouseEvent = event as MouseEvent
							const cursorX = mouseEvent.clientX
							onToggleFullscreen(id, cursorX, newY)
							enableSelection()
							return
						}

						// Only constrain top to menu bar, allow off-screen in other directions
						const constrainedY = Math.max(menuBarHeight, newY)

						setCurrentX(newX)
						setCurrentY(constrainedY)
					}}
					onPanEnd={() => {
						isPanningRef.current = false
						enableSelection()
						onPositionChange(id, currentX, currentY)
					}}
				>
					<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 relative whitespace-nowrap">
						<AnimatePresence mode="wait" initial={false}>
							<motion.span
								key={title}
								initial={{
									transform: 'translateY(5px)',
									opacity: 0,
									filter: 'blur(4px)',
								}}
								animate={{
									transform: 'translateY(0px)',
									opacity: 1,
									filter: 'blur(0px)',
									transition: {
										transform: {
											type: 'spring',
											duration: 0.7,
											bounce: 0.5,
										},
										default: {
											ease: 'easeInOut',
											duration: 0.2,
										},
									},
								}}
								exit={{
									transform: 'translateY(-5px)',
									opacity: 0,
									filter: 'blur(4px)',
								}}
								className="inline-block"
							>
								{title || 'Untitled Window'}
							</motion.span>
						</AnimatePresence>
					</h3>
				</motion.div>
				<div className="flex items-stretch">
					<button
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation()
							onToggleFullscreen(id)
						}}
						className="px-3 py-2 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
						title="Fullscreen"
					>
						<ArrowsPointingOutIcon className="w-4 h-4" />
					</button>
					<button
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation()
							onClose(id)
						}}
						className="px-3 py-2 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-tr-lg"
						title="Close"
					>
						<XMarkIcon className="w-4 h-4" />
					</button>
				</div>
			</div>
			<div
				className={`flex-1 overflow-auto bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 ${noPadding ? '' : 'p-4'}`}
				style={{ userSelect: isResizing ? 'none' : 'auto' }}
			>
				{children}
			</div>

			{/* Resize handle */}
			<motion.div
				className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10"
				onPanStart={() => {
					setIsResizing(true)
					disableSelection()
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
					enableSelection()
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
