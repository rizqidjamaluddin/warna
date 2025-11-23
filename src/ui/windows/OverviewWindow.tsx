import { useMemo } from 'react'
import { useSwatchesValue, useSwatchNames, useToneNames, useOverviewGridlines } from '../../hooks/useProjectAtoms'
import type { WindowInstance } from '../../types'
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
	const [gridlines] = useOverviewGridlines()

	// swatchNames and toneNames are already derived atoms, no need to compute here

	const gridlineBorder = gridlines === 'black' ? 'border-r border-b border-black'
		: gridlines === 'white' ? 'border-r border-b border-white'
		: ''

	const content = (
		<div className="h-full overflow-auto bg-white dark:bg-gray-900">
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
							/>
						))}
					</>
				))}
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
