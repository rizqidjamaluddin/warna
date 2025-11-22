import { useProject } from '../../hooks/useProject'
import type { Swatches } from '../../types'
import { FloatingWindow } from '../FloatingWindow'
import { Tabs, type Tab } from '../Tabs'

interface OutputWindowProps {
	id: string
	title: string
	x: number
	y: number
	width: number
	height: number
	isFullscreen?: boolean
	menuBarHeight: number
	zIndex?: number
	onBringToFront?: () => void
	onPositionChange: (id: string, x: number, y: number) => void
	onResize: (id: string, width: number, height: number) => void
	onClose: (id: string) => void
	onToggleFullscreen: (id: string, x?: number, y?: number) => void
}

function formatAsJSON(swatches: Swatches): string {
	return JSON.stringify(swatches, null, 2)
}

function formatAsCSS(swatches: Swatches): string {
	const lines: string[] = [':root {']

	for (const [swatchName, tones] of Object.entries(swatches)) {
		for (const [toneName, color] of Object.entries(tones)) {
			if (color) {
				lines.push(`  --color-${swatchName}-${toneName}: oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(3)});`)
			}
		}
	}

	lines.push('}')
	return lines.join('\n')
}

function formatAsTailwind(swatches: Swatches): string {
	const lines: string[] = [
		'module.exports = {',
		'  theme: {',
		'    extend: {',
		'      colors: {',
	]

	for (const [swatchName, tones] of Object.entries(swatches)) {
		lines.push(`        '${swatchName}': {`)

		for (const [toneName, color] of Object.entries(tones)) {
			if (color) {
				lines.push(`          '${toneName}': 'oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(3)})',`)
			}
		}

		lines.push('        },')
	}

	lines.push(
		'      },',
		'    },',
		'  },',
		'}',
	)

	return lines.join('\n')
}

export function OutputWindow({
	id,
	title,
	x,
	y,
	width,
	height,
	isFullscreen,
	zIndex,
	menuBarHeight,
	onPositionChange,
	onResize,
	onClose,
	onToggleFullscreen,
	onBringToFront,
}: OutputWindowProps) {
	const { currentProject } = useProject()

	const swatches = currentProject?.data.swatches ?? {}

	const tabs: Tab[] = [
		{
			id: 'json',
			label: 'JSON',
			content: (
				<pre className="h-full overflow-auto text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3">
					{formatAsJSON(swatches)}
				</pre>
			),
		},
		{
			id: 'css',
			label: 'CSS',
			content: (
				<pre className="h-full overflow-auto text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3">
					{formatAsCSS(swatches)}
				</pre>
			),
		},
		{
			id: 'tailwind',
			label: 'Tailwind',
			content: (
				<pre className="h-full overflow-auto text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3">
					{formatAsTailwind(swatches)}
				</pre>
			),
		},
	]

	const content = <Tabs tabs={tabs} defaultTabId="json" />

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
