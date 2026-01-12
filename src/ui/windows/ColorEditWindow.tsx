import { useCallback, useEffect, useState } from 'react'
import type { Oklch } from 'culori'
import { useColor } from '../../hooks/useProjectAtoms'
import { useColorEditMode } from '../../hooks/useSelection'
import type { WindowInstance } from '../../types'
import { isInGamut, oklchToRgb, rgbToOklch, toHex } from '../../utils/color'
import { useRenderLoopDetector } from '../../utils/useRenderLoopDetector'
import { FloatingWindow } from '../FloatingWindow'

function isOklchColor(value: unknown): value is Oklch {
	return typeof value === 'object' && value !== null && 'mode' in value && 'l' in value && 'c' in value
}

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
	const [colorValue, setColor] = useColor(swatchName, toneName)
	const color = isOklchColor(colorValue) ? colorValue : undefined
	const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 })
	const { setEditMode } = useColorEditMode(swatchName, toneName)

	useRenderLoopDetector('ColorEditWindow', {
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
	})

	// Initialize RGB from color on mount only
	useEffect(() => {
		if (color) {
			setRgb(oklchToRgb(color))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', value: number) => {
		// Set edit mode to RGB
		setEditMode('rgb')

		setRgb((currentRgb) => {
			const newRgb = { ...currentRgb, [channel]: value }

			// Convert to OKLch and update immediately
			const newColor = rgbToOklch(newRgb.r, newRgb.g, newRgb.b)
			setColor(newColor)

			return newRgb
		})
	}, [setEditMode, setColor])

	const outOfGamut = color ? !isInGamut(color) : false

	const content = (
		<div className={`h-full flex flex-col bg-white dark:bg-gray-900 overflow-auto ${isFullscreen ? '' : 'p-4'}`}>
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
					{swatchName}.{toneName}
				</h3>
			</div>

			{color
				? (
					<div className="flex flex-col gap-4">
						{/* Color preview */}
						<div
							className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700"
							style={{ backgroundColor: toHex(color) }}
						/>

						{/* Out of gamut warning */}
						{outOfGamut && (
							<div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
								⚠️ This color is outside the sRGB gamut. The RGB values shown are a close approximation.
								Adjusting RGB will bring the color into sRGB.
							</div>
						)}

						{/* RGB sliders */}
						<div className="flex flex-col gap-3">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								RGB
							</label>

							{/* Red slider */}
							<div className="flex items-center gap-3">
								<label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-6">R</label>
								<input
									type="range"
									min="0"
									max="255"
									value={rgb.r}
									onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
									className="flex-1"
								/>
								<span className="text-xs font-mono text-gray-700 dark:text-gray-300 w-8 text-right">
									{rgb.r}
								</span>
							</div>

							{/* Green slider */}
							<div className="flex items-center gap-3">
								<label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-6">G</label>
								<input
									type="range"
									min="0"
									max="255"
									value={rgb.g}
									onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
									className="flex-1"
								/>
								<span className="text-xs font-mono text-gray-700 dark:text-gray-300 w-8 text-right">
									{rgb.g}
								</span>
							</div>

							{/* Blue slider */}
							<div className="flex items-center gap-3">
								<label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-6">B</label>
								<input
									type="range"
									min="0"
									max="255"
									value={rgb.b}
									onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
									className="flex-1"
								/>
								<span className="text-xs font-mono text-gray-700 dark:text-gray-300 w-8 text-right">
									{rgb.b}
								</span>
							</div>
						</div>

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
				)
				: (
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
