import type { LCHColor, Swatches } from '../../types'

/**
 * A color preset that can be used to initialize a new project
 */
export interface ColorPreset {
	id: string
	name: string
	description: string
	swatches: Swatches
}

/**
 * Helper type for defining presets with string literal types
 */
export type PresetDefinition<S extends string = string, T extends string = string> = {
	id: string
	name: string
	description: string
	swatches: Record<S, Record<T, LCHColor>>
}
