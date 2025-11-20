import type { WindowInstance } from '../../types'
import { Button } from '../Button'
import { FloatingWindow } from '../FloatingWindow'

interface DebugWindowProps {
	id: string
	x: number
	y: number
	isFullscreen?: boolean
	onPositionChange: (id: string, x: number, y: number) => void
	onAddWindow: (window: WindowInstance) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string) => void
}

export function DebugWindow({
	id,
	x,
	y,
	isFullscreen,
	onPositionChange,
	onAddWindow,
	onClose,
	onToggleFullscreen,
}: DebugWindowProps) {
	function handleAddWindow() {
		const newWindow: WindowInstance = {
			id: crypto.randomUUID(),
			type: 'debug',
			x: x + 30,
			y: y + 30,
			isFullscreen: false,
		}
		onAddWindow(newWindow)
	}

	const content = (
		<div className="space-y-2">
			<div className="text-sm text-gray-700">Hello World</div>
			<Button onClick={handleAddWindow} size="sm">
				Add Window
			</Button>
		</div>
	)

	// If fullscreen, just return the content (will be rendered by FullscreenWindowManager)
	if (isFullscreen) {
		return content
	}

	return (
		<FloatingWindow
			id={id}
			x={x}
			y={y}
			title="Debug Window"
			onPositionChange={onPositionChange}
			onClose={onClose}
			onToggleFullscreen={onToggleFullscreen}
		>
			{content}
		</FloatingWindow>
	)
}
