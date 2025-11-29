import { useAtomValue } from 'jotai'
import type { LCHColor } from '../../../types'
import { toHex, getContrastTextColor, applyVisionSimulation } from '../../../utils/color'
import { visionTypeAtom } from '../../../atoms/ui'

interface ColorCellProps {
	color: LCHColor | undefined
	swatchName: string
	toneName: string
	gridlines: 'black' | 'white' | 'none'
}

export function ColorCell({ color, swatchName, toneName, gridlines }: ColorCellProps) {
	const visionType = useAtomValue(visionTypeAtom)
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

	// Apply vision simulation
	const simulatedColor = applyVisionSimulation(color, visionType)
	const backgroundColor = toHex(simulatedColor)
	const textColor = getContrastTextColor(simulatedColor)
	const colorName = `${swatchName}.${toneName}`

	return (
		<div
			className={`p-2 min-h-[60px] flex items-center justify-center text-xs font-medium ${gridlineBorder}`}
			style={{ backgroundColor, color: textColor }}
			title={`${swatchName}-${toneName}`}
		>
			{colorName}
		</div>
	)
}
