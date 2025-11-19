/**
 * LCH color representation (Lightness, Chroma, Hue)
 * - l: Lightness (0-100)
 * - c: Chroma (0+)
 * - h: Hue (0-360)
 */
export interface LCHColor {
	l: number
	c: number
	h: number
}

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
 * Project preferences (for future use)
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProjectPreferences {
	// To be defined based on user preferences
}

/**
 * Window configuration (for future use)
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WindowConfig {
	// To be defined based on window management needs
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
