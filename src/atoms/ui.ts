import { atom } from 'jotai'

/**
 * Vision simulation types for accessibility testing
 * These simulate different types of color vision deficiencies
 */
export type VisionType =
	| 'normal'
	| 'protanopia' // Red-blind (no red cones)
	| 'deuteranopia' // Green-blind (no green cones)
	| 'tritanopia' // Blue-blind (no blue cones)
	| 'protanomaly' // Red-weak
	| 'deuteranomaly' // Green-weak
	| 'tritanomaly' // Blue-weak
	| 'achromatopsia' // Complete color blindness (monochrome)
	| 'achromatomaly' // Incomplete color blindness

/**
 * Selection state for swatches, tones, and individual colors.
 * This is ephemeral UI state that is not persisted in the document.
 */

// Currently only swatches are selectable, but the structure supports future expansion
export const selectedSwatchesAtom = atom<Set<string>>(new Set<string>())

// Future: Allow selecting specific tones across all swatches
export const selectedTonesAtom = atom<Set<string>>(new Set<string>())

// Future: Allow selecting individual colors (stored as "swatchName.toneName")
export const selectedColorsAtom = atom<Set<string>>(new Set<string>())

/**
 * Track the last edit mode used for each color to prevent feedback loops
 * Key: "swatchName.toneName", Value: edit mode ('rgb' | 'oklch' | 'hex' | null)
 */
export const colorEditModeAtom = atom<Map<string, 'rgb' | 'oklch' | 'hex' | null>>(new Map())
