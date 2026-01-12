import { useColor } from '../../hooks/useProjectAtoms'
import type { WindowInstance } from '../../types'
import { toHex } from '../../utils/color'
import { FloatingWindow } from '../FloatingWindow'

interface ColorEditWindowProps {
	id: string
	title: string
	x: number
	y: number
	width: number
	height: number
	isFullscreen?: boolean
	menuBarHeight: number
	swatchName: string
	toneName: string
	zIndex?: number
	onBringToFront?: () => void
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
}

export function ColorEditWindow({
	id,
	title,
	x,
	y,
	width,
	height,
	isFullscreen,
	zIndex,
	menuBarHeight,
	swatchName,
	toneName,
	onPositionChange,
	onResize,
	onClose,
	onToggleFullscreen,
	onBringToFront,
}: ColorEditWindowProps) {
	const [color] = useColor(swatchName, toneName)

	const content = (
		<div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${isFullscreen ? '' : 'p-4'}`}>
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
					{swatchName}.{toneName}
				</h3>
			</div>

			{color ? (
				<div className="flex flex-col gap-4">
					{/* Color preview */}
					<div
						className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700"
						style={{ backgroundColor: toHex(color) }}
					/>

					{/* Hex value */}
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Hex
						</label>
						<div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-900 dark:text-gray-100">
							{toHex(color)}
						</div>
					</div>

					{/* OKLch values */}
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							OKLch
						</label>
						<div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-900 dark:text-gray-100">
							oklch({color.l.toFixed(3)} {color.c.toFixed(3)} {color.h?.toFixed(3) ?? '0.000'})
						</div>
					</div>
				</div>
			) : (
				<div className="text-center text-gray-500 dark:text-gray-400">
					Color not found
				</div>
			)}
		</div>
	)

	// If fullscreen, just return the content (will be rendered by FullscreenWindowManager)
	if (isFullscreen) {
		return content
	}

	return (
		<FloatingWindow
			id={id}
			x={x}
			y={y}
			width={width}
			height={height}
			title={title}
			zIndex={zIndex}
			menuBarHeight={menuBarHeight}
			onPositionChange={onPositionChange}
			onResize={onResize}
			onClose={onClose}
			onToggleFullscreen={onToggleFullscreen}
			onBringToFront={onBringToFront}
		>
			{content}
		</FloatingWindow>
	)
}
