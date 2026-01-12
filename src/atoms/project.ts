import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import type { ProjectMetadata, Swatches, ProjectPreferences, WindowConfig } from '../types'

// Base atoms - split into separate pieces for granular reactivity
export const projectMetadataAtom = atom<ProjectMetadata | null>(null)
export const swatchesAtom = atom<Swatches>({})
export const preferencesAtom = atom<ProjectPreferences>({})
export const windowConfigAtom = atom<WindowConfig | undefined>(undefined)

// Derived atom for focused fullscreen window
export const focusedFullscreenWindowIdAtom = atom(
	(get) => get(windowConfigAtom)?.focusedFullscreenWindowId,
	(get, set, newValue: string | undefined) => {
		const config = get(windowConfigAtom)
		if (config) {
			set(windowConfigAtom, {
				...config,
				focusedFullscreenWindowId: newValue,
			})
		}
	},
)

// Memoization caches for atom families
const swatchAtomCache = new Map()
const colorAtomCache = new Map()

// Helper to get/set individual swatches - returns atom for a specific swatch
export function swatchAtomFamily(swatchName: string) {
	if (!swatchAtomCache.has(swatchName)) {
		swatchAtomCache.set(
			swatchName,
			focusAtom(swatchesAtom, (optic) => optic.prop(swatchName))
		)
	}
	return swatchAtomCache.get(swatchName)
}

// Helper to get/set a specific color in a swatch
export function colorAtomFamily(swatchName: string, toneName: string) {
	const key = `${swatchName}.${toneName}`
	if (!colorAtomCache.has(key)) {
		colorAtomCache.set(
			key,
			focusAtom(swatchesAtom, (optic) =>
				optic.prop(swatchName).optional().prop(toneName),
			)
		)
	}
	return colorAtomCache.get(key)
}

// Derived atoms for commonly accessed data
export const swatchNamesAtom = atom((get) => Object.keys(get(swatchesAtom)))

export const toneNamesAtom = atom((get) => {
	const swatches = get(swatchesAtom)
	const toneNamesSet = new Set<string>()

	for (const tones of Object.values(swatches)) {
		for (const toneName of Object.keys(tones)) {
			toneNamesSet.add(toneName)
		}
	}

	// Sort tone names numerically
	return Array.from(toneNamesSet).sort((a, b) => {
		const numA = Number.parseInt(a, 10)
		const numB = Number.parseInt(b, 10)
		if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
			return numA - numB
		}
		return a.localeCompare(b)
	})
})

// Combined project atom for operations that need everything (like saving)
export const fullProjectAtom = atom(
	(get) => {
		const metadata = get(projectMetadataAtom)
		if (!metadata) { return null }

		return {
			metadata,
			data: {
				swatches: get(swatchesAtom),
				preferences: get(preferencesAtom),
				windowConfig: get(windowConfigAtom),
			},
		}
	},
	(_get, set, newProject: { metadata: ProjectMetadata; data: { swatches: Swatches; preferences?: ProjectPreferences; windowConfig?: WindowConfig } } | null) => {
		if (!newProject) {
			set(projectMetadataAtom, null)
			set(swatchesAtom, {})
			set(preferencesAtom, {})
			set(windowConfigAtom, undefined)
		} else {
			set(projectMetadataAtom, newProject.metadata)
			set(swatchesAtom, newProject.data.swatches)
			set(preferencesAtom, newProject.data.preferences ?? {})
			set(windowConfigAtom, newProject.data.windowConfig)
		}
	},
)
