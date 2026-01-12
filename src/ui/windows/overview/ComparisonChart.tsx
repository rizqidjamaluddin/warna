interface DataSeries {
	name: string
	legendColor: string
	data: Array<{
		index: number
		value: number
		color: string
	}>
}

interface ComparisonChartProps {
	series: DataSeries[]
	labels: string[]
	width: number
	height: number
	yMin?: number
	yMax?: number
	xAxisLabel?: string
	yAxisLabel?: string
	showAxisLabels?: boolean
	showGridlines?: boolean
	hoveredSeries?: string | null
	selectedSeries?: Set<string>
}

export function ComparisonChart({
	series,
	labels,
	width,
	height,
	yMin = 0,
	yMax = 1,
	xAxisLabel,
	yAxisLabel,
	showAxisLabels = true,
	showGridlines = true,
	hoveredSeries = null,
	selectedSeries,
}: ComparisonChartProps) {
	// Chart dimensions
	const padding = { top: 40, right: 40, bottom: 60, left: 60 }
	const chartWidth = width - padding.left - padding.right
	const chartHeight = height - padding.top - padding.bottom

	// Scales
	const xScale = (index: number) => padding.left + (index / (labels.length - 1)) * chartWidth
	const yScale = (value: number) => {
		const normalized = (value - yMin) / (yMax - yMin)
		return padding.top + (1 - normalized) * chartHeight
	}

	// Generate gridlines
	const gridlineCount = 5
	const gridlinePositions = Array.from({ length: gridlineCount }, (_, i) => {
		const normalized = i / (gridlineCount - 1)
		const actualValue = yMin + normalized * (yMax - yMin)
		return {
			y: yScale(actualValue),
			label: actualValue.toFixed(2),
		}
	})

	return (
		<svg width={width} height={height} className="overflow-visible">
			{/* Background */}
			<rect
				width={width}
				height={height}
				className="fill-gray-50 dark:fill-gray-900"
			/>

			{/* Gridlines */}
			{showGridlines && gridlinePositions.map((pos, i) => (
				<line
					key={i}
					x1={padding.left}
					y1={pos.y}
					x2={padding.left + chartWidth}
					y2={pos.y}
					stroke="currentColor"
					strokeWidth="1"
					opacity="0.2"
					className="text-gray-400 dark:text-gray-600"
				/>
			))}

			{/* Y-axis labels */}
			{showAxisLabels && gridlinePositions.map((pos, i) => (
				<text
					key={i}
					x={padding.left - 10}
					y={pos.y}
					textAnchor="end"
					alignmentBaseline="middle"
					className="fill-gray-600 dark:fill-gray-400"
					style={{ fontSize: '12px' }}
				>
					{pos.label}
				</text>
			))}

			{/* X-axis labels */}
			{showAxisLabels && labels.map((label, index) => (
				<text
					key={label}
					x={xScale(index)}
					y={padding.top + chartHeight + 20}
					textAnchor="middle"
					className="fill-gray-600 dark:fill-gray-400 uppercase"
					style={{ fontSize: '11px' }}
				>
					{label}
				</text>
			))}

			{/* Main axes */}
			<line
				x1={padding.left}
				y1={padding.top}
				x2={padding.left}
				y2={padding.top + chartHeight}
				stroke="white"
				strokeWidth="2"
				className="dark:stroke-gray-200"
			/>
			<line
				x1={padding.left}
				y1={padding.top + chartHeight}
				x2={padding.left + chartWidth}
				y2={padding.top + chartHeight}
				stroke="white"
				strokeWidth="2"
				className="dark:stroke-gray-200"
			/>

			{/* Axis labels */}
			{showAxisLabels && xAxisLabel && (
				<text
					x={padding.left + chartWidth / 2}
					y={padding.top + chartHeight + 45}
					textAnchor="middle"
					className="fill-gray-700 dark:fill-gray-300"
					style={{ fontSize: '14px', fontWeight: 'bold' }}
				>
					{xAxisLabel}
				</text>
			)}
			{showAxisLabels && yAxisLabel && (
				<text
					x={20}
					y={padding.top + chartHeight / 2}
					textAnchor="middle"
					className="fill-gray-700 dark:fill-gray-300"
					style={{ fontSize: '14px', fontWeight: 'bold' }}
					transform={`rotate(-90, 20, ${padding.top + chartHeight / 2})`}
				>
					{yAxisLabel}
				</text>
			)}

			{/* Plot lines for each series */}
			{/* Render non-highlighted series first, then highlighted series last (for z-index) */}
			{series
				.sort((a, b) => {
					// Priority: hovered > selected > normal
					const aIsHovered = hoveredSeries === a.name
					const bIsHovered = hoveredSeries === b.name
					const aIsSelected = selectedSeries?.has(a.name) ?? false
					const bIsSelected = selectedSeries?.has(b.name) ?? false

					if (aIsHovered && !bIsHovered) return 1
					if (!aIsHovered && bIsHovered) return -1
					if (aIsSelected && !bIsSelected) return 1
					if (!aIsSelected && bIsSelected) return -1
					return 0
				})
				.map((s) => {
					if (s.data.length === 0) return null

					const isHovered = hoveredSeries === s.name
					const isSelected = selectedSeries?.has(s.name) ?? false

					// Determine opacity:
					// - If hovering: highlight hovered AND selected, dim the rest
					// - Else if selection exists: highlight selected, dim the rest
					// - Else: all visible
					const hasHover = hoveredSeries !== null
					const hasSelection = selectedSeries && selectedSeries.size > 0

					let opacity = 1
					if (hasHover) {
						opacity = (isHovered || isSelected) ? 1 : 0.1
					} else if (hasSelection) {
						opacity = isSelected ? 1 : 0.1
					}

					const linePath = s.data
						.map((d, i) => {
							const x = xScale(d.index)
							const y = yScale(d.value)
							return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
						})
						.join(' ')

					return (
						<g key={s.name} opacity={opacity} className="transition-opacity duration-200">
							{/* Line - low contrast */}
							<path
								d={linePath}
								fill="none"
								className="stroke-gray-300 dark:stroke-gray-700"
								strokeWidth="1"
							/>

							{/* Data points */}
							{s.data.map((d) => {
								const size = 8
								const cx = xScale(d.index)
								const cy = yScale(d.value)
								return (
									<rect
										key={d.index}
										x={cx - size / 2}
										y={cy - size / 2}
										width={size}
										height={size}
										fill={d.color}
										stroke="white"
										strokeWidth="1"
									/>
								)
							})}
						</g>
					)
				})}
		</svg>
	)
}
