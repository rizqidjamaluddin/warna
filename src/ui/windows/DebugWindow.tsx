import { useEffect, useState } from 'react'
import type { WindowInstance } from '../../types'
import { Button } from '../Button'
import { FloatingWindow } from '../FloatingWindow'
import { Input } from '../Input'

interface DebugWindowProps {
	id: string
	title: string
	x: number
	y: number
	width: number
	height: number
	isFullscreen?: boolean
	menuBarHeight: number
	// Generic window management props (passed through to FloatingWindow)
	zIndex?: number
	onBringToFront?: () => void
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onAddWindow: (window: WindowInstance) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
}

export function DebugWindow({
	id,
	title,
	x,
	y,
	width,
	height,
	isFullscreen,
	zIndex,
	menuBarHeight,
	onPositionChange,
	onResize,
	onAddWindow,
	onUpdateWindow,
	onClose,
	onToggleFullscreen,
	onBringToFront,
}: DebugWindowProps) {
	const [localTitle, setLocalTitle] = useState(title)

	// Sync local state with prop when it changes
	useEffect(() => {
		setLocalTitle(title)
	}, [title])

	function handleAddWindow() {
		const newWindow: WindowInstance = {
			id: crypto.randomUUID(),
			type: 'debug',
			title: 'Debug Window',
			x: x + 30,
			y: y + 30,
			width: 300,
			height: 200,
			isFullscreen: false,
		}
		onAddWindow(newWindow)
	}

	function handleTitleChange(newTitle: string) {
		setLocalTitle(newTitle)
		onUpdateWindow(id, { title: newTitle })
	}

	const content = (
		<div className="space-y-3">
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1">
					Window Title
				</label>
				<Input
					value={localTitle}
					onChange={(e) => handleTitleChange(e.target.value)}
					placeholder="Enter window title"
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
			width={width}
			height={height}
			title={localTitle}
			zIndex={zIndex}
			menuBarHeight={menuBarHeight}
			onPositionChange={onPositionChange}
			onResize={onResize}
			onClose={onClose}
			onToggleFullscreen={onToggleFullscreen}
			onBringToFront={onBringToFront}
		>
			{content}
		</FloatingWindow>
	)
}
