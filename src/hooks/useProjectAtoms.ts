import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import {
	fullProjectAtom,
	projectMetadataAtom,
	swatchesAtom,
	preferencesAtom,
	windowConfigAtom,
	focusedFullscreenWindowIdAtom,
	swatchNamesAtom,
	toneNamesAtom,
	swatchAtomFamily,
	colorAtomFamily,
} from '../atoms/project'
import { saveProject } from '../utils/db'
import type { SavedProject, WindowInstance } from '../types'

// Hook to get/set the full project (for loading/saving)
export function useFullProject() {
	const [project, setProject] = useAtom(fullProjectAtom)
	return { currentProject: project, setCurrentProject: setProject }
}

// Hook for project metadata only
export function useProjectMetadata() {
	return useAtom(projectMetadataAtom)
}

// Hook for swatches (read-only or read-write)
export function useSwatches() {
	return useAtom(swatchesAtom)
}

export function useSwatchesValue() {
	return useAtomValue(swatchesAtom)
}

// Hook for preferences
export function usePreferences() {
	return useAtom(preferencesAtom)
}

// Hook for window config
export function useWindowConfig() {
	return useAtom(windowConfigAtom)
}

// Hook for focused fullscreen window
export function useFocusedFullscreenWindowId() {
	return useAtom(focusedFullscreenWindowIdAtom)
}

// Hook for derived swatch/tone names
export function useSwatchNames() {
	return useAtomValue(swatchNamesAtom)
}

export function useToneNames() {
	return useAtomValue(toneNamesAtom)
}

// Hook for a specific swatch
export function useSwatch(swatchName: string) {
	return useAtom(swatchAtomFamily(swatchName))
}

// Hook for a specific color
export function useColor(swatchName: string, toneName: string) {
	return useAtom(colorAtomFamily(swatchName, toneName))
}

// Helper hook for updating metadata and saving
export function useUpdateMetadata() {
	const [metadata, setMetadata] = useAtom(projectMetadataAtom)
	const fullProject = useAtomValue(fullProjectAtom)

	return useCallback(
		async (updates: Partial<Pick<NonNullable<typeof metadata>, 'name'>>) => {
			if (!metadata || !fullProject) { return }

			const updatedMetadata = {
				...metadata,
				...updates,
				updatedAt: Date.now(),
			}

			const updatedProject: SavedProject = {
				...fullProject,
				metadata: updatedMetadata,
			}

			await saveProject(updatedProject)
			setMetadata(updatedMetadata)
		},
		[metadata, fullProject, setMetadata],
	)
}

// Helper hook for updating window config and saving
export function useUpdateWindowConfig() {
	const [windowConfig, setWindowConfig] = useAtom(windowConfigAtom)
	const metadata = useAtomValue(projectMetadataAtom)
	const fullProject = useAtomValue(fullProjectAtom)

	return useCallback(
		async (
			updater: (current: WindowInstance[]) => WindowInstance[],
			focusedId?: string | undefined,
		) => {
			if (!metadata || !fullProject) { return }

			const currentWindows = windowConfig?.windows ?? []
			const updatedWindows = updater(currentWindows)

			const updatedConfig = {
				windows: updatedWindows,
				focusedFullscreenWindowId: focusedId !== undefined ? focusedId : windowConfig?.focusedFullscreenWindowId,
			}

			const updatedProject: SavedProject = {
				...fullProject,
				metadata: {
					...metadata,
					updatedAt: Date.now(),
				},
				data: {
					...fullProject.data,
					windowConfig: updatedConfig,
				},
			}

			await saveProject(updatedProject)
			setWindowConfig(updatedConfig)
		},
		[windowConfig, metadata, fullProject, setWindowConfig],
	)
}

// Helper hook for updating preferences and saving
export function useUpdatePreferences() {
	const [preferences, setPreferences] = useAtom(preferencesAtom)
	const metadata = useAtomValue(projectMetadataAtom)
	const fullProject = useAtomValue(fullProjectAtom)

	return useCallback(
		async (updater: (current: typeof preferences) => typeof preferences) => {
			if (!metadata || !fullProject) { return }

			const updatedPreferences = updater(preferences)

			const updatedProject: SavedProject = {
				...fullProject,
				metadata: {
					...metadata,
					updatedAt: Date.now(),
				},
				data: {
					...fullProject.data,
					preferences: updatedPreferences,
				},
			}

			await saveProject(updatedProject)
			setPreferences(updatedPreferences)
		},
		[preferences, metadata, fullProject, setPreferences],
	)
}
