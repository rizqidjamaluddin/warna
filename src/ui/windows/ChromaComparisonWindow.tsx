import { useState, useRef, useEffect } from 'react'
import { useSwatchesValue, useSwatchNames, useToneNames } from '../../hooks/useProjectAtoms'
import { useSelectedSwatchesValue, useToggleSwatchSelection } from '../../hooks/useSelection'
import type { WindowInstance } from '../../types'
import { FloatingWindow } from '../FloatingWindow'
import { toHex } from '../../utils/color'
import { ComparisonChart } from './overview/ComparisonChart'

interface ChromaComparisonWindowProps {
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

export function ChromaComparisonWindow({
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
}: ChromaComparisonWindowProps) {
	const swatches = useSwatchesValue()
	const swatchNames = useSwatchNames()
	const toneNames = useToneNames()
	const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)
	const selectedSwatches = useSelectedSwatchesValue()
	const toggleSwatchSelection = useToggleSwatchSelection()
	const chartContainerRef = useRef<HTMLDivElement>(null)
	const [containerSize, setContainerSize] = useState({ width: width, height: height })

	// Measure container size when in fullscreen or when window resizes
	useEffect(() => {
		if (!isFullscreen) {
			setContainerSize({ width, height })
			return
		}

		const updateSize = () => {
			if (chartContainerRef.current) {
				const rect = chartContainerRef.current.getBoundingClientRect()
				setContainerSize({ width: rect.width, height: rect.height })
			}
		}

		// Initial measurement
		updateSize()

		// Update on window resize
		window.addEventListener('resize', updateSize)
		// Small delay to ensure layout is complete
		const timer = setTimeout(updateSize, 0)

		return () => {
			window.removeEventListener('resize', updateSize)
			clearTimeout(timer)
		}
	}, [isFullscreen, width, height])

	// Calculate global max chroma
	const maxChroma = Math.max(
		...swatchNames.flatMap((swatchName) =>
			toneNames.map((toneName) => swatches[swatchName]?.[toneName]?.c ?? 0)
		),
		0.3
	)

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
					value: swatches[swatchName]?.[toneName]?.c,
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

	// Calculate chart dimensions - use full space in fullscreen, centered with padding otherwise
	const chartPadding = isFullscreen ? 0 : 32 // p-4 on both sides when not fullscreen
	// In fullscreen, use measured container width (flex-1 already excludes legend)
	// In windowed mode, subtract legend width from total window width
	const chartWidth = isFullscreen ? containerSize.width : width - 192
	const chartHeight = containerSize.height - chartPadding

	const content = (
		<div className="h-full flex bg-white dark:bg-gray-900 overflow-hidden">
			{/* Chart */}
			<div ref={chartContainerRef} className={`flex-1 flex overflow-hidden ${isFullscreen ? '' : 'items-center justify-center p-4'}`}>
				<ComparisonChart
					series={series}
					labels={toneNames}
					width={chartWidth}
					height={chartHeight}
					yMin={0}
					yMax={maxChroma}
					xAxisLabel="Tone"
					yAxisLabel="Chroma"
					hoveredSeries={hoveredSeries}
					selectedSeries={selectedSwatches}
				/>
			</div>

			{/* Vertical scrollable legend */}
			<div className="w-48 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex-shrink-0">
				<div className="p-3">
					{series.map((s) => {
						const isSelected = selectedSwatches.has(s.name)
						return (
							<div
								key={s.name}
								className={`flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 py-1 transition-colors ${
									isSelected ? 'bg-gray-200 dark:bg-gray-700' : ''
								}`}
								onMouseEnter={() => setHoveredSeries(s.name)}
								onMouseLeave={() => setHoveredSeries(null)}
								onClick={() => toggleSwatchSelection(s.name)}
							>
								<div
									className="w-3 h-3 rounded-full flex-shrink-0"
									style={{ backgroundColor: s.legendColor }}
								/>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
									{s.name}
								</span>
							</div>
						)
					})}
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
