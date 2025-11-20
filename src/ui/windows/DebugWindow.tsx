import type { WindowInstance } from '../../types'
import { Button } from '../Button'
import { FloatingWindow } from '../FloatingWindow'

interface DebugWindowProps {
	id: string
	x: number
	y: number
	onPositionChange: (id: string, x: number, y: number) => void
	onAddWindow: (window: WindowInstance) => void
}

export function DebugWindow({ id, x, y, onPositionChange, onAddWindow }: DebugWindowProps) {
	function handleAddWindow() {
		const newWindow: WindowInstance = {
			id: crypto.randomUUID(),
			type: 'debug',
			x: x + 30,
			y: y + 30,
		}
		onAddWindow(newWindow)
	}

	return (
		<FloatingWindow
			id={id}
			x={x}
			y={y}
			title="Debug Window"
			onPositionChange={onPositionChange}
		>
			<div className="space-y-2">
				<div className="text-sm text-gray-700">Hello World</div>
				<Button onClick={handleAddWindow} size="sm">
					Add Window
				</Button>
			</div>
		</FloatingWindow>
	)
}
