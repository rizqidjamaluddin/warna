interface DataPoint {
	index: number
	value: number
	color?: string
	label?: string
}

interface ChartProps {
	data: DataPoint[]
	width?: number
	height?: number
	gridlines: 'black' | 'white' | 'none'
	showAxisLabels?: boolean
	showYAxisValues?: boolean
	xAxisLabel?: string
	yAxisLabel?: string
	lineColor?: string
	pointColor?: string
	maxDataPoints?: number
}

export function Chart({
	data,
	width = 200,
	height = 80,
	gridlines,
	showAxisLabels = false,
	showYAxisValues = false,
	xAxisLabel,
	yAxisLabel,
	lineColor = 'rgb(59, 130, 246)', // blue-500
	pointColor = 'rgb(37, 99, 235)', // blue-600
	maxDataPoints = 20,
}: ChartProps) {
	const padding = {
		top: 10,
		right: 15,
		bottom: showAxisLabels ? 20 : 10,
		left: showYAxisValues ? 30 : 15,
	}
	const chartWidth = width - padding.left - padding.right
	const chartHeight = height - padding.top - padding.bottom

	if (data.length === 0) {
		return (
			<div
				className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 ${
					gridlines === 'black' ? 'border-r border-b border-black' :
					gridlines === 'white' ? 'border-r border-b border-white' : ''
				}`}
				style={{ width, height }}
			>
				No data
			</div>
		)
	}

	// Calculate positions
	const xScale = (index: number) => padding.left + (index / (maxDataPoints - 1)) * chartWidth
	const yScale = (value: number) => padding.top + (1 - value) * chartHeight

	// Generate gridlines (5 horizontal lines)
	const gridlineCount = 5
	const gridlinePositions = Array.from({ length: gridlineCount }, (_, i) => {
		const value = i / (gridlineCount - 1)
		return {
			y: yScale(value),
			label: value.toFixed(1),
		}
	})

	// Generate path for connecting lines
	const linePath = data.map((d, i) => {
		const x = xScale(d.index)
		const y = yScale(d.value)
		return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
	}).join(' ')

	const gridlineBorder = gridlines === 'black' ? 'border-r border-b border-black'
		: gridlines === 'white' ? 'border-r border-b border-white'
		: ''

	return (
		<div
			className={`bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${gridlineBorder}`}
			style={{ width, height }}
		>
			<svg width={width} height={height} className="overflow-visible">
				{/* Gridlines */}
				{gridlinePositions.map((pos, i) => (
					<line
						key={i}
						x1={padding.left}
						y1={pos.y}
						x2={padding.left + chartWidth}
						y2={pos.y}
						stroke="currentColor"
						strokeWidth="0.5"
						opacity="0.2"
						className="text-gray-400 dark:text-gray-600"
					/>
				))}

				{/* Y-axis labels */}
				{showYAxisValues && gridlinePositions.map((pos, i) => (
					<text
						key={i}
						x={padding.left - 5}
						y={pos.y}
						textAnchor="end"
						alignmentBaseline="middle"
						className="text-gray-600 dark:text-gray-400"
						style={{ fontSize: '8px' }}
					>
						{pos.label}
					</text>
				))}

				{/* Main axes - thicker white lines */}
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

				{/* Connecting lines */}
				<path
					d={linePath}
					fill="none"
					stroke={lineColor}
					strokeWidth="1.5"
				/>

				{/* Data points (circles) */}
				{data.map((d) => {
					const cx = xScale(d.index)
					const cy = yScale(d.value)

					return (
						<g key={d.index}>
							{/* Outer circle */}
							<circle
								cx={cx}
								cy={cy}
								r="4"
								fill={d.color || pointColor}
								stroke="white"
								strokeWidth="1"
							/>
						</g>
					)
				})}

				{/* X-axis label */}
				{showAxisLabels && xAxisLabel && (
					<text
						x={padding.left + chartWidth / 2}
						y={height - 2}
						textAnchor="middle"
						className="text-gray-600 dark:text-gray-400"
						style={{ fontSize: '8px' }}
					>
						{xAxisLabel}
					</text>
				)}

				{/* Y-axis label */}
				{showAxisLabels && yAxisLabel && (
					<text
						x={8}
						y={padding.top + chartHeight / 2}
						textAnchor="middle"
						className="text-gray-600 dark:text-gray-400"
						style={{ fontSize: '8px' }}
						transform={`rotate(-90, 8, ${padding.top + chartHeight / 2})`}
					>
						{yAxisLabel}
					</text>
				)}
			</svg>
		</div>
	)
}
