import type { LCHColor } from '../../../types'
import { toHex } from '../../../utils/color'
import { Chart } from './Chart'

interface BrightnessChartProps {
	tones: Record<string, LCHColor | undefined>
	toneNames: string[]
	gridlines: 'black' | 'white' | 'none'
}

export function BrightnessChart({ tones, toneNames, gridlines }: BrightnessChartProps) {
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
		.filter((d) => d.value !== null && d.color !== null) as Array<{
			index: number
			value: number
			color: string
			label: string
		}>

	return (
		<Chart
			data={data}
			gridlines={gridlines}
			showAxisLabels={false}
			showYAxisValues={false}
			xAxisLabel="Tone"
			yAxisLabel="Lightness"
			maxDataPoints={toneNames.length}
		/>
	)
}
