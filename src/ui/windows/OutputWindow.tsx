import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useSwatchesValue, useUpdatePreferences, usePreferences } from '../../hooks/useProjectAtoms'
import type { Swatches, WindowInstance } from '../../types'
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
	onUpdateWindow: (id: string, updates: Partial<WindowInstance>) => void
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
			if (color && color.h !== undefined) {
				lines.push(`  --color-${swatchName}-${toneName}: oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(3)});`)
			}
		}
	}

	lines.push('}')
	return lines.join('\n')
}

function formatAsTailwindV3(swatches: Swatches): string {
	const lines: string[] = [
		'module.exports = {',
		'  theme: {',
		'    extend: {',
		'      colors: {',
	]

	for (const [swatchName, tones] of Object.entries(swatches)) {
		lines.push(`        '${swatchName}': {`)

		for (const [toneName, color] of Object.entries(tones)) {
			if (color && color.h !== undefined) {
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

function formatAsTailwindV4(swatches: Swatches, overrideDefaultColors: boolean): string {
	const lines: string[] = ['@theme {']

	// Add override for default colors if enabled
	if (overrideDefaultColors) {
		lines.push('  --color-*: initial;')
		lines.push('')
	}

	for (const [swatchName, tones] of Object.entries(swatches)) {
		for (const [toneName, color] of Object.entries(tones)) {
			if (color && color.h !== undefined) {
				lines.push(`  --color-${swatchName}-${toneName}: oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(3)});`)
			}
		}
	}

	lines.push('}')
	return lines.join('\n')
}

interface CodeBlockWithCopyProps {
	content: string
	bottomPanel?: React.ReactNode
}

function CodeBlockWithCopy({ content, bottomPanel }: CodeBlockWithCopyProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	return (
		<div className="relative h-full group flex flex-col">
			<div className="flex-1 overflow-auto">
				<pre className="h-full text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3">
					{content}
				</pre>
			</div>
			{bottomPanel && (
				<div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
					{bottomPanel}
				</div>
			)}
			<button
				onClick={handleCopy}
				className="absolute top-2 right-2 p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
				title="Copy to clipboard"
			>
				{copied ? (
					<CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
				) : (
					<ClipboardDocumentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
				)}
			</button>
		</div>
	)
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
	onUpdateWindow,
	onClose,
	onToggleFullscreen,
	onBringToFront,
}: OutputWindowProps) {
	// Only subscribe to swatches
	const swatches = useSwatchesValue()
	const [preferences] = usePreferences()
	const updatePreferences = useUpdatePreferences()
	const [activeTabId, setActiveTabId] = useState<'json' | 'css' | 'tailwind-v4' | 'tailwind-v3'>(preferences.outputFormat ?? 'json')
	const [overrideDefaultColors, setOverrideDefaultColors] = useState(preferences.overrideDefaultColors ?? true)

	const tabs: Tab[] = [
		{
			id: 'json',
			label: 'JSON',
			content: <CodeBlockWithCopy content={formatAsJSON(swatches)} />,
		},
		{
			id: 'css',
			label: 'CSS',
			content: <CodeBlockWithCopy content={formatAsCSS(swatches)} />,
		},
		{
			id: 'tailwind-v4',
			label: 'CSS (TW v4)',
			content: (
				<CodeBlockWithCopy
					content={formatAsTailwindV4(swatches, overrideDefaultColors)}
					bottomPanel={
						<div className="px-3 py-2">
							<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
								<input
									type="checkbox"
									checked={overrideDefaultColors}
									onChange={(e) => handleOverrideDefaultColorsChange(e.target.checked)}
									className="rounded border-gray-300 dark:border-gray-600"
								/>
								<span>Override default colors</span>
							</label>
						</div>
					}
				/>
			),
		},
		{
			id: 'tailwind-v3',
			label: 'TW (v3)',
			content: <CodeBlockWithCopy content={formatAsTailwindV3(swatches)} />,
		},
	]

	function handleTabChange(tabId: string) {
		const format = tabId as 'json' | 'css' | 'tailwind-v4' | 'tailwind-v3'
		setActiveTabId(format)
		const tab = tabs.find((t) => t.id === tabId)
		if (tab) {
			onUpdateWindow(id, { title: `Output (${tab.label})` })
		}
		// Save tab preference
		void updatePreferences((current) => ({
			...current,
			outputFormat: format,
		}))
	}

	function handleOverrideDefaultColorsChange(checked: boolean) {
		setOverrideDefaultColors(checked)
		// Save override preference
		void updatePreferences((current) => ({
			...current,
			overrideDefaultColors: checked,
		}))
	}

	// Sync state when preferences change externally
	useEffect(() => {
		if (preferences.outputFormat !== undefined && preferences.outputFormat !== activeTabId) {
			setActiveTabId(preferences.outputFormat)
		}
		if (preferences.overrideDefaultColors !== undefined && preferences.overrideDefaultColors !== overrideDefaultColors) {
			setOverrideDefaultColors(preferences.overrideDefaultColors)
		}
	}, [preferences, activeTabId, overrideDefaultColors])

	// Set initial title on mount
	useEffect(() => {
		const tab = tabs.find((t) => t.id === activeTabId)
		if (tab) {
			onUpdateWindow(id, { title: `Output (${tab.label})` })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const content = <Tabs tabs={tabs} activeTabId={activeTabId} onActiveTabChange={handleTabChange} />

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
