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
	yMin?: number
	yMax?: number
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
	yMin = 0,
	yMax = 1,
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
			<svg width={width} height={height}>
				{/* Background */}
				<rect
					width={width}
					height={height}
					className="fill-gray-100 dark:fill-gray-800"
				/>
				{/* Borders */}
				{gridlines !== 'none' && (
					<>
						<line
							x1={width}
							y1={0}
							x2={width}
							y2={height}
							className={gridlines === 'black' ? 'stroke-black' : 'stroke-white'}
							strokeWidth="1"
						/>
						<line
							x1={0}
							y1={height}
							x2={width}
							y2={height}
							className={gridlines === 'black' ? 'stroke-black' : 'stroke-white'}
							strokeWidth="1"
						/>
					</>
				)}
				{/* "No data" text */}
				<text
					x={width / 2}
					y={height / 2}
					textAnchor="middle"
					alignmentBaseline="middle"
					className="fill-gray-500 dark:fill-gray-400"
					style={{ fontSize: '12px' }}
				>
					No data
				</text>
			</svg>
		)
	}

	// Calculate positions
	const xScale = (index: number) => padding.left + (index / (maxDataPoints - 1)) * chartWidth
	const yScale = (value: number) => {
		const normalized = (value - yMin) / (yMax - yMin)
		return padding.top + (1 - normalized) * chartHeight
	}

	// Generate gridlines (5 horizontal lines)
	const gridlineCount = 5
	const gridlinePositions = Array.from({ length: gridlineCount }, (_, i) => {
		const normalized = i / (gridlineCount - 1)
		const actualValue = yMin + normalized * (yMax - yMin)
		return {
			y: yScale(actualValue),
			label: actualValue.toFixed(2),
		}
	})

	// Generate path for connecting lines
	const linePath = data.map((d, i) => {
		const x = xScale(d.index)
		const y = yScale(d.value)
		return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
	}).join(' ')

	return (
		<svg width={width} height={height}>
			{/* Background */}
			<rect
				width={width}
				height={height}
				className="fill-gray-50 dark:fill-gray-900"
			/>
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
								fill={d.color ?? pointColor}
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

			{/* Borders */}
			{gridlines !== 'none' && (
				<>
					<line
						x1={width}
						y1={0}
						x2={width}
						y2={height}
						className={gridlines === 'black' ? 'stroke-black' : 'stroke-white'}
						strokeWidth="1"
					/>
					<line
						x1={0}
						y1={height}
						x2={width}
						y2={height}
						className={gridlines === 'black' ? 'stroke-black' : 'stroke-white'}
						strokeWidth="1"
					/>
				</>
			)}
		</svg>
	)
}
