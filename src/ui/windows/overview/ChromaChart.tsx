import type { LCHColor } from '../../../types'
import { toHex } from '../../../utils/color'
import { Chart } from './Chart'

interface ChromaChartProps {
	tones: Record<string, LCHColor | undefined>
	toneNames: string[]
	gridlines: 'black' | 'white' | 'none'
}

export function ChromaChart({ tones, toneNames, gridlines }: ChromaChartProps) {
	// Find the max chroma value to normalize the chart
	const maxChroma = Math.max(
		...toneNames.map((toneName) => tones[toneName]?.c ?? 0),
		0.3, // Minimum max to avoid division by zero and ensure reasonable scale
	)

	// Extract chroma values for each tone
	const data = toneNames
		.map((toneName, index) => {
			const color = tones[toneName]
			return {
				index,
				value: color !== undefined ? color.c / maxChroma : null, // Normalize to 0-1 range (0 is valid!)
				color: color ? toHex(color) : null,
				label: toneName,
			}
		})
		.filter((d) => d.value !== null && d.color !== null) as {
			index: number
			value: number
			color: string
			label: string
		}[]

	return (
		<Chart
			data={data}
			gridlines={gridlines}
			showAxisLabels={false}
			showYAxisValues={false}
			xAxisLabel="Tone"
			yAxisLabel="Chroma"
			maxDataPoints={toneNames.length}
		/>
	)
}
