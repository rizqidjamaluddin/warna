import { useState } from 'react'
import { useSwatchesValue, useSwatchNames, useToneNames } from '../../hooks/useProjectAtoms'
import type { WindowInstance } from '../../types'
import type { VisionType } from '../../atoms/ui'
import { FloatingWindow } from '../FloatingWindow'
import { ColorCell } from './overview/ColorCell'

interface OverviewWindowProps {
	id: string
	title: string
	x: number
	y: number
	width: number
	height: number
	isFullscreen?: boolean
	menuBarHeight: number
	zIndex?: number
	onBringToFront?: () => void
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
}

export function OverviewWindow({
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
	onClose,
	onToggleFullscreen,
	onBringToFront,
}: OverviewWindowProps) {
	// Only subscribe to the exact data needed
	const swatches = useSwatchesValue()
	const swatchNames = useSwatchNames()
	const toneNames = useToneNames()

	// Local state for this window instance
	const [gridlines, setGridlines] = useState<'black' | 'white' | 'none'>('none')
	const [visionType, setVisionType] = useState<VisionType>('normal')

	const gridlineBorder = gridlines === 'black' ? 'border-r border-b border-black'
		: gridlines === 'white' ? 'border-r border-b border-white'
		: ''

	const content = (
		<div className="h-full flex flex-col bg-white dark:bg-gray-900">
			{/* Toolbar */}
			<div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-2">
					<label htmlFor={`gridlines-${id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Gridlines:
					</label>
					<select
						id={`gridlines-${id}`}
						value={gridlines}
						onChange={(e) => setGridlines(e.target.value as 'black' | 'white' | 'none')}
						className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="none">None</option>
						<option value="black">Black</option>
						<option value="white">White</option>
					</select>
				</div>

				<div className="flex items-center gap-2">
					<label htmlFor={`vision-${id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Vision:
					</label>
					<select
						id={`vision-${id}`}
						value={visionType}
						onChange={(e) => setVisionType(e.target.value as VisionType)}
						className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="normal">Normal</option>
						<option value="protanopia">Protanopia (Red-blind)</option>
						<option value="deuteranopia">Deuteranopia (Green-blind)</option>
						<option value="tritanopia">Tritanopia (Blue-blind)</option>
						<option value="protanomaly">Protanomaly (Red-weak)</option>
						<option value="deuteranomaly">Deuteranomaly (Green-weak)</option>
						<option value="tritanomaly">Tritanomaly (Blue-weak)</option>
						<option value="achromatopsia">Achromatopsia (Monochrome)</option>
						<option value="achromatomaly">Achromatomaly (Near-monochrome)</option>
					</select>
				</div>
			</div>

			{/* Grid */}
			<div className="flex-1 overflow-auto">
				<div className="grid" style={{ gridTemplateColumns: `auto repeat(${toneNames.length}, minmax(80px, 1fr))`, gap: 0 }}>
					{/* Top-left corner cell */}
					<div className={`sticky top-0 left-0 z-20 bg-gray-200 dark:bg-gray-700 p-2 text-sm font-semibold ${gridlineBorder}`} />

					{/* Header row - tone names */}
					{toneNames.map((toneName) => (
						<div
							key={toneName}
							className={`sticky top-0 z-10 bg-gray-200 dark:bg-gray-700 p-2 text-center text-sm font-semibold ${gridlineBorder}`}
						>
							{toneName}
						</div>
					))}

					{/* Data rows */}
					{swatchNames.map((swatchName) => (
						<>
							{/* Leftmost header cell - swatch name */}
							<div
								key={`${swatchName}-header`}
								className={`sticky left-0 z-10 bg-gray-200 dark:bg-gray-700 p-2 text-sm font-semibold whitespace-nowrap ${gridlineBorder}`}
							>
								{swatchName}
							</div>

							{/* Color cells */}
							{toneNames.map((toneName) => (
								<ColorCell
									key={`${swatchName}-${toneName}`}
									color={swatches[swatchName]?.[toneName]}
									swatchName={swatchName}
									toneName={toneName}
									gridlines={gridlines}
									visionType={visionType}
								/>
							))}
						</>
					))}
				</div>
			</div>
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
			title={title}
			zIndex={zIndex}
			menuBarHeight={menuBarHeight}
			noPadding={true}
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
