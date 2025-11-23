import { formatHex, oklch } from 'culori'
import type { LCHColor } from '../../../types'

interface ColorCellProps {
	color: LCHColor | undefined
	swatchName: string
	toneName: string
}

export function ColorCell({ color, swatchName, toneName }: ColorCellProps) {
	if (!color) {
		return (
			<div className="border-r border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs text-gray-500 dark:text-gray-400 min-h-[60px] flex items-center justify-center">
				Missing
			</div>
		)
	}

	const backgroundColor = formatHex(oklch(color))

	return (
		<div
			className="border-r border-b border-gray-300 dark:border-gray-600 p-2 min-h-[60px]"
			style={{ backgroundColor }}
			title={`${swatchName}-${toneName}`}
		/>
	)
}
