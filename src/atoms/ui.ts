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
