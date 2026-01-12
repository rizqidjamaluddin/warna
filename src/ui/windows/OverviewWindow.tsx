import { useSwatchesValue, useSwatchNames, useToneNames } from '../../hooks/useProjectAtoms'
import type { WindowInstance } from '../../types'
import type { VisionType } from '../../atoms/ui'
import { FloatingWindow } from '../FloatingWindow'
import { ColorCell } from './overview/ColorCell'
import { LightnessChart } from './overview/LightnessChart'
import { ChromaChart } from './overview/ChromaChart'

interface OverviewWindowProps {
	id: string
	title: string
	x: number
	y: number
	width: number
	height: number
	isFullscreen?: boolean
	menuBarHeight: number
	zIndex?: number
	viewOptions?: {
		gridlines?: 'black' | 'white' | 'none'
		visionType?: VisionType
	}
	onBringToFront?: () => void
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
	onAddWindow?: (window: WindowInstance) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
}

export function OverviewWindow({
	id,
	title,
	x,
	y,
	width,
	height,
	isFullscreen,
	zIndex,
	menuBarHeight,
	viewOptions,
	onPositionChange,
	onResize,
	onClose,
	onToggleFullscreen,
	onBringToFront,
	onUpdateWindow,
	onAddWindow,
}: OverviewWindowProps) {
	// Only subscribe to the exact data needed
	const swatches = useSwatchesValue()
	const swatchNames = useSwatchNames()
	const toneNames = useToneNames()

	const gridlines = viewOptions?.gridlines ?? 'none'
	const visionType = viewOptions?.visionType ?? 'normal'

	// Calculate global max chroma across all swatches for consistent chart scaling
	const maxChroma = Math.max(
		...swatchNames.flatMap(swatchName =>
			toneNames.map(toneName => swatches[swatchName]?.[toneName]?.c ?? 0)
		),
		0.3 // Minimum to ensure reasonable scale
	)

	const gridlineBorder = gridlines === 'black' ? 'border-r border-b border-black'
		: gridlines === 'white' ? 'border-r border-b border-white'
		: ''

	const handleOpenLightnessComparison = () => {
		if (!onAddWindow) return
		onAddWindow({
			id: `lightness-comparison-${Date.now()}`,
			type: 'lightness-comparison',
			title: 'Project Lightness Comparison',
			x: 100,
			y: 100,
			width: 800,
			height: 600,
			isFullscreen: false,
		})
	}

	const handleOpenChromaComparison = () => {
		if (!onAddWindow) return
		onAddWindow({
			id: `chroma-comparison-${Date.now()}`,
			type: 'chroma-comparison',
			title: 'Project Chroma Comparison',
			x: 120,
			y: 120,
			width: 800,
			height: 600,
			isFullscreen: false,
		})
	}

	const content = (
		<div className="h-full flex flex-col bg-white dark:bg-gray-900">
			{/* Toolbar */}
			<div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-2">
					<label htmlFor={`gridlines-${id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Gridlines:
					</label>
					<select
						id={`gridlines-${id}`}
						value={gridlines}
						onChange={(e) => onUpdateWindow(id, {
							viewOptions: { ...viewOptions, gridlines: e.target.value as 'black' | 'white' | 'none' }
						})}
						className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="none">None</option>
						<option value="black">Black</option>
						<option value="white">White</option>
					</select>
				</div>

				<div className="flex items-center gap-2">
					<label htmlFor={`vision-${id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Vision:
					</label>
					<select
						id={`vision-${id}`}
						value={visionType}
						onChange={(e) => onUpdateWindow(id, {
							viewOptions: { ...viewOptions, visionType: e.target.value as VisionType }
						})}
						className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="normal">Normal</option>
						<option value="protanopia">Protanopia (Red-blind)</option>
						<option value="deuteranopia">Deuteranopia (Green-blind)</option>
						<option value="tritanopia">Tritanopia (Blue-blind)</option>
						<option value="protanomaly">Protanomaly (Red-weak)</option>
						<option value="deuteranomaly">Deuteranomaly (Green-weak)</option>
						<option value="tritanomaly">Tritanomaly (Blue-weak)</option>
						<option value="achromatopsia">Achromatopsia (Monochrome)</option>
						<option value="achromatomaly">Achromatomaly (Near-monochrome)</option>
					</select>
				</div>
			</div>

			{/* Grid */}
			<div className="flex-1 overflow-auto">
				<div className="grid" style={{ gridTemplateColumns: `auto repeat(${toneNames.length}, minmax(80px, 1fr)) auto auto`, gap: 0 }}>
					{/* Top-left corner cell */}
					<div className={`sticky top-0 left-0 z-20 bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur p-2 text-sm font-semibold ${gridlineBorder}`} />

					{/* Header row - tone names */}
					{toneNames.map((toneName) => (
						<div
							key={toneName}
							className={`sticky top-0 z-10 bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur px-3 py-2 text-center text-sm font-semibold flex items-center justify-center uppercase text-gray-600 dark:text-gray-400 ${gridlineBorder}`}
						>
							{toneName}
						</div>
					))}

					{/* Header cell for lightness chart */}
					<div
						className={`sticky top-0 z-10 bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur px-3 py-2 text-center text-sm font-semibold flex items-center justify-center uppercase text-gray-600 dark:text-gray-400 ${gridlineBorder} cursor-pointer hover:bg-gray-300/70 dark:hover:bg-gray-600/70 transition-colors`}
						onClick={handleOpenLightnessComparison}
						title="Click to open lightness comparison chart"
					>
						Lightness
					</div>

					{/* Header cell for chroma chart */}
					<div
						className={`sticky top-0 z-10 bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur px-3 py-2 text-center text-sm font-semibold flex items-center justify-center uppercase text-gray-600 dark:text-gray-400 ${gridlineBorder} cursor-pointer hover:bg-gray-300/70 dark:hover:bg-gray-600/70 transition-colors`}
						onClick={handleOpenChromaComparison}
						title="Click to open chroma comparison chart"
					>
						Chroma
					</div>

					{/* Data rows */}
					{swatchNames.map((swatchName) => (
						<>
							{/* Leftmost header cell - swatch name */}
							<div
								key={`${swatchName}-header`}
								className={`sticky left-0 z-10 bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur px-3 py-2 text-sm font-semibold whitespace-nowrap flex items-center uppercase text-gray-600 dark:text-gray-400 ${gridlineBorder}`}
							>
								{swatchName}
							</div>

							{/* Color cells */}
							{toneNames.map((toneName) => (
								<ColorCell
									key={`${swatchName}-${toneName}`}
									color={swatches[swatchName]?.[toneName]}
									swatchName={swatchName}
									toneName={toneName}
									gridlines={gridlines}
									visionType={visionType}
									onClick={() => {
										if (onAddWindow) {
											const newWindow: WindowInstance = {
												id: crypto.randomUUID(),
												type: 'color-edit' as const,
												title: `Edit ${swatchName}.${toneName}`,
												x: 150,
												y: 150,
												width: 400,
												height: 500,
												isFullscreen: false,
												swatchName: swatchName,
												toneName: toneName,
											}
											onAddWindow(newWindow)
										}
									}}
								/>
							))}

							{/* Lightness chart */}
							<LightnessChart
								key={`${swatchName}-lightness-chart`}
								tones={swatches[swatchName] ?? {}}
								toneNames={toneNames}
								gridlines={gridlines}
							/>

							{/* Chroma chart */}
							<ChromaChart
								key={`${swatchName}-chroma-chart`}
								tones={swatches[swatchName] ?? {}}
								toneNames={toneNames}
								gridlines={gridlines}
								maxChroma={maxChroma}
							/>
						</>
					))}
				</div>
			</div>
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
			noPadding={true}
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
