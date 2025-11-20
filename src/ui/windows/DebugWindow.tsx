import { useEffect, useState } from 'react'
import type { WindowInstance } from '../../types'
import { Button } from '../Button'
import { FloatingWindow } from '../FloatingWindow'
import { Input } from '../Input'

interface DebugWindowProps {
	id: string
	x: number
	y: number
	name: string
	isFullscreen?: boolean
	onPositionChange: (id: string, x: number, y: number) => void
	onAddWindow: (window: WindowInstance) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string) => void
}

export function DebugWindow({
	id,
	x,
	y,
	name,
	isFullscreen,
	onPositionChange,
	onAddWindow,
	onUpdateWindow,
	onClose,
	onToggleFullscreen,
}: DebugWindowProps) {
	const [localName, setLocalName] = useState(name)

	// Sync local state with prop when it changes
	useEffect(() => {
		setLocalName(name)
	}, [name])

	function handleAddWindow() {
		const newWindow: WindowInstance = {
			id: crypto.randomUUID(),
			type: 'debug',
			x: x + 30,
			y: y + 30,
			isFullscreen: false,
			name: 'Debug Window',
		}
		onAddWindow(newWindow)
	}

	function handleNameChange(newName: string) {
		setLocalName(newName)
		onUpdateWindow(id, { name: newName })
	}

	const content = (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">
					Window Name
				</label>
				<Input
					value={localName}
					onChange={(e) => handleNameChange(e.target.value)}
					placeholder="Enter window name"
					className="text-sm"
				/>
			</div>
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
			title={localName || 'Debug Window'}
			onPositionChange={onPositionChange}
			onClose={onClose}
			onToggleFullscreen={onToggleFullscreen}
		>
			{content}
		</FloatingWindow>
	)
}
