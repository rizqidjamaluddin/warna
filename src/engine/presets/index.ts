import type { ColorPreset } from './types'
import { tailwindPreset } from './tailwind'

export type { ColorPreset, PresetDefinition } from './types'
export { tailwindPreset } from './tailwind'

/**
 * All available color presets
 */
export const presets: ColorPreset[] = [tailwindPreset]

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): ColorPreset | undefined {
	return presets.find(preset => preset.id === id)
}

/**
 * Get all available preset options for UI selection
 */
export function getPresetOptions() {
	return presets.map(preset => ({
		id: preset.id,
		name: preset.name,
		description: preset.description,
	}))
}
