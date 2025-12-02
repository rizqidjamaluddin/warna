import type { LCHColor } from '../../../types'
import { toHex } from '../../../utils/color'
import { Chart } from './Chart'

interface LightnessChartProps {
	tones: Record<string, LCHColor | undefined>
	toneNames: string[]
	gridlines: 'black' | 'white' | 'none'
}

export function LightnessChart({ tones, toneNames, gridlines }: LightnessChartProps) {
	// Extract lightness values for each tone
	const data = toneNames
		.map((toneName, index) => {
			const color = tones[toneName]
			return {
				index,
				value: color?.l ?? null,
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
			yAxisLabel="Lightness"
			maxDataPoints={toneNames.length}
		/>
	)
}
