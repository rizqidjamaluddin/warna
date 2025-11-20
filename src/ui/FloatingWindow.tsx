import { motion, useDragControls } from 'motion/react'
import type { ReactNode } from 'react'

interface FloatingWindowProps {
	id: string
	x: number
	y: number
	title: string
	children: ReactNode
	onPositionChange: (id: string, x: number, y: number) => void
}

export function FloatingWindow({
	id,
	x,
	y,
	title,
	children,
	onPositionChange,
}: FloatingWindowProps) {
	const dragControls = useDragControls()

	return (
		<motion.div
			drag
			dragControls={dragControls}
			dragMomentum={false}
			dragElastic={0}
			style={{
				x,
				y,
				position: 'fixed',
				zIndex: 50,
			}}
			onDragEnd={(_event, info) => {
				const newX = x + info.offset.x
				const newY = y + info.offset.y
				onPositionChange(id, newX, newY)
			}}
			className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]"
		>
			<div
				onPointerDown={(e) => dragControls.start(e)}
				className="px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg cursor-move select-none"
			>
				<h3 className="text-sm font-medium text-gray-900">{title}</h3>
			</div>
			<div className="p-4">{children}</div>
		</motion.div>
	)
}
