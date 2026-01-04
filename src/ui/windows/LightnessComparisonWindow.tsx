import { useState } from 'react'
import { useSwatchesValue, useSwatchNames, useToneNames } from '../../hooks/useProjectAtoms'
import type { WindowInstance } from '../../types'
import { FloatingWindow } from '../FloatingWindow'
import { toHex } from '../../utils/color'
import { ComparisonChart } from './overview/ComparisonChart'

interface LightnessComparisonWindowProps {
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

export function LightnessComparisonWindow({
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
}: LightnessComparisonWindowProps) {
	const swatches = useSwatchesValue()
	const swatchNames = useSwatchNames()
	const toneNames = useToneNames()
	const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)

	// Prepare data series for the chart
	const series = swatchNames.map((swatchName) => {
		// Get the middle tone color to represent this swatch
		const middleIndex = Math.floor(toneNames.length / 2)
		const middleColor = swatches[swatchName]?.[toneNames[middleIndex]]
		const representativeColor = middleColor ? toHex(middleColor) : '#000000'

		return {
			name: swatchName,
			legendColor: representativeColor,
			data: toneNames
				.map((toneName, index) => ({
					index,
					value: swatches[swatchName]?.[toneName]?.l,
					color: swatches[swatchName]?.[toneName],
				}))
				.filter((d) => d.value !== undefined && d.color !== undefined)
				.map((d) => ({
					index: d.index,
					value: d.value!,
					color: representativeColor,
				})),
		}
	})

	const content = (
		<div className="h-full flex bg-white dark:bg-gray-900">
			{/* Chart */}
			<div className="flex-1 flex items-center justify-center p-4">
				<ComparisonChart
					series={series}
					labels={toneNames}
					width={width - 200}
					height={height}
					yMin={0}
					yMax={1}
					xAxisLabel="Tone"
					yAxisLabel="Lightness"
					hoveredSeries={hoveredSeries}
				/>
			</div>

			{/* Vertical scrollable legend */}
			<div className="w-48 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
				<div className="p-3">
					{series.map((s) => (
						<div
							key={s.name}
							className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 py-1 transition-colors"
							onMouseEnter={() => setHoveredSeries(s.name)}
							onMouseLeave={() => setHoveredSeries(null)}
						>
							<div
								className="w-3 h-3 rounded-full flex-shrink-0"
								style={{ backgroundColor: s.legendColor }}
							/>
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
								{s.name}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)

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
