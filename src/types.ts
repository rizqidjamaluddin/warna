import type { Oklch } from 'culori'

/**
 * We use Culori's Oklch type for all color representations
 * - mode: 'oklch'
 * - l: Lightness (0-1)
 * - c: Chroma (0+)
 * - h: Hue (0-360)
 */
export type LCHColor = Oklch

/**
 * RGB color representation
 */
export interface RGBColor {
	r: number
	g: number
	b: number
}

/**
 * HSL color representation
 */
export interface HSLColor {
	h: number
	s: number
	l: number
}

/**
 * HSV color representation
 */
export interface HSVColor {
	h: number
	s: number
	v: number
}

/**
 * Swatches organized by swatch name and tone name
 */
export type Swatches<S extends string = string, T extends string = string> = Record<
	S,
	Record<T, LCHColor | undefined>
>

/**
 * Project preferences
 */
export interface ProjectPreferences {
	// Reserved for future preferences
}

/**
 * Base window interface with discriminated union by type
 */
export interface BaseWindow {
	id: string
	title: string
	x: number
	y: number
	width: number
	height: number
	isFullscreen: boolean
}

/**
 * Debug window for testing
 */
export interface DebugWindow extends BaseWindow {
	type: 'debug'
}

/**
 * Output window that displays project colors as JSON
 */
export interface OutputWindow extends BaseWindow {
	type: 'output'
}

/**
 * Overview window that displays a grid of all colors
 */
export interface OverviewWindow extends BaseWindow {
	type: 'overview'
	viewOptions?: {
		gridlines?: 'black' | 'white' | 'none'
		visionType?: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia' | 'achromatomaly'
	}
}

/**
 * Lightness comparison window that shows all swatches on one chart
 */
export interface LightnessComparisonWindow extends BaseWindow {
	type: 'lightness-comparison'
}

/**
 * Chroma comparison window that shows all swatches on one chart
 */
export interface ChromaComparisonWindow extends BaseWindow {
	type: 'chroma-comparison'
}

/**
 * Union of all window types
 */
export type WindowInstance = DebugWindow | OutputWindow | OverviewWindow | LightnessComparisonWindow | ChromaComparisonWindow

/**
 * Window configuration
 */
export interface WindowConfig {
	windows: WindowInstance[]
	focusedFullscreenWindowId?: string
}

/**
 * A project contains swatches, preferences, and window configuration
 */
export interface Project<S extends string = string, T extends string = string> {
	swatches: Swatches<S, T>
	preferences?: ProjectPreferences
	windowConfig?: WindowConfig
}

/**
 * Metadata for a saved project
 */
export interface ProjectMetadata {
	id: string
	name: string
	createdAt: number
	updatedAt: number
}

/**
 * A saved project with both data and metadata
 */
export interface SavedProject {
	metadata: ProjectMetadata
	data: Project
}
