import { formatHex, oklch } from 'culori'
import type { LCHColor } from '../../../types'

interface ColorCellProps {
	color: LCHColor | undefined
	swatchName: string
	toneName: string
	gridlines: 'black' | 'white' | 'none'
}

export function ColorCell({ color, swatchName, toneName, gridlines }: ColorCellProps) {
	const gridlineBorder = gridlines === 'black' ? 'border-r border-b border-black'
		: gridlines === 'white' ? 'border-r border-b border-white'
		: ''

	if (!color) {
		return (
			<div className={`bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs text-gray-500 dark:text-gray-400 min-h-[60px] flex items-center justify-center ${gridlineBorder}`}>
				Missing
			</div>
		)
	}

	const backgroundColor = formatHex(oklch(color))

	return (
		<div
			className={`p-2 min-h-[60px] ${gridlineBorder}`}
			style={{ backgroundColor }}
			title={`${swatchName}-${toneName}`}
		/>
	)
}
