import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, useDragControls } from 'motion/react'
import type { ReactNode } from 'react'

interface FloatingWindowProps {
	id: string
	x: number
	y: number
	title: string
	children: ReactNode
	onPositionChange: (id: string, x: number, y: number) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string) => void
}

export function FloatingWindow({
	id,
	x,
	y,
	title,
	children,
	onPositionChange,
	onClose,
	onToggleFullscreen,
}: FloatingWindowProps) {
	const dragControls = useDragControls()

	return (
		<motion.div
			drag
			dragControls={dragControls}
			dragMomentum={false}
			dragElastic={0}
			dragListener={false}
			style={{
				x,
				y,
				position: 'fixed',
				zIndex: 60,
			}}
			onDragEnd={(_event, info) => {
				const newX = x + info.offset.x
				const newY = y + info.offset.y
				onPositionChange(id, newX, newY)
			}}
			className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]"
		>
			<div className="px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg select-none flex items-center justify-between">
				<h3
					onPointerDown={(e) => dragControls.start(e)}
					className="text-sm font-medium text-gray-900 cursor-move flex-1"
				>
					{title}
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
			<div className="p-4">{children}</div>
		</motion.div>
	)
}
