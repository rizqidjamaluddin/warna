import type { LCHColor } from '../../../types'
import { toHex } from '../../../utils/color'
import { Chart } from './Chart'

interface ChromaChartProps {
	tones: Record<string, LCHColor | undefined>
	toneNames: string[]
	gridlines: 'black' | 'white' | 'none'
	maxChroma: number
}

export function ChromaChart({ tones, toneNames, gridlines, maxChroma }: ChromaChartProps) {
	// Extract absolute chroma values for each tone (no normalization!)
	const data = toneNames
		.map((toneName, index) => {
			const color = tones[toneName]
			return {
				index,
				value: color !== undefined ? color.c : null, // Use absolute chroma value
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
			showYAxisValues={true}
			xAxisLabel="Tone"
			yAxisLabel="Chroma"
			maxDataPoints={toneNames.length}
			yMin={0}
			yMax={maxChroma}
		/>
	)
}
