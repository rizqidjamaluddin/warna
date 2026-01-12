import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { selectedSwatchesAtom, selectedTonesAtom, selectedColorsAtom, colorEditModeAtom } from '../atoms/ui'

/**
 * Hook for reading and writing the selected swatches
 */
export function useSelectedSwatches() {
	return useAtom(selectedSwatchesAtom)
}

/**
 * Hook for reading the selected swatches (read-only)
 */
export function useSelectedSwatchesValue() {
	return useAtomValue(selectedSwatchesAtom)
}

/**
 * Hook for toggling a swatch selection
 */
export function useToggleSwatchSelection() {
	const setSelectedSwatches = useSetAtom(selectedSwatchesAtom)

	return useCallback(
		(swatchName: string) => {
			setSelectedSwatches((prev: Set<string>) => {
				const next = new Set(prev)
				if (next.has(swatchName)) {
					next.delete(swatchName)
				} else {
					next.add(swatchName)
				}
				return next
			})
		},
		[setSelectedSwatches],
	)
}

/**
 * Hook for checking if a swatch is selected
 */
export function useIsSwatchSelected() {
	const selectedSwatches = useAtomValue(selectedSwatchesAtom)

	return useCallback(
		(swatchName: string) => {
			return selectedSwatches.has(swatchName)
		},
		[selectedSwatches],
	)
}

/**
 * Hook for clearing all selections
 */
export function useClearSelections() {
	const setSelectedSwatches = useSetAtom(selectedSwatchesAtom)
	const setSelectedTones = useSetAtom(selectedTonesAtom)
	const setSelectedColors = useSetAtom(selectedColorsAtom)

	return useCallback(() => {
		setSelectedSwatches(new Set())
		setSelectedTones(new Set())
		setSelectedColors(new Set())
	}, [setSelectedSwatches, setSelectedTones, setSelectedColors])
}

// Future hooks for tones and individual colors can be added here

/**
 * Hook for managing color edit mode to prevent feedback loops
 */
export function useColorEditMode(swatchName: string, toneName: string) {
	const [editModes, setEditModes] = useAtom(colorEditModeAtom)
	const colorKey = `${swatchName}.${toneName}`

	const setEditMode = useCallback(
		(mode: 'rgb' | 'oklch' | 'hex' | null) => {
			setEditModes((prev) => {
				const next = new Map(prev)
				next.set(colorKey, mode)
				return next
			})
		},
		[colorKey, setEditModes],
	)

	const getEditMode = useCallback(() => {
		return editModes.get(colorKey) ?? null
	}, [editModes, colorKey])

	return { getEditMode, setEditMode }
}
