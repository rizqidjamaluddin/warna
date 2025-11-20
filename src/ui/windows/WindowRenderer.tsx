import type { WindowInstance } from '../../types'
import { DebugWindow } from './DebugWindow'

interface WindowRendererProps {
	windows: WindowInstance[]
	onPositionChange: (id: string, x: number, y: number) => void
	onAddWindow: (window: WindowInstance) => void
}

export function WindowRenderer({ windows, onPositionChange, onAddWindow }: WindowRendererProps) {
	return (
		<>
			{windows.map((window) => {
				switch (window.type) {
					case 'debug':
						return (
							<DebugWindow
								key={window.id}
								id={window.id}
								x={window.x}
								y={window.y}
								onPositionChange={onPositionChange}
								onAddWindow={onAddWindow}
							/>
						)
					default:
						return null
				}
			})}
		</>
	)
}
